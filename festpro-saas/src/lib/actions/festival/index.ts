"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  Festival, FestivalSettings, FestivalDay, FestivalVenue, FestivalStage,
  FestivalCommittee, FestivalContact, FestivalDocument, FestivalAnnouncement,
  FestivalSponsor, FestivalGalleryItem, FestivalBanner, FestivalStatistics,
  FestivalDashboardData, FestivalFormData,
} from "@/types/festival"

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkFestivalAccess(festivalId: string, requiredRoles: UserRole[] = []) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const

  const admin = createAdminClient()
  const { data: festival } = await admin.from("festivals").select("organization_id, created_by").eq("id", festivalId).single()
  if (!festival) return { allowed: false, error: "Festival not found" } as const

  const { data: member } = await admin
    .from("organization_members")
    .select("role")
    .eq("organization_id", festival.organization_id)
    .eq("user_id", user.id)
    .single()

  if (!member) return { allowed: false, error: "Not a member of this organization" } as const

  if (requiredRoles.length > 0 && !requiredRoles.includes(member.role as UserRole)) {
    return { allowed: false, error: "Permission denied" } as const
  }

  return { allowed: true, user, festival, member: member as { role: UserRole } } as const
}

async function logActivity(festivalId: string, action: string, metadata: Record<string, any> = {}) {
  const user = await getAuth()
  if (!user) return
  const admin = createAdminClient()
  const { data: f } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!f) return
  await admin.from("activity_logs").insert({
    organization_id: f.organization_id,
    user_id: user.id,
    action,
    resource_type: "festival",
    resource_id: festivalId,
    metadata,
  })
}

export async function getOrgIdForFestival(festivalId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  return data?.organization_id || null
}

// ────────────────────────────────────────────
// FESTIVAL CRUD
// ────────────────────────────────────────────

export async function createFestival(orgId: string, formData: FestivalFormData) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const { data, error } = await admin.from("festivals").insert({
    organization_id: orgId,
    name: formData.name,
    short_name: formData.short_name || null,
    code: formData.code || null,
    description: formData.description || null,
    theme: formData.theme || "default",
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
    registration_start_date: formData.registration_start_date || null,
    registration_end_date: formData.registration_end_date || null,
    result_publish_date: formData.result_publish_date || null,
    venue_name: formData.venue_name || null,
    address: formData.address || null,
    district: formData.district || null,
    state: formData.state || null,
    country: formData.country || null,
    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    timezone: formData.timezone || "UTC",
    status: formData.status || "draft",
    visibility: formData.visibility || "public",
    max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
    max_competitions: formData.max_competitions ? parseInt(formData.max_competitions) : null,
    created_by: user.id,
  }).select().single()

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  return { success: true, festivalId: data.id }
}

export async function getFestival(festivalId: string): Promise<Festival | null> {
  const check = await checkFestivalAccess(festivalId)
  if (!check.allowed) return null

  const admin = createAdminClient()
  const { data } = await admin.from("festivals").select("*").eq("id", festivalId).single()
  return data as Festival | null
}

export async function getFestivals(orgId: string): Promise<Festival[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("festivals")
    .select("*")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  return (data || []) as Festival[]
}

export async function updateFestival(festivalId: string, formData: Partial<FestivalFormData & { status: string }>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director", "platform_owner", "platform_admin"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const updateData: Record<string, any> = {}

  for (const [key, value] of Object.entries(formData)) {
    if (value !== undefined && value !== null) {
      if (key === "latitude" || key === "longitude") {
        updateData[key] = value ? parseFloat(value as string) : null
      } else if (key === "max_participants" || key === "max_competitions") {
        updateData[key] = value ? parseInt(value as string) : null
      } else {
        updateData[key] = value
      }
    }
  }

  const { error } = await admin.from("festivals").update(updateData).eq("id", festivalId)
  if (error) return { error: error.message }

  await logActivity(festivalId, "festival.updated", { changes: Object.keys(updateData) })

  const orgId = await getOrgIdForFestival(festivalId)
  if (orgId) revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  return { success: true }
}

export async function duplicateFestival(festivalId: string) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data: original } = await admin.from("festivals").select("*").eq("id", festivalId).single()
  if (!original) return { error: "Festival not found" }

  const { data: newFest, error } = await admin.from("festivals").insert({
    organization_id: original.organization_id,
    name: `${original.name} (Copy)`,
    short_name: original.short_name,
    description: original.description,
    theme: original.theme,
    start_date: original.start_date,
    end_date: original.end_date,
    venue_name: original.venue_name,
    address: original.address,
    district: original.district,
    state: original.state,
    country: original.country,
    timezone: original.timezone,
    status: "draft",
    visibility: original.visibility,
    template_id: festivalId,
    is_template: false,
    created_by: check.user.id,
  }).select().single()

  if (error) return { error: error.message }

  await logActivity(festivalId, "festival.duplicated", { new_id: newFest.id })

  const orgId = await getOrgIdForFestival(festivalId)
  if (orgId) revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  return { success: true, festivalId: newFest.id }
}

