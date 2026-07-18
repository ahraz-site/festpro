"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  AuditLog, LoginHistory, SecurityEvent, FailedLogin, ActiveSession,
  Device, IpWhitelist, IpBlacklist, SystemSetting, MaintenanceMode,
  SystemHealth, FeatureFlag, ApiToken, SystemBackup, ErrorLog, ActivityStream,
  Module11DashboardData,
} from "@/types/security"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkAdmin(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  if (festivalId) {
    const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, member: member as { role: UserRole } } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id, member: members[0] as { role: UserRole } } as const
}

// ── DASHBOARD ──

export async function getSecurityDashboard(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const orgFilter = {} as any
  const festFilter = festivalId ? { festival_id: festivalId } : {}

  const [
    { count: al }, { count: se }, { count: ce }, { count: as },
    { count: fl }, { count: at }, { count: shh }, { count: sht },
    { count: el }, { count: ffe }, { count: bc }, { count: ib },
  ] = await Promise.all([
    admin.from("audit_logs").select("*", { count: "exact", head: true }).match(orgFilter),
    admin.from("security_events").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter }),
    admin.from("security_events").select("*", { count: "exact", head: true }).match({ ...orgFilter, ...festFilter, severity: "critical", is_resolved: false }),
    admin.from("active_sessions").select("*", { count: "exact", head: true }),
    admin.from("failed_logins").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    admin.from("api_tokens").select("*", { count: "exact", head: true }).match({ is_revoked: false }),
    admin.from("system_health").select("*", { count: "exact", head: true }).eq("status", "healthy"),
    admin.from("system_health").select("*", { count: "exact", head: true }),
    admin.from("error_logs").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    admin.from("feature_flags").select("*", { count: "exact", head: true }).match({ is_enabled: true }),
    admin.from("system_backups").select("*", { count: "exact", head: true }).in("status", ["completed", "verified"]),
    admin.from("ip_blacklist").select("*", { count: "exact", head: true }).match({ is_active: true }),
  ])

  return {
    data: {
      total_audit_logs: al || 0, security_events: se || 0, critical_events: ce || 0,
      active_sessions: as || 0, failed_logins_24h: fl || 0, api_tokens: at || 0,
      system_health_healthy: shh || 0, system_health_total: sht || 0,
      error_logs_24h: el || 0, feature_flags_enabled: ffe || 0,
      backups_completed: bc || 0, ip_blacklist_count: ib || 0,
    } as Module11DashboardData,
  }
}

// ── AUDIT LOGS ──

export async function getAuditLogs(festivalId?: string, filters?: {
  action?: string; status?: string; userId?: string; days?: number
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  let q = admin.from("audit_logs").select("*, profiles:user_id(first_name, last_name)").order("created_at", { ascending: false }).limit(200)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.action) q = q.eq("action", filters.action)
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.userId) q = q.eq("user_id", filters.userId)
  if (filters?.days) q = q.gte("created_at", new Date(Date.now() - filters.days * 86400000).toISOString())
  const { data } = await q
  return { data: data as AuditLog[] }
}

export async function getAuditLog(id: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("audit_logs").select("*, profiles:user_id(first_name, last_name)").eq("id", id).single()
  return { data: data as AuditLog | null }
}

// ── LOGIN HISTORY ──

export async function getLoginHistory(festivalId?: string, filters?: {
  userId?: string; days?: number; status?: string
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  let q = admin.from("login_history").select("*").order("login_at", { ascending: false }).limit(100)
  if (filters?.userId) q = q.eq("user_id", filters.userId)
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.days) q = q.gte("login_at", new Date(Date.now() - filters.days * 86400000).toISOString())
  const { data } = await q
  return { data: data as LoginHistory[] }
}

// ── SECURITY EVENTS ──

export async function getSecurityEvents(festivalId?: string, filters?: {
  eventType?: string; severity?: string; resolved?: boolean; days?: number
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  let q = admin.from("security_events").select("*").order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.eventType) q = q.eq("event_type", filters.eventType)
  if (filters?.severity) q = q.eq("severity", filters.severity)
  if (filters?.resolved !== undefined) q = q.eq("is_resolved", filters.resolved)
  if (filters?.days) q = q.gte("created_at", new Date(Date.now() - filters.days * 86400000).toISOString())
  const { data } = await q
  return { data: data as SecurityEvent[] }
}

export async function resolveSecurityEvent(id: string) {
  const admin = createAdminClient()
  await admin.from("security_events").update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/security")
  return { success: true }
}

// ── ACTIVE SESSIONS ──

