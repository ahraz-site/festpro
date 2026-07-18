"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types"
import type { Attendance, AttendanceStatus } from "@/types/participant"

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
    resource_type: "attendance", metadata,
  })
}

export async function markAttendance(participantId: string, festivalId: string, status: AttendanceStatus, registrationId?: string, competitionId?: string, notes?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]

  // Upsert
  const { data: existing } = await admin.from("attendance").select("id").eq("participant_id", participantId).eq("festival_id", festivalId).eq("attendance_date", today).maybeSingle()

  const attendanceData: Record<string, any> = {
    participant_id: participantId,
    festival_id: festivalId,
    attendance_date: today,
    status,
    marked_by: check.user.id,
    registration_id: registrationId || null,
    competition_id: competitionId || null,
    notes: notes || null,
    check_in_time: status === "present" || status === "late" ? new Date().toISOString() : null,
  }

  if (existing) {
    const { error } = await admin.from("attendance").update(attendanceData).eq("id", existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("attendance").insert(attendanceData)
    if (error) return { error: error.message }
  }

  // Update registration is_attended
  if (registrationId) {
    await admin.from("registrations").update({ is_attended: status === "present" }).eq("id", registrationId)
  }

  await logActivity(check.festival.organization_id, "participant.checked_in", { participant_id: participantId, status })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/attendance`)
  return { success: true }
}

export async function getAttendance(festivalId: string, params: {
  status?: string; attendance_date?: string; competition_id?: string; participant_id?: string; page?: number; limit?: number
} = {}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }

  const admin = createAdminClient()
  let query = admin.from("attendance").select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url, unit), competition:competitions(id, name)", { count: "exact" })
    .eq("festival_id", festivalId)
    .order("attendance_date", { ascending: false })

  if (params.status) query = query.eq("status", params.status)
  if (params.attendance_date) query = query.eq("attendance_date", params.attendance_date)
  if (params.competition_id) query = query.eq("competition_id", params.competition_id)
  if (params.participant_id) query = query.eq("participant_id", params.participant_id)

  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data as unknown as Attendance[], count: count || 0 }
}

export async function getAttendanceStats(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const { data } = await admin.from("attendance").select("status").eq("festival_id", festivalId).eq("attendance_date", today)

  const present = data?.filter(a => a.status === "present").length || 0
  const absent = data?.filter(a => a.status === "absent").length || 0
  const late = data?.filter(a => a.status === "late").length || 0
  const excused = data?.filter(a => a.status === "excused").length || 0

  return { data: { present, absent, late, excused, total: data?.length || 0 } }
}
