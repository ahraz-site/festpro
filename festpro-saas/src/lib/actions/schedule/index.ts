"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  StageSchedule, ScheduleSession, ScheduleFormData, SessionFormData,
  ScheduleConflict, ScheduleDashboardData,
} from "@/types/schedule"

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
    resource_type: "schedule", metadata,
  })
}

// ────────────────────────────────────────────
// SCHEDULE SESSIONS
// ────────────────────────────────────────────

export async function getSessions(festivalId: string, dayId?: string) {
  const admin = createAdminClient()
  let query = admin.from("schedule_sessions").select("*, day:festival_days(date, label)").eq("festival_id", festivalId).order("display_order")
  if (dayId) query = query.eq("day_id", dayId)
  const { data } = await query
  return { data: data as ScheduleSession[] }
}

export async function createSession(festivalId: string, formData: SessionFormData) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("schedule_sessions").insert({
    festival_id: festivalId, day_id: formData.day_id || null,
    name: formData.name, session_type: formData.session_type || "morning",
    start_time: formData.start_time, end_time: formData.end_time,
    buffer_before_minutes: parseInt(formData.buffer_before_minutes) || 5,
    buffer_after_minutes: parseInt(formData.buffer_after_minutes) || 5,
    is_break: formData.is_break || false, break_type: formData.break_type || null,
    notes: formData.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/sessions`)
  return { data: data as ScheduleSession }
}

export async function updateSession(sessionId: string, formData: Partial<SessionFormData>) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("schedule_sessions").select("festival_id").eq("id", sessionId).single()
  if (!existing) return { error: "Session not found" }
  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }
  const { error } = await admin.from("schedule_sessions").update({
    name: formData.name, session_type: formData.session_type,
    start_time: formData.start_time, end_time: formData.end_time,
    buffer_before_minutes: formData.buffer_before_minutes ? parseInt(formData.buffer_before_minutes) : undefined,
    buffer_after_minutes: formData.buffer_after_minutes ? parseInt(formData.buffer_after_minutes) : undefined,
    is_break: formData.is_break, break_type: formData.break_type,
  }).eq("id", sessionId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${existing.festival_id}/sessions`)
  return { success: true }
}

export async function deleteSession(sessionId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("schedule_sessions").select("festival_id").eq("id", sessionId).single()
  if (!existing) return { error: "Session not found" }
  const { error } = await admin.from("schedule_sessions").delete().eq("id", sessionId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// STAGE SCHEDULES
// ────────────────────────────────────────────

export async function getSchedules(festivalId: string, params: {
  stage_id?: string; competition_id?: string; day_id?: string; scheduled_date?: string; status?: string; page?: number; limit?: number
} = {}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }
  const admin = createAdminClient()
  let query = admin.from("stage_schedules").select("*, stage:festival_stages(id, name, code), competition:competitions(id, name, code), round:competition_rounds(id, name, round_number), session:schedule_sessions(id, name, start_time), day:festival_days(date, label)", { count: "exact" })
    .eq("festival_id", festivalId).order("scheduled_date").order("start_time")
  if (params.stage_id) query = query.eq("stage_id", params.stage_id)
  if (params.competition_id) query = query.eq("competition_id", params.competition_id)
  if (params.day_id) query = query.eq("day_id", params.day_id)
  if (params.scheduled_date) query = query.eq("scheduled_date", params.scheduled_date)
  if (params.status) query = query.eq("status", params.status)
  const page = params.page || 1; const limit = params.limit || 50
  query = query.range((page - 1) * limit, page * limit - 1)
  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data as StageSchedule[], count: count || 0 }
}

export async function createSchedule(festivalId: string, formData: ScheduleFormData) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("stage_schedules").insert({
    festival_id: festivalId, stage_id: formData.stage_id,
    competition_id: formData.competition_id, round_id: formData.round_id || null,
    session_id: formData.session_id || null, scheduled_date: formData.scheduled_date,
    start_time: formData.start_time, end_time: formData.end_time,
    estimated_duration_minutes: parseInt(formData.estimated_duration_minutes) || 30,
    max_participants: parseInt(formData.max_participants) || 50,
    notes: formData.notes || null, created_by: check.user.id,
  }).select("id").single()
  if (error) return { error: error.message }
  await logActivity(check.festival.organization_id, "schedule.created", { schedule_id: data.id })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/schedules`)
  return { data }
}

export async function updateSchedule(scheduleId: string, formData: Partial<ScheduleFormData>) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("stage_schedules").select("festival_id, status").eq("id", scheduleId).single()
  if (!existing) return { error: "Schedule not found" }
  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }
  const { error } = await admin.from("stage_schedules").update({
    stage_id: formData.stage_id, competition_id: formData.competition_id,
    round_id: formData.round_id, session_id: formData.session_id,
    scheduled_date: formData.scheduled_date, start_time: formData.start_time, end_time: formData.end_time,
    estimated_duration_minutes: formData.estimated_duration_minutes ? parseInt(formData.estimated_duration_minutes) : undefined,
    max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
    notes: formData.notes,
  }).eq("id", scheduleId)
  if (error) return { error: error.message }
  await logActivity(check.festival.organization_id, "schedule.updated", { schedule_id: scheduleId })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${existing.festival_id}/schedules`)
  return { success: true }
}

