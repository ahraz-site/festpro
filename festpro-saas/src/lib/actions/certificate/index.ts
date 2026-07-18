"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { CertificateTemplate, Certificate, CertificateBatch, CertificateVerification } from "@/types/result"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id, id").eq("id", festivalId).single()
  if (!fest) return { allowed: false, error: "Festival not found" } as const
  const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
  if (!member) return { allowed: false, error: "Not a member" } as const
  return { allowed: true, user, festival: fest as { organization_id: string; id: string }, member: member as { role: UserRole } } as const
}

// ────────────────────────────────────────────
// CERTIFICATE TEMPLATES
// ────────────────────────────────────────────

export async function getTemplates(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("certificate_templates").select("*").eq("festival_id", festivalId).order("template_name")
  return { data: data as CertificateTemplate[] }
}

export async function upsertTemplate(festivalId: string, data: {
  id?: string; certificate_type: string; template_name: string; orientation?: string;
  page_size?: string; background_image_url?: string; logo_url?: string;
  header_text?: string; body_template: string; footer_text?: string;
  font_family?: string; primary_color?: string; accent_color?: string;
  show_qr?: boolean; show_serial?: boolean; show_date?: boolean; show_signature?: boolean; show_logo?: boolean;
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = { festival_id: festivalId, organization_id: check.festival.organization_id, ...data }
  if (data.id) {
    const { error } = await admin.from("certificate_templates").update(payload).eq("id", data.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("certificate_templates").insert(payload)
    if (error) return { error: error.message }
  }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/certificates`)
  return { success: true }
}

export async function deleteTemplate(templateId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("certificate_templates").delete().eq("id", templateId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// CERTIFICATE GENERATION
// ────────────────────────────────────────────

export async function generateCertificates(festivalId: string, templateId: string, recipientType: string, competitionId?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const { data: template } = await admin.from("certificate_templates").select("*").eq("id", templateId).single()
  if (!template) return { error: "Template not found" }

  // Create batch
  const { data: batch } = await admin.from("certificate_batches").insert({
    festival_id: festivalId, organization_id: check.festival.organization_id,
    template_id: templateId, batch_name: `Batch ${new Date().toISOString().slice(0, 10)}`,
    status: "processing", started_at: new Date().toISOString(), generated_by: user.id,
  }).select().single()

  // Get recipients based on type
  let recipients: { id: string; name: string; email?: string; rank?: number; score?: number; grade?: string }[] = []
  if (recipientType === "participant" || recipientType === "winner") {
    let q = admin.from("result_items")
      .select("participant_id, rank, final_score, grade, participant:participants(id, first_name, last_name, email)")
      .eq("festival_id", festivalId).eq("status", "published")
    if (competitionId) q = q.eq("competition_id", competitionId)
    if (recipientType === "winner") q = q.lte("rank", 3)
    const { data: items } = await q
    if (items) {
      for (const item of items) {
        const p = item.participant as any
        if (p) recipients.push({
          id: p.id, name: `${p.first_name} ${p.last_name}`,
          email: p.email, rank: item.rank ?? undefined,
          score: item.final_score ?? undefined, grade: item.grade ?? undefined,
        })
      }
    }
  }

  let success = 0; let failed = 0
  for (const r of recipients) {
    const ct = recipientType === "winner" ? "winner" : "participant"
    const { error } = await admin.from("certificates").insert({
      festival_id: festivalId, organization_id: check.festival.organization_id,
      template_id: templateId, recipient_type: ct, recipient_id: r.id,
      recipient_name: r.name, recipient_email: r.email || null,
      competition_id: competitionId || null, status: "generated",
      generated_by: user.id, generated_at: new Date().toISOString(),
      certificate_type: ct,
      position: (r as any).rank === 1 ? "1st" : (r as any).rank === 2 ? "2nd" : (r as any).rank === 3 ? "3rd" : null,
      rank: (r as any).rank || null, grade: (r as any).grade || null, score: (r as any).score || null,
    })
    if (error) failed++; else success++
  }

  // Update batch
  await admin.from("certificate_batches").update({
    status: "completed", total_count: recipients.length,
    success_count: success, failed_count: failed,
    completed_at: new Date().toISOString(),
  }).eq("id", (batch as any).id)

  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/certificates`)
  return { batch_id: (batch as any).id, total: recipients.length, success, failed }
}

export async function getCertificates(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let q = admin.from("certificates").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false }).limit(100)
  if (status) q = q.eq("status", status)
  const { data } = await q
  return { data: data as Certificate[] }
}

export async function publishCertificates(ids: string[]) {
  const admin = createAdminClient()
  const { error } = await admin.from("certificates").update({ status: "published", published_at: new Date().toISOString() }).in("id", ids)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/certificates`)
  return { success: true }
}

export async function revokeCertificate(id: string, reason: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("certificates").update({
    status: "revoked", revoked_at: new Date().toISOString(), revoke_reason: reason,
  }).eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// BATCH MANAGEMENT
// ────────────────────────────────────────────

export async function getBatches(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("certificate_batches").select("*, template:certificate_templates(template_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as any[] }
}

// ────────────────────────────────────────────
// QR VERIFICATION (Public)
// ────────────────────────────────────────────

export async function verifyCertificate(code: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("certificates")
    .select("*, festival:festivals(name, logo_url), template:certificate_templates(template_name)")
    .eq("verification_code", code).single()
  if (!data) return { error: "Certificate not found" }

  // Log verification
  await admin.from("certificate_verifications").insert({
    certificate_id: data.id, verification_method: "qr",
    is_valid: data.status === "published",
    details: `Verified via QR code. Status: ${data.status}`,
  })

  // Update verification count
  await admin.from("certificates").update({ is_verified: true, last_verified_at: new Date().toISOString() }).eq("id", data.id)

  return { data: data as any, valid: data.status === "published" }
}

export async function getVerificationLogs(certificateId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("certificate_verifications").select("*").eq("certificate_id", certificateId).order("verified_at", { ascending: false })
  return { data: data as CertificateVerification[] }
}

// ────────────────────────────────────────────
// PUBLIC RESULTS
// ────────────────────────────────────────────

export async function getPublicResults(festivalId: string, competitionId?: string) {
  const admin = createAdminClient()
  let q = admin.from("result_items")
    .select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url, unit, division)")
    .eq("festival_id", festivalId).eq("status", "live").order("rank", { ascending: true, nullsFirst: false })
  if (competitionId) q = q.eq("competition_id", competitionId)
  const { data } = await q
  return { data: data as any[] }
}

export async function getPublicTeamPoints(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("team_points").select("*")
    .eq("festival_id", festivalId).eq("status", "published").order("rank", { ascending: true, nullsFirst: false })
  return { data: data as any[] }
}

export async function getPublicChampionship(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("overall_championship").select("*")
    .eq("festival_id", festivalId).eq("status", "published").order("rank", { ascending: true, nullsFirst: false })
  return { data: data as any[] }
}