export async function archiveFestival(festivalId: string) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festivals").update({ status: "archived" }).eq("id", festivalId)
  if (error) return { error: error.message }

  await logActivity(festivalId, "festival.archived")

  const orgId = await getOrgIdForFestival(festivalId)
  if (orgId) revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  return { success: true }
}

export async function restoreFestival(festivalId: string) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festivals").update({ status: "draft", deleted_at: null }).eq("id", festivalId)
  if (error) return { error: error.message }

  await logActivity(festivalId, "festival.restored")

  const orgId = await getOrgIdForFestival(festivalId)
  if (orgId) revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  return { success: true }
}

export async function deleteFestival(festivalId: string) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festivals").update({ deleted_at: new Date().toISOString() }).eq("id", festivalId)
  if (error) return { error: error.message }

  await logActivity(festivalId, "festival.deleted")

  const orgId = await getOrgIdForFestival(festivalId)
  if (orgId) revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  redirect(`/dashboard/organization/${orgId}`)
}

// ────────────────────────────────────────────
// SETTINGS
// ────────────────────────────────────────────

export async function getFestivalSettings(festivalId: string): Promise<FestivalSettings | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_settings").select("*").eq("festival_id", festivalId).single()
  return data as FestivalSettings | null
}

export async function updateFestivalSettings(festivalId: string, formData: Partial<FestivalSettings>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_settings").update(formData).eq("festival_id", festivalId)
  if (error) return { error: error.message }

  return { success: true }
}

// ────────────────────────────────────────────
// DAYS
// ────────────────────────────────────────────

export async function getFestivalDays(festivalId: string): Promise<FestivalDay[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_days").select("*").eq("festival_id", festivalId).order("day_number", { ascending: true })
  return (data || []) as FestivalDay[]
}

