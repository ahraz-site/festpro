"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { ResultItem, ResultPublication, Module8DashboardData, ResultPublishStatus } from "@/types/result"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id, id").eq("id", festivalId).single()
  if (!fest) return { allowed: false, error: "Festival not found" } as const
  const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
  if (!member) return { allowed: false, error: "Not a member" } as const
  return { allowed: true, user, festival: fest as { organization_id: string; id: string }, member: member as { role: UserRole } } as const
}

// ────────────────────────────────────────────
// DASHBOARD
// ────────────────────────────────────────────

export async function getModule8Dashboard(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const [
    { count: tr }, { count: pr }, { count: dr }, { count: lr },
    { count: tp }, { count: tpk }, { count: cc },
    { count: pa }, { count: ta },
    { count: tc }, { count: cg }, { count: cp }, { count: tv },
  ] = await Promise.all([
    admin.from("result_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("result_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "published"),
    admin.from("result_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "draft"),
    admin.from("result_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "live"),
    admin.from("team_points").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("team_points").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).not("rank", "is", null),
    admin.from("overall_championship").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("appeals").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "submitted"),
    admin.from("appeals").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("certificates").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("certificates").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "generated"),
    admin.from("certificates").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "published"),
    admin.from("certificate_verifications").select("*", { count: "exact", head: true }),
  ])
  return {
    data: {
      total_results: tr || 0, published_results: pr || 0, draft_results: dr || 0, live_results: lr || 0,
      total_team_points: tp || 0, team_rankings_count: tpk || 0, championship_count: cc || 0,
      pending_appeals: pa || 0, total_appeals: ta || 0,
      total_certificates: tc || 0, certificates_generated: cg || 0, certificates_published: cp || 0,
      total_verifications: tv || 0,
    } as Module8DashboardData,
  }
}

// ────────────────────────────────────────────
// RESULT PROCESSING ENGINE
// ────────────────────────────────────────────

export async function processResults(competitionId: string, festivalId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()

  const { data: comp } = await admin.from("competitions").select("organization_id, name").eq("id", competitionId).single()
  if (!comp) return { error: "Competition not found" }

  const { data: scores } = await admin.from("scores")
    .select("participant_id, total_score, weighted_score, average_score")
    .eq("competition_id", competitionId)
    .in("status", ["locked", "approved"])

  if (!scores || scores.length === 0) return { error: "No approved/locked scores found" }

  const { data: grades } = await admin.from("result_grades").select("*").eq("festival_id", festivalId).order("display_order")

  const { data: rules } = await admin.from("competition_scoring_rules").select("scoring_method").eq("competition_id", competitionId).maybeSingle()
  const method = (rules as any)?.scoring_method || "average"

  // Group scores by participant
  const map: Record<string, { total: number[]; weighted: number[]; average: number[] }> = {}
  for (const s of scores) {
    if (!map[s.participant_id]) map[s.participant_id] = { total: [], weighted: [], average: [] }
    if (s.total_score !== null) map[s.participant_id].total.push(s.total_score)
    if (s.weighted_score !== null) map[s.participant_id].weighted.push(s.weighted_score)
    if (s.average_score !== null) map[s.participant_id].average.push(s.average_score)
  }

  const results: { pid: string; total: number; weighted: number; average: number; final: number }[] = []
  for (const [pid, d] of Object.entries(map)) {
    const avgTotal = d.total.reduce((a, b) => a + b, 0) / (d.total.length || 1)
    const avgWeighted = d.weighted.reduce((a, b) => a + b, 0) / (d.weighted.length || 1)
    const avgAverage = d.average.reduce((a, b) => a + b, 0) / (d.average.length || 1)
    const final = method === "total" ? d.total.reduce((a, b) => a + b, 0) :
                  method === "weighted" ? avgWeighted :
                  method === "best_of" ? Math.max(...(d.weighted.length ? d.weighted : d.total)) :
                  avgAverage
    results.push({ pid, total: Math.round(avgTotal * 100) / 100, weighted: Math.round(avgWeighted * 100) / 100, average: Math.round(avgAverage * 100) / 100, final: Math.round(final * 100) / 100 })
  }

  results.sort((a, b) => b.final - a.final)

  let rank = 1
  const inserted: ResultItem[] = []
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].final < results[i - 1].final) rank = i + 1
    const isTie = i > 0 && results[i].final === results[i - 1].final

    const finalScore = results[i].final
    const pct = finalScore
    const matchedGrade = grades?.find(g => pct >= g.min_percentage && pct <= g.max_percentage)

    const { data: existing } = await admin.from("result_items").select("id")
      .eq("competition_id", competitionId).eq("participant_id", results[i].pid).maybeSingle()

    const payload = {
      competition_id: competitionId, participant_id: results[i].pid,
      festival_id: festivalId, organization_id: comp.organization_id,
      total_score: results[i].total, average_score: results[i].average,
      weighted_score: results[i].weighted, final_score: finalScore,
      rank, is_tie: isTie, grade: matchedGrade?.grade || null,
      grade_label: matchedGrade?.label || null, is_passed: matchedGrade?.is_pass ?? true,
      is_winner: rank === 1, is_medalist: rank <= 3,
      status: "draft" as ResultPublishStatus, processed_at: new Date().toISOString(),
    }

    if (existing) {
      await admin.from("result_items").update(payload).eq("id", existing.id)
    } else {
      const { data: ins } = await admin.from("result_items").insert(payload).select().single()
      if (ins) inserted.push(ins as any)
    }
  }

  // Audit
  await admin.from("result_audit_logs").insert({
    festival_id: festivalId, organization_id: comp.organization_id,
    action: "results_processed", entity_type: "result_items",
    performed_by: user.id,
    metadata: { competition_id: competitionId, count: results.length, method },
  })

  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results`)
  return { processed: results.length }
}

export async function getResultItems(competitionId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("result_items")
    .select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url, unit, division)")
    .eq("competition_id", competitionId).order("rank", { ascending: true, nullsFirst: false })
  return { data: data as ResultItem[] }
}

export async function getResultItemsByFestival(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let q = admin.from("result_items")
    .select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, photo_url, unit, division), competition:competitions(id, name, code)")
    .eq("festival_id", festivalId).order("rank", { ascending: true, nullsFirst: false }).limit(100)
  if (status) q = q.eq("status", status)
  const { data } = await q
  return { data: data as ResultItem[] }
}

export async function overrideResultRank(resultItemId: string, newRank: number, reason: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  if (newRank < 1) return { error: "Rank must be 1 or higher" }
  const admin = createAdminClient()
  const { error } = await admin.from("result_items").update({
    rank: newRank, rank_overridden: true, rank_overridden_by: user.id,
    rank_override_reason: reason, is_winner: newRank === 1, is_medalist: newRank <= 3,
  }).eq("id", resultItemId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results`)
  return { success: true }
}

