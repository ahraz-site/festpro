"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  Competition, CompetitionRound, CompetitionRule, CompetitionMaterial,
  CompetitionStageAssignment, CompetitionJudgeAssignment, CompetitionTimeSlot,
  CompetitionEligibility, CompetitionFormData,
} from "@/types/competition"

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

async function logActivity(festivalId: string, action: string, metadata: Record<string, any> = {}) {
  const user = await getAuth()
  if (!user) return
  const admin = createAdminClient()
  const { data: f } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!f) return
  await admin.from("activity_logs").insert({
    organization_id: f.organization_id, user_id: user.id, action,
    resource_type: "competition", metadata,
  })
}

// ────────────────────────────────────────────
// COMPETITIONS CRUD
// ────────────────────────────────────────────

export async function createCompetition(festivalId: string, formData: CompetitionFormData) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data, error } = await admin.from("competitions").insert({
    festival_id: festivalId,
    category_id: formData.category_id,
    subcategory_id: formData.subcategory_id || null,
    group_id: formData.group_id || null,
    name: formData.name,
    name_ml: formData.name_ml || null,
    code: formData.code || null,
    description: formData.description || null,
    competition_type: formData.competition_type || "individual",
    age_group: formData.age_group || "open",
    gender_restriction: formData.gender_restriction || "all",
    language: formData.language || "all",
    duration_minutes: parseInt(formData.duration_minutes) || 60,
    max_participants: parseInt(formData.max_participants) || 100,
    min_participants: parseInt(formData.min_participants) || 1,
    max_teams: parseInt(formData.max_teams) || 50,
    max_participants_per_team: parseInt(formData.max_participants_per_team) || 1,
    is_team_event: formData.is_team_event || false,
    stage_required: formData.stage_required ?? true,
    judge_count: parseInt(formData.judge_count) || 3,
    round_count: parseInt(formData.round_count) || 1,
    status: formData.status || "draft",
    allow_multiple_entries: formData.allow_multiple_entries || false,
    requires_approval: formData.requires_approval || false,
    instructions: formData.instructions || null,
    winning_criteria: formData.winning_criteria || null,
    scoring_method: formData.scoring_method || "points",
    max_score: parseFloat(formData.max_score) || 100,
    passing_score: formData.passing_score ? parseFloat(formData.passing_score) : null,
    created_by: check.user.id,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/competitions`, "layout")
  return { success: true, id: data.id }
}

export async function getCompetitions(festivalId: string): Promise<Competition[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competitions")
    .select("*, category:competition_categories(name, color), group:competition_groups(name)")
    .eq("festival_id", festivalId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  return (data || []) as unknown as Competition[]
}

export async function getCompetition(competitionId: string): Promise<Competition | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("competitions")
    .select("*, category:competition_categories(*), group:competition_groups(*), rounds:competition_rounds(*), stage_assignments:competition_stage_assignments(*), judge_assignments:competition_judge_assignments(*)")
    .eq("id", competitionId)
    .single()
  return data as unknown as Competition | null
}

export async function updateCompetition(competitionId: string, formData: Partial<CompetitionFormData>) {
  const admin = createAdminClient()
  const { data: comp } = await admin.from("competitions").select("festival_id").eq("id", competitionId).single()
  if (!comp) return { error: "Competition not found" }

  const updateData: Record<string, any> = {}
  for (const [key, value] of Object.entries(formData)) {
    if (value !== undefined) {
      if (["duration_minutes", "max_participants", "min_participants", "max_teams", "max_participants_per_team", "judge_count", "round_count", "display_order"].includes(key)) {
        updateData[key] = value ? parseInt(value as string) : null
      } else if (["max_score", "passing_score"].includes(key)) {
        updateData[key] = value ? parseFloat(value as string) : null
      } else {
        updateData[key] = value || null
      }
    }
  }

  const { error } = await admin.from("competitions").update(updateData).eq("id", competitionId)
  if (error) return { error: error.message }

  await logActivity(comp.festival_id, "competition.updated", { competition_id: competitionId })
  revalidatePath(`/dashboard/organization/*/festivals/${comp.festival_id}/competitions`, "layout")
  return { success: true }
}

export async function deleteCompetition(competitionId: string) {
  const admin = createAdminClient()
  const { data: comp } = await admin.from("competitions").select("festival_id").eq("id", competitionId).single()
  if (!comp) return { error: "Competition not found" }

  const { error } = await admin.from("competitions").update({ deleted_at: new Date().toISOString() }).eq("id", competitionId)
  if (error) return { error: error.message }

  await logActivity(comp.festival_id, "competition.deleted", { competition_id: competitionId })
  revalidatePath(`/dashboard/organization/*/festivals/${comp.festival_id}/competitions`, "layout")
  return { success: true }
}

export async function getCompetitionsByCategory(festivalId: string, categoryId: string): Promise<Competition[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competitions")
    .select("*, category:competition_categories(name, color), group:competition_groups(name)")
    .eq("festival_id", festivalId).eq("category_id", categoryId).is("deleted_at", null).order("name")
  return (data || []) as unknown as Competition[]
}

// ────────────────────────────────────────────
// ROUNDS
// ────────────────────────────────────────────

export async function getCompetitionRounds(competitionId: string): Promise<CompetitionRound[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_rounds").select("*").eq("competition_id", competitionId).order("round_number", { ascending: true })
  return (data || []) as CompetitionRound[]
}

export async function createCompetitionRound(competitionId: string, formData: { name: string; round_type: string; round_number: number; duration_minutes?: number; max_participants?: number; description?: string }) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_rounds").insert({ competition_id: competitionId, ...formData })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateCompetitionRound(roundId: string, formData: Partial<CompetitionRound>) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_rounds").update(formData).eq("id", roundId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCompetitionRound(roundId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_rounds").delete().eq("id", roundId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// RULES
// ────────────────────────────────────────────

export async function getCompetitionRules(competitionId: string): Promise<CompetitionRule[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_rules").select("*").eq("competition_id", competitionId).order("rule_number", { ascending: true })
  return (data || []) as CompetitionRule[]
}

export async function createCompetitionRule(competitionId: string, formData: { title: string; description?: string; rule_number?: number; file_url?: string }) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_rules").insert({ competition_id: competitionId, title: formData.title, description: formData.description || null, rule_number: formData.rule_number || 1, file_url: formData.file_url || null })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateCompetitionRule(ruleId: string, formData: Partial<CompetitionRule>) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_rules").update(formData).eq("id", ruleId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCompetitionRule(ruleId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_rules").delete().eq("id", ruleId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// MATERIALS
// ────────────────────────────────────────────

export async function getCompetitionMaterials(competitionId: string): Promise<CompetitionMaterial[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_materials").select("*").eq("competition_id", competitionId).order("name")
  return (data || []) as CompetitionMaterial[]
}

export async function createCompetitionMaterial(competitionId: string, formData: { name: string; description?: string; is_required?: boolean; quantity?: number }) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_materials").insert({ competition_id: competitionId, name: formData.name, description: formData.description || null, is_required: formData.is_required ?? true, quantity: formData.quantity || 1 })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCompetitionMaterial(materialId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_materials").delete().eq("id", materialId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// STAGE ASSIGNMENT
// ────────────────────────────────────────────

export async function getStageAssignments(competitionId: string): Promise<CompetitionStageAssignment[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_stage_assignments")
    .select("*, stage:festival_stages(name, code), venue:festival_venues(name)")
    .eq("competition_id", competitionId)
  return (data || []) as unknown as CompetitionStageAssignment[]
}

export async function assignStage(competitionId: string, formData: { stage_id: string; venue_id?: string; assigned_date?: string; start_time?: string; end_time?: string; notes?: string }) {
  const admin = createAdminClient()
  const { data: comp } = await admin.from("competitions").select("festival_id").eq("id", competitionId).single()
  if (!comp) return { error: "Competition not found" }

  const { error } = await admin.from("competition_stage_assignments").insert({
    competition_id: competitionId, stage_id: formData.stage_id,
    venue_id: formData.venue_id || null, assigned_date: formData.assigned_date || null,
    start_time: formData.start_time || null, end_time: formData.end_time || null,
    notes: formData.notes || null,
  })
  if (error) {
    if (error.message.includes("duplicate")) return { error: "This stage is already assigned to this competition on this date" }
    return { error: error.message }
  }

  await logActivity(comp.festival_id, "competition.stage_assigned", { competition_id: competitionId, stage_id: formData.stage_id })
  return { success: true }
}

export async function removeStageAssignment(assignmentId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_stage_assignments").delete().eq("id", assignmentId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// JUDGE ASSIGNMENT
// ────────────────────────────────────────────

export async function getJudgeAssignments(competitionId: string): Promise<CompetitionJudgeAssignment[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_judge_assignments")
    .select("*, profile:profiles(first_name, last_name, email)")
    .eq("competition_id", competitionId)
  return (data || []) as unknown as CompetitionJudgeAssignment[]
}

export async function assignJudge(competitionId: string, userId: string, isLeadJudge = false) {
  const admin = createAdminClient()
  const { data: comp } = await admin.from("competitions").select("festival_id").eq("id", competitionId).single()
  if (!comp) return { error: "Competition not found" }

  const { error } = await admin.from("competition_judge_assignments").insert({
    competition_id: competitionId, user_id: userId, role: "judge", is_lead_judge: isLeadJudge,
  })
  if (error) {
    if (error.message.includes("duplicate")) return { error: "This judge is already assigned" }
    return { error: error.message }
  }

  await logActivity(comp.festival_id, "competition.judge_assigned", { competition_id: competitionId, judge_id: userId })
  return { success: true }
}

export async function removeJudge(assignmentId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_judge_assignments").delete().eq("id", assignmentId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// TIME SLOTS
// ────────────────────────────────────────────

export async function getTimeSlots(festivalId: string, date?: string): Promise<CompetitionTimeSlot[]> {
  const admin = createAdminClient()
  let query = admin.from("competition_time_slots")
    .select("*, stage:festival_stages(name), venue:festival_venues(name), round:competition_rounds(name, round_number), competition:competitions(name, code)")
    .eq("competition:competitions.festival_id", festivalId)
  if (date) query = query.eq("slot_date", date)
  const { data } = await query.order("slot_date").order("start_time")
  return (data || []) as unknown as CompetitionTimeSlot[]
}

export async function createTimeSlot(competitionId: string, formData: { round_id?: string; stage_id?: string; venue_id?: string; slot_date: string; start_time: string; end_time: string; max_participants?: number; notes?: string }) {
  const admin = createAdminClient()
  const { data: comp } = await admin.from("competitions").select("festival_id").eq("id", competitionId).single()
  if (!comp) return { error: "Competition not found" }

  const { error } = await admin.from("competition_time_slots").insert({
    competition_id: competitionId, round_id: formData.round_id || null,
    stage_id: formData.stage_id || null, venue_id: formData.venue_id || null,
    slot_date: formData.slot_date, start_time: formData.start_time, end_time: formData.end_time,
    max_participants: formData.max_participants || null, notes: formData.notes || null,
  })
  if (error) return { error: error.message }
  await logActivity(comp.festival_id, "competition.scheduled", { competition_id: competitionId })
  return { success: true }
}

export async function updateTimeSlot(slotId: string, formData: Partial<CompetitionTimeSlot>) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_time_slots").update(formData).eq("id", slotId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteTimeSlot(slotId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_time_slots").delete().eq("id", slotId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// ELIGIBILITY
// ────────────────────────────────────────────

export async function getEligibility(competitionId: string): Promise<CompetitionEligibility | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_eligibility").select("*").eq("competition_id", competitionId).maybeSingle()
  return data as CompetitionEligibility | null
}

export async function upsertEligibility(competitionId: string, formData: Partial<CompetitionEligibility>) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_eligibility").upsert({
    competition_id: competitionId, ...formData,
  }).select().single()
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// ORG MEMBERS (for judge selection)
// ────────────────────────────────────────────

export async function getOrgMembersForJudge(organizationId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("organization_members")
    .select("user_id, role, profile:profiles(first_name, last_name, email)")
    .eq("organization_id", organizationId)
    .not("role", "in", '("public_user","participant")')
  return (data || []) as any[]
}

// ────────────────────────────────────────────
// DASHBOARD STATS
// ────────────────────────────────────────────

export async function getCompetitionStats(festivalId: string) {
  const admin = createAdminClient()
  const { data: total } = await admin.from("competitions").select("id", { count: "exact", head: true }).eq("festival_id", festivalId).is("deleted_at", null)
  const { data: byStatus } = await admin.from("competitions").select("status", { count: "exact", head: true }).eq("festival_id", festivalId).is("deleted_at", null)
  const { data: categories } = await admin.from("competition_categories").select("id", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_active", true)

  const statusCounts: Record<string, number> = {}
  if (byStatus) {
    for (const s of byStatus as any[]) {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1
    }
  }

  return { total: total?.length || 0, categories: categories?.length || 0, byStatus: statusCounts }
}
