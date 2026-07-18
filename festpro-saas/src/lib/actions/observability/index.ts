"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SystemHealth, HealthCheck, ServiceStatus, ApplicationLog, ErrorLog,
  BackupJob, RestoreJob, SystemAlert, IncidentLog, MaintenanceWindow,
  DeploymentHistory, ObservabilityDashboardData,
} from "@/types/observability"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkSuperAdmin() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("user_profiles").select("role").eq("user_id", user.id).single()
  if (!profile || !["super_admin", "platform_admin"].includes(profile.role)) return { allowed: false, error: "Not authorized" } as const
  return { allowed: true, user } as const
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getObservabilityDashboard(): Promise<{ data: ObservabilityDashboardData } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const today = new Date().toISOString().split("T")[0]
    const [{ data: services }, { count: aa }, { count: ca }, { count: oi },
      { count: tl }, { count: el }, { count: tb }, { count: fb },
      { count: pr }, { count: td },
    ] = await Promise.all([
      admin.from("service_statuses").select("service, status, uptime_percent").order("service"),
      admin.from("system_alerts").select("*", { count: "exact", head: true }).eq("status", "active"),
      admin.from("system_alerts").select("*", { count: "exact", head: true }).eq("severity", "critical").eq("status", "active"),
      admin.from("incident_logs").select("*", { count: "exact", head: true }).neq("status", "closed"),
      admin.from("application_logs").select("*", { count: "exact", head: true }).gte("created_at", today),
      admin.from("application_logs").select("*", { count: "exact", head: true }).in("log_level", ["error", "fatal"]).gte("created_at", today),
      admin.from("backup_jobs").select("*", { count: "exact", head: true }),
      admin.from("backup_jobs").select("*", { count: "exact", head: true }).eq("status", "failed"),
      admin.from("restore_jobs").select("*", { count: "exact", head: true }).eq("status", "running"),
      admin.from("deployment_history").select("*", { count: "exact", head: true }),
    ])
    return {
      data: {
        services: (services ?? []).map((s: any) => ({ name: s.service, status: s.status, uptime: s.uptime_percent })),
        active_alerts: aa ?? 0, critical_alerts: ca ?? 0, open_incidents: oi ?? 0,
        total_logs_today: tl ?? 0, error_logs_today: el ?? 0, total_backups: tb ?? 0,
        failed_backups: fb ?? 0, pending_restores: pr ?? 0, total_deployments: td ?? 0,
        avg_response_time: 0, db_size_gb: 0, queue_depth: 0,
      },
    }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// SYSTEM HEALTH
// ============================================================

export async function getSystemHealth(service?: string): Promise<{ data: SystemHealth[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("system_health").select("*").order("last_checked_at", { ascending: false })
    if (service) q = q.eq("service", service)
    const { data } = await q
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createHealthCheck(data: Partial<HealthCheck>): Promise<{ data: HealthCheck } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: chk, error } = await admin.from("health_checks").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: chk }
  } catch (e: any) { return { error: e.message } }
}

export async function updateSystemHealth(id: string, updates: Partial<SystemHealth>): Promise<{ data: SystemHealth } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: h, error } = await admin.from("system_health").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: h }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// SERVICE STATUSES
// ============================================================

export async function getServiceStatuses(): Promise<{ data: ServiceStatus[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("service_statuses").select("*").order("service")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function updateServiceStatus(id: string, updates: Partial<ServiceStatus>): Promise<{ data: ServiceStatus } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: s, error } = await admin.from("service_statuses").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: s }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// APPLICATION LOGS
// ============================================================

export async function getApplicationLogs(options?: { organization_id?: string; log_level?: string; log_source?: string; search?: string; offset?: number; limit?: number }): Promise<{ data: ApplicationLog[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0
    let q = admin.from("application_logs").select("*", { count: "exact" })
    let cq = admin.from("application_logs").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.log_level) { q = q.eq("log_level", options.log_level); cq = cq.eq("log_level", options.log_level) }
    if (options?.log_source) { q = q.eq("log_source", options.log_source); cq = cq.eq("log_source", options.log_source) }
    if (options?.search) { q = q.ilike("message", `%${options.search}%`); cq = cq.ilike("message", `%${options.search}%`) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// ERROR LOGS
// ============================================================

export async function getErrorLogs(options?: { organization_id?: string; resolved?: boolean; search?: string; offset?: number; limit?: number }): Promise<{ data: ErrorLog[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("error_logs").select("*", { count: "exact" })
    let cq = admin.from("error_logs").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.resolved !== undefined) { q = q.eq("is_resolved", options.resolved); cq = cq.eq("is_resolved", options.resolved) }
    if (options?.search) { q = q.ilike("message", `%${options.search}%`); cq = cq.ilike("message", `%${options.search}%`) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function resolveErrorLog(id: string): Promise<{ data: ErrorLog } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: e, error } = await admin.from("error_logs").update({ is_resolved: true, resolved_at: new Date().toISOString(), resolved_by: auth.user.id }).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: e }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// BACKUP JOBS
// ============================================================

export async function getBackupJobs(options?: { organization_id?: string; status?: string; offset?: number; limit?: number }): Promise<{ data: BackupJob[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("backup_jobs").select("*", { count: "exact" })
    let cq = admin.from("backup_jobs").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createBackupJob(data: Partial<BackupJob>): Promise<{ data: BackupJob } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: job, error } = await admin.from("backup_jobs").insert({ ...data, status: "pending", created_by: auth.user.id }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: job }
  } catch (e: any) { return { error: e.message } }
}

export async function updateBackupJob(id: string, updates: Partial<BackupJob>): Promise<{ data: BackupJob } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: job, error } = await admin.from("backup_jobs").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: job }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// RESTORE JOBS
// ============================================================

