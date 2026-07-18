"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  MobileDevice, DeviceRegistration, DeviceSession, OfflineSyncQueue, SyncLog,
  MobileSetting, PushSubscription, PushDeliveryLog, MobileActivityLog, OfflineForm,
  OfflineMediaUpload, SyncQueueItem, PushNotificationPayload, QrVerificationResult,
  MobileDashboardData, MobileDevicePlatform, SyncPriority,
} from "@/types/mobile-platform"

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

function generateNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getMobileDashboard(organizationId?: string, festivalId?: string): Promise<{ data?: MobileDashboardData; error?: string }> {
  const admin = createAdminClient()
  const orgId = organizationId
  if (!orgId) {
    const auth = await checkOrgAccess(festivalId)
    if (!auth.allowed) return { error: auth.error }
    const dash = await getMobileDashboard(auth.organization_id, festivalId)
    return dash
  }
  const today = new Date().toISOString().split("T")[0]
  const q = admin.from("mobile_devices").select("*", { count: "exact", head: true }).eq("organization_id", orgId)
  const [{ count: ad }, { count: rd }, { count: ps }, { count: fs }, { count: pp }, { count: pd },
    { count: pf }, { count: of }, { count: pu }, { count: ta }, { count: ass }] = await Promise.all([
    admin.from("mobile_devices").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    admin.from("device_registrations").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("is_active", true),
    admin.from("offline_sync_queue").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "pending"),
    admin.from("offline_sync_queue").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "failed"),
    admin.from("push_delivery_logs").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "sent"),
    admin.from("push_delivery_logs").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "delivered"),
    admin.from("push_delivery_logs").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "failed"),
    admin.from("offline_forms").select("*", { count: "exact", head: true }).eq("organization_id", orgId).not("status", "in", "('synced')"),
    admin.from("offline_media_uploads").select("*", { count: "exact", head: true }).eq("organization_id", orgId).neq("status", "completed"),
    admin.from("mobile_activity_logs").select("*", { count: "exact", head: true }).eq("organization_id", orgId).gte("created_at", today),
    admin.from("device_sessions").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
  ])
  const dash = {
    active_devices: ad || 0, registered_devices: rd || 0, pending_syncs: ps || 0,
    failed_syncs: fs || 0, push_sent: pp || 0, push_delivered: pd || 0, push_failed: pf || 0,
    offline_forms: of || 0, pending_uploads: pu || 0, today_activity: ta || 0,
    sync_success_rate: ((ps || 0) + (fs || 0)) > 0 ? Math.round(((ps || 0) / ((ps || 0) + (fs || 0))) * 100) : 100,
    active_sessions: ass || 0,
  }
  return { data: dash }
}

// ============================================================
// MOBILE DEVICES
// ============================================================

