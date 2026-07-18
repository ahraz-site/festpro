"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!fest) return { allowed: false, error: "Festival not found" } as const
  const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
  if (!member) return { allowed: false, error: "Not a member" } as const
  return { allowed: true, user, festival: fest, member: member as { role: UserRole } } as const
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

export async function softDeleteParticipant(participantId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("participants").select("festival_id, organization_id, first_name, last_name").eq("id", participantId).single()
  if (!existing) return { error: "Participant not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("participants").update({ deleted_at: new Date().toISOString() }).eq("id", participantId)
  if (error) return { error: error.message }

  await logActivity(existing.organization_id, "participant.deleted", { participant_id: participantId, name: `${existing.first_name} ${existing.last_name}` })
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
  let query = admin.from("participants").select("*, guardians(*), institution:institutions(*), registrations(*)", { count: "exact" })
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