export async function getRestoreJobs(options?: { organization_id?: string; status?: string; offset?: number; limit?: number }): Promise<{ data: RestoreJob[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("restore_jobs").select("*", { count: "exact" })
    let cq = admin.from("restore_jobs").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createRestoreJob(data: Partial<RestoreJob>): Promise<{ data: RestoreJob } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: job, error } = await admin.from("restore_jobs").insert({ ...data, status: "pending", requested_by: auth.user.id }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: job }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// SYSTEM ALERTS
// ============================================================

export async function getSystemAlerts(options?: { organization_id?: string; severity?: string; status?: string; offset?: number; limit?: number }): Promise<{ data: SystemAlert[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("system_alerts").select("*", { count: "exact" })
    let cq = admin.from("system_alerts").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.severity) { q = q.eq("severity", options.severity); cq = cq.eq("severity", options.severity) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function acknowledgeAlert(id: string): Promise<{ data: SystemAlert } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: a, error } = await admin.from("system_alerts").update({ status: "acknowledged", acknowledged_by: auth.user.id, acknowledged_at: new Date().toISOString() }).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: a }
  } catch (e: any) { return { error: e.message } }
}

export async function resolveAlert(id: string, note?: string): Promise<{ data: SystemAlert } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: a, error } = await admin.from("system_alerts").update({ status: "resolved", resolved_by: auth.user.id, resolved_at: new Date().toISOString(), resolved_note: note ?? null }).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: a }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// INCIDENT LOGS
// ============================================================

export async function getIncidentLogs(options?: { organization_id?: string; severity?: string; status?: string; offset?: number; limit?: number }): Promise<{ data: IncidentLog[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("incident_logs").select("*", { count: "exact" })
    let cq = admin.from("incident_logs").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.severity) { q = q.eq("severity", options.severity); cq = cq.eq("severity", options.severity) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createIncident(data: Partial<IncidentLog>): Promise<{ data: IncidentLog } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: inc, error } = await admin.from("incident_logs").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: inc }
  } catch (e: any) { return { error: e.message } }
}

export async function updateIncident(id: string, updates: Partial<IncidentLog>): Promise<{ data: IncidentLog } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: inc, error } = await admin.from("incident_logs").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: inc }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// MAINTENANCE WINDOWS
// ============================================================

export async function getMaintenanceWindows(options?: { organization_id?: string; status?: string; offset?: number; limit?: number }): Promise<{ data: MaintenanceWindow[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("maintenance_windows").select("*", { count: "exact" })
    let cq = admin.from("maintenance_windows").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("scheduled_start", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createMaintenanceWindow(data: Partial<MaintenanceWindow>): Promise<{ data: MaintenanceWindow } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: mw, error } = await admin.from("maintenance_windows").insert({ ...data, created_by: auth.user.id }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: mw }
  } catch (e: any) { return { error: e.message } }
}

export async function updateMaintenanceWindow(id: string, updates: Partial<MaintenanceWindow>): Promise<{ data: MaintenanceWindow } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: mw, error } = await admin.from("maintenance_windows").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: mw }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// DEPLOYMENT HISTORY
// ============================================================

export async function getDeploymentHistory(options?: { organization_id?: string; environment?: string; offset?: number; limit?: number }): Promise<{ data: DeploymentHistory[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("deployment_history").select("*", { count: "exact" })
    let cq = admin.from("deployment_history").select("*", { count: "exact", head: true })
    if (options?.organization_id) { q = q.eq("organization_id", options.organization_id); cq = cq.eq("organization_id", options.organization_id) }
    if (options?.environment) { q = q.eq("environment", options.environment); cq = cq.eq("environment", options.environment) }
    q = q.order("created_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createDeployment(data: Partial<DeploymentHistory>): Promise<{ data: DeploymentHistory } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: dep, error } = await admin.from("deployment_history").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/observability")
    return { data: dep }
  } catch (e: any) { return { error: e.message } }
}