export async function getMobileDevices(organizationId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("mobile_devices").select("*").eq("organization_id", organizationId).order("last_active_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as MobileDevice[] }
}

export async function getMobileDevice(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("mobile_devices").select("*, device_registrations(*, user_id), device_sessions(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function registerDevice(form: { device_id: string; device_name: string; device_platform: MobileDevicePlatform; device_model?: string; os_version?: string; fcm_token?: string }) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: existing } = await admin.from("mobile_devices").select("id").eq("device_id", form.device_id).maybeSingle()
  if (existing) {
    const { data, error } = await admin.from("mobile_devices").update({ device_name: form.device_name, device_platform: form.device_platform, device_model: form.device_model || null, os_version: form.os_version || null, fcm_token: form.fcm_token || null, last_active_at: new Date().toISOString(), status: "active" }).eq("id", existing.id).select().single()
    if (error) return { error: error.message }
    await logActivity(auth.organization_id, undefined, (data as any).id, auth.user.id, "settings_change", "Device re-registered")
    return { data: data as MobileDevice }
  }
  const { data, error } = await admin.from("mobile_devices").insert({
    organization_id: auth.organization_id, device_id: form.device_id, device_name: form.device_name,
    device_platform: form.device_platform, device_model: form.device_model || null,
    os_version: form.os_version || null, fcm_token: form.fcm_token || null,
  }).select().single()
  if (error) return { error: error.message }
  await logActivity(auth.organization_id, undefined, (data as any).id, auth.user.id, "login", "Device registered")
  return { data: data as MobileDevice }
}

export async function updateMobileDeviceStatus(id: string, status: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("mobile_devices").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/mobile`)
  return { data: data as MobileDevice }
}

// ============================================================
// DEVICE REGISTRATIONS
// ============================================================

export async function getDeviceRegistrations(organizationId: string, deviceId?: string) {
  const admin = createAdminClient()
  let query = admin.from("device_registrations").select("*, mobile_devices(device_name, device_platform), auth.users(email)").eq("organization_id", organizationId).order("registered_at", { ascending: false })
  if (deviceId) query = query.eq("device_id", deviceId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createDeviceRegistration(deviceId: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("device_registrations").insert({
    organization_id: auth.organization_id, device_id: deviceId, user_id: auth.user.id, is_remembered: true, is_trusted: true,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as DeviceRegistration }
}

// ============================================================
// DEVICE SESSIONS
// ============================================================

export async function getActiveSessions(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("device_sessions").select("*, device_registrations!inner(mobile_devices(device_name))").eq("organization_id", organizationId).eq("status", "active").order("started_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function terminateSession(id: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from("device_sessions").update({ status: "terminated", terminated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/mobile")
  return { success: true }
}

export async function remoteLogout(deviceRegistrationId: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  await admin.from("device_sessions").update({ status: "revoked", terminated_at: new Date().toISOString() }).eq("device_registration_id", deviceRegistrationId)
  await admin.from("device_registrations").update({ is_active: false }).eq("id", deviceRegistrationId)
  revalidatePath("/mobile")
  return { success: true }
}

// ============================================================
// OFFLINE SYNC QUEUE
// ============================================================

export async function getSyncQueue(organizationId: string, status?: string, deviceId?: string) {
  const admin = createAdminClient()
  let query = admin.from("offline_sync_queue").select("*, mobile_devices(device_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100)
  if (status) query = query.eq("status", status)
  if (deviceId) query = query.eq("device_id", deviceId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function enqueueSync(items: SyncQueueItem[]) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const promises = items.map(async (item) => {
    const { data: device } = await admin.from("mobile_devices").select("id").eq("organization_id", auth.organization_id).eq("status", "active").limit(1).maybeSingle()
    if (!device) return null
    return admin.from("offline_sync_queue").insert({
      organization_id: auth.organization_id, festival_id: item.festival_id || null, device_id: device.id,
      user_id: auth.user.id, sync_operation: item.sync_operation, table_name: item.table_name,
      record_id: item.record_id || null, payload: item.payload, previous_state: item.previous_state || null,
      priority: item.priority || "medium",
    }).select().single()
  })
  const results = await Promise.all(promises)
  return { data: results.filter(Boolean) }
}

export async function processSyncQueue(deviceId: string) {
  const admin = createAdminClient()
  const { data: items } = await admin.from("offline_sync_queue").select("*")
    .eq("device_id", deviceId).eq("status", "pending").order("priority", { ascending: true }).order("created_at").limit(50)
  if (!items || items.length === 0) return { data: [] }
  const results = []
  for (const item of items) {
    await admin.from("offline_sync_queue").update({ status: "syncing", locked_at: new Date().toISOString() }).eq("id", item.id)
    try {
      const table = item.table_name as string
      const payload = item.payload as any
      if (item.sync_operation === "create") {
        const { error } = await admin.from(table).insert(payload)
        if (error) throw new Error(error.message)
      } else if (item.sync_operation === "update") {
        const { error } = await admin.from(table).update(payload).eq("id", item.record_id)
        if (error) throw new Error(error.message)
      } else if (item.sync_operation === "delete") {
        const { error } = await admin.from(table).delete().eq("id", item.record_id)
        if (error) throw new Error(error.message)
      } else if (item.sync_operation === "upsert") {
        const { error } = await admin.from(table).upsert(payload).eq("id", item.record_id || payload.id)
        if (error) throw new Error(error.message)
      }
      await admin.from("offline_sync_queue").update({ status: "completed", synced_at: new Date().toISOString() }).eq("id", item.id)
      results.push({ id: item.id, status: "completed" })
    } catch (err: any) {
      const retry = (item.retry_count || 0) + 1
      const newStatus = retry >= (item.max_retries || 3) ? "failed" : "pending"
      await admin.from("offline_sync_queue").update({ status: newStatus, error_message: err.message, retry_count: retry, locked_at: null }).eq("id", item.id)
      results.push({ id: item.id, status: newStatus, error: err.message })
    }
  }
  const totalMs = items.reduce((sum: number, i: any) => sum + (Date.parse(new Date().toISOString()) - Date.parse(i.created_at)), 0)
  await admin.from("sync_logs").insert({
    organization_id: items[0].organization_id, device_id: deviceId, user_id: items[0].user_id,
    sync_type: "batch", records_synced: results.filter((r: any) => r.status === "completed").length,
    records_failed: results.filter((r: any) => r.status === "failed").length, duration_ms: totalMs / items.length || 0,
    status: results.some((r: any) => r.status === "failed") ? "completed" : "completed",
  })
  return { data: results }
}

export async function getSyncLogs(organizationId: string, deviceId?: string) {
  const admin = createAdminClient()
  let query = admin.from("sync_logs").select("*, mobile_devices(device_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100)
  if (deviceId) query = query.eq("device_id", deviceId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// MOBILE SETTINGS
// ============================================================

export async function getMobileSettings(deviceId: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("mobile_settings").select("*").eq("device_id", deviceId).eq("user_id", auth.user.id).maybeSingle()
  if (error) return { error: error.message }
  return { data: data as MobileSetting | null }
}

export async function saveMobileSettings(deviceId: string, settings: Partial<MobileSetting>) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: existing } = await admin.from("mobile_settings").select("id").eq("device_id", deviceId).eq("user_id", auth.user.id).maybeSingle()
  if (existing) {
    const { data, error } = await admin.from("mobile_settings").update({ ...settings, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single()
    if (error) return { error: error.message }
    return { data: data as MobileSetting }
  }
  const { data, error } = await admin.from("mobile_settings").insert({
    organization_id: auth.organization_id, device_id: deviceId, user_id: auth.user.id, ...settings,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MobileSetting }
}

// ============================================================
// PUSH SUBSCRIPTIONS
// ============================================================

export async function getPushSubscriptions(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("push_subscriptions").select("*, mobile_devices(device_name)").eq("organization_id", organizationId).eq("is_active", true).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function subscribePush(deviceId: string, subscription: any, provider: string = "web_push") {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const existingId = subscription?.endpoint || crypto.randomUUID()
  const { data: existing } = await admin.from("push_subscriptions").select("id").eq("device_id", deviceId).eq("user_id", auth.user.id).eq("provider", provider).maybeSingle()
  if (existing) {
    const { data, error } = await admin.from("push_subscriptions").update({ subscription, endpoint: existingId, is_active: true, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single()
    if (error) return { error: error.message }
    return { data: data as PushSubscription }
  }
  const { data: dev } = await admin.from("mobile_devices").select("id, device_id").eq("id", deviceId).single()
  const { data, error } = await admin.from("push_subscriptions").insert({
    organization_id: auth.organization_id, device_id: deviceId, user_id: auth.user.id,
    subscription, provider, endpoint: existingId,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as PushSubscription }
}

export async function unsubscribePush(subscriptionId: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from("push_subscriptions").update({ is_active: false }).eq("id", subscriptionId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function sendPushNotification(payload: PushNotificationPayload) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  let query = admin.from("push_subscriptions").select("*, mobile_devices!inner(organization_id)").eq("is_active", true)
  if (payload.festival_id) query = query.eq("mobile_devices.organization_id", auth.organization_id)
  if (payload.user_id) query = query.eq("user_id", payload.user_id)
  if (payload.role) {
    const { data: users } = await admin.from("organization_members").select("user_id").eq("organization_id", auth.organization_id).eq("role", payload.role)
    const ids = (users || []).map(u => u.user_id)
    if (ids.length > 0) query = query.in("user_id", ids)
  }
  const { data: subs } = await query
  if (!subs || subs.length === 0) return { data: [] }
  const results = []
  for (const sub of subs) {
    const { data: logEntry } = await admin.from("push_delivery_logs").insert({
      organization_id: auth.organization_id, festival_id: payload.festival_id || null,
      subscription_id: sub.id, user_id: sub.user_id, title: payload.title, body: payload.body || null,
      data: payload.data || null, notification_type: payload.notification_type || null,
      priority: payload.priority || "medium", status: "sent", sent_at: new Date().toISOString(),
    }).select().single()
    results.push(logEntry)
  }
  return { data: results }
}

export async function getPushDeliveryLogs(organizationId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("push_delivery_logs").select("*, push_subscriptions(mobile_devices(device_name))").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100)
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// QR VERIFICATION
// ============================================================

export async function verifyQrCode(qrData: string): Promise<QrVerificationResult> {
  const admin = createAdminClient()
  try {
    const parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData
    const type = parsed?.type || "unknown"
    const id = parsed?.id || parsed?.participant_id || parsed?.code || parsed?.ticket_id
    if (!id) return { valid: false, type, data: null, message: "Invalid QR code format" }

    if (type === "participant" || type === "id_card") {
      const { data: p } = await admin.from("participants").select("*, competitions(name)").eq("id", id).maybeSingle()
      if (!p) return { valid: false, type, data: null, message: "Participant not found" }
      return { valid: true, type, data: p, message: `Participant: ${p.full_name}` }
    }
    if (type === "meal_coupon") {
      const { data: mc } = await admin.from("meal_coupons").select("*, participants(full_name), meal_sessions(session_name)").eq("id", id).maybeSingle()
      if (!mc) return { valid: false, type, data: null, message: "Coupon not found" }
      if (mc.is_used) return { valid: false, type, data: mc, message: "Coupon already used" }
      return { valid: true, type, data: mc, message: `Meal: ${mc.meal_sessions?.session_name}` }
    }
    if (type === "certificate") {
      const { data: cert } = await admin.from("medical_certificates").select("*, medical_cases(patients(full_name))").eq("id", id).maybeSingle()
      if (!cert) return { valid: false, type, data: null, message: "Certificate not found" }
      if (!cert.is_valid) return { valid: false, type, data: cert, message: "Certificate is revoked" }
      return { valid: true, type, data: cert, message: `Certificate: ${cert.certificate_number}` }
    }
    if (type === "visitor_pass") {
      const { data: v } = await admin.from("visitors").select("*").eq("id", id).maybeSingle()
      if (!v) return { valid: false, type, data: null, message: "Visitor not found" }
      return { valid: true, type, data: v, message: `Visitor: ${v.full_name}` }
    }
    if (type === "asset") {
      const { data: a } = await admin.from("inventory_items").select("*, inventory_categories(name)").eq("id", id).maybeSingle()
      if (!a) return { valid: false, type, data: null, message: "Asset not found" }
      return { valid: true, type, data: a, message: `Asset: ${a.name}` }
    }
    if (type === "room") {
      const { data: r } = await admin.from("accommodation_rooms").select("*, accommodation_buildings(building_name)").eq("id", id).maybeSingle()
      if (!r) return { valid: false, type, data: null, message: "Room not found" }
      return { valid: true, type, data: r, message: `Room: ${r.room_number}` }
    }
    if (type === "vehicle") {
      const { data: v } = await admin.from("transport_vehicles").select("*").eq("id", id).maybeSingle()
      if (!v) return { valid: false, type, data: null, message: "Vehicle not found" }
      return { valid: true, type, data: v, message: `Vehicle: ${v.vehicle_number}` }
    }
    return { valid: false, type, data: null, message: `Unknown QR type: ${type}` }
  } catch {
    const { data: p } = await admin.from("participants").select("*").eq("id", qrData).maybeSingle()
    if (p) return { valid: true, type: "participant", data: p, message: `Participant: ${p.full_name}` }
    return { valid: false, type: "unknown", data: null, message: "Invalid QR code" }
  }
}

// ============================================================
// ACTIVITY LOGS
// ============================================================

async function logActivity(organizationId: string, festivalId: string | undefined, deviceId: string | undefined, userId: string, activityType: string, description?: string, metadata?: any, isOffline?: boolean) {
  const admin = createAdminClient()
  await admin.from("mobile_activity_logs").insert({
    organization_id: organizationId, festival_id: festivalId || null, device_id: deviceId || null,
    user_id: userId, activity_type: activityType, description: description || null, metadata: metadata || {},
    is_offline: isOffline || false,
  })
}

export async function getActivityLogs(organizationId: string, type?: string, festivalId?: string) {
  const admin = createAdminClient()
  let query = admin.from("mobile_activity_logs").select("*, mobile_devices(device_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(200)
  if (type) query = query.eq("activity_type", type)
  if (festivalId) query = query.eq("festival_id", festivalId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function logMobileActivity(form: { festival_id?: string; device_id?: string; activity_type: string; description?: string; metadata?: any; is_offline?: boolean }) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  await logActivity(auth.organization_id, form.festival_id, form.device_id, auth.user.id, form.activity_type, form.description, form.metadata, form.is_offline)
  return { success: true }
}

// ============================================================
// OFFLINE FORMS
// ============================================================

export async function getOfflineForms(organizationId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("offline_forms").select("*, mobile_devices(device_name)").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(100)
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function saveOfflineForm(form: { form_type: string; form_data: any; festival_id?: string }) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: device } = await admin.from("mobile_devices").select("id").eq("organization_id", auth.organization_id).eq("status", "active").limit(1).maybeSingle()
  if (!device) return { error: "No active device found" }
  const { data, error } = await admin.from("offline_forms").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id || null,
    device_id: device.id, user_id: auth.user.id, form_type: form.form_type,
    form_data: form.form_data, status: "submitted", submitted_at: new Date().toISOString(),
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as OfflineForm }
}

// ============================================================
// OFFLINE MEDIA UPLOADS
// ============================================================

export async function getPendingUploads(organizationId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("offline_media_uploads").select("*, mobile_devices(device_name)").eq("organization_id", organizationId).neq("status", "completed").order("created_at", { ascending: false }).limit(100)
  if (error) return { error: error.message }
  return { data }
}

export async function queueMediaUpload(form: { file_name: string; file_size?: number; mime_type?: string; festival_id?: string }) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: device } = await admin.from("mobile_devices").select("id").eq("organization_id", auth.organization_id).eq("status", "active").limit(1).maybeSingle()
  if (!device) return { error: "No active device found" }
  const { data, error } = await admin.from("offline_media_uploads").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id || null,
    device_id: device.id, user_id: auth.user.id, file_name: form.file_name,
    file_size: form.file_size || null, mime_type: form.mime_type || null,
    storage_bucket: "mobile-uploads",
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as OfflineMediaUpload }
}

// ============================================================
// OFFLINE-SPECIFIC HELPERS
// ============================================================

export async function getOfflineData(festivalId: string, tables?: string[]) {
  const auth = await checkOrgAccess(festivalId)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const syncTables = tables || ["participants", "competitions", "schedules", "judging_criteria"]
  const result: Record<string, any> = {}
  for (const table of syncTables) {
    const { data } = await admin.from(table).select("*").eq("festival_id", festivalId).limit(500)
    result[table] = data || []
  }
  return { data: result }
}

export async function resolveSyncConflict(id: string, resolution: "local" | "remote" | "manual", resolvedData?: any) {
  const admin = createAdminClient()
  const { data: item } = await admin.from("offline_sync_queue").select("*").eq("id", id).single()
  if (!item) return { error: "Sync item not found" }
  if (resolution === "local") {
    await admin.from("offline_sync_queue").update({ status: "completed", conflict_resolution: "local", synced_at: new Date().toISOString() }).eq("id", id)
  } else if (resolution === "remote") {
    await admin.from("offline_sync_queue").update({ status: "completed", conflict_resolution: "remote", synced_at: new Date().toISOString() }).eq("id", id)
  } else if (resolution === "manual" && resolvedData) {
    await admin.from("offline_sync_queue").update({ payload: resolvedData, status: "pending", conflict_resolution: null }).eq("id", id)
  }
  return { success: true }
}

// ============================================================
// REPORTS
// ============================================================

export async function getDeviceReport(organizationId: string) {
  const admin = createAdminClient()
  const [devices, registrations] = await Promise.all([
    admin.from("mobile_devices").select("*").eq("organization_id", organizationId),
    admin.from("device_registrations").select("*, mobile_devices(device_name, device_platform, status)").eq("organization_id", organizationId),
  ])
  return { data: { devices: devices.data || [], registrations: registrations.data || [] } }
}

export async function getSyncReport(organizationId: string) {
  const admin = createAdminClient()
  const [logs, queue] = await Promise.all([
    admin.from("sync_logs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(500),
    admin.from("offline_sync_queue").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(500),
  ])
  return { data: { logs: logs.data || [], queue: queue.data || [] } }
}

export async function getPushReport(organizationId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("push_delivery_logs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(500)
  return { data: data || [] }
}

export async function getActivityReport(organizationId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("mobile_activity_logs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(500)
  return { data: data || [] }
}