export async function publishResults(competitionId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const { error } = await admin.from("result_items").update({ status: "published", published_at: now })
    .eq("competition_id", competitionId).neq("status", "published")
  if (error) return { error: error.message }
  await admin.from("result_audit_logs").insert({
    festival_id: "", organization_id: "", action: "results_published",
    entity_type: "result_items", performed_by: user.id,
    metadata: { competition_id: competitionId },
  })
  revalidatePath(`/dashboard/organization/*/festivals/*/results`)
  return { success: true }
}

export async function setResultsLive(competitionId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("result_items").update({ status: "live" })
    .eq("competition_id", competitionId).eq("status", "published")
  if (error) return { error: error.message }
  return { success: true }
}

export async function archiveResults(competitionId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("result_items").update({ status: "archived" })
    .eq("competition_id", competitionId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results`)
  return { success: true }
}

// ────────────────────────────────────────────
// PUBLICATIONS
// ────────────────────────────────────────────

export async function createPublication(festivalId: string, data: { competition_id?: string; stage_id?: string; category_id?: string; publish_scope: string; title?: string; description?: string }) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!fest) return { error: "Festival not found" }
  const { error } = await admin.from("result_publications").insert({
    festival_id: festivalId, organization_id: fest.organization_id,
    competition_id: data.competition_id || null, stage_id: data.stage_id || null,
    category_id: data.category_id || null, publish_scope: data.publish_scope,
    title: data.title || data.publish_scope, description: data.description || null,
    published_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results`)
  return { success: true }
}

export async function getPublications(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("result_publications")
    .select("*, competition:competitions(name)").eq("festival_id", festivalId).order("published_at", { ascending: false })
  return { data: data as any[] }
}

// ────────────────────────────────────────────
// GRADES
// ────────────────────────────────────────────

export async function getGrades(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("result_grades")
    .select("*").eq("festival_id", festivalId).order("display_order", { ascending: true })
  return { data: data as any[] }
}

