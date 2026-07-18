"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/client"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  PublicHomepageSettings, PublicFestivalDetails, PublicNews, PublicGallery,
  PublicDownload, PublicSponsor, PublicFaq, PublicContactInquiry, PublicRegistration,
  LiveScheduleCache, LiveResultsCache, LiveStageStatus, PublicApiToken, Module12DashboardData,
} from "@/types/public"

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
  return { allowed: true, user, organization_id: fest.organization_id, member } as const
}

// ── DASHBOARD ──

export async function getPublicDashboard(festivalId: string) {
  const admin = createAdminClient()
  const [{ count: n }, { count: g }, { count: d }, { count: s }, { count: f }, { count: ci }, { count: pr }, { count: ls }, { count: at }] = await Promise.all([
    admin.from("public_news").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_published", true),
    admin.from("public_gallery").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_published", true),
    admin.from("public_downloads").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_published", true),
    admin.from("public_sponsors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_published", true),
    admin.from("public_faqs").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_published", true),
    admin.from("public_contact_inquiries").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("public_registrations").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("live_stage_status").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_live", true),
    admin.from("public_api_tokens").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_active", true),
  ])
  return { data: { published_news: n || 0, gallery_items: g || 0, downloads: d || 0, sponsors: s || 0, faqs: f || 0, contact_inquiries: ci || 0, public_registrations: pr || 0, live_stages: ls || 0, api_tokens: at || 0 } as Module12DashboardData }
}

// ── HOMEPAGE ──

export async function getHomepageSettings(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("public_homepage_settings").select("*").eq("festival_id", festivalId).eq("is_published", true).maybeSingle()
  return { data: data as PublicHomepageSettings | null }
}

export async function upsertHomepageSettings(data: { festival_id: string; hero_title?: string; hero_subtitle?: string; hero_image_url?: string; about_title?: string; about_body?: string; about_image_url?: string; stats?: any; featured_sections?: any; seo_meta?: any; is_published?: boolean }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const existing = await admin.from("public_homepage_settings").select("id").eq("festival_id", data.festival_id).maybeSingle()
  if (existing.data) await admin.from("public_homepage_settings").update(data).eq("id", existing.data.id)
  else await admin.from("public_homepage_settings").insert({ ...data, updated_by: check.user.id })
  revalidatePath(`/festival/${data.festival_id}`)
  return { success: true }
}

// ── FESTIVAL DETAILS ──

export async function getFestivalDetails(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("public_festival_details").select("*").eq("festival_id", festivalId).eq("is_published", true).maybeSingle()
  return { data: data as PublicFestivalDetails | null }
}

export async function upsertFestivalDetails(data: { festival_id: string; vision?: string; mission?: string; history?: string; organizing_committee?: any; venue_name?: string; venue_address?: string; venue_map_url?: string; venue_contact?: string; faqs?: any; seo_meta?: any; is_published?: boolean }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const existing = await admin.from("public_festival_details").select("id").eq("festival_id", data.festival_id).maybeSingle()
  if (existing.data) await admin.from("public_festival_details").update(data).eq("id", existing.data.id)
  else await admin.from("public_festival_details").insert(data)
  revalidatePath(`/festival/${data.festival_id}/about`)
  return { success: true }
}

// ── NEWS ──

export async function getNews(festivalId: string, filters?: { category?: string; featured?: boolean }) {
  const supabase = createAdminClient()
  let q = supabase.from("public_news").select("*").eq("festival_id", festivalId).eq("is_published", true).order("published_at", { ascending: false })
  if (filters?.category) q = q.eq("category", filters.category)
  if (filters?.featured) q = q.eq("is_featured", true)
  const { data } = await q
  return { data: data as PublicNews[] }
}

export async function getNewsItem(slug: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("public_news").select("*").eq("slug", slug).eq("is_published", true).single()
  return { data: data as PublicNews | null }
}

export async function upsertNews(data: { id?: string; festival_id: string; category?: string; title: string; slug: string; excerpt?: string; body?: string; cover_image_url?: string; author?: string; is_published?: boolean; is_featured?: boolean; published_at?: string; seo_meta?: any }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = { ...data, created_by: check.user.id }
  if (data.id) await admin.from("public_news").update(payload).eq("id", data.id)
  else await admin.from("public_news").insert(payload)
  revalidatePath(`/festival/${data.festival_id}/news`)
  return { success: true }
}

export async function deleteNews(id: string) {
  const admin = createAdminClient()
  await admin.from("public_news").delete().eq("id", id)
  return { success: true }
}

// ── GALLERY ──

