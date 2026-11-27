"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyFestivalAccess } from "@/lib/auth/session-guard"
import type { UserRole } from "@/types"
import type {
  Participant, ParticipantFormData,
  Institution, Guardian,
} from "@/types/participant"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId: string) {
  const access = await verifyFestivalAccess(festivalId)
  if (!access.allowed) return { allowed: false, error: access.error } as const
  return {
    allowed: true,
    user: { id: access.mode === "supabase" ? access.userId || null : null },
    festival: { organization_id: access.organizationId },
    member: { role: access.role as UserRole },
  } as const
}

async function logActivity(orgId: string, action: string, metadata: Record<string, any> = {}) {
  const user = await getAuth()
  if (!user) return
  const admin = createAdminClient()
  await admin.from("activity_logs").insert({
    organization_id: orgId, user_id: user.id, action,
    resource_type: "participant", metadata,
  })
}

// ────────────────────────────────────────────
// PARTICIPANTS CRUD
// ────────────────────────────────────────────

export async function createParticipant(festivalId: string, formData: ParticipantFormData) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data, error } = await admin.from("participants").insert({
    festival_id: festivalId,
    organization_id: check.festival.organization_id,
    first_name: formData.first_name,
    last_name: formData.last_name,
    date_of_birth: formData.date_of_birth || null,
    gender: formData.gender || "male",
    email: formData.email || null,
    phone: formData.phone || null,
    address: formData.address || null,
    city: formData.city || null,
    district: formData.district || null,
    state: formData.state || null,
    unit: formData.unit || null,
    division: formData.division || null,
    sector: formData.sector || null,
    institution_id: formData.institution_id || null,
    institution_name: formData.institution_name || null,
    notes: formData.notes || null,
    created_by: check.user.id,
  }).select("id, participant_id, registration_number, chest_number").single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/participants`)
  return { data }
}

/**
 * Add a participant directly from FestPro Participant Console matching Festize reference
 */
export async function addFestParticipantAction(
  festivalId: string,
  params: {
    name: string
    name_ml?: string
    date_of_birth?: string
    team: string
    category: string
  }
) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const parts = params.name.trim().split(" ")
  const firstName = parts[0]
  const lastName = parts.slice(1).join(" ") || ""

  const { count } = await admin
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("festival_id", festivalId)

  const prefix = (params.team || "P").slice(0, 2).toUpperCase()
  const numStr = String((count || 0) + 1).padStart(3, "0")
  const chestNo = `${prefix}${numStr}`

  const { data: inserted, error } = await admin.from("participants").insert({
    festival_id: festivalId,
    organization_id: check.festival.organization_id,
    participant_id: `PID-${Date.now().toString(36).toUpperCase()}`,
    registration_number: `REG-${Date.now().toString(36).toUpperCase()}`,
    first_name: firstName,
    last_name: lastName,
    chest_number: chestNo,
    unit: params.team,
    division: params.category,
    date_of_birth: params.date_of_birth || null,
    notes: params.name_ml || null,
    created_by: check.user.id,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/participants`)
  return { success: true, participant: inserted }
}

/**
 * Bulk add participants line-by-line matching Festize reference
 */
