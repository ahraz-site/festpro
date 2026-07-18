"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { TeamPoint, TeamPointRule, OverallChampionship } from "@/types/result"

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
// POINT RULES
// ────────────────────────────────────────────

export async function getPointRules(festivalId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("team_point_rules").select("*").eq("festival_id", festivalId).order("entity_type").order("rank_from")
  return { data: data as TeamPointRule[] }
}

export async function upsertPointRule(festivalId: string, data: {
  id?: string; rule_name: string; entity_type: string; point_type: string;
  rank_from?: number; rank_to?: number; points: number; description?: string
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const payload = { festival_id: festivalId, ...data, rank_from: data.rank_from ?? null, rank_to: data.rank_to ?? null, description: data.description || null }
  if (data.id) {
    const { error } = await admin.from("team_point_rules").update(payload).eq("id", data.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("team_point_rules").insert(payload)
    if (error) return { error: error.message }
  }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/team-points`)
  return { success: true }
}

export async function deletePointRule(ruleId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("team_point_rules").delete().eq("id", ruleId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// TEAM POINTS CALCULATION
// ────────────────────────────────────────────

export async function calculateTeamPoints(festivalId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const { data: rules } = await admin.from("team_point_rules").select("*").eq("festival_id", festivalId).eq("is_active", true)
  if (!rules || rules.length === 0) return { error: "No point rules defined. Create rules first." }

  const { data: results } = await admin.from("result_items")
    .select("participant_id, rank, is_passed, participant:participants(unit, division, sector, organization_id)")
    .eq("festival_id", festivalId).eq("status", "published")

  if (!results || results.length === 0) return { error: "No published results found" }

  // Calculate points for each entity
  const entityMap: Record<string, { points: number; gold: number; silver: number; bronze: number; count: number }> = {}

  for (const r of results) {
    const p = r.participant as any
    if (!p) continue
    const entities = [
      { type: "unit", id: p.unit },
      { type: "sector", id: p.sector },
      { type: "division", id: p.division },
      { type: "organization", id: p.organization_id },
    ]

    for (const entity of entities) {
      if (!entity.id) continue
      const key = `${entity.type}:${entity.id}`
      if (!entityMap[key]) entityMap[key] = { points: 0, gold: 0, silver: 0, bronze: 0, count: 0 }
      entityMap[key].count++

      if (r.rank === 1) entityMap[key].gold++
      else if (r.rank === 2) entityMap[key].silver++
      else if (r.rank === 3) entityMap[key].bronze++

      for (const rule of rules) {
        if (rule.entity_type !== entity.type) continue
        if (rule.point_type === "rank" && r.rank) {
          if ((rule.rank_from === null || r.rank >= rule.rank_from) && (rule.rank_to === null || r.rank <= rule.rank_to)) {
            entityMap[key].points += rule.points
          }
        } else if (rule.point_type === "participation" && r.is_passed) {
          entityMap[key].points += rule.points
        }
      }
    }
  }

  // Sort and save
  const sorted = Object.entries(entityMap)
    .map(([key, data]) => {
      const [entity_type, entity_id] = key.split(":")
      return { entity_type, entity_id, ...data }
    })
    .sort((a, b) => b.points - a.points)

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i]
    const { data: existing } = await admin.from("team_points").select("id")
      .eq("festival_id", festivalId).eq("entity_type", r.entity_type).eq("entity_id", r.entity_id).maybeSingle()

    const payload = {
      festival_id: festivalId, organization_id: check.festival.organization_id,
      entity_type: r.entity_type, entity_id: r.entity_id, entity_name: r.entity_id.slice(0, 20),
      total_points: r.points, rank: i + 1, medals_gold: r.gold, medals_silver: r.silver,
      medals_bronze: r.bronze, participation_count: r.count,
      status: "draft", calculated_at: new Date().toISOString(),
    }
    if (existing) {
      await admin.from("team_points").update(payload).eq("id", existing.id)
    } else {
      await admin.from("team_points").insert(payload)
    }
  }

  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/team-points`)
  return { processed: sorted.length }
}

export async function getTeamPoints(festivalId: string, entityType?: string) {
  const admin = createAdminClient()
  let q = admin.from("team_points").select("*").eq("festival_id", festivalId).order("rank", { ascending: true, nullsFirst: false })
  if (entityType) q = q.eq("entity_type", entityType)
  const { data } = await q
  return { data: data as TeamPoint[] }
}

export async function publishTeamPoints(festivalId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("team_points").update({ status: "published" }).eq("festival_id", festivalId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/team-points`)
  return { success: true }
}

// ────────────────────────────────────────────
// OVERALL CHAMPIONSHIP
// ────────────────────────────────────────────

export async function calculateChampionship(festivalId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const { data: points } = await admin.from("team_points").select("*").eq("festival_id", festivalId)

  if (!points || points.length === 0) return { error: "Calculate team points first" }

  const types = ["overall", "unit", "sector", "division"]
  for (const type of types) {
    const filtered = type === "overall" ? points : points.filter(p => p.entity_type === type)
    const sorted = [...filtered].sort((a, b) => b.total_points - a.total_points)

    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i]
      const { data: existing } = await admin.from("overall_championship").select("id")
        .eq("festival_id", festivalId).eq("championship_type", type).eq("entity_id", s.entity_id).maybeSingle()

      const payload = {
        festival_id: festivalId, organization_id: check.festival.organization_id,
        championship_type: type, entity_id: s.entity_id, entity_name: s.entity_name,
        total_points: s.total_points, rank: i + 1,
        is_champion: i === 0, is_runner_up: i === 1,
        medals_gold: s.medals_gold, medals_silver: s.medals_silver, medals_bronze: s.medals_bronze,
        status: "draft", calculated_at: new Date().toISOString(),
      }
      if (existing) {
        await admin.from("overall_championship").update(payload).eq("id", existing.id)
      } else {
        await admin.from("overall_championship").insert(payload)
      }
    }
  }

  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/results/championship`)
  return { success: true }
}

export async function getChampionship(festivalId: string, type?: string) {
  const admin = createAdminClient()
  let q = admin.from("overall_championship").select("*").eq("festival_id", festivalId).order("rank", { ascending: true, nullsFirst: false })
  if (type) q = q.eq("championship_type", type)
  const { data } = await q
  return { data: data as OverallChampionship[] }
}

export async function publishChampionship(festivalId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("overall_championship").update({ status: "published" }).eq("festival_id", festivalId)
  if (error) return { error: error.message }
  return { success: true }
}
