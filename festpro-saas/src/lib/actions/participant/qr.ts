"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types"
import type { QrCard } from "@/types/participant"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!fest) return { allowed: false, error: "Festival not found" } as const
  const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
  if (!member) return { allowed: false, error: "Not a member" } as const
  return { allowed: true, user, festival: fest, member: member as { role: UserRole } } as const
}

async function logActivity(orgId: string, action: string, metadata: Record<string, any> = {}) {
  const user = await getAuth()
  if (!user) return
  const admin = createAdminClient()
  await admin.from("activity_logs").insert({
    organization_id: orgId, user_id: user.id, action,
    resource_type: "qr", metadata,
  })
}

export async function generateQrCard(participantId: string, festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()

  // Get participant data
  const { data: participant } = await admin.from("participants").select("id, participant_id, registration_number, chest_number, first_name, last_name, photo_url").eq("id", participantId).single()
  if (!participant) return { error: "Participant not found" }

  // Build QR data payload
  const qrData = JSON.stringify({
    pid: participant.participant_id,
    reg: participant.registration_number,
    chest: participant.chest_number,
    name: `${participant.first_name} ${participant.last_name}`,
    festival: festivalId,
  })

  // Generate QR image URL using a public API (we store the URL)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

  // Upsert QR card
  const { data: existing } = await admin.from("qr_cards").select("id").eq("participant_id", participantId).eq("festival_id", festivalId).maybeSingle()

  if (existing) {
    await admin.from("qr_cards").update({ qr_data: qrData, qr_image_url: qrImageUrl }).eq("id", existing.id)
  } else {
    await admin.from("qr_cards").insert({
      participant_id: participantId,
      festival_id: festivalId,
      qr_data: qrData,
      qr_image_url: qrImageUrl,
    })
  }

  await logActivity(check.festival.organization_id, "participant.qr_generated", { participant_id: participantId })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/qr`)
  return { qr_data: qrData, qr_image_url: qrImageUrl }
}

export async function generateBulkQrCards(participantIds: string[], festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const results = []
  for (const pid of participantIds) {
    const result = await generateQrCard(pid, festivalId)
    results.push({ participant_id: pid, ...result })
  }
  return { data: results }
}

export async function markQrAsPrinted(participantId: string, festivalId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("qr_cards").update({ is_printed: true, printed_at: new Date().toISOString() })
    .eq("participant_id", participantId).eq("festival_id", festivalId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/qr`)
  return { success: true }
}

export async function getQrCards(festivalId: string, params: { is_printed?: boolean; page?: number; limit?: number } = {}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }

  const admin = createAdminClient()
  let query = admin.from("qr_cards").select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, registration_number, photo_url, unit, division)", { count: "exact" })
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: false })

  if (params.is_printed !== undefined) query = query.eq("is_printed", params.is_printed)

  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data as unknown as QrCard[], count: count || 0 }
}
