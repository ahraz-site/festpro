"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  Notification, EmailTemplate, EmailLog, Announcement, WorkflowRule,
  WorkflowHistory, Module10DashboardData,
} from "@/types/communication"

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
    const { data: fest } = await admin.from("festivals").select("organization_id, id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, festival: fest as { organization_id: string; id: string }, member: member as { role: UserRole } } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id, member: members[0] as { role: UserRole } } as const
}

// ── DASHBOARD ──

export async function getCommunicationDashboard(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const orgFilter = { organization_id: check.organization_id }
  const festFilter = festivalId ? { festival_id: festivalId } : {}

  const [
    { count: tn }, { count: un }, { count: ta }, { count: aa },
    { count: ea }, { count: aw }, { count: pe }, { count: fe },
    { count: es }, { count: ps }, { count: pp }, { count: sn },
  ] = await Promise.all([
    admin.from("notifications").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter }),
    admin.from("notifications").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, is_read: false }),
    admin.from("announcements").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter }),
    admin.from("announcements").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, status: "published" }),
    admin.from("announcements").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, is_emergency: true }),
    admin.from("workflow_rules").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, status: "active" }),
    admin.from("email_logs").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, status: "pending" }),
    admin.from("email_logs").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, status: "failed" }),
    admin.from("email_logs").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter }).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    admin.from("sms_logs").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, status: "pending" }),
    admin.from("push_logs").select("*", { count: "exact", head: true }).match({ ...orgFilter, status: "pending" }),
    admin.from("scheduled_notifications").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, status: "pending" }),
  ])

  return {
    data: {
      total_notifications: tn || 0, unread_notifications: un || 0, total_announcements: ta || 0,
      active_announcements: aa || 0, emergency_announcements: ea || 0, active_workflows: aw || 0,
      pending_emails: pe || 0, failed_emails: fe || 0, total_email_sent: es || 0,
      pending_sms: ps || 0, pending_push: pp || 0, scheduled_notifications: sn || 0,
    } as Module10DashboardData,
  }
}

// ── NOTIFICATIONS ──

export async function getNotifications(festivalId?: string, filters?: { status?: string; priority?: string }) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  let q = admin.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.status === "unread") q = q.eq("is_read", false).eq("is_archived", false)
  if (filters?.status === "archived") q = q.eq("is_archived", true)
  if (filters?.priority) q = q.eq("priority", filters.priority)
  const { data } = await q
  return { data: data as Notification[] }
}

export async function getUnreadCount() {
  const user = await getAuth()
  if (!user) return { count: 0 }
  const admin = createAdminClient()
  const { count } = await admin.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false).eq("is_archived", false)
  return { count: count || 0 }
}

export async function markNotificationRead(id: string) {
  const admin = createAdminClient()
  await admin.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id)
  return { success: true }
}

export async function markAllRead() {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  await admin.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("user_id", user.id).eq("is_read", false)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/notifications`)
  return { success: true }
}

export async function archiveNotification(id: string) {
  const admin = createAdminClient()
  await admin.from("notifications").update({ is_archived: true }).eq("id", id)
  return { success: true }
}

export async function sendNotification(data: {
  festival_id?: string; user_id: string; title: string; body?: string; priority?: string
  channel?: string; action_url?: string; action_text?: string
  source_entity_type?: string; source_entity_id?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("notifications").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    user_id: data.user_id, title: data.title, body: data.body || null,
    priority: data.priority || "normal", channel: data.channel || "in_app",
    action_url: data.action_url || null, action_text: data.action_text || null,
    source_entity_type: data.source_entity_type || null, source_entity_id: data.source_entity_id || null,
    status: "sent", sent_at: new Date().toISOString(), created_by: check.user.id,
  })
  if (error) return { error: error.message }
  return { success: true }
}

// ── ANNOUNCEMENTS ──

export async function getAnnouncements(festivalId: string, filters?: { status?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("announcements").select("*, template:announcement_templates(*)").eq("organization_id", check.organization_id).eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function createAnnouncement(data: {
  festival_id: string; title: string; body: string; target?: string; priority?: string
  is_pinned?: boolean; is_emergency?: boolean; scheduled_at?: string; template_id?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload: any = {
    organization_id: check.organization_id, festival_id: data.festival_id, title: data.title, body: data.body,
    target: data.target || "festival", priority: data.priority || "normal",
    is_pinned: data.is_pinned || false, is_emergency: data.is_emergency || false,
    template_id: data.template_id || null, created_by: check.user.id,
  }
  if (data.scheduled_at) { payload.status = "scheduled"; payload.scheduled_at = data.scheduled_at }
  else { payload.status = "published"; payload.published_at = new Date().toISOString() }
  const { error } = await admin.from("announcements").insert(payload)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${data.festival_id}/communication/announcements`)
  return { success: true }
}

export async function updateAnnouncementStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "published") updates.published_at = new Date().toISOString()
  if (status === "archived") updates.archived_at = new Date().toISOString()
  await admin.from("announcements").update(updates).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/announcements`)
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const admin = createAdminClient()
  await admin.from("announcements").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/announcements`)
  return { success: true }
}

