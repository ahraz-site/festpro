"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  JudgeProfile, CriteriaGroup, ScoringCriteria, CompetitionScoringRule, CompetitionCriteria,
  Score, ScoreItem, ScoreLock, ChiefApproval, ResultProcessing, TieBreakRule,
} from "@/types/judging"

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

async function logAudit(orgId: string, action: string, metadata: Record<string, any> = {}) {
  const user = await getAuth()
  if (!user) return
  const admin = createAdminClient()
  await admin.from("score_audit_logs").insert({
    organization_id: orgId, user_id: user.id, action,
    resource_type: "judging", metadata,
  })
}

// ────────────────────────────────────────────
// JUDGE PROFILES
// ────────────────────────────────────────────

export async function getJudgeProfiles(orgId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("judge_profiles").select("*, profile:profiles!judge_profiles_user_id_fkey(first_name, last_name, email)").eq("organization_id", orgId).order("created_at", { ascending: false })
  return { data: data as JudgeProfile[] }
}

export async function upsertJudgeProfile(orgId: string, userId: string, formData: { phone?: string; qualification?: string; specialization?: string; experience_years?: number; languages?: string[]; status?: string }) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: existing } = await admin.from("judge_profiles").select("id").eq("user_id", userId).eq("organization_id", orgId).maybeSingle()
  if (existing) {
    const { error } = await admin.from("judge_profiles").update(formData).eq("id", existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("judge_profiles").insert({ organization_id: orgId, user_id: userId, ...formData })
    if (error) return { error: error.message }
  }
  revalidatePath(`/dashboard/organization/${orgId}/judging`)
  return { success: true }
}

// ────────────────────────────────────────────
// JUDGE ASSIGNMENTS (wraps competition_judge_assignments)
// ────────────────────────────────────────────

export async function getJudgeAssignments(competitionId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_judge_assignments").select("*, profile:profiles!competition_judge_assignments_user_id_fkey(first_name, last_name, email)").eq("competition_id", competitionId)
  return { data: data as any[] }
}

export async function assignJudgeToCompetition(competitionId: string, userId: string, role = "judge", isLead = false) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: existing } = await admin.from("competition_judge_assignments").select("id").eq("competition_id", competitionId).eq("user_id", userId).maybeSingle()
  if (existing) return { error: "Judge already assigned" }
  if (isLead) {
    await admin.from("competition_judge_assignments").update({ is_lead_judge: false }).eq("competition_id", competitionId)
  }
  const { error } = await admin.from("competition_judge_assignments").insert({ competition_id: competitionId, user_id: userId, role, is_lead_judge: isLead })
  if (error) return { error: error.message }
  await logAudit("", "judge.assigned", { competition_id: competitionId, user_id: userId })
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${competitionId}/judges`)
  return { success: true }
}

export async function removeJudgeFromCompetition(assignmentId: string) {
  const admin = createAdminClient()
  const { data: a } = await admin.from("competition_judge_assignments").select("competition_id").eq("id", assignmentId).single()
  if (!a) return { error: "Assignment not found" }
  const { error } = await admin.from("competition_judge_assignments").delete().eq("id", assignmentId)
  if (error) return { error: error.message }
  await logAudit("", "judge.unassigned", { assignment_id: assignmentId })
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${a.competition_id}/judges`)
  return { success: true }
}

// ────────────────────────────────────────────
// CRITERIA GROUPS
// ────────────────────────────────────────────

export async function getCriteriaGroups(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("criteria_groups").select("*, criteria:scoring_criteria(*)").eq("festival_id", festivalId).order("display_order")
  return { data: data as CriteriaGroup[] }
}

export async function createCriteriaGroup(festivalId: string, name: string, nameMl?: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("criteria_groups").insert({ festival_id: festivalId, name, name_ml: nameMl || null }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/criteria`)
  return { data: data as CriteriaGroup }
}

export async function deleteCriteriaGroup(groupId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("criteria_groups").delete().eq("id", groupId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// SCORING CRITERIA
// ────────────────────────────────────────────

export async function getCriteria(festivalId: string, groupId?: string) {
  const admin = createAdminClient()
  let query = admin.from("scoring_criteria").select("*, group:criteria_groups(name)").eq("festival_id", festivalId).eq("is_active", true).order("display_order")
  if (groupId) query = query.eq("group_id", groupId)
  const { data } = await query
  return { data: data as ScoringCriteria[] }
}

export async function createCriteria(festivalId: string, formData: { name: string; name_ml?: string; group_id?: string; max_score: number; min_score?: number; weight?: number; description?: string }) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("scoring_criteria").insert({
    festival_id: festivalId, name: formData.name, name_ml: formData.name_ml || null,
    group_id: formData.group_id || null, max_score: formData.max_score,
    min_score: formData.min_score || 0, weight: formData.weight || 1.0,
    description: formData.description || null,
  }).select().single()
  if (error) return { error: error.message }
  await logAudit("", "judge.criteria_created", { criteria_id: data.id })
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/criteria`)
  return { data: data as ScoringCriteria }
}