export async function getGallery(festivalId: string, filters?: { type?: string; albumId?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("public_gallery").select("*").eq("festival_id", festivalId).eq("is_published", true).order("sort_order").order("created_at", { ascending: false })
  if (filters?.type) q = q.eq("gallery_type", filters.type)
  if (filters?.albumId) q = q.eq("album_id", filters.albumId)
  const { data } = await q
  return { data: data as PublicGallery[] }
}

export async function upsertGallery(data: { id?: string; festival_id: string; gallery_type: string; album_id?: string; title: string; description?: string; media_url: string; thumbnail_url?: string; is_published?: boolean; is_featured?: boolean; sort_order?: number }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("public_gallery").update(data).eq("id", data.id)
  else await admin.from("public_gallery").insert({ ...data, created_by: check.user.id })
  revalidatePath(`/festival/${data.festival_id}/gallery`)
  return { success: true }
}

export async function deleteGallery(id: string) {
  const admin = createAdminClient()
  await admin.from("public_gallery").delete().eq("id", id)
  return { success: true }
}

// ── DOWNLOADS ──

export async function getDownloads(festivalId: string, category?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("public_downloads").select("*").eq("festival_id", festivalId).eq("is_published", true).order("sort_order").order("created_at", { ascending: false })
  if (category) q = q.eq("category", category)
  const { data } = await q
  return { data: data as PublicDownload[] }
}

export async function upsertDownload(data: { id?: string; festival_id: string; category?: string; title: string; description?: string; file_url: string; is_published?: boolean; sort_order?: number }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("public_downloads").update(data).eq("id", data.id)
  else await admin.from("public_downloads").insert({ ...data, created_by: check.user.id })
  revalidatePath(`/festival/${data.festival_id}/downloads`)
  return { success: true }
}

export async function deleteDownload(id: string) {
  const admin = createAdminClient()
  await admin.from("public_downloads").delete().eq("id", id)
  return { success: true }
}

// ── SPONSORS ──

export async function getSponsors(festivalId: string, tier?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("public_sponsors").select("*").eq("festival_id", festivalId).eq("is_published", true).order("sort_order")
  if (tier) q = q.eq("tier", tier)
  const { data } = await q
  return { data: data as PublicSponsor[] }
}

export async function upsertSponsor(data: { id?: string; festival_id: string; sponsor_name: string; sponsor_logo_url?: string; website_url?: string; tier?: string; description?: string; is_published?: boolean; sort_order?: number }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("public_sponsors").update(data).eq("id", data.id)
  else await admin.from("public_sponsors").insert(data)
  revalidatePath(`/festival/${data.festival_id}/sponsors`)
  return { success: true }
}

export async function deleteSponsor(id: string) {
  const admin = createAdminClient()
  await admin.from("public_sponsors").delete().eq("id", id)
  return { success: true }
}

// ── FAQS ──

export async function getFaqs(festivalId: string, category?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("public_faqs").select("*").eq("festival_id", festivalId).eq("is_published", true).order("sort_order")
  if (category) q = q.eq("category", category)
  const { data } = await q
  return { data: data as PublicFaq[] }
}

export async function upsertFaq(data: { id?: string; festival_id: string; category?: string; question: string; answer: string; sort_order?: number; is_published?: boolean }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("public_faqs").update(data).eq("id", data.id)
  else await admin.from("public_faqs").insert(data)
  revalidatePath(`/festival/${data.festival_id}/faq`)
  return { success: true }
}

export async function deleteFaq(id: string) {
  const admin = createAdminClient()
  await admin.from("public_faqs").delete().eq("id", id)
  return { success: true }
}

// ── CONTACT INQUIRIES ──

export async function submitContactInquiry(data: { festival_id?: string; name: string; email: string; phone?: string; subject?: string; message: string }) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("public_contact_inquiries").insert(data)
  if (error) return { error: error.message }
  return { success: true }
}

export async function getContactInquiries(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("public_contact_inquiries").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as PublicContactInquiry[] }
}

export async function markInquiryRead(id: string) {
  const admin = createAdminClient()
  await admin.from("public_contact_inquiries").update({ is_read: true }).eq("id", id)
  return { success: true }
}

// ── PUBLIC REGISTRATION ──