export async function createFestivalDay(festivalId: string, formData: Partial<FestivalDay>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_days").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFestivalDay(dayId: string, formData: Partial<FestivalDay>) {
  const admin = createAdminClient()
  const { data: day } = await admin.from("festival_days").select("festival_id").eq("id", dayId).single()
  if (!day) return { error: "Day not found" }

  const check = await checkFestivalAccess(day.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_days").update(formData).eq("id", dayId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalDay(dayId: string) {
  const admin = createAdminClient()
  const { data: day } = await admin.from("festival_days").select("festival_id").eq("id", dayId).single()
  if (!day) return { error: "Day not found" }

  const check = await checkFestivalAccess(day.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_days").delete().eq("id", dayId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// VENUES
// ────────────────────────────────────────────

export async function getFestivalVenues(festivalId: string): Promise<FestivalVenue[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_venues").select("*").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return (data || []) as FestivalVenue[]
}

export async function createFestivalVenue(festivalId: string, formData: Partial<FestivalVenue>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_venues").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFestivalVenue(venueId: string, formData: Partial<FestivalVenue>) {
  const admin = createAdminClient()
  const { data: venue } = await admin.from("festival_venues").select("festival_id").eq("id", venueId).single()
  if (!venue) return { error: "Venue not found" }

  const check = await checkFestivalAccess(venue.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_venues").update(formData).eq("id", venueId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalVenue(venueId: string) {
  const admin = createAdminClient()
  const { data: venue } = await admin.from("festival_venues").select("festival_id").eq("id", venueId).single()
  if (!venue) return { error: "Venue not found" }

  const check = await checkFestivalAccess(venue.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_venues").delete().eq("id", venueId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// STAGES
// ────────────────────────────────────────────

export async function getFestivalStages(festivalId: string): Promise<FestivalStage[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_stages").select("*, venue:festival_venues(name)").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return (data || []) as FestivalStage[]
}

export async function createFestivalStage(festivalId: string, formData: Partial<FestivalStage>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_stages").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFestivalStage(stageId: string, formData: Partial<FestivalStage>) {
  const admin = createAdminClient()
  const { data: stage } = await admin.from("festival_stages").select("festival_id").eq("id", stageId).single()
  if (!stage) return { error: "Stage not found" }

  const check = await checkFestivalAccess(stage.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_stages").update(formData).eq("id", stageId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalStage(stageId: string) {
  const admin = createAdminClient()
  const { data: stage } = await admin.from("festival_stages").select("festival_id").eq("id", stageId).single()
  if (!stage) return { error: "Stage not found" }

  const check = await checkFestivalAccess(stage.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_stages").delete().eq("id", stageId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// COMMITTEES
// ────────────────────────────────────────────

export async function getFestivalCommittees(festivalId: string): Promise<FestivalCommittee[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_committees").select("*").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return (data || []) as FestivalCommittee[]
}

export async function createFestivalCommittee(festivalId: string, formData: Partial<FestivalCommittee>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_committees").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFestivalCommittee(committeeId: string, formData: Partial<FestivalCommittee>) {
  const admin = createAdminClient()
  const { data: committee } = await admin.from("festival_committees").select("festival_id").eq("id", committeeId).single()
  if (!committee) return { error: "Committee not found" }

  const check = await checkFestivalAccess(committee.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_committees").update(formData).eq("id", committeeId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalCommittee(committeeId: string) {
  const admin = createAdminClient()
  const { data: committee } = await admin.from("festival_committees").select("festival_id").eq("id", committeeId).single()
  if (!committee) return { error: "Committee not found" }

  const check = await checkFestivalAccess(committee.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_committees").delete().eq("id", committeeId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// CONTACTS
// ────────────────────────────────────────────

export async function getFestivalContacts(festivalId: string): Promise<FestivalContact[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_contacts").select("*").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return (data || []) as FestivalContact[]
}

export async function createFestivalContact(festivalId: string, formData: Partial<FestivalContact>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_contacts").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalContact(contactId: string) {
  const admin = createAdminClient()
  const { data: contact } = await admin.from("festival_contacts").select("festival_id").eq("id", contactId).single()
  if (!contact) return { error: "Contact not found" }

  const check = await checkFestivalAccess(contact.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_contacts").delete().eq("id", contactId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// DOCUMENTS
// ────────────────────────────────────────────

export async function getFestivalDocuments(festivalId: string): Promise<FestivalDocument[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_documents").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return (data || []) as FestivalDocument[]
}

export async function createFestivalDocument(festivalId: string, formData: { title: string; description?: string; file_url: string; file_type?: string; category?: string }) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const user = await getAuth()
  const admin = createAdminClient()
  const { error } = await admin.from("festival_documents").insert({
    festival_id: festivalId,
    title: formData.title,
    description: formData.description || null,
    file_url: formData.file_url,
    file_type: formData.file_type || null,
    category: formData.category || "general",
    created_by: user?.id || null,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalDocument(docId: string) {
  const admin = createAdminClient()
  const { data: doc } = await admin.from("festival_documents").select("festival_id").eq("id", docId).single()
  if (!doc) return { error: "Document not found" }

  const check = await checkFestivalAccess(doc.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_documents").delete().eq("id", docId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// ANNOUNCEMENTS
// ────────────────────────────────────────────

export async function getFestivalAnnouncements(festivalId: string): Promise<FestivalAnnouncement[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_announcements").select("*, creator:profiles(first_name, last_name, email)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return (data || []) as FestivalAnnouncement[]
}

export async function createFestivalAnnouncement(festivalId: string, formData: { title: string; content: string; status?: string; is_pinned?: boolean; scheduled_at?: string }) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const user = await getAuth()
  const admin = createAdminClient()
  const insertData: Record<string, any> = {
    festival_id: festivalId,
    title: formData.title,
    content: formData.content,
    status: formData.status || "draft",
    is_pinned: formData.is_pinned || false,
    created_by: user?.id || null,
  }
  if (formData.scheduled_at) {
    insertData.scheduled_at = formData.scheduled_at
    insertData.status = "scheduled"
  }
  if (formData.status === "published") {
    insertData.published_at = new Date().toISOString()
  }

  const { error } = await admin.from("festival_announcements").insert(insertData)
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFestivalAnnouncement(announcementId: string, formData: Partial<FestivalAnnouncement>) {
  const admin = createAdminClient()
  const { data: ann } = await admin.from("festival_announcements").select("festival_id").eq("id", announcementId).single()
  if (!ann) return { error: "Announcement not found" }

  const check = await checkFestivalAccess(ann.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const updateData: Record<string, any> = { ...formData }
  if (formData.status === "published") updateData.published_at = new Date().toISOString()
  if (formData.status === "archived") updateData.archived_at = new Date().toISOString()

  const { error } = await admin.from("festival_announcements").update(updateData).eq("id", announcementId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalAnnouncement(announcementId: string) {
  const admin = createAdminClient()
  const { data: ann } = await admin.from("festival_announcements").select("festival_id").eq("id", announcementId).single()
  if (!ann) return { error: "Announcement not found" }

  const check = await checkFestivalAccess(ann.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_announcements").delete().eq("id", announcementId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// SPONSORS
// ────────────────────────────────────────────

export async function getFestivalSponsors(festivalId: string): Promise<FestivalSponsor[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_sponsors").select("*").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return (data || []) as FestivalSponsor[]
}

export async function createFestivalSponsor(festivalId: string, formData: Partial<FestivalSponsor>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_sponsors").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateFestivalSponsor(sponsorId: string, formData: Partial<FestivalSponsor>) {
  const admin = createAdminClient()
  const { data: sponsor } = await admin.from("festival_sponsors").select("festival_id").eq("id", sponsorId).single()
  if (!sponsor) return { error: "Sponsor not found" }

  const check = await checkFestivalAccess(sponsor.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_sponsors").update(formData).eq("id", sponsorId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalSponsor(sponsorId: string) {
  const admin = createAdminClient()
  const { data: sponsor } = await admin.from("festival_sponsors").select("festival_id").eq("id", sponsorId).single()
  if (!sponsor) return { error: "Sponsor not found" }

  const check = await checkFestivalAccess(sponsor.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_sponsors").delete().eq("id", sponsorId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// GALLERY
// ────────────────────────────────────────────

export async function getFestivalGallery(festivalId: string): Promise<FestivalGalleryItem[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_gallery").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  return (data || []) as FestivalGalleryItem[]
}

export async function createFestivalGalleryItem(festivalId: string, formData: { title?: string; file_url: string; thumbnail_url?: string; gallery_type?: string; category?: string }) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const user = await getAuth()
  const admin = createAdminClient()
  const { error } = await admin.from("festival_gallery").insert({
    festival_id: festivalId,
    title: formData.title || null,
    file_url: formData.file_url,
    thumbnail_url: formData.thumbnail_url || null,
    gallery_type: formData.gallery_type || "image",
    category: formData.category || "general",
    created_by: user?.id || null,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalGalleryItem(itemId: string) {
  const admin = createAdminClient()
  const { data: item } = await admin.from("festival_gallery").select("festival_id").eq("id", itemId).single()
  if (!item) return { error: "Item not found" }

  const check = await checkFestivalAccess(item.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_gallery").delete().eq("id", itemId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// BANNERS
// ────────────────────────────────────────────

export async function getFestivalBanners(festivalId: string): Promise<FestivalBanner[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_banners").select("*").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return (data || []) as FestivalBanner[]
}

export async function createFestivalBanner(festivalId: string, formData: Partial<FestivalBanner>) {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { error } = await admin.from("festival_banners").insert({ festival_id: festivalId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteFestivalBanner(bannerId: string) {
  const admin = createAdminClient()
  const { data: banner } = await admin.from("festival_banners").select("festival_id").eq("id", bannerId).single()
  if (!banner) return { error: "Banner not found" }

  const check = await checkFestivalAccess(banner.festival_id, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("festival_banners").delete().eq("id", bannerId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// STATISTICS
// ────────────────────────────────────────────

export async function getFestivalStatistics(festivalId: string): Promise<FestivalStatistics | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("festival_statistics").select("*").eq("festival_id", festivalId).single()
  return data as FestivalStatistics | null
}

// ────────────────────────────────────────────
// DASHBOARD DATA
// ────────────────────────────────────────────

export async function getFestivalDashboardData(festivalId: string): Promise<FestivalDashboardData | null> {
  const check = await checkFestivalAccess(festivalId)
  if (!check.allowed) return null

  const [festival, settings, statistics, days, venues, stages, announcements, sponsors] = await Promise.all([
    getFestival(festivalId),
    getFestivalSettings(festivalId),
    getFestivalStatistics(festivalId),
    getFestivalDays(festivalId),
    getFestivalVenues(festivalId),
    getFestivalStages(festivalId),
    getFestivalAnnouncements(festivalId),
    getFestivalSponsors(festivalId),
  ])

  if (!festival) return null

  return {
    festival,
    settings: settings!,
    statistics: statistics!,
    days,
    venues,
    stages,
    announcements: announcements.filter((a: FestivalAnnouncement) => a.status === "published"),
    sponsors: sponsors.filter((s: FestivalSponsor) => s.status === "confirmed"),
    recentActivity: [],
  } as FestivalDashboardData
}

// ────────────────────────────────────────────
// STORAGE UPLOAD
// ────────────────────────────────────────────

export async function uploadFile(festivalId: string, bucket: string, file: File, path: string): Promise<{ url?: string; error?: string }> {
  const check = await checkFestivalAccess(festivalId, ["organization_owner", "organization_admin", "festival_director"])
  if (!check.allowed) return { error: check.error }

  const supabase = await createClient()
  const filePath = `${festivalId}/${path}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) return { error: error.message }

  const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(data.path)
  return { url: urlData.publicUrl }
}

export async function deleteFile(bucket: string, filePath: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) return { error: error.message }
  return {}
}
