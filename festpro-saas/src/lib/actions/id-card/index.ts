"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  IdCardTemplate, IdCard, BadgeTemplate, Badge, PassTypeMeta, PassCategory, Pass,
  VehiclePass, GuestPass, VipPass, MediaPass, QrCode, BarcodeRecord, PrintJob,
  PrintHistory, VerificationLog, Module14DashboardData,
} from "@/types/id-card"

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

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

function generateCardNumber(type: string): string {
  const prefix = type.substring(0, 3).toUpperCase()
  const num = Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase()
  return `${prefix}-${num}`
}

function generatePassNumber(type: string): string {
  const prefix = type.substring(0, 2).toUpperCase()
  const num = Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase()
  return `${prefix}-${num}`
}

// ── DASHBOARD ──

export async function getIdCardDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [{ count: ic }, { count: aic }, { count: tb }, { count: ab }, { count: tp }, { count: ap }, { count: tq }, { count: vt }, { count: vv }, { count: fv }, { count: pqc }, { count: rp }] = await Promise.all([
    admin.from("id_cards").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("id_cards").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("badges").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("badges").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("passes").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("passes").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("qr_codes").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("verification_logs").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).gte("created_at", `${today}T00:00:00`),
    admin.from("verification_logs").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("result", "valid").gte("created_at", `${today}T00:00:00`),
    admin.from("verification_logs").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("result", ["invalid", "expired", "revoked", "not_found"]).gte("created_at", `${today}T00:00:00`),
    admin.from("print_jobs").select("*", { count: "exact", head: true }).in("status", ["queued", "processing"]),
    admin.from("print_history").select("*", { count: "exact", head: true }).gte("printed_at", `${today}T00:00:00`),
  ])
  return {
    data: {
      total_id_cards: ic || 0, active_id_cards: aic || 0, total_badges: tb || 0, active_badges: ab || 0,
      total_passes: tp || 0, active_passes: ap || 0, total_qr_codes: tq || 0,
      verifications_today: vt || 0, valid_verifications: vv || 0, failed_verifications: fv || 0,
      print_queue_count: pqc || 0, recent_prints: rp || 0,
    } as Module14DashboardData,
  }
}

// ── ID CARD TEMPLATES ──

export async function getIdCardTemplates(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("id_card_templates").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as IdCardTemplate[] }
}