export async function submitRegistration(data: {
  festival_id: string; registration_type?: string; first_name: string; last_name: string
  email: string; phone?: string; date_of_birth?: string; gender?: string; address?: string
  city?: string; state?: string; country?: string; postal_code?: string
  institution_name?: string; grade?: string; team_name?: string; team_members?: any
  competition_ids?: string[]; special_requirements?: string
}) {
  const admin = createAdminClient()
  const trackingToken = `trk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
  const regNumber = `REG-${Date.now().toString(36).toUpperCase()}`
  const { error } = await admin.from("public_registrations").insert({
    ...data, tracking_token: trackingToken, registration_number: regNumber,
    status: "submitted", registered_at: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  return { success: true, tracking_token: trackingToken, registration_number: regNumber }
}

export async function getRegistrationByToken(token: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("public_registrations").select("*").eq("tracking_token", token).single()
  return { data: data as PublicRegistration | null }
}

export async function getRegistrations(festivalId: string, filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("public_registrations").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.dateFrom) q = q.gte("created_at", filters.dateFrom)
  if (filters?.dateTo) q = q.lte("created_at", filters.dateTo)
  const { data } = await q
  return { data: data as PublicRegistration[] }
}

export async function updateRegistrationStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "confirmed") updates.confirmed_at = new Date().toISOString()
  await admin.from("public_registrations").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/public/registrations")
  return { success: true }
}

// ── LIVE PORTAL ──

export async function getLiveStageStatus(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("live_stage_status").select("*, stage:stages(name), current_competition:competitions(name), current_session:sessions(name), current_participant:participants(first_name, last_name)").eq("festival_id", festivalId).eq("is_live", true)
  return { data: data as any[] }
}

export async function getLiveSchedule(festivalId: string, stageId?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("live_schedule_cache").select("*, stage:stages(name), competition:competitions(name)").eq("festival_id", festivalId).order("generated_at", { ascending: false }).limit(50)
  if (stageId) q = q.eq("stage_id", stageId)
  const { data } = await q
  return { data: data as any[] }
}

export async function getLiveResults(festivalId: string, competitionId?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("live_results_cache").select("*, competition:competitions(name)").eq("festival_id", festivalId).order("generated_at", { ascending: false }).limit(50)
  if (competitionId) q = q.eq("competition_id", competitionId)
  const { data } = await q
  return { data: data as any[] }
}

// ── SEARCH ──

export async function publicSearch(festivalId: string, query: string, type?: string) {
  const supabase = createAdminClient()
  const results: any = {}
  if (!type || type === "participants") {
    const { data } = await supabase.from("participants").select("id, first_name, last_name, institution_name, participant_code").eq("festival_id", festivalId).or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,institution_name.ilike.%${query}%`).limit(5)
    results.participants = data
  }
  if (!type || type === "competitions") {
    const { data } = await supabase.from("competitions").select("id, name, category, code").eq("festival_id", festivalId).or(`name.ilike.%${query}%,code.ilike.%${query}%`).limit(5)
    results.competitions = data
  }
  if (!type || type === "results") {
    const { data } = await supabase.from("results").select("id, rank, score, participant:participants(first_name, last_name), competition:competitions(name)").eq("festival_id", festivalId).or(`participant.first_name.ilike.%${query}%,participant.last_name.ilike.%${query}%`).limit(5)
    results.results = data
  }
  return { data: results }
}

// ── CERTIFICATE VERIFICATION ──

export async function verifyCertificate(certificateCode: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("certificates").select("*, participant:participants(first_name, last_name, participant_code), competition:competitions(name), festival:festivals(name)").eq("certificate_code", certificateCode).maybeSingle()
  return { data: data as any | null }
}

// ── PUBLIC API TOKENS ──

export async function getPublicApiTokens(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("public_api_tokens").select("*").eq("festival_id", festivalId)
  return { data: data as PublicApiToken[] }
}

export async function createPublicApiToken(data: { festival_id: string; token_name: string; allowed_origins?: string[]; rate_limit?: number }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  async function sha256(msg: string) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
  }
  const rawToken = `pub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`
  const tokenHash = await sha256(rawToken)
  const { error } = await admin.from("public_api_tokens").insert({
    festival_id: data.festival_id, token_name: data.token_name, token_hash: tokenHash,
    token_prefix: rawToken.substring(0, 10), allowed_origins: data.allowed_origins || [],
    rate_limit: data.rate_limit || 60, is_active: true,
  })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization/*/festivals/*/public/settings")
  return { success: true, token: rawToken }
}

export async function revokePublicApiToken(id: string) {
  const admin = createAdminClient()
  await admin.from("public_api_tokens").update({ is_active: false }).eq("id", id)
  return { success: true }
}

// ── FESTIVAL DATA (for public use - from ERP tables) ──

export async function getPublicFestivalData(festivalId: string) {
  const supabase = createAdminClient()
  const [festRes, statsRes, compRes, schedRes] = await Promise.all([
    supabase.from("festivals").select("id, name, description, start_date, end_date, venue, city, state, country, logo_url, banner_url, brand_color, timezone, status, festival_type, is_public").eq("id", festivalId).single(),
    supabase.from("participants").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    supabase.from("competitions").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
  ])
  return {
    data: {
      festival: festRes.data,
      stats: { participants: statsRes.count || 0, competitions: compRes.count || 0, sessions: schedRes.count || 0 },
    },
  }
}
