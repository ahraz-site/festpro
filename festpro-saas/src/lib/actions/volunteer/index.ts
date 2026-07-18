"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  Volunteer, VolunteerProfile, StaffMember, StaffDepartmentMeta, Duty,
  DutyAssignment, ShiftTemplate, Shift, AttendanceLog, Checkpoint, Checkin,
  TaskList, TaskItem, TaskComment, TaskFile, VolunteerCertificate, Module13DashboardData,
} from "@/types/volunteer"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  if (festivalId) {
    const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, festival_id: festivalId } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id } as const
}

// ── DASHBOARD ──

export async function getVolunteerDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [{ count: tv }, { count: av }, { count: ts }, { count: td }, { count: ash }, { count: pt }, { count: at }, { count: ptask }, { count: tc }] = await Promise.all([
    admin.from("volunteers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("volunteers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("staff_members").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_active", true),
    admin.from("duties").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("shifts").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("date", today).in("status", ["scheduled", "checked_in"]),
    admin.from("shifts").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("date", today).eq("status", "checked_in"),
    admin.from("shifts").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("date", today).eq("status", "no_show"),
    admin.from("task_status").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
    admin.from("checkpoints").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
  ])
  return { data: { total_volunteers: tv || 0, active_volunteers: av || 0, total_staff: ts || 0, total_duties: td || 0, active_shifts: ash || 0, present_today: pt || 0, absent_today: at || 0, pending_tasks: ptask || 0, total_checkpoints: tc || 0 } as Module13DashboardData }
}

// ── VOLUNTEERS ──