export async function upsertIdCardTemplate(data: {
  id?: string; festival_id: string; name: string; card_type: string; fields?: any[]; layout_data?: any
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("id_card_templates").update(data).eq("id", data.id)
  else await admin.from("id_card_templates").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/templates")
  return { success: true }
}

// ── ID CARDS ──

export async function getIdCards(festivalId: string, filters?: { status?: string; card_type?: string; search?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("id_cards").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.card_type) q = q.eq("card_type", filters.card_type)
  if (filters?.search) q = q.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,card_number.ilike.%${filters.search}%`)
  const { data } = await q
  return { data: data as IdCard[] }
}

export async function createIdCard(data: {
  festival_id: string; card_type: string; first_name: string; last_name: string
  template_id?: string; participant_id?: string; chest_number?: string; registration_number?: string
  photo_url?: string; role_title?: string; unit?: string; division?: string; sector?: string
  competition_info?: string; emergency_contact_name?: string; emergency_contact_phone?: string
  blood_group?: string; organization_name?: string; validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const cardNumber = generateCardNumber(data.card_type)
  const { data: card, error } = await admin.from("id_cards").insert({
    ...data, card_number: cardNumber, organization_id: check.organization_id, issued_by: check.user.id, status: "active", issued_at: new Date().toISOString(),
  }).select("id").single()
  if (error) return { error: error.message }
  const token = generateToken()
  await admin.from("qr_codes").insert({
    organization_id: check.organization_id, festival_id: data.festival_id,
    entity_type: "id_card", entity_id: card.id, token,
    expires_at: data.validity_end,
  })
  await admin.from("id_cards").update({ qr_code_id: undefined }).eq("id", card.id)
  const { data: qr } = await admin.from("qr_codes").select("id").eq("token", token).single()
  if (qr) await admin.from("id_cards").update({ qr_code_id: qr.id }).eq("id", card.id)
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards")
  return { success: true, card_number: cardNumber }
}

export async function updateIdCardStatus(id: string, status: string, reason?: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "revoked") { updates.revoked_at = new Date().toISOString(); updates.revoked_reason = reason || null }
  await admin.from("id_cards").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards")
  return { success: true }
}

// ── BADGE TEMPLATES ──

export async function getBadgeTemplates(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("badge_templates").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as BadgeTemplate[] }
}

export async function upsertBadgeTemplate(data: {
  id?: string; festival_id: string; name: string; badge_type: string; access_levels?: string[]
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("badge_templates").update(data).eq("id", data.id)
  else await admin.from("badge_templates").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/badge-templates")
  return { success: true }
}

// ── BADGES ──

export async function getBadges(festivalId: string, filters?: { status?: string; badge_type?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("badges").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.badge_type) q = q.eq("badge_type", filters.badge_type)
  const { data } = await q
  return { data: data as Badge[] }
}

export async function createBadge(data: {
  festival_id: string; badge_type: string; holder_name: string; role_title?: string; department?: string
  template_id?: string; user_id?: string; photo_url?: string; access_levels?: string[]
  validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const badgeNumber = generateCardNumber(data.badge_type)
  await admin.from("badges").insert({
    ...data, badge_number: badgeNumber, organization_id: check.organization_id, issued_by: check.user.id, status: "active",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/badges")
  return { success: true, badge_number: badgeNumber }
}

export async function updateBadgeStatus(id: string, status: string, reason?: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "revoked") { updates.revoked_at = new Date().toISOString(); updates.revoked_reason = reason || null }
  await admin.from("badges").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/badges")
  return { success: true }
}

// ── PASS TYPES ──

export async function getPassTypes(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("pass_types").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as PassTypeMeta[] }
}

export async function upsertPassType(data: {
  id?: string; festival_id: string; name: string; type: string; description?: string; color?: string
  access_areas?: string[]; max_quantity?: number; validity_days?: number; price?: number
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("pass_types").update(data).eq("id", data.id)
  else await admin.from("pass_types").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/pass-types")
  return { success: true }
}

// ── PASS CATEGORIES ──

export async function getPassCategories(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("pass_categories").select("*").eq("festival_id", festivalId).order("sort_order")
  return { data: data as PassCategory[] }
}

export async function upsertPassCategory(data: {
  id?: string; festival_id: string; name: string; description?: string; parent_id?: string; sort_order?: number
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("pass_categories").update(data).eq("id", data.id)
  else await admin.from("pass_categories").insert({ ...data, organization_id: check.organization_id })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/pass-categories")
  return { success: true }
}

// ── PASSES ──

export async function getPasses(festivalId: string, filters?: { status?: string; pass_type?: string; search?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("passes").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.pass_type) q = q.eq("pass_type", filters.pass_type)
  if (filters?.search) q = q.or(`holder_name.ilike.%${filters.search}%,pass_number.ilike.%${filters.search}%`)
  const { data } = await q
  return { data: data as Pass[] }
}

export async function createPass(data: {
  festival_id: string; pass_type: string; holder_name: string; holder_contact?: string
  organization_name?: string; photo_url?: string; access_areas?: string[]
  pass_type_id?: string; category_id?: string; is_transferable?: boolean
  validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const passNumber = generatePassNumber(data.pass_type)
  const { data: pass, error } = await admin.from("passes").insert({
    ...data, pass_number: passNumber, organization_id: check.organization_id, issued_by: check.user.id, status: "active", issued_at: new Date().toISOString(),
  }).select("id").single()
  if (error) return { error: error.message }
  const token = generateToken()
  await admin.from("qr_codes").insert({
    organization_id: check.organization_id, festival_id: data.festival_id,
    entity_type: "pass", entity_id: pass.id, token,
    expires_at: data.validity_end,
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/passes")
  return { success: true, pass_number: passNumber }
}

export async function updatePassStatus(id: string, status: string, reason?: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "used") updates.used_at = new Date().toISOString()
  if (status === "revoked") { updates.revoked_at = new Date().toISOString(); updates.revoked_reason = reason || null }
  await admin.from("passes").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/passes")
  return { success: true }
}

// ── VEHICLE PASSES ──

export async function getVehiclePasses(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("vehicle_passes").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as VehiclePass[] }
}

export async function createVehiclePass(data: {
  festival_id: string; vehicle_number: string; vehicle_type?: string; driver_name?: string
  driver_phone?: string; parking_zone?: string; pass_id?: string
  validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data: vp } = await admin.from("vehicle_passes").insert({
    ...data, organization_id: check.organization_id, issued_by: check.user.id, status: "active",
  }).select("id").single()
  if (!vp) return { error: "Failed to create vehicle pass" }
  const token = generateToken()
  await admin.from("qr_codes").insert({
    organization_id: check.organization_id, festival_id: data.festival_id,
    entity_type: "vehicle_pass", entity_id: vp.id, token,
    expires_at: data.validity_end,
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/vehicle-passes")
  return { success: true }
}

// ── GUEST PASSES ──

export async function getGuestPasses(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("guest_passes").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as GuestPass[] }
}

export async function createGuestPass(data: {
  festival_id: string; guest_name: string; guest_phone?: string; guest_email?: string
  host_name: string; host_department?: string; purpose?: string; company?: string; pass_id?: string
  validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("guest_passes").insert({
    ...data, organization_id: check.organization_id, issued_by: check.user.id, status: "active",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/guest-passes")
  return { success: true }
}

// ── VIP PASSES ──

export async function getVipPasses(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("vip_passes").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as VipPass[] }
}

export async function createVipPass(data: {
  festival_id: string; vip_name: string; vip_title?: string; vip_phone?: string; vip_email?: string
  vip_level?: number; personal_assistant?: string; security_clearance?: string
  special_requirements?: string; has_parking?: boolean; has_hospitality?: boolean; pass_id?: string
  validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("vip_passes").insert({
    ...data, organization_id: check.organization_id, issued_by: check.user.id, status: "active",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/vip-passes")
  return { success: true }
}

// ── MEDIA PASSES ──

export async function getMediaPasses(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("media_passes").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as MediaPass[] }
}

export async function createMediaPass(data: {
  festival_id: string; media_name: string; media_organization: string; media_type?: string
  media_phone?: string; media_email?: string; press_id_number?: string; equipment_list?: string
  has_camera_permit?: boolean; has_drone_permit?: boolean; has_interview_access?: boolean; pass_id?: string
  validity_start: string; validity_end: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("media_passes").insert({
    ...data, organization_id: check.organization_id, issued_by: check.user.id, status: "active",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/media-passes")
  return { success: true }
}

// ── QR CODES ──

export async function getQrCodes(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("qr_codes").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as QrCode[] }
}

export async function revokeQrCode(id: string) {
  const admin = createAdminClient()
  await admin.from("qr_codes").update({ is_revoked: true }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/qr-codes")
  return { success: true }
}

// ── BARCODES ──

export async function getBarcodeRecords(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("barcode_records").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as BarcodeRecord[] }
}

// ── PRINT JOBS ──

export async function getPrintJobs(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("print_jobs").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as PrintJob[] }
}

export async function createPrintJob(data: {
  festival_id: string; job_name: string; entity_type: string; entity_ids: string[]
  print_type?: string; template_id?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("print_jobs").insert({
    ...data, total_items: data.entity_ids.length, organization_id: check.organization_id, created_by: check.user.id, status: "queued",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/print-jobs")
  return { success: true }
}

export async function updatePrintJobStatus(id: string, status: string, pdfUrl?: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "processing") updates.started_at = new Date().toISOString()
  if (status === "completed") { updates.completed_at = new Date().toISOString(); updates.completed_items = 0 }
  if (pdfUrl) updates.pdf_url = pdfUrl
  await admin.from("print_jobs").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/id-cards/print-jobs")
  return { success: true }
}

// ── PRINT HISTORY ──

export async function getPrintHistory(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("print_history").select("*").eq("organization_id", (await checkOrgAccess()).organization_id).order("printed_at", { ascending: false }).limit(100)
  return { data: data as PrintHistory[] }
}

// ── VERIFICATION ──

export async function verifyByQr(token: string) {
  const admin = createAdminClient()
  const { data: qr } = await admin.from("qr_codes").select("*").eq("token", token).single()
  if (!qr) return { error: "QR code not found" }
  if (qr.is_revoked) return { error: "QR code has been revoked" }
  if (qr.expires_at && new Date(qr.expires_at) < new Date()) return { error: "QR code has expired" }

  await admin.from("qr_codes").update({ scan_count: (qr.scan_count || 0) + 1 }).eq("id", qr.id)

  let entityData: any = null
  if (qr.entity_type === "id_card") {
    const { data: card } = await admin.from("id_cards").select("*").eq("id", qr.entity_id).single()
    entityData = card
  } else if (qr.entity_type === "pass") {
    const { data: pass } = await admin.from("passes").select("*").eq("id", qr.entity_id).single()
    entityData = pass
  }

  const isValid = entityData && entityData.status === "active"
  await admin.from("verification_logs").insert({
    organization_id: qr.organization_id, festival_id: qr.festival_id,
    entity_type: qr.entity_type, entity_id: qr.entity_id,
    verification_method: "qr_scan", result: isValid ? "valid" : "invalid",
    scanned_data: token,
  })

  return { data: entityData, valid: isValid }
}

export async function verifyByManualSearch(query: string) {
  const admin = createAdminClient()
  const { data: cards } = await admin.from("id_cards").select("*").or(`card_number.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`).limit(5)
  const { data: passes } = await admin.from("passes").select("*").or(`pass_number.ilike.%${query}%,holder_name.ilike.%${query}%`).limit(5)
  return { cards: cards as IdCard[], passes: passes as Pass[] }
}

export async function getVerificationLogs(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("verification_logs").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false }).limit(100)
  return { data: data as VerificationLog[] }
}