export async function bulkAddParticipantsAction(
  festivalId: string,
  teamCode: string,
  categoryName: string,
  namesText: string
) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const lines = namesText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return { error: "No participant names entered" }

  const admin = createAdminClient()

  const { count } = await admin
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("festival_id", festivalId)

  const startNum = (count || 0) + 1
  const prefix = (teamCode || "P").slice(0, 2).toUpperCase()

  const baseTs = Date.now().toString(36).toUpperCase()
  const inserts = lines.map((line, idx) => {
    const parts = line.split(" ")
    const firstName = parts[0]
    const lastName = parts.slice(1).join(" ") || ""
    const numStr = String(startNum + idx).padStart(3, "0")
    const chestNo = `${prefix}${numStr}`

    return {
      festival_id: festivalId,
      organization_id: check.festival.organization_id,
      participant_id: `PID-${baseTs}-${idx + 1}`,
      registration_number: `REG-${baseTs}-${idx + 1}`,
      first_name: firstName,
      last_name: lastName,
      chest_number: chestNo,
      unit: teamCode,
      division: categoryName,
      created_by: check.user.id,
    }
  })

  const { data, error } = await admin.from("participants").insert(inserts).select()
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/participants`)
  return { success: true, count: data.length }
}

export async function updateParticipant(participantId: string, formData: Partial<ParticipantFormData>) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("participants").select("festival_id, organization_id").eq("id", participantId).single()
  if (!existing) return { error: "Participant not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const { data, error } = await admin.from("participants").update({
    first_name: formData.first_name,
    last_name: formData.last_name,
    date_of_birth: formData.date_of_birth || null,
    gender: formData.gender,
    email: formData.email || null,
    phone: formData.phone || null,
    address: formData.address || null,
    city: formData.city || null,
    district: formData.district || null,
    state: formData.state || null,
    unit: formData.unit || null,
    division: formData.division || null,
    sector: formData.sector || null,
    institution_id: formData.institution_id || null,
    institution_name: formData.institution_name || null,
    notes: formData.notes || null,
  }).eq("id", participantId).select("id, participant_id, chest_number").single()

  if (error) return { error: error.message }
  await logActivity(existing.organization_id, "participant.updated", { participant_id: participantId })
  revalidatePath(`/dashboard/organization/${existing.organization_id}/festivals/${existing.festival_id}/participants`)
  return { data }
}

export async function updateFestParticipantAction(
  participantId: string,
  festivalId: string,
  params: {
    name: string
    name_ml?: string
    date_of_birth?: string
    team: string
    category: string
  }
) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const parts = params.name.trim().split(" ")
  const firstName = parts[0]
  const lastName = parts.slice(1).join(" ") || ""

  const { data, error } = await admin
    .from("participants")
    .update({
      first_name: firstName,
      last_name: lastName,
      unit: params.team || null,
      division: params.category || null,
      date_of_birth: params.date_of_birth || null,
      notes: params.name_ml || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", participantId)
    .eq("festival_id", festivalId)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/participants`)
  return { data }
}

