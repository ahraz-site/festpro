"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types"
import type { Team, TeamFormData } from "@/types/participant"

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
    resource_type: "team", metadata,
  })
}

export async function createTeam(festivalId: string, formData: TeamFormData) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data, error } = await admin.from("teams").insert({
    festival_id: festivalId,
    competition_id: formData.competition_id,
    name: formData.name,
    code: formData.code || null,
    team_leader_id: formData.team_leader_id || null,
    max_members: parseInt(formData.max_members) || 10,
    min_members: parseInt(formData.min_members) || 2,
    created_by: check.user.id,
  }).select("id").single()

  if (error) return { error: error.message }
  await logActivity(check.festival.organization_id, "team.created", { team_id: data.id, name: formData.name })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/teams`)
  return { data }
}

export async function updateTeam(teamId: string, formData: Partial<TeamFormData>) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("teams").select("festival_id").eq("id", teamId).single()
  if (!existing) return { error: "Team not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("teams").update({
    name: formData.name,
    code: formData.code,
    max_members: formData.max_members ? parseInt(formData.max_members) : undefined,
    min_members: formData.min_members ? parseInt(formData.min_members) : undefined,
  }).eq("id", teamId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${existing.festival_id}/teams`)
  return { success: true }
}

export async function deleteTeam(teamId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: existing } = await admin.from("teams").select("festival_id").eq("id", teamId).single()
  if (!existing) return { error: "Team not found" }

  const check = await checkOrgAccess(existing.festival_id)
  if (!check.allowed) return { error: check.error }

  const { error } = await admin.from("teams").update({ is_active: false }).eq("id", teamId)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${existing.festival_id}/teams`)
  return { success: true }
}

export async function addTeamMember(teamId: string, participantId: string, role: "leader" | "member" | "substitute" = "member") {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: team } = await admin.from("teams").select("id, festival_id, max_members, competition_id").eq("id", teamId).single()
  if (!team) return { error: "Team not found" }

  const check = await checkOrgAccess(team.festival_id)
  if (!check.allowed) return { error: check.error }

  // Check max members
  const { count } = await admin.from("team_members").select("*", { count: "exact", head: true }).eq("team_id", teamId)
  if (count && count >= team.max_members) return { error: `Team already has maximum ${team.max_members} members` }

  // Check duplicate
  const { data: existing } = await admin.from("team_members").select("id").eq("team_id", teamId).eq("participant_id", participantId).maybeSingle()
  if (existing) return { error: "Participant is already a member of this team" }

  // If role is leader, remove previous leader
  if (role === "leader") {
    await admin.from("team_members").update({ role: "member" }).eq("team_id", teamId).eq("role", "leader")
    await admin.from("participants").update({ is_team_leader: false }).eq("festival_id", team.festival_id).eq("is_team_leader", true)
  }

  const { error } = await admin.from("team_members").insert({ team_id: teamId, participant_id: participantId, role })
  if (error) return { error: error.message }

  if (role === "leader") {
    await admin.from("teams").update({ team_leader_id: participantId }).eq("id", teamId)
    await admin.from("participants").update({ is_team_leader: true }).eq("id", participantId)
  }

  await logActivity(check.festival.organization_id, "team.member_added", { team_id: teamId, participant_id: participantId })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${team.festival_id}/teams`)
  return { success: true }
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data: team } = await admin.from("teams").select("festival_id").eq("id", teamId).single()
  if (!team) return { error: "Team not found" }

  const check = await checkOrgAccess(team.festival_id)
  if (!check.allowed) return { error: check.error }

  const { data: member } = await admin.from("team_members").select("participant_id, role").eq("id", memberId).single()
  if (!member) return { error: "Member not found" }

  const { error } = await admin.from("team_members").delete().eq("id", memberId)
  if (error) return { error: error.message }

  if (member.role === "leader") {
    await admin.from("teams").update({ team_leader_id: null }).eq("id", teamId)
    await admin.from("participants").update({ is_team_leader: false }).eq("id", member.participant_id)
  }

  await logActivity(check.festival.organization_id, "team.member_removed", { team_id: teamId, participant_id: member.participant_id })
  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${team.festival_id}/teams`)
  return { success: true }
}

export async function getTeams(festivalId: string, params: { competition_id?: string; page?: number; limit?: number } = {}) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { data: [], count: 0 }

  const admin = createAdminClient()
  let query = admin.from("teams").select("*, members:team_members(*, participant:participants(id, first_name, last_name, participant_id, photo_url)), team_leader:participants!teams_team_leader_id_fkey(id, first_name, last_name), competition:competitions(id, name, code)", { count: "exact" })
    .eq("festival_id", festivalId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (params.competition_id) query = query.eq("competition_id", params.competition_id)

  const page = params.page || 1
  const limit = params.limit || 20
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error: error.message }
  return { data: data as unknown as Team[], count: count || 0 }
}

export async function getTeamById(teamId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("teams").select("*, members:team_members(*, participant:participants(id, first_name, last_name, participant_id, photo_url, chest_number, unit, division)), team_leader:participants!teams_team_leader_id_fkey(*), competition:competitions(id, name, code)").eq("id", teamId).single()
  if (error) return { error: error.message }
  return { data: data as unknown as Team }
}