export async function upsertGrade(festivalId: string, data: {
  id?: string; grade: string; min_percentage: number; max_percentage: number
  label: string; is_pass: boolean; color: string; display_order: number
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = data.id
    ? await admin.from("result_grades").update(data).eq("id", data.id)
    : await admin.from("result_grades").insert({ ...data, festival_id: festivalId })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/grades`)
  return { success: true }
}

export async function deleteGrade(id: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("result_grades").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/grades`)
  return { success: true }
}

// ────────────────────────────────────────────
// RANKINGS
// ────────────────────────────────────────────

export async function getRankings(festivalId: string, entityType?: string) {
  const admin = createAdminClient()
  let q = admin.from("team_points")
    .select("*").eq("festival_id", festivalId).not("rank", "is", null).order("rank", { ascending: true }).limit(200)
  if (entityType) q = q.eq("entity_type", entityType)
  const { data } = await q
  return { data: data as any[] }
}

export async function calculateTeamRankings(competitionId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()

  const { data: items } = await admin.from("result_items")
    .select("id, participant_id, rank, medal_type, competition_id, festival_id, organization_id")
    .eq("competition_id", competitionId).in("status", ["published", "live"])

  if (!items || items.length === 0) return { error: "No published results" }

  const fest = items[0]
  const { data: rules } = await admin.from("team_point_rules")
    .select("*").eq("festival_id", fest.festival_id).eq("is_active", true)

  if (!rules || rules.length === 0) return { error: "No active point rules" }

  const { data: participants } = await admin.from("participants")
    .select("id, team_id, institution_id, group_id").in("id", [...new Set(items.map(i => i.participant_id))])

  const entityMap: Record<string, { name: string; type: string; points: number; gold: number; silver: number; bronze: number; count: number }> = {}

  for (const item of items) {
    const p = participants?.find(pp => pp.id === item.participant_id)
    if (!p) continue
    const entityId = p.team_id || p.institution_id || p.group_id || item.participant_id
    const entityType = p.team_id ? "team" : p.institution_id ? "institution" : p.group_id ? "group" : "individual"
    if (!entityMap[entityId]) entityMap[entityId] = { name: entityId, type: entityType, points: 0, gold: 0, silver: 0, bronze: 0, count: 0 }

    const matchedRule = rules.find(r => r.entity_type === entityType && item.rank !== null && r.rank_from !== null && r.rank_to !== null && item.rank >= r.rank_from && item.rank <= r.rank_to)
    if (matchedRule) entityMap[entityId].points += matchedRule.points

    if (item.medal_type === "gold") entityMap[entityId].gold++
    else if (item.medal_type === "silver") entityMap[entityId].silver++
    else if (item.medal_type === "bronze") entityMap[entityId].bronze++
    entityMap[entityId].count++
  }

  const sorted = Object.entries(entityMap).sort((a, b) => b[1].points - a[1].points || b[1].gold - a[1].gold)
  let changed = 0

  for (let i = 0; i < sorted.length; i++) {
    const [eId, eData] = sorted[i]
    const { data: existing } = await admin.from("team_points")
      .select("id").eq("festival_id", fest.festival_id).eq("entity_id", eId).maybeSingle()
    const payload = {
      festival_id: fest.festival_id, organization_id: fest.organization_id,
      entity_type: eData.type, entity_id: eId, entity_name: eData.name,
      total_points: eData.points, rank: i + 1,
      medals_gold: eData.gold, medals_silver: eData.silver, medals_bronze: eData.bronze,
      participation_count: eData.count, competition_count: 1,
      status: "published" as const, calculated_at: new Date().toISOString(),
    }
    if (existing) {
      await admin.from("team_points").update(payload).eq("id", existing.id)
    } else {
      await admin.from("team_points").insert(payload)
    }
    changed++
  }

  revalidatePath(`/dashboard/organization/*/festivals/*/results/rankings`)
  return { processed: changed }
}

// ────────────────────────────────────────────
// PUBLISH QUEUE
// ────────────────────────────────────────────

export async function getPublishQueue(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("result_publications")
    .select("*, competition:competitions(name)")
    .eq("festival_id", festivalId).order("created_at", { ascending: false })
  return { data: data as any[] }
}

export async function schedulePublish(competitionId: string, festivalId: string, scheduledAt: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!fest) return { error: "Festival not found" }
  const { error } = await admin.from("result_publications").insert({
    festival_id: festivalId, organization_id: fest.organization_id,
    competition_id: competitionId, publish_scope: "competition",
    title: "Scheduled publish", published_by: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/publish`)
  return { success: true }
}

export async function cancelScheduledPublish(id: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { error } = await admin.from("result_publications").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/results/publish`)
  return { success: true }
}