export async function deleteSchedule(scheduleId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("stage_schedules").select("festival_id").eq("id", scheduleId).single()
  if (!existing) return { error: "Schedule not found" }
  const { error } = await admin.from("stage_schedules").delete().eq("id", scheduleId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function publishSchedule(scheduleId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("stage_schedules").select("festival_id").eq("id", scheduleId).single()
  if (!existing) return { error: "Schedule not found" }
  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }
  const { error } = await admin.from("stage_schedules").update({ status: "published" }).eq("id", scheduleId)
  if (error) return { error: error.message }
  await logActivity(check.festival.organization_id, "schedule.published", { schedule_id: scheduleId })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${existing.festival_id}/schedules`)
  return { success: true }
}

// ────────────────────────────────────────────
// SMART SCHEDULING ENGINE (auto-generate)
// ────────────────────────────────────────────

export async function autoGenerateSchedule(festivalId: string, dayId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()

  // Get day info
  const { data: day } = await admin.from("festival_days").select("*").eq("id", dayId).single()
  if (!day) return { error: "Day not found" }

  // Get all active stages
  const { data: stages } = await admin.from("festival_stages").select("*").eq("festival_id", festivalId).eq("is_active", true).order("display_order")

  // Get all competitions with registrations
  const { data: competitions } = await admin.from("competitions").select("id, name, duration_minutes, competition_type, stage_required, max_participants, max_teams").eq("festival_id", festivalId).eq("status", "registration_closed").or("status.eq.running")

  if (!stages || !competitions) return { error: "No stages or competitions available" }

  // Get sessions for this day
  const { data: sessions } = await admin.from("schedule_sessions").select("*").eq("festival_id", festivalId).eq("day_id", dayId).eq("is_break", false).order("start_time")

  if (!sessions || sessions.length === 0) return { error: "No sessions defined for this day. Create sessions first." }

  const generatedSchedules: any[] = []
  const conflicts: any[] = []

  // Distribute competitions across stages evenly
  let stageIndex = 0
  const stageAssignments: Record<string, any[]> = {}
  stages.forEach(s => { stageAssignments[s.id] = [] })

  for (const comp of competitions) {
    const stage = stages[stageIndex % stages.length]
    stageIndex++
    const session = sessions[Math.floor(stageIndex / stages.length) % sessions.length]
    const dur = comp.duration_minutes || 30

    // Calculate time within session
    const sessionStart = session.start_time
    const sessionEnd = session.end_time
    const existingCount = stageAssignments[stage.id].length
    const slotStart = addTimeToTime(sessionStart, existingCount * (dur + 10))
    const slotEnd = addTimeToTime(slotStart, dur)

    // Check if within session bounds (simplified)
    if (slotStart >= sessionEnd) {
      continue // Skip if out of session
    }

    const scheduleEntry = {
      festival_id: festivalId,
      day_id: dayId,
      stage_id: stage.id,
      competition_id: comp.id,
      scheduled_date: day.date,
      start_time: slotStart,
      end_time: slotEnd < sessionEnd ? slotEnd : sessionEnd,
      estimated_duration_minutes: dur,
      max_participants: comp.competition_type === "team" ? (comp.max_teams || 50) : (comp.max_participants || 100),
      status: "draft" as const,
      created_by: check.user.id,
    }

    stageAssignments[stage.id].push(scheduleEntry)
    generatedSchedules.push(scheduleEntry)
  }

  // Batch insert
  if (generatedSchedules.length > 0) {
    const { error } = await admin.from("stage_schedules").insert(generatedSchedules)
    if (error) return { error: error.message, generated: generatedSchedules.length }
  }

  await logActivity(check.festival.organization_id, "schedule.auto_generated", { day_id: dayId, count: generatedSchedules.length })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/schedules`)
  return { generated: generatedSchedules.length, conflicts }
}

function addTimeToTime(timeStr: string, minutesToAdd: number): string {
  const [h, m] = timeStr.split(":").map(Number)
  const totalMinutes = h * 60 + m + minutesToAdd
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

// ────────────────────────────────────────────
// CONFLICT MANAGEMENT
// ────────────────────────────────────────────

export async function getConflicts(festivalId: string, resolved?: boolean) {
  const admin = createAdminClient()
  let query = admin.from("schedule_conflicts").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (resolved !== undefined) query = query.eq("is_resolved", resolved)
  const { data } = await query
  return { data: data as ScheduleConflict[] }
}

export async function resolveConflict(conflictId: string, notes?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("schedule_conflicts").update({
    is_resolved: true, resolved_at: new Date().toISOString(),
    resolved_by: user.id, resolution_notes: notes || null,
  }).eq("id", conflictId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// DASHBOARD
// ────────────────────────────────────────────

export async function getScheduleDashboard(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const { data: stages } = await admin.from("festival_stages").select("id, name").eq("festival_id", festivalId).eq("is_active", true)
  const { data: schedules } = await admin.from("stage_schedules").select("id, status, delay_minutes").eq("festival_id", festivalId)
  const { data: queues } = await admin.from("stage_queue").select("stage_id, status").eq("festival_id", festivalId)
  const { data: statuses } = await admin.from("stage_status").select("stage_id, current_status, is_live").eq("festival_id", festivalId)

  const activeStages = statuses?.filter(s => s.is_live).length || 0
  const total = schedules?.length || 0
  const completed = schedules?.filter(s => s.status === "completed").length || 0
  const delayed = schedules?.filter(s => s.delay_minutes > 10).length || 0
  const waiting = queues?.filter(q => q.status === "waiting").length || 0
  const liveQueue = queues?.filter(q => q.status === "calling" || q.status === "performing").length || 0

  const stageData = (stages || []).map(s => ({
    id: s.id,
    name: s.name,
    status: statuses?.find(st => st.stage_id === s.id)?.current_status || "idle",
    queue_length: queues?.filter(q => q.stage_id === s.id && q.status === "waiting").length || 0,
  }))

  return { data: { active_stages: activeStages, total_schedules: total, completed_schedules: completed, delayed_competitions: delayed, waiting_participants: waiting, live_queue_length: liveQueue, stages: stageData } as ScheduleDashboardData }
}