export async function getVolunteers(festivalId: string, filters?: { status?: string; department?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("volunteers").select("*, profiles:volunteer_profiles(*)").eq("festival_id", festivalId).order("first_name")
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function upsertVolunteer(data: {
  id?: string; festival_id: string; first_name: string; last_name: string; phone?: string; email?: string
  photo_url?: string; date_of_birth?: string; blood_group?: string
  emergency_contact_name?: string; emergency_contact_phone?: string; skills?: string[]
  languages?: string[]; availability?: string; address?: string; city?: string; status?: string; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const qrCode = `v_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
  if (data.id) {
    await admin.from("volunteers").update({ ...data, organization_id: check.organization_id }).eq("id", data.id)
  } else {
    await admin.from("volunteers").insert({ ...data, organization_id: check.organization_id, qr_code: qrCode, created_by: check.user.id })
  }
  revalidatePath(`/dashboard/organization/*/festivals/${data.festival_id}/volunteers`)
  return { success: true }
}

export async function deleteVolunteer(id: string) {
  const admin = createAdminClient()
  await admin.from("volunteers").delete().eq("id", id)
  return { success: true }
}

// ── STAFF ──

export async function getStaffMembers(festivalId: string, filters?: { department?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("staff_members").select("*").eq("festival_id", festivalId).order("first_name")
  if (filters?.department) q = q.eq("department", filters.department)
  const { data } = await q
  return { data: data as StaffMember[] }
}

export async function upsertStaffMember(data: {
  id?: string; festival_id: string; department?: string; first_name: string; last_name: string
  phone?: string; email?: string; position?: string; is_supervisor?: boolean; is_active?: boolean; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) {
    await admin.from("staff_members").update({ ...data, organization_id: check.organization_id }).eq("id", data.id)
  } else {
    await admin.from("staff_members").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  }
  revalidatePath(`/dashboard/organization/*/festivals/${data.festival_id}/staff`)
  return { success: true }
}

export async function deleteStaffMember(id: string) {
  const admin = createAdminClient()
  await admin.from("staff_members").delete().eq("id", id)
  return { success: true }
}

// ── DEPARTMENTS ──

export async function getDepartments(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("staff_departments").select("*").eq("festival_id", festivalId).order("display_name")
  return { data: data as StaffDepartmentMeta[] }
}

export async function upsertDepartment(data: {
  id?: string; festival_id: string; department: string; display_name: string; description?: string; color?: string; max_capacity?: number
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("staff_departments").update(data).eq("id", data.id)
  else await admin.from("staff_departments").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath(`/dashboard/organization/*/festivals/${data.festival_id}/departments`)
  return { success: true }
}

// ── DUTIES ──

export async function getDuties(festivalId: string, filters?: { department?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("duties").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.department) q = q.eq("department", filters.department)
  const { data } = await q
  return { data: data as Duty[] }
}

export async function upsertDuty(data: {
  id?: string; festival_id: string; title: string; description?: string; department?: string; location?: string; is_critical?: boolean
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("duties").update(data).eq("id", data.id)
  else await admin.from("duties").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath(`/dashboard/organization/*/festivals/${data.festival_id}/duties`)
  return { success: true }
}

export async function deleteDuty(id: string) {
  const admin = createAdminClient()
  await admin.from("duties").delete().eq("id", id)
  return { success: true }
}

// ── DUTY ASSIGNMENTS ──

export async function getDutyAssignments(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("duty_assignments").select("*, duty:duties(*), volunteer:volunteers(first_name, last_name, photo_url), staff:staff_members(first_name, last_name)")
    .eq("duty.festival_id", festivalId).order("assigned_at", { ascending: false })
  return { data: data as any[] }
}

export async function createDutyAssignment(data: { duty_id: string; volunteer_id?: string; staff_id?: string; notes?: string }) {
  const admin = createAdminClient()
  await admin.from("duty_assignments").insert({ ...data, assigned_by: (await getAuth())?.id })
  revalidatePath("/dashboard/organization/*/festivals/*/duties")
  return { success: true }
}

export async function updateDutyAssignmentStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "checked_in") updates.started_at = new Date().toISOString()
  if (status === "completed") updates.completed_at = new Date().toISOString()
  await admin.from("duty_assignments").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/duties")
  return { success: true }
}

// ── SHIFT TEMPLATES ──

export async function getShiftTemplates(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("shift_templates").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as ShiftTemplate[] }
}

export async function upsertShiftTemplate(data: { id?: string; festival_id: string; name: string; shift_type: string; start_time: string; end_time: string; break_duration?: number; color?: string }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("shift_templates").update(data).eq("id", data.id)
  else await admin.from("shift_templates").insert({ ...data, organization_id: check.organization_id })
  revalidatePath("/dashboard/organization/*/festivals/*/shifts")
  return { success: true }
}

// ── SHIFTS ──

export async function getShifts(festivalId: string, date?: string, filters?: { status?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("shifts").select("*, volunteer:volunteers(first_name, last_name, photo_url), staff:staff_members(first_name, last_name)")
    .eq("festival_id", festivalId).order("start_time")
  if (date) q = q.eq("date", date)
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function upsertShift(data: {
  id?: string; festival_id: string; volunteer_id?: string; staff_id?: string; template_id?: string
  date: string; start_time: string; end_time: string; is_overtime?: boolean; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("shifts").update(data).eq("id", data.id)
  else await admin.from("shifts").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/shifts")
  return { success: true }
}

// ── ATTENDANCE ──

export async function getAttendanceLogs(festivalId: string, date?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("attendance_logs").select("*, volunteer:volunteers(first_name, last_name), staff:staff_members(first_name, last_name), shift:shifts(date)")
    .eq("festival_id", festivalId).order("timestamp", { ascending: false }).limit(100)
  if (date) q = q.gte("timestamp", `${date}T00:00:00`).lte("timestamp", `${date}T23:59:59`)
  const { data } = await q
  return { data: data as any[] }
}

export async function recordAttendance(data: {
  festival_id: string; volunteer_id?: string; staff_id?: string; shift_id?: string
  attendance_type: string; checkpoint_id?: string; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("attendance_logs").insert({ ...data, organization_id: check.organization_id })
  revalidatePath("/dashboard/organization/*/festivals/*/attendance")
  return { success: true }
}

// ── CHECKPOINTS ──

export async function getCheckpoints(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("checkpoints").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as Checkpoint[] }
}

export async function upsertCheckpoint(data: {
  id?: string; festival_id: string; name: string; checkpoint_type?: string; location?: string; is_active?: boolean
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const qrCode = `cp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
  if (data.id) await admin.from("checkpoints").update(data).eq("id", data.id)
  else await admin.from("checkpoints").insert({ ...data, qr_code: qrCode, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/checkpoints")
  return { success: true }
}

// ── TASKS ──

export async function getTaskLists(festivalId: string, department?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("task_lists").select("*, tasks:task_status(*)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (department) q = q.eq("department", department)
  const { data } = await q
  return { data: data as any[] }
}

export async function upsertTaskList(data: { id?: string; festival_id: string; title: string; description?: string; department?: string }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("task_lists").update(data).eq("id", data.id)
  else await admin.from("task_lists").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/tasks")
  return { success: true }
}

export async function upsertTask(data: {
  id?: string; task_list_id: string; title: string; description?: string; priority?: string
  assigned_to?: string; assigned_staff?: string; due_date?: string; sort_order?: number
}) {
  const admin = createAdminClient()
  if (data.id) await admin.from("task_status").update(data).eq("id", data.id)
  else await admin.from("task_status").insert({ ...data, created_by: (await getAuth())?.id })
  revalidatePath("/dashboard/organization/*/festivals/*/tasks")
  return { success: true }
}

export async function updateTaskStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "completed") { updates.completed_by = (await getAuth())?.id; updates.completed_at = new Date().toISOString() }
  await admin.from("task_status").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/tasks")
  return { success: true }
}

// ── CERTIFICATES ──

export async function getVolunteerCertificates(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("volunteer_certificates").select("*, volunteer:volunteers(first_name, last_name), staff:staff_members(first_name, last_name)")
    .eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as any[] }
}

export async function issueCertificate(data: {
  festival_id: string; volunteer_id?: string; staff_id?: string; certificate_type?: string; title: string
  description?: string; total_hours?: number
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const code = `VC-${Date.now().toString(36).toUpperCase()}`
  await admin.from("volunteer_certificates").insert({
    ...data, certificate_code: code, organization_id: check.organization_id, created_by: check.user.id,
  })
  revalidatePath("/dashboard/organization/*/festivals/*/volunteers/certificates")
  return { success: true, certificate_code: code }
}
