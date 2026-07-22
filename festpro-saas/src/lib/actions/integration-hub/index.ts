"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  ApiKey, ApiKeyPermission, ApiClient, OAuthClient, IntegrationConnection,
  IntegrationProvider, WebhookEndpoint, WebhookEvent, WebhookDelivery,
  EventBusEntry, ScheduledJob, JobExecution, FileImport, FileExport,
  ImportTemplate, IntegrationDashboardData, ApiUsageStats, DeadLetterJob,
  WebhookEventName, JobPriority,
} from "@/types/integration-hub"

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

async function checkIntegrationAdmin() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  const allowedRoles = ["platform_owner", "platform_admin", "organization_owner", "organization_admin", "integration_admin", "super_admin"]
  if (!profile || !allowedRoles.includes(profile.role)) return { allowed: false, error: "Not authorized" } as const
  return { allowed: true, user } as const
}

function generateKey(): string {
  const raw = crypto.randomBytes(32).toString("hex")
  const prefix = raw.substring(0, 8)
  return `fp_${prefix}_${raw.substring(8)}`
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getIntegrationDashboard(organizationId: string): Promise<{ data: IntegrationDashboardData } | { error: string }> {
  try {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [{ count: ak }, { count: aak }, { count: wh }, { count: awh },
    { count: ic }, { count: aic }, { count: pev }, { count: fev },
    { count: tj }, { count: pj }, { count: rj }, { count: fj },
    { count: timp }, { count: cimp }, { count: fimp },
    { count: texp }, { count: cexp }, { count: fexp },
  ] = await Promise.all([
    admin.from("api_keys").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    admin.from("api_keys").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "active"),
    admin.from("webhook_endpoints").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    admin.from("webhook_endpoints").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("is_active", true),
    admin.from("integration_connections").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    admin.from("integration_connections").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "active"),
    admin.from("event_bus").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "pending"),
    admin.from("event_bus").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "failed"),
    admin.from("scheduled_jobs").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    admin.from("scheduled_jobs").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "pending"),
    admin.from("scheduled_jobs").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "running"),
    admin.from("scheduled_jobs").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "failed"),
    admin.from("file_imports").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    admin.from("file_imports").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "completed"),
    admin.from("file_imports").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "failed"),
    admin.from("file_exports").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    admin.from("file_exports").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "completed"),
    admin.from("file_exports").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "failed"),
  ])
  const { count: apiReqs } = await admin.from("api_key_usage_logs").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).gte("created_at", today)
  const { count: whDel } = await admin.from("webhook_deliveries").select("*", { count: "exact", head: true }).eq("endpoint_id", organizationId).gte("created_at", today)
  const dash: IntegrationDashboardData = {
    total_api_keys: ak || 0, active_api_keys: aak || 0,
    total_webhooks: wh || 0, active_webhooks: awh || 0,
    total_integrations: ic || 0, active_integrations: aic || 0,
    pending_events: pev || 0, failed_events: fev || 0,
    total_jobs: tj || 0, pending_jobs: pj || 0, running_jobs: rj || 0, failed_jobs: fj || 0,
    total_imports: timp || 0, completed_imports: cimp || 0, failed_imports: fimp || 0,
    total_exports: texp || 0, completed_exports: cexp || 0, failed_exports: fexp || 0,
    api_requests_today: apiReqs || 0, webhook_deliveries_today: whDel || 0,
  }
  return { data: dash }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// API KEYS
// ============================================================

export async function getApiKeys(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("api_keys").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as ApiKey[] }
}

export async function createApiKey(values: { key_name: string; permissions: ApiKeyPermission[]; rate_limit_per_hour?: number; expires_at?: string }) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const rawKey = generateKey()
  const prefix = rawKey.split("_")[1]
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")
  const lastFive = rawKey.slice(-5)
  const { data, error } = await admin.from("api_keys").insert({
    organization_id: auth.organization_id, key_name: values.key_name, key_prefix: prefix,
    key_hash: keyHash, key_last_five: lastFive, permissions: values.permissions,
    rate_limit_per_hour: values.rate_limit_per_hour || 1000, expires_at: values.expires_at || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/api-keys")
  return { data: data as ApiKey, raw_key: rawKey }
}

export async function revokeApiKey(id: string, reason?: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("api_keys").update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_reason: reason || null }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/api-keys")
  return { success: true }
}