export async function getActiveSessions() {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data } = await admin.from("active_sessions").select("*, profiles:user_id(first_name, last_name, email)").order("last_active_at", { ascending: false }).limit(50)
  return { data: data as ActiveSession[] }
}

export async function forceLogoutSession(sessionId: string) {
  const admin = createAdminClient()
  await admin.from("active_sessions").delete().eq("id", sessionId)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/sessions")
  return { success: true }
}

export async function forceLogoutAll(userId: string) {
  const admin = createAdminClient()
  await admin.from("active_sessions").delete().eq("user_id", userId)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/sessions")
  return { success: true }
}

// ── FAILED LOGINS ──

export async function getFailedLogins(festivalId?: string, filters?: { days?: number }) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  let q = admin.from("failed_logins").select("*").order("last_attempt_at", { ascending: false }).limit(100)
  if (filters?.days) q = q.gte("created_at", new Date(Date.now() - filters.days * 86400000).toISOString())
  const { data } = await q
  return { data: data as FailedLogin[] }
}

// ── IP MANAGEMENT ──

export async function getIpWhitelist(organizationId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("ip_whitelist").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false })
  return { data: data as IpWhitelist[] }
}

export async function upsertIpWhitelist(data: { id?: string; organization_id: string; ip_address: string; label?: string }) {
  const admin = createAdminClient()
  if (data.id) {
    await admin.from("ip_whitelist").update(data).eq("id", data.id)
  } else {
    await admin.from("ip_whitelist").insert(data)
  }
  revalidatePath("/dashboard/organization/*/festivals/*/admin/security")
  return { success: true }
}

export async function deleteIpWhitelist(id: string) {
  const admin = createAdminClient()
  await admin.from("ip_whitelist").delete().eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/security")
  return { success: true }
}

export async function getIpBlacklist(organizationId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("ip_blacklist").select("*").eq("organization_id", organizationId).order("blocked_at", { ascending: false })
  return { data: data as IpBlacklist[] }
}

export async function upsertIpBlacklist(data: { id?: string; organization_id: string; ip_address: string; reason?: string; expires_at?: string }) {
  const admin = createAdminClient()
  if (data.id) {
    await admin.from("ip_blacklist").update(data).eq("id", data.id)
  } else {
    await admin.from("ip_blacklist").insert(data)
  }
  revalidatePath("/dashboard/organization/*/festivals/*/admin/security")
  return { success: true }
}

