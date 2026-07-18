"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { Appeal, AppealDocument, AppealStatus } from "@/types/result"

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
// APPEALS
// ────────────────────────────────────────────

export async function getAppeals(festivalId: string, status?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [] }
  const admin = createAdminClient()
  let q = admin.from("appeals")
    .select("*, participant:participants(id, first_name, last_name, participant_id), competition:competitions(id, name), documents:appeal_documents(*), history:appeal_history(*)")
    .eq("festival_id", festivalId).order("submitted_at", { ascending: false })
  if (status) q = q.eq("status", status)
  const { data } = await q
  return { data: data as Appeal[] }
}

export async function getAppeal(appealId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("appeals")
    .select("*, participant:participants(*), competition:competitions(*), documents:appeal_documents(*), history:appeal_history(*, changed_by_profile:profiles!appeal_history_changed_by_fkey(first_name, last_name))")
    .eq("id", appealId).single()
  return { data: data as Appeal | null }
}

export async function createAppeal(festivalId: string, data: {
  competition_id: string; participant_id: string; appeal_type: string;
  title: string; description: string; priority?: string; result_item_id?: string
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("appeals").insert({
    festival_id: festivalId, organization_id: check.festival.organization_id,
    competition_id: data.competition_id, participant_id: data.participant_id,
    appeal_type: data.appeal_type, title: data.title, description: data.description,
    priority: data.priority || "normal", result_item_id: data.result_item_id || null,
    submitted_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/appeals`)
  return { success: true }
}

export async function updateAppealStatus(appealId: string, status: AppealStatus, decision?: string, notes?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const updateData: any = {
    status, decision_by: user.id, committee_notes: notes || null,
    decision: decision || null, decided_at: new Date().toISOString(),
  }
  if (status === "approved" || status === "rejected") updateData.resolved_at = new Date().toISOString()
  const { error } = await admin.from("appeals").update(updateData).eq("id", appealId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/appeals`)
  return { success: true }
}

export async function assignAppeal(appealId: string, assigneeId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("appeals").update({
    assigned_to: assigneeId, status: "under_review",
  }).eq("id", appealId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/appeals`)
  return { success: true }
}

// ────────────────────────────────────────────
// APPEAL DOCUMENTS
// ────────────────────────────────────────────

export async function getAppealDocuments(appealId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("appeal_documents").select("*").eq("appeal_id", appealId)
  return { data: data as AppealDocument[] }
}

export async function uploadAppealDocument(appealId: string, fileName: string, filePath: string, fileType?: string, fileSize?: number) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("appeal_documents").insert({
    appeal_id: appealId, file_name: fileName, file_path: filePath,
    file_type: fileType || null, file_size: fileSize || null, uploaded_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/appeals/${appealId}`)
  return { success: true }
}

export async function deleteAppealDocument(docId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("appeal_documents").delete().eq("id", docId)
  if (error) return { error: error.message }
  return { success: true }
}