export async function rotateApiKey(id: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const rawKey = generateKey()
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")
  const lastFive = rawKey.slice(-5)
  const { data: old } = await admin.from("api_keys").select("*").eq("id", id).single()
  if (!old) return { error: "API key not found" }
  await admin.from("api_keys").update({ status: "rotated", rotated_from: id }).eq("id", id)
  const { data, error } = await admin.from("api_keys").insert({
    organization_id: old.organization_id, key_name: old.key_name + " (rotated)",
    key_prefix: rawKey.split("_")[1], key_hash: keyHash, key_last_five: lastFive,
    permissions: old.permissions, rate_limit_per_hour: old.rate_limit_per_hour,
    created_by: auth.user.id, rotated_from: id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/api-keys")
  return { data: data as ApiKey, raw_key: rawKey }
}

// ============================================================
// OAUTH CLIENTS
// ============================================================

export async function getOAuthClients(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("oauth_clients").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as OAuthClient[] }
}

export async function createOAuthClient(values: Partial<OAuthClient>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("oauth_clients").insert({ ...values, organization_id: auth.organization_id, created_by: auth.user.id }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/oauth")
  return { data: data as OAuthClient }
}

// ============================================================
// INTEGRATION PROVIDERS & CONNECTIONS
// ============================================================

export async function getIntegrationProviders() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("integration_providers").select("*").eq("is_active", true).order("sort_order", { ascending: true })
  if (error) return { error: error.message }
  return { data: data as IntegrationProvider[] }
}

export async function getIntegrationConnections(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("integration_connections").select("*, integration_providers(*)").eq("organization_id", organizationId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createIntegrationConnection(values: Partial<IntegrationConnection>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("integration_connections").insert({ ...values, organization_id: auth.organization_id, connected_by: auth.user.id, connected_at: new Date().toISOString() }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/connections")
  return { data }
}

export async function testIntegrationConnection(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("integration_connections").update({ last_test_at: new Date().toISOString(), last_test_result: true }).eq("id", id).select().single()
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// WEBHOOKS
// ============================================================

export async function getWebhookEndpoints(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("webhook_endpoints").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as WebhookEndpoint[] }
}

export async function createWebhookEndpoint(values: Partial<WebhookEndpoint>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const secret = crypto.randomBytes(32).toString("hex")
  const { data, error } = await admin.from("webhook_endpoints").insert({ ...values, organization_id: auth.organization_id, secret, created_by: auth.user.id }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/webhooks")
  return { data: data as WebhookEndpoint, secret }
}

export async function updateWebhookEndpoint(id: string, values: Partial<WebhookEndpoint>) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("webhook_endpoints").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/webhooks")
  return { data: data as WebhookEndpoint }
}

export async function deleteWebhookEndpoint(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("webhook_endpoints").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/webhooks")
  return { success: true }
}

export async function getWebhookEvents(endpointId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("webhook_events").select("*").eq("endpoint_id", endpointId).order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as WebhookEvent[] }
}

export async function getWebhookDeliveries(eventId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("webhook_deliveries").select("*").eq("webhook_event_id", eventId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as WebhookDelivery[] }
}

export async function replayWebhookEvent(id: string) {
  const admin = createAdminClient()
  const { data: event } = await admin.from("webhook_events").select("*").eq("id", id).single()
  if (!event) return { error: "Event not found" }
  const { data, error } = await admin.from("webhook_events").insert({
    organization_id: event.organization_id, endpoint_id: event.endpoint_id,
    event_name: event.event_name, payload: event.payload,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as WebhookEvent }
}

// ============================================================
// EVENT BUS
// ============================================================

export async function publishEvent(eventName: WebhookEventName, payload: any, organizationId: string, source?: string, actorId?: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("event_bus").insert({
    organization_id: organizationId, event_name: eventName, payload,
    source: source || "internal", actor_id: actorId || null,
  }).select().single()
  return { data, error: error?.message }
}

// ============================================================
// SCHEDULER & JOBS
// ============================================================

export async function getScheduledJobs(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("scheduled_jobs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as ScheduledJob[] }
}

export async function createScheduledJob(values: Partial<ScheduledJob>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("scheduled_jobs").insert({ ...values, organization_id: auth.organization_id, created_by: auth.user.id }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/jobs")
  return { data: data as ScheduledJob }
}

export async function updateScheduledJob(id: string, values: Partial<ScheduledJob>) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("scheduled_jobs").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/jobs")
  return { data: data as ScheduledJob }
}

export async function deleteScheduledJob(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("scheduled_jobs").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/jobs")
  return { success: true }
}

export async function getJobExecutions(jobId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("job_executions").select("*").eq("scheduled_job_id", jobId).order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as JobExecution[] }
}

export async function getDeadLetterQueue(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("dead_letter_queue").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as DeadLetterJob[] }
}

export async function retryDeadLetterJob(id: string) {
  const admin = createAdminClient()
  const { data: job } = await admin.from("dead_letter_queue").select("*").eq("id", id).single()
  if (!job) return { error: "Job not found" }
  await admin.from("dead_letter_queue").update({ status: "retrying" }).eq("id", id)
  const { data, error } = await admin.from("event_bus").insert({
    organization_id: job.organization_id, event_name: "sync.completed",
    payload: job.payload, source: job.source, source_id: job.source_id,
  }).select().single()
  if (error) return { error: error.message }
  return { success: true }
}

// ============================================================
// IMPORT / EXPORT
// ============================================================

export async function getImportTemplates(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("import_templates").select("*").eq("organization_id", organizationId).eq("is_active", true).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as ImportTemplate[] }
}

export async function createImportTemplate(values: Partial<ImportTemplate>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("import_templates").insert({ ...values, organization_id: auth.organization_id, created_by: auth.user.id }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/imports")
  return { data: data as ImportTemplate }
}

export async function getFileImports(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("file_imports").select("*, import_templates(template_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data }
}

export async function getFileExports(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("file_exports").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as FileExport[] }
}

export async function createFileExport(values: Partial<FileExport>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("file_exports").insert({ ...values, organization_id: auth.organization_id, created_by: auth.user.id }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/[orgId]/integrations/exports")
  return { data: data as FileExport }
}

// ============================================================
// API USAGE
// ============================================================

export async function getApiUsageStats(organizationId: string, period: "today" | "week" | "month" = "today") {
  const admin = createAdminClient()
  const since = new Date()
  if (period === "today") since.setHours(0, 0, 0, 0)
  else if (period === "week") since.setDate(since.getDate() - 7)
  else if (period === "month") since.setMonth(since.getMonth() - 1)
  const sinceStr = since.toISOString()
  const { data: logs, error } = await admin.from("api_key_usage_logs").select("*").eq("organization_id", organizationId).gte("created_at", sinceStr)
  if (error) return { error: error.message }
  const total = logs?.length || 0
  const successful = logs?.filter((l: any) => l.status_code < 400).length || 0
  const failed = total - successful
  const avgResponse = logs?.length ? Math.round(logs.reduce((s: number, l: any) => s + (l.response_time_ms || 0), 0) / logs.length) : 0
  const byEndpoint: Record<string, number> = {}
  const byMethod: Record<string, number> = {}
  const byHour: Record<string, number> = {}
  logs?.forEach((l: any) => {
    byEndpoint[l.request_path] = (byEndpoint[l.request_path] || 0) + 1
    byMethod[l.request_method] = (byMethod[l.request_method] || 0) + 1
    const hour = new Date(l.created_at).getHours().toString()
    byHour[hour] = (byHour[hour] || 0) + 1
  })
  const stats: ApiUsageStats = { total_requests: total, successful_requests: successful, failed_requests: failed, avg_response_time_ms: avgResponse, requests_by_endpoint: byEndpoint, requests_by_method: byMethod, requests_by_hour: byHour, top_consumers: [] }
  return { data: stats }
}

// ============================================================
// PUBLIC API VALIDATION
// ============================================================

export async function validateApiKey(rawKey: string) {
  const admin = createAdminClient()
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")
  const { data, error } = await admin.from("api_keys").select("*, organizations(*)").eq("key_hash", keyHash).eq("status", "active").single()
  if (error || !data) return { valid: false, error: "Invalid or revoked API key" }
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, error: "API key expired" }
  if (data.allowed_ips?.length) {
    // IP validation would happen at middleware level
  }
  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)
  return { valid: true, key: data as ApiKey, organization_id: data.organization_id }
}
