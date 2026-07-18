"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { StageQueue, QueueStatus } from "@/types/schedule"

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
    resource_type: "queue", metadata,
  })
}

export async function getStageQueue(stageId: string, festivalId: string, status?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }

  const admin = createAdminClient()
  let query = admin.from("stage_queue").select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url), registration:registrations(id, competition_id), team:teams(id, name)")
    .eq("stage_id", stageId).eq("festival_id", festivalId).order("queue_order")

  if (status) query = query.eq("status", status)
  else query = query.not("status", "in", '("completed","cancelled")')

  const { data } = await query
  return { data: data as StageQueue[] }
}

export async function buildQueueForSchedule(scheduleId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: schedule } = await admin.from("stage_schedules").select("id, festival_id, stage_id, competition_id, round_id").eq("id", scheduleId).single()
  if (!schedule) return { error: "Schedule not found" }

  const check = await checkOrgAccess(schedule.festival_id)
  if (!check.allowed) return { error: check.error }

  // Get registrations for this competition
  const { data: registrations } = await admin.from("registrations")
    .select("id, participant_id, team_id")
    .eq("competition_id", schedule.competition_id)
    .eq("festival_id", schedule.festival_id)
    .eq("status", "approved")

  if (!registrations || registrations.length === 0) return { error: "No approved registrations for this competition" }

  // Get existing queue
  const { data: existingQueue } = await admin.from("stage_queue").select("id").eq("schedule_id", scheduleId)
  if (existingQueue && existingQueue.length > 0) return { error: "Queue already exists for this schedule. Clear it first." }

  // Build queue entries
  const queueEntries = registrations.map((reg, idx) => ({
    festival_id: schedule.festival_id,
    stage_id: schedule.stage_id,
    schedule_id: scheduleId,
    participant_id: reg.participant_id,
    registration_id: reg.id,
    team_id: reg.team_id,
    queue_order: idx + 1,
    status: "waiting" as QueueStatus,
  }))

  const { error } = await admin.from("stage_queue").insert(queueEntries)
  if (error) return { error: error.message }

  await logActivity(check.festival.organization_id, "schedule.queue_built", { schedule_id: scheduleId, count: queueEntries.length })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${schedule.festival_id}/queue`)
  return { count: queueEntries.length }
}

export async function clearQueue(stageId: string, festivalId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("stage_queue").delete().eq("stage_id", stageId).eq("festival_id", festivalId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// QUEUE ACTIONS (Live Calling)
// ────────────────────────────────────────────

export async function callNextParticipant(stageId: string, festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  // Get next waiting participant
  const { data: next } = await admin.from("stage_queue")
    .select("id, participant_id")
    .eq("stage_id", stageId).eq("festival_id", festivalId).eq("status", "waiting")
    .order("queue_order").limit(1).single()

  if (!next) return { error: "No participants in queue" }

  // Update current to "completed" if any performing
  await admin.from("stage_queue").update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("stage_id", stageId).eq("festival_id", festivalId).eq("status", "performing")

  // Mark next as calling
  await admin.from("stage_queue").update({
    status: "calling", call_count: admin.rpc("increment", { x: 1 }) as any,
    last_called_at: new Date().toISOString(),
  }).eq("id", next.id)

  // Log call
  await admin.from("call_history").insert({
    festival_id: festivalId, stage_id: stageId, queue_id: next.id,
    participant_id: next.participant_id, call_type: "first_call", called_by: check.user.id,
  })

  await logActivity(check.festival.organization_id, "schedule.participant_called", { queue_id: next.id })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { queue_id: next.id }
}

export async function markAsPerforming(queueId: string, festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const { data: q } = await admin.from("stage_queue").select("id, participant_id, stage_id").eq("id", queueId).single()
  if (!q) return { error: "Queue item not found" }

  await admin.from("stage_queue").update({ status: "performing" }).eq("id", queueId)
  await admin.from("stage_status").update({
    current_status: "running", current_participant_id: q.participant_id,
    started_at: new Date().toISOString(), is_live: true,
  }).eq("stage_id", q.stage_id).eq("festival_id", festivalId)

  await admin.from("performance_log").insert({
    festival_id: festivalId, stage_id: q.stage_id, participant_id: q.participant_id,
    started_at: new Date().toISOString(), status: "performing",
  })

  await logActivity(check.festival.organization_id, "schedule.performance_started", { queue_id: queueId })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { success: true }
}

export async function markAsCompleted(queueId: string, festivalId: string, remarks?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const { data: q } = await admin.from("stage_queue").select("id, participant_id, stage_id, created_at").eq("id", queueId).single()
  if (!q) return { error: "Queue item not found" }

  const duration = q.created_at ? Math.floor((Date.now() - new Date(q.created_at).getTime()) / 1000) : 0

  await admin.from("stage_queue").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", queueId)
  await admin.from("stage_status").update({
    current_status: "idle", current_participant_id: null, is_live: false,
  }).eq("stage_id", q.stage_id).eq("festival_id", festivalId)

  await admin.from("performance_log").update({
    completed_at: new Date().toISOString(), duration_seconds: duration,
    status: "completed", remarks: remarks || null,
  }).eq("participant_id", q.participant_id).eq("stage_id", q.stage_id).eq("status", "performing")

  await logActivity(check.festival.organization_id, "schedule.performance_completed", { queue_id: queueId, duration })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { success: true }
}

export async function skipParticipant(queueId: string, festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("stage_queue").update({ status: "skipped" }).eq("id", queueId)
  await logActivity(check.festival.organization_id, "schedule.queue_changed", { queue_id: queueId, action: "skipped" })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { success: true }
}

export async function markAbsent(queueId: string, festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data: q } = await admin.from("stage_queue").select("id, participant_id, stage_id").eq("id", queueId).single()
  if (!q) return { error: "Queue item not found" }
  await admin.from("stage_queue").update({ status: "absent" }).eq("id", queueId)
  await admin.from("call_history").insert({
    festival_id: festivalId, stage_id: q.stage_id, queue_id: queueId,
    participant_id: q.participant_id, call_type: "absent_mark", called_by: check.user.id,
    response: "absent",
  })
  await logActivity(check.festival.organization_id, "schedule.queue_changed", { queue_id: queueId, action: "absent" })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { success: true }
}

export async function recallParticipant(queueId: string, festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data: q } = await admin.from("stage_queue").select("id, participant_id, stage_id").eq("id", queueId).single()
  if (!q) return { error: "Queue item not found" }
  await admin.from("stage_queue").update({
    status: "calling", call_count: admin.rpc("increment", { x: 1 }) as any,
    last_called_at: new Date().toISOString(),
  }).eq("id", queueId)
  await admin.from("call_history").insert({
    festival_id: festivalId, stage_id: q.stage_id, queue_id: queueId,
    participant_id: q.participant_id, call_type: "recall", called_by: check.user.id,
  })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { success: true }
}

export async function reorderQueue(stageId: string, festivalId: string, queueIds: string[]) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  for (let i = 0; i < queueIds.length; i++) {
    await admin.from("stage_queue").update({ queue_order: i + 1 }).eq("id", queueIds[i])
  }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/live`)
  return { success: true }
}