// ── EMAIL ──

export async function getEmailTemplates() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("email_templates").select("*").eq("organization_id", check.organization_id).order("template_name")
  return { data: data as EmailTemplate[] }
}

export async function upsertEmailTemplate(data: {
  id?: string; template_name: string; subject: string; body_html: string; body_text?: string
  variables?: any; from_name?: string; from_email?: string; reply_to?: string
}) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = { organization_id: check.organization_id, ...data }
  if (data.id) {
    await admin.from("email_templates").update(payload).eq("id", data.id)
  } else {
    await admin.from("email_templates").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/email/templates`)
  return { success: true }
}

export async function deleteEmailTemplate(id: string) {
  const admin = createAdminClient()
  await admin.from("email_templates").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/email/templates`)
  return { success: true }
}

export async function getEmailLogs(festivalId?: string, filters?: { status?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("email_logs").select("*, template:email_templates(template_name)").eq("organization_id", check.organization_id).order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function sendEmail(data: {
  festival_id?: string; to_address: string; subject: string; body_html: string
  template_id?: string; cc?: string[]; bcc?: string[]
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("email_logs").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    to_address: data.to_address, subject: data.subject, body_html: data.body_html,
    template_id: data.template_id || null, cc_addresses: data.cc || [],
    bcc_addresses: data.bcc || [], status: "pending",
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/email`)
  return { success: true }
}

// ── SMS ──

export async function getSmsLogs(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("sms_logs").select("*, template:sms_templates(template_name)").eq("organization_id", check.organization_id).order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  const { data } = await q
  return { data: data as any[] }
}

export async function sendSms(data: {
  festival_id?: string; to_phone: string; body: string; template_id?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("sms_logs").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    to_number: data.to_phone, body: data.body, template_id: data.template_id || null,
    status: "pending",
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/sms`)
  return { success: true }
}

// ── WORKFLOWS ──

export async function getWorkflows(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("workflow_rules").select("*").eq("organization_id", check.organization_id).order("created_at", { ascending: false })
  if (festivalId) q = q.eq("festival_id", festivalId)
  const { data } = await q
  return { data: data as WorkflowRule[] }
}

export async function upsertWorkflow(data: {
  id?: string; festival_id?: string; rule_name: string; description?: string
  trigger_type: string; trigger_event?: string; trigger_config?: any
  condition_type?: string; condition_field?: string; condition_value?: string
  action_type?: string; action_target?: string; action_params?: any
  cooldown_minutes?: number; status?: string; priority?: number; max_executions?: number
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const conditions: any = {}
  if (data.condition_type) conditions.type = data.condition_type
  if (data.condition_field) conditions.field = data.condition_field
  if (data.condition_value) conditions.value = data.condition_value
  if (data.cooldown_minutes) conditions.cooldown = data.cooldown_minutes
  const actions: any = { type: data.action_type || "send_notification" }
  if (data.action_target) actions.target = data.action_target
  if (data.action_params) actions.params = data.action_params
  const payload = {
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    rule_name: data.rule_name, description: data.description || null,
    trigger_type: data.trigger_type, trigger_event: data.trigger_event || null,
    trigger_config: data.trigger_config || {}, conditions, actions,
    status: data.status || "active",
    priority: data.priority || 0, max_executions: data.max_executions || null,
    created_by: check.user.id,
  }
  if (data.id) {
    await admin.from("workflow_rules").update(payload).eq("id", data.id)
  } else {
    await admin.from("workflow_rules").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/workflows`)
  return { success: true }
}

export async function updateWorkflowStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("workflow_rules").update({ status }).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/workflows`)
  return { success: true }
}

export async function deleteWorkflow(id: string) {
  const admin = createAdminClient()
  await admin.from("workflow_rules").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/workflows`)
  return { success: true }
}

export async function getWorkflowHistory(workflowId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("workflow_history").select("*").eq("workflow_rule_id", workflowId).order("created_at", { ascending: false })
  return { data: data as WorkflowHistory[] }
}

export async function triggerWorkflow(workflowId: string, triggerData?: any) {
  const admin = createAdminClient()
  const { data: rule } = await admin.from("workflow_rules").select("*").eq("id", workflowId).single()
  if (!rule) return { error: "Workflow not found" }
  const { error } = await admin.from("workflow_history").insert({
    workflow_rule_id: workflowId, organization_id: rule.organization_id,
    trigger_event: rule.trigger_event, trigger_data: triggerData || {},
    status: "active", started_at: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  await admin.from("workflow_rules").update({ execution_count: (rule.execution_count || 0) + 1, last_executed_at: new Date().toISOString() }).eq("id", workflowId)
  revalidatePath(`/dashboard/organization/*/festivals/*/communication/workflows`)
  return { success: true }
}

// ── ANNOUNCEMENT TEMPLATES ──

export async function getAnnouncementTemplates() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("announcement_templates").select("*").eq("organization_id", check.organization_id).order("template_name")
  return { data: data as any[] }
}
