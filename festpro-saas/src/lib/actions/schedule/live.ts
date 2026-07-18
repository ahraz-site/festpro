"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { StageStatusRecord, LiveEvent, CallHistory, PerformanceLog } from "@/types/schedule"

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

// ────────────────────────────────────────────
// STAGE STATUS
// ────────────────────────────────────────────

export async function getStageStatuses(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("stage_status").select("*, stage:festival_stages(id, name, code), current_participant:participants(id, first_name, last_name)").eq("festival_id", festivalId)
  return { data: data as StageStatusRecord[] }
}

export async function initStageStatus(stageId: string, festivalId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("stage_status").select("id").eq("stage_id", stageId).eq("festival_id", festivalId).maybeSingle()
  if (existing) return { success: true }
  const { error } = await admin.from("stage_status").insert({ festival_id: festivalId, stage_id: stageId })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateStageStatus(stageId: string, festivalId: string, status: string) {
  const admin = createAdminClient()
  const updateData: Record<string, any> = { current_status: status }
  if (status === "running") {
    updateData.started_at = new Date().toISOString()
    updateData.is_live = true
  } else if (status === "completed") {
    updateData.completed_at = new Date().toISOString()
    updateData.is_live = false
  } else if (status === "break") {
    updateData.paused_at = new Date().toISOString()
  }
  const { error } = await admin.from("stage_status").update(updateData).eq("stage_id", stageId).eq("festival_id", festivalId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/live`)
  return { success: true }
}

// ────────────────────────────────────────────
// LIVE EVENTS (display screens)
// ────────────────────────────────────────────

export async function getLiveEvents(festivalId: string, stageId?: string) {
  const admin = createAdminClient()
  let query = admin.from("live_events").select("*, stage:festival_stages(name, code)").eq("festival_id", festivalId).eq("is_active", true).order("created_at", { ascending: false })
  if (stageId) query = query.eq("stage_id", stageId)
  const { data } = await query
  return { data: data as LiveEvent[] }
}

export async function createLiveEvent(festivalId: string, stageId: string, title: string, subtitle?: string, eventType?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("live_events").insert({
    festival_id: festivalId, stage_id: stageId, title, subtitle: subtitle || null,
    event_type: eventType || "performance", started_at: new Date().toISOString(),
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { data: data as LiveEvent }
}

export async function endLiveEvent(eventId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("live_events").update({ is_active: false, ended_at: new Date().toISOString() }).eq("id", eventId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// CALL HISTORY
// ────────────────────────────────────────────

export async function getCallHistory(festivalId: string, stageId?: string, limit = 50) {
  const admin = createAdminClient()
  let query = admin.from("call_history").select("*, participant:participants(first_name, last_name, participant_id), stage:festival_stages(name, code)")
    .eq("festival_id", festivalId).order("called_at", { ascending: false }).limit(limit)
  if (stageId) query = query.eq("stage_id", stageId)
  const { data } = await query
  return { data: data as CallHistory[] }
}

// ────────────────────────────────────────────
// PERFORMANCE LOG
// ────────────────────────────────────────────

export async function getPerformanceLog(festivalId: string, params: { stage_id?: string; status?: string; page?: number; limit?: number } = {}) {
  const admin = createAdminClient()
  let query = admin.from("performance_log").select("*, participant:participants(first_name, last_name, participant_id, chest_number)")
    .eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (params.stage_id) query = query.eq("stage_id", params.stage_id)
  if (params.status) query = query.eq("status", params.status)
  const page = params.page || 1; const limit = params.limit || 50
  query = query.range((page - 1) * limit, page * limit - 1)
  const { data } = await query
  return { data: data as PerformanceLog[] }
}

// ────────────────────────────────────────────
// LIVE STAGE DATA (for display screens)
// ────────────────────────────────────────────

export async function getLiveStageData(festivalId: string) {
  const admin = createAdminClient()
  const [statusRes, queueRes, eventsRes, announceRes] = await Promise.all([
    admin.from("stage_status").select("*, stage:festival_stages(id, name, code)").eq("festival_id", festivalId).eq("is_live", true),
    admin.from("stage_queue").select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url)")
      .eq("festival_id", festivalId).in("status", ["waiting", "calling", "performing"])
      .order("queue_order"),
    admin.from("live_events").select("*, stage:festival_stages(name, code)").eq("festival_id", festivalId).eq("is_active", true).order("created_at", { ascending: false }).limit(10),
    admin.from("stage_announcements").select("*, stage:festival_stages(name, code)")
      .eq("festival_id", festivalId).eq("display_on_screen", true)
      .gt("expires_at", new Date().toISOString()).or("expires_at.is.null")
      .order("priority", { ascending: false }).limit(5),
  ])
  return {
    stages: statusRes.data as StageStatusRecord[],
    queue: queueRes.data as any[],
    events: eventsRes.data as LiveEvent[],
    announcements: announceRes.data as any[],
  }
}
