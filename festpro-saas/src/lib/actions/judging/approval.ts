"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { ChiefApproval, ScoreLock, ResultProcessing } from "@/types/judging"

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
    resource_type: "approval", metadata,
  })
}

// ────────────────────────────────────────────
// CHIEF APPROVAL
// ────────────────────────────────────────────

export async function getPendingApprovals(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [] }

  const admin = createAdminClient()
  const { data } = await admin.from("chief_approvals")
    .select("*, score:scores(*, participant:participants(first_name, last_name, participant_id)), competition:competitions(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return { data: data as any[] }
}

export async function requestChiefApproval(competitionId: string, participantId: string, scoreId: string, chiefJudgeId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("chief_approvals").select("id")
    .eq("competition_id", competitionId).eq("participant_id", participantId).eq("score_id", scoreId).maybeSingle()
  if (existing) return { error: "Approval already requested" }

  const { error } = await admin.from("chief_approvals").insert({
    competition_id: competitionId, participant_id: participantId,
    score_id: scoreId, chief_judge_id: chiefJudgeId,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function approveScore(approvalId: string, remarks?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: approval } = await admin.from("chief_approvals").select("score_id, competition_id").eq("id", approvalId).single()
  if (!approval) return { error: "Approval not found" }

  await admin.from("chief_approvals").update({
    status: "approved", remarks: remarks || null, decided_at: new Date().toISOString(),
  }).eq("id", approvalId)

  await admin.from("scores").update({ status: "approved" }).eq("id", approval.score_id)
  await logAudit("", "judge.score_approved", { approval_id: approvalId, score_id: approval.score_id })
  revalidatePath(`/dashboard/organization/*/festivals/*/judging/approvals`)
  return { success: true }
}

export async function rejectScore(approvalId: string, correctionNotes?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: approval } = await admin.from("chief_approvals").select("score_id, competition_id").eq("id", approvalId).single()
  if (!approval) return { error: "Approval not found" }

  await admin.from("chief_approvals").update({
    status: "rejected", correction_notes: correctionNotes || null, decided_at: new Date().toISOString(),
  }).eq("id", approvalId)

  await admin.from("scores").update({ status: "rejected" }).eq("id", approval.score_id)
  await logAudit("", "judge.score_rejected", { approval_id: approvalId, score_id: approval.score_id })
  revalidatePath(`/dashboard/organization/*/festivals/*/judging/approvals`)
  return { success: true }
}

// ────────────────────────────────────────────
// LOCK MANAGEMENT
// ────────────────────────────────────────────

export async function getScoreLocks(competitionId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("score_lock").select("*, profile:profiles!score_lock_locked_by_fkey(first_name, last_name)").eq("competition_id", competitionId).eq("is_active", true)
  return { data: data as any[] }
}

export async function lockCompetition(competitionId: string, lockType = "competition_lock", reason?: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("score_lock").insert({
    competition_id: competitionId, locked_by: user.id,
    lock_type: lockType, reason: reason || null,
  })
  if (error) return { error: error.message }
  await admin.from("scores").update({ status: "locked", is_locked: true, locked_at: new Date().toISOString(), locked_by: user.id }).eq("competition_id", competitionId).neq("status", "locked")
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${competitionId}/*`)
  return { success: true }
}

export async function unlockCompetition(lockId: string) {
  const admin = createAdminClient()
  const { data: lock } = await admin.from("score_lock").select("competition_id").eq("id", lockId).single()
  if (!lock) return { error: "Lock not found" }
  await admin.from("score_lock").update({ is_active: false, unlocked_at: new Date().toISOString() }).eq("id", lockId)
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${lock.competition_id}/*`)
  return { success: true }
}

// ────────────────────────────────────────────
// RESULT PROCESSING ENGINE
// ────────────────────────────────────────────

export async function processResults(competitionId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()

  // Get all approved/locked scores for this competition
  const { data: scores } = await admin.from("scores")
    .select("participant_id, total_score, weighted_score, judge_id, competition_id")
    .eq("competition_id", competitionId)
    .in("status", ["locked", "approved"])

  if (!scores || scores.length === 0) return { error: "No approved scores found" }

  // Group by participant and calculate averages
  const participantMap: Record<string, { scores: number[]; weighted: number[] }> = {}
  for (const s of scores) {
    if (!participantMap[s.participant_id]) participantMap[s.participant_id] = { scores: [], weighted: [] }
    if (s.total_score !== null) participantMap[s.participant_id].scores.push(s.total_score)
    if (s.weighted_score !== null) participantMap[s.participant_id].weighted.push(s.weighted_score)
  }

  // Calculate final scores
  const results: { participant_id: string; final_score: number; weighted_score: number }[] = []
  for (const [pid, data] of Object.entries(participantMap)) {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
    const wAvg = data.weighted.reduce((a, b) => a + b, 0) / data.weighted.length
    results.push({ participant_id: pid, final_score: Math.round(avg * 100) / 100, weighted_score: Math.round(wAvg * 100) / 100 })
  }

  // Sort by score descending
  results.sort((a, b) => b.final_score - a.final_score)

  // Assign ranks (with tie handling)
  let currentRank = 1
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].final_score < results[i - 1].final_score) {
      currentRank = i + 1
    }
    const isTie = i > 0 && results[i].final_score === results[i - 1].final_score

    // Upsert result
    const { data: existing } = await admin.from("result_processing").select("id")
      .eq("competition_id", competitionId).eq("participant_id", results[i].participant_id).maybeSingle()

    const resultData = {
      competition_id: competitionId,
      participant_id: results[i].participant_id,
      final_score: results[i].final_score,
      weighted_score: results[i].weighted_score,
      rank: currentRank,
      is_tie_broken: isTie,
      is_winner: currentRank === 1,
      is_passed: true,
      processed_at: new Date().toISOString(),
    }

    if (existing) {
      await admin.from("result_processing").update(resultData).eq("id", existing.id)
    } else {
      await admin.from("result_processing").insert(resultData)
    }
  }

  await logAudit("", "judge.results_processed", { competition_id: competitionId, count: results.length })
  revalidatePath(`/dashboard/organization/*/festivals/*/competitions/${competitionId}/results`)
  return { processed: results.length }
}

export async function getResults(competitionId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("result_processing")
    .select("*, participant:participants(first_name, last_name, participant_id, chest_number, photo_url)")
    .eq("competition_id", competitionId)
    .order("rank", { ascending: true, nullsFirst: false })
  return { data: data as ResultProcessing[] }
}

// ────────────────────────────────────────────
// JUDGING DASHBOARD
// ────────────────────────────────────────────

export async function getJudgingDashboard(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const orgId = check.festival.organization_id

  const [{ count: totalJudges }, { count: activeJudges }, { count: totalScores }, { count: lockedScores }, { count: pendingApprovals }, { count: completedComps }] = await Promise.all([
    admin.from("judge_profiles").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
    admin.from("judge_profiles").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
    admin.from("scores").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("scores").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_locked", true),
    admin.from("chief_approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("competitions").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "completed"),
  ])

  return {
    data: {
      total_judges: totalJudges || 0, active_judges: activeJudges || 0,
      total_scores: totalScores || 0, locked_scores: lockedScores || 0,
      pending_approvals: pendingApprovals || 0, completed_competitions: completedComps || 0,
    },
  }
}