export async function softDeleteParticipant(participantId: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("participants").select("festival_id, organization_id, first_name, last_name").eq("id", participantId).single()
  if (!existing) return { error: "Participant not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("participants").update({ deleted_at: new Date().toISOString() }).eq("id", participantId)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/organization/${existing.organization_id}/festivals/${existing.festival_id}/participants`)
  return { success: true }
}

export async function restoreParticipant(participantId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("participants").select("festival_id, organization_id").eq("id", participantId).single()
  if (!existing) return { error: "Participant not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("participants").update({ deleted_at: null }).eq("id", participantId)
  if (error) return { error: error.message }

  await logActivity(existing.organization_id, "participant.restored", { participant_id: participantId })
  revalidatePath(`/dashboard/organization/${existing.organization_id}/festivals/${existing.festival_id}/participants`)
  return { success: true }
}

export async function getParticipants(festivalId: string, params: {
  search?: string; status?: string; unit?: string; division?: string; sector?: string; gender?: string; institution_id?: string; deleted?: string; page?: number; limit?: number
} = {}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }

  const admin = createAdminClient()
  let query = admin
    .from("participants")
    .select(
      "id, festival_id, organization_id, participant_id, registration_number, chest_number, first_name, last_name, date_of_birth, gender, email, phone, unit, division, sector, notes, created_at, deleted_at",
      { count: "exact" }
    )
    .eq("festival_id", festivalId)
    .order("created_at", { ascending: false })

  if (params.deleted === "true") {
    query = query.not("deleted_at", "is", null)
  } else if (params.deleted !== "all") {
    query = query.is("deleted_at", null)
  }

  if (params.search) {
    query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,participant_id.ilike.%${params.search}%,registration_number.ilike.%${params.search}%,chest_number.ilike.%${params.search}%`)
  }
  if (params.unit) query = query.eq("unit", params.unit)
  if (params.division) query = query.eq("division", params.division)
  if (params.sector) query = query.eq("sector", params.sector)
  if (params.gender) query = query.eq("gender", params.gender)
  if (params.institution_id) query = query.eq("institution_id", params.institution_id)

  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data as unknown as Participant[], count: count || 0 }
}

export async function getParticipantById(participantId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("participants").select("*, guardians(*), registrations(*, competition:competitions(id, name, code, competition_type)), documents:participant_documents(*), medical:medical_information(*), attendance(*), qr_card:qr_cards(*)").eq("id", participantId).single()
  if (error) return { error: error.message }
  return { data: data as unknown as Participant }
}

export async function getParticipantDashboard(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data: participants } = await admin.from("participants").select("id, gender, deleted_at").eq("festival_id", festivalId).is("deleted_at", null)
  const { data: registrations } = await admin.from("registrations").select("id, status, competition_id, is_attended, competition:competitions(name)").eq("festival_id", festivalId)

  const total = participants?.length || 0
  const approved = registrations?.filter(r => r.status === "approved").length || 0
  const pending = registrations?.filter(r => r.status === "pending").length || 0
  const rejected = registrations?.filter(r => r.status === "rejected").length || 0
  const checked_in = registrations?.filter(r => r.is_attended).length || 0
  const absent = registrations?.filter(r => r.status === "approved" && !r.is_attended).length || 0

  const competitionMap: Record<string, number> = {}
  registrations?.forEach(r => {
    const name = (r.competition as { name?: string })?.name || "Unknown"
    competitionMap[name] = (competitionMap[name] || 0) + 1
  })
  const competition_wise = Object.entries(competitionMap).map(([name, count]) => ({ name, count }))

  const male = participants?.filter(p => p.gender === "male").length || 0
  const female = participants?.filter(p => p.gender === "female").length || 0
  const other = participants?.filter(p => p.gender === "other").length || 0

  return {
    data: { total, approved, pending, rejected, checked_in, absent, competition_wise, gender_distribution: { male, female, other } },
  }
}

// ────────────────────────────────────────────
// PHOTO UPLOAD
// ────────────────────────────────────────────

export async function uploadParticipantPhoto(participantId: string, formData: FormData) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("participants").select("festival_id, organization_id").eq("id", participantId).single()
  if (!existing) return { error: "Participant not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const ext = file.name.split(".").pop()
  const filePath = `${participantId}/photo-${Date.now()}.${ext}`

  const { data: upload, error: uploadError } = await admin.storage.from("participant-photos").upload(filePath, file, { upsert: true })
  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from("participant-photos").getPublicUrl(filePath)
  await admin.from("participants").update({ photo_url: publicUrl }).eq("id", participantId)

  revalidatePath(`/dashboard/organization/${existing.organization_id}/festivals/${existing.festival_id}/participants`)
  return { url: publicUrl }
}

// ────────────────────────────────────────────
// INSTITUTIONS
// ────────────────────────────────────────────

export async function getInstitutions(orgId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("institutions").select("*").eq("organization_id", orgId).eq("is_active", true).order("name")
  return { data: data as Institution[] }
}

export async function createInstitution(orgId: string, name: string, code?: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("institutions").insert({ organization_id: orgId, name, code: code || null }).select().single()
  if (error) return { error: error.message }
  return { data: data as Institution }
}

// ────────────────────────────────────────────
// GUARDIANS
// ────────────────────────────────────────────

export async function upsertGuardian(participantId: string, formData: { name: string; relationship?: string; phone?: string; email?: string; occupation?: string; address?: string; is_emergency_contact?: boolean }) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("guardians").select("id").eq("participant_id", participantId).maybeSingle()

  if (existing) {
    const { error } = await admin.from("guardians").update(formData).eq("id", existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("guardians").insert({ participant_id: participantId, ...formData })
    if (error) return { error: error.message }
  }
  return { success: true }
}
