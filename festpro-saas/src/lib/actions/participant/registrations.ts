"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types"
import type { Registration, RegistrationFormData } from "@/types/participant"

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
    resource_type: "registration", metadata,
  })
}

export async function createRegistration(festivalId: string, formData: RegistrationFormData) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()

  // Check duplicate
  const { data: existing } = await admin.from("registrations").select("id").eq("participant_id", formData.participant_id).eq("competition_id", formData.competition_id).maybeSingle()
  if (existing) return { error: "Participant is already registered for this competition" }

  // Check participant max registrations
  const { data: participant } = await admin.from("participants").select("max_registrations").eq("id", formData.participant_id).single()
  const { count } = await admin.from("registrations").select("*", { count: "exact", head: true }).eq("participant_id", formData.participant_id).neq("status", "cancelled")
  if (count && participant && count >= participant.max_registrations) {
    return { error: `Participant can register for maximum ${participant.max_registrations} competitions` }
  }

  // Get chest number from participant
  const { data: p } = await admin.from("participants").select("chest_number").eq("id", formData.participant_id).single()

  const { data, error } = await admin.from("registrations").insert({
    participant_id: formData.participant_id,
    competition_id: formData.competition_id,
    festival_id: festivalId,
    team_id: formData.team_id || null,
    chest_number: p?.chest_number || null,
    status: "pending",
    notes: formData.notes || null,
    created_by: check.user.id,
  }).select("id").single()

  if (error) return { error: error.message }
  await logActivity(check.festival.organization_id, "participant.registered", { registration_id: data.id })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/registrations`)
  return { data }
}

export async function updateRegistrationStatus(registrationId: string, status: "approved" | "rejected" | "cancelled", rejectionReason?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: reg } = await admin.from("registrations").select("id, festival_id, participant_id, competition_id").eq("id", registrationId).single()
  if (!reg) return { error: "Registration not found" }

  const check = await checkOrgAccess(reg.festival_id)
  if (!check.allowed) return { error: check.error }

  const updateData: Record<string, any> = { status }
  if (status === "approved") {
    updateData.approved_at = new Date().toISOString()
    updateData.approved_by = user.id
  }
  if (status === "rejected" && rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { error } = await admin.from("registrations").update(updateData).eq("id", registrationId)
  if (error) return { error: error.message }

  const action = status === "approved" ? "participant.registration_approved" : status === "rejected" ? "participant.registration_rejected" : ""
  if (action) await logActivity(check.festival.organization_id, action, { registration_id: registrationId })

  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${reg.festival_id}/registrations`)
  return { success: true }
}

export async function getRegistrations(festivalId: string, params: {
  status?: string; competition_id?: string; participant_id?: string; team_id?: string; page?: number; limit?: number
} = {}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }

  const admin = createAdminClient()
  let query = admin.from("registrations").select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url, unit, division), competition:competitions(id, name, code, competition_type), team:teams(id, name)", { count: "exact" })
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: false })

  if (params.status) query = query.eq("status", params.status)
  if (params.competition_id) query = query.eq("competition_id", params.competition_id)
  if (params.participant_id) query = query.eq("participant_id", params.participant_id)
  if (params.team_id) query = query.eq("team_id", params.team_id)

  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data as unknown as Registration[], count: count || 0 }
}

export async function bulkApproveRegistrations(ids: string[]) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("registrations").update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id }).in("id", ids).eq("status", "pending")
  if (error) return { error: error.message }
  return { success: true }
}

export async function bulkRejectRegistrations(ids: string[], reason?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("registrations").update({ status: "rejected", rejection_reason: reason || null, approved_by: user.id }).in("id", ids).eq("status", "pending")
  if (error) return { error: error.message }
  return { success: true }
}
