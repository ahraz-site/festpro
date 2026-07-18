"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { StageAnnouncement } from "@/types/schedule"

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
    resource_type: "announcement", metadata,
  })
}

export async function getAnnouncements(festivalId: string, params: { stage_id?: string; type?: string; active_only?: boolean; page?: number; limit?: number } = {}) {
  const admin = createAdminClient()
  let query = admin.from("stage_announcements").select("*, stage:festival_stages(name, code)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (params.stage_id) query = query.eq("stage_id", params.stage_id)
  if (params.type) query = query.eq("announcement_type", params.type)
  if (params.active_only) query = query.gt("expires_at", new Date().toISOString()).or("expires_at.is.null")
  const page = params.page || 1; const limit = params.limit || 20
  query = query.range((page - 1) * limit, page * limit - 1)
  const { data } = await query
  return { data: data as StageAnnouncement[] }
}

export async function createAnnouncement(festivalId: string, formData: {
  stage_id?: string; title: string; message: string; announcement_type?: string;
  display_on_screen?: boolean; is_scrolling?: boolean; is_emergency?: boolean;
  priority?: number; expires_at?: string;
}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("stage_announcements").insert({
    festival_id: festivalId, stage_id: formData.stage_id || null,
    title: formData.title, message: formData.message,
    announcement_type: formData.announcement_type || "general",
    display_on_screen: formData.display_on_screen ?? true,
    is_scrolling: formData.is_scrolling ?? false,
    is_emergency: formData.is_emergency ?? false,
    priority: formData.priority || 0,
    expires_at: formData.expires_at || null,
    created_by: check.user.id,
  }).select().single()
  if (error) return { error: error.message }
  await logActivity(check.festival.organization_id, "schedule.announcement_created", { announcement_id: data.id })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/announcements`)
  return { data: data as StageAnnouncement }
}

export async function deleteAnnouncement(announcementId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("stage_announcements").select("festival_id").eq("id", announcementId).single()
  if (!existing) return { error: "Announcement not found" }
  const { error } = await admin.from("stage_announcements").delete().eq("id", announcementId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// JUDGE AVAILABILITY
// ────────────────────────────────────────────

export async function getJudgeAvailability(festivalId: string, date?: string) {
  const admin = createAdminClient()
  let query = admin.from("judge_availability").select("*, profile:profiles(first_name, last_name, email)").eq("festival_id", festivalId).order("date").order("start_time")
  if (date) query = query.eq("date", date)
  const { data } = await query
  return { data: data as any[] }
}

export async function upsertJudgeAvailability(festivalId: string, userId: string, date: string, startTime: string, endTime: string, status?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data: existing } = await admin.from("judge_availability").select("id").eq("user_id", userId).eq("date", date).maybeSingle()
  if (existing) {
    await admin.from("judge_availability").update({ start_time: startTime, end_time: endTime, status: status || "available" }).eq("id", existing.id)
  } else {
    await admin.from("judge_availability").insert({ festival_id: festivalId, user_id: userId, date, start_time: startTime, end_time: endTime, status: status || "available" })
  }
  return { success: true }
}