export async function unblockIp(id: string) {
  const admin = createAdminClient()
  await admin.from("ip_blacklist").update({ is_active: false }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/security")
  return { success: true }
}

// ── SYSTEM SETTINGS ──

export async function getSystemSettings(group?: string) {
  const admin = createAdminClient()
  let q = admin.from("system_settings").select("*").order("setting_group").order("setting_key")
  if (group) q = q.eq("setting_group", group)
  const { data } = await q
  return { data: data as SystemSetting[] }
}

export async function updateSystemSetting(id: string, value: any) {
  const admin = createAdminClient()
  await admin.from("system_settings").update({ setting_value: value, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/settings")
  return { success: true }
}

// ── MAINTENANCE MODE ──

export async function getMaintenanceMode(organizationId?: string) {
  const admin = createAdminClient()
  let q = admin.from("maintenance_mode").select("*").order("created_at", { ascending: false }).limit(1)
  if (organizationId) q = q.eq("organization_id", organizationId)
  else q = q.is("organization_id", null)
  const { data } = await q
  return { data: data?.[0] as MaintenanceMode | null }
}

export async function toggleMaintenanceMode(data: {
  organization_id?: string; is_active: boolean; scope?: string; message?: string
  scheduled_start?: string; scheduled_end?: string
}) {
  const check = await checkAdmin(data.organization_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const existing = await admin.from("maintenance_mode").select("id").is("organization_id", data.organization_id || null).limit(1)
  const id = existing.data?.[0]?.id
  const payload = {
    organization_id: data.organization_id || null, is_active: data.is_active,
    scope: data.scope || "full", message: data.message || null,
    scheduled_start: data.scheduled_start || null, scheduled_end: data.scheduled_end || null,
    started_by: check.user.id, started_at: data.is_active ? new Date().toISOString() : null,
    ended_at: data.is_active ? null : new Date().toISOString(),
  }
  if (id) await admin.from("maintenance_mode").update(payload).eq("id", id)
  else await admin.from("maintenance_mode").insert(payload)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/settings")
  return { success: true }
}

// ── SYSTEM HEALTH ──

export async function getSystemHealth() {
  const admin = createAdminClient()
  const { data } = await admin.from("system_health").select("*").order("component")
  return { data: data as SystemHealth[] }
}

// ── FEATURE FLAGS ──

export async function getFeatureFlags(organizationId?: string) {
  const admin = createAdminClient()
  let q = admin.from("feature_flags").select("*").order("flag_name")
  if (organizationId) q = q.eq("organization_id", organizationId)
  else q = q.is("organization_id", null)
  const { data } = await q
  return { data: data as FeatureFlag[] }
}

export async function toggleFeatureFlag(id: string, isEnabled: boolean) {
  const admin = createAdminClient()
  await admin.from("feature_flags").update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/features")
  return { success: true }
}

export async function updateFeatureFlag(data: {
  id?: string; organization_id?: string; flag_key: string; flag_name: string
  description?: string; is_enabled?: boolean; is_beta?: boolean
  allowed_roles?: string[]; percentage?: number
}) {
  const admin = createAdminClient()
  const payload = { ...data, updated_by: (await getAuth())?.id }
  if (data.id) {
    await admin.from("feature_flags").update(payload).eq("id", data.id)
  } else {
    await admin.from("feature_flags").insert({ ...payload, created_by: (await getAuth())?.id })
  }
  revalidatePath("/dashboard/organization/*/festivals/*/admin/features")
  return { success: true }
}

// ── API TOKENS ──

export async function getApiTokens(organizationId?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  let q = admin.from("api_tokens").select("*").order("created_at", { ascending: false })
  if (organizationId) q = q.eq("organization_id", organizationId)
  const { data } = await q
  return { data: data as ApiToken[] }
}

export async function createApiToken(data: {
  organization_id: string; token_name: string; permissions?: string
  allowed_ips?: string[]; allowed_modules?: string[]; rate_limit?: number; expires_at?: string
}) {
  const check = await checkAdmin(data.organization_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  async function sha256(msg: string) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
  }
  const rawToken = `fp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 14)}`
  const tokenHash = await sha256(rawToken)
  const { error } = await admin.from("api_tokens").insert({
    organization_id: data.organization_id, user_id: check.user.id,
    token_name: data.token_name, token_hash: tokenHash, token_prefix: rawToken.substring(0, 12),
    permissions: data.permissions || "read", allowed_ips: data.allowed_ips || [],
    allowed_modules: data.allowed_modules || [], rate_limit: data.rate_limit || 1000,
    expires_at: data.expires_at || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/*/festivals/*/admin/api-tokens")
  return { success: true, token: rawToken }
}

export async function revokeApiToken(id: string) {
  const admin = createAdminClient()
  await admin.from("api_tokens").update({ is_revoked: true, revoked_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/api-tokens")
  return { success: true }
}

// ── BACKUPS ──

export async function getBackups(organizationId?: string) {
  const admin = createAdminClient()
  let q = admin.from("system_backups").select("*").order("created_at", { ascending: false }).limit(50)
  if (organizationId) q = q.eq("organization_id", organizationId)
  else q = q.is("organization_id", null)
  const { data } = await q
  return { data: data as SystemBackup[] }
}

export async function createBackup(data: {
  organization_id?: string; backup_name: string; backup_type?: string
}) {
  const admin = createAdminClient()
  const { error } = await admin.from("system_backups").insert({
    organization_id: data.organization_id || null, backup_name: data.backup_name,
    backup_type: data.backup_type || "full", status: "pending",
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/*/festivals/*/admin/backups")
  return { success: true }
}

// ── ERROR LOGS ──

export async function getErrorLogs(festivalId?: string, filters?: {
  errorType?: string; resolved?: boolean; days?: number
}) {
  const admin = createAdminClient()
  let q = admin.from("error_logs").select("*").order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.errorType) q = q.eq("error_type", filters.errorType)
  if (filters?.resolved !== undefined) q = q.eq("is_resolved", filters.resolved)
  if (filters?.days) q = q.gte("created_at", new Date(Date.now() - filters.days * 86400000).toISOString())
  const { data } = await q
  return { data: data as ErrorLog[] }
}

export async function resolveErrorLog(id: string) {
  const admin = createAdminClient()
  await admin.from("error_logs").update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/admin/errors")
  return { success: true }
}

// ── ACTIVITY STREAM ──

export async function getActivityStream(festivalId?: string) {
  const admin = createAdminClient()
  let q = admin.from("activity_stream").select("*, profiles:user_id(first_name, last_name)").order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  const { data } = await q
  return { data: data as ActivityStream[] }
}