export async function updateCriteria(criteriaId: string, formData: Partial<{ name: string; max_score: number; min_score: number; weight: number; is_active: boolean }>) {
  const admin = createAdminClient()
  const { error } = await admin.from("scoring_criteria").update(formData).eq("id", criteriaId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCriteria(criteriaId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("scoring_criteria").delete().eq("id", criteriaId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// COMPETITION SCORING RULES
// ────────────────────────────────────────────

export async function getScoringRules(competitionId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_scoring_rules").select("*").eq("competition_id", competitionId).maybeSingle()
  return { data: data as CompetitionScoringRule | null }
}

export async function upsertScoringRules(competitionId: string, formData: Partial<CompetitionScoringRule>) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("competition_scoring_rules").select("id").eq("competition_id", competitionId).maybeSingle()
  if (existing) {
    const { error } = await admin.from("competition_scoring_rules").update(formData).eq("id", existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("competition_scoring_rules").insert({ competition_id: competitionId, ...formData })
    if (error) return { error: error.message }
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${competitionId}/*`)
  return { success: true }
}

// ────────────────────────────────────────────
// COMPETITION CRITERIA MAPPING
// ────────────────────────────────────────────

export async function getCompetitionCriteria(competitionId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_criteria").select("*, criteria:scoring_criteria(*)").eq("competition_id", competitionId).order("display_order")
  return { data: data as CompetitionCriteria[] }
}

export async function assignCriteriaToCompetition(competitionId: string, criteriaId: string, maxScore?: number, weight?: number) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("competition_criteria").select("id").eq("competition_id", competitionId).eq("criteria_id", criteriaId).maybeSingle()
  if (existing) return { error: "Criteria already assigned" }
  const { error } = await admin.from("competition_criteria").insert({ competition_id: competitionId, criteria_id: criteriaId, max_score: maxScore, weight })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${competitionId}/scoring`)
  return { success: true }
}

export async function removeCriteriaFromCompetition(mappingId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_criteria").delete().eq("id", mappingId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// SCORES & SCORE ITEMS
// ────────────────────────────────────────────

export async function getScores(competitionId: string, params: { participant_id?: string; judge_id?: string; round_id?: string; status?: string } = {}) {
  const admin = createAdminClient()
  let query = admin.from("scores").select("*, items:score_items(*, criteria:scoring_criteria(*)), participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url)").eq("competition_id", competitionId).order("created_at")
  if (params.participant_id) query = query.eq("participant_id", params.participant_id)
  if (params.judge_id) query = query.eq("judge_id", params.judge_id)
  if (params.round_id) query = query.eq("round_id", params.round_id)
  if (params.status) query = query.eq("status", params.status)
  const { data } = await query
  return { data: data as Score[] }
}

export async function getOrCreateScore(competitionId: string, participantId: string, judgeId: string, festivalId: string, roundId?: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("scores").select("*, items:score_items(*, criteria:scoring_criteria(*))").eq("competition_id", competitionId).eq("participant_id", participantId).eq("judge_id", judgeId).eq("round_id", roundId || null).maybeSingle()
  if (existing) return { data: existing as Score }
  const { data, error } = await admin.from("scores").insert({
    festival_id: festivalId, competition_id: competitionId, participant_id: participantId,
    judge_id: judgeId, round_id: roundId || null, status: "draft",
  }).select("*, items:score_items(*)").single()
  if (error) return { error: error.message }
  return { data: data as Score }
}

export async function saveScoreItem(scoreId: string, criteriaId: string, score: number, maxScore?: number, weight?: number, remarks?: string) {
  const admin = createAdminClient()
  const { data: existing } = await admin.from("score_items").select("id").eq("score_id", scoreId).eq("criteria_id", criteriaId).maybeSingle()
  if (existing) {
    const { error } = await admin.from("score_items").update({ score, max_score: maxScore, weight, remarks: remarks || null }).eq("id", existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("score_items").insert({ score_id: scoreId, criteria_id: criteriaId, score, max_score: maxScore, weight: weight || 1.0, remarks: remarks || null })
    if (error) return { error: error.message }
  }
  return { success: true }
}

export async function submitScore(scoreId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("scores").update({ status: "submitted", submitted_at: new Date().toISOString() }).eq("id", scoreId)
  if (error) return { error: error.message }
  await logAudit("", "judge.score_submitted", { score_id: scoreId })
  return { success: true }
}

export async function lockScore(scoreId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("scores").update({ status: "locked", is_locked: true, locked_at: new Date().toISOString(), locked_by: user.id }).eq("id", scoreId)
  if (error) return { error: error.message }
  await logAudit("", "judge.score_locked", { score_id: scoreId })
  return { success: true }
}
