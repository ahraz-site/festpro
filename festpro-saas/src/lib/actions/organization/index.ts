"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type { UserRole } from "@/types"
import type {
  ExtendedOrganization,
  OrganizationSettings,
  OrganizationMember,
  Invitation,
  ActivityLog,
  Permission,
} from "@/types/organization"
import { hasPermission } from "@/config/permissions"
import type { PermissionCode } from "@/config/permissions"

// ────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────

async function getCurrentUserRole(orgId?: string): Promise<{ userId: string; role: UserRole; profileRole: UserRole } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  if (!profile) return null

  let role: UserRole = profile.role as UserRole

  if (orgId) {
    const { data: member } = await admin
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("user_id", user.id)
      .single()
    if (member) {
      role = member.role as UserRole
    }
  }

  return { userId: user.id, role, profileRole: profile.role as UserRole }
}

export async function checkPermission(orgId: string, permission: PermissionCode): Promise<boolean> {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return false
  return hasPermission(ctx.role, permission)
}

// ────────────────────────────────────────────
// ORGANIZATION CRUD
// ────────────────────────────────────────────

export async function createOrganization(formData: {
  name: string
  code?: string
  address?: string
  country?: string
  state?: string
  district?: string
  website?: string
  org_email?: string
  org_phone?: string
  timezone?: string
  language?: string
  brand_color?: string
}) {
  const ctx = await getCurrentUserRole()
  if (!ctx) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const slug = formData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + crypto.randomBytes(3).toString("hex")

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: formData.name,
      slug,
      code: formData.code || null,
      address: formData.address || null,
      country: formData.country || null,
      state: formData.state || null,
      district: formData.district || null,
      website: formData.website || null,
      org_email: formData.org_email || null,
      org_phone: formData.org_phone || null,
      timezone: formData.timezone || "UTC",
      language: formData.language || "en",
      brand_color: formData.brand_color || "#4F46E5",
      created_by: ctx.userId,
    })
    .select()
    .single()

  if (orgError) return { error: orgError.message }

  const { error: memberError } = await admin.from("organization_members").insert({
    organization_id: org.id,
    user_id: ctx.userId,
    role: "organization_owner",
  })

  if (memberError) return { error: memberError.message }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ organization_id: org.id })
    .eq("id", ctx.userId)

  if (profileError) return { error: profileError.message }

  revalidatePath("/dashboard", "layout")
  return { success: true, orgId: org.id }
}

export async function getOrganization(orgId: string): Promise<ExtendedOrganization | null> {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return null

  const admin = createAdminClient()
  const { data } = await admin.from("organizations").select("*").eq("id", orgId).single()
  if (!data) return null

  const { count: memberCount } = await admin
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)

  const { count: activeCount } = await admin
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("is_suspended", false)

  return { ...data, member_count: memberCount ?? 0, active_member_count: activeCount ?? 0 }
}

export async function getOrganizations(): Promise<ExtendedOrganization[]> {
  const ctx = await getCurrentUserRole()
  if (!ctx) return []

  const admin = createAdminClient()

  // Platform roles see all orgs; others see only their own
  if (["platform_owner", "platform_admin"].includes(ctx.profileRole)) {
    const { data } = await admin.from("organizations").select("*").is("deleted_at", null).order("created_at", { ascending: false })
    return (data as ExtendedOrganization[]) || []
  }

  const { data: memberships } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", ctx.userId)

  if (!memberships?.length) return []

  const ids = memberships.map((m: { organization_id: string }) => m.organization_id)
  const { data } = await admin
    .from("organizations")
    .select("*")
    .in("id", ids)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  return (data as ExtendedOrganization[]) || []
}

export async function updateOrganization(orgId: string, formData: Partial<{
  name: string
  code: string
  address: string
  country: string
  state: string
  district: string
  website: string
  org_email: string
  org_phone: string
  timezone: string
  language: string
  brand_color: string
  theme: Record<string, any>
  subscription_plan: string
  max_users: number
  max_festivals: number
}>) {
  const hasPerm = await checkPermission(orgId, "organization.edit")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin.from("organizations").update(formData).eq("id", orgId)

  if (error) return { error: error.message }

  await logActivity(orgId, "organization.updated", "organization", orgId, { changes: Object.keys(formData) })

  revalidatePath(`/dashboard/organization/${orgId}`, "layout")
  return { success: true }
}

export async function deleteOrganization(orgId: string) {
  const hasPerm = await checkPermission(orgId, "organization.delete")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("organizations")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", orgId)

  if (error) return { error: error.message }

  await logActivity(orgId, "organization.deleted", "organization", orgId)

  revalidatePath("/dashboard", "layout")
  redirect("/dashboard")
}

// ────────────────────────────────────────────
// ORGANIZATION SETTINGS
// ────────────────────────────────────────────

export async function getOrganizationSettings(orgId: string): Promise<OrganizationSettings | null> {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from("organization_settings")
    .select("*")
    .eq("organization_id", orgId)
    .single()

  return data as OrganizationSettings | null
}

export async function updateOrganizationSettings(orgId: string, formData: Partial<OrganizationSettings>) {
  const hasPerm = await checkPermission(orgId, "settings.manage")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("organization_settings")
    .update(formData)
    .eq("organization_id", orgId)

  if (error) return { error: error.message }

  await logActivity(orgId, "settings.updated", "organization_settings", orgId)

  revalidatePath(`/dashboard/organization/${orgId}/settings`, "layout")
  return { success: true }
}

// ────────────────────────────────────────────
// MEMBERS
// ────────────────────────────────────────────

export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return []

  const admin = createAdminClient()
  const { data: members } = await admin
    .from("organization_members")
    .select(`
      *,
      profile:profiles!inner(email, first_name, last_name, avatar_url, phone)
    `)
    .eq("organization_id", orgId)
    .order("joined_at", { ascending: true })

  return (members || []) as unknown as OrganizationMember[]
}

export async function inviteMember(orgId: string, formData: { email: string; role: UserRole }) {
  const hasPerm = await checkPermission(orgId, "member.invite")
  if (!hasPerm) return { error: "Permission denied" }

  const ctx = await getCurrentUserRole()
  if (!ctx) return { error: "Not authenticated" }

  const admin = createAdminClient()

  // Check org user limit
  const { data: org } = await admin.from("organizations").select("max_users").eq("id", orgId).single()
  if (org) {
    const { count } = await admin
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
    if (count && org.max_users && count >= org.max_users) {
      return { error: "Organization has reached its maximum user limit" }
    }
  }

  // Check if user already has a pending invitation
  const { data: existing } = await admin
    .from("invitations")
    .select("id")
    .eq("organization_id", orgId)
    .eq("email", formData.email)
    .eq("status", "pending")

  if (existing && existing.length > 0) {
    return { error: "An invitation has already been sent to this email" }
  }

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

  const { error: inviteError } = await admin.from("invitations").insert({
    organization_id: orgId,
    email: formData.email,
    role: formData.role,
    token,
    expires_at: expiresAt,
    invited_by: ctx.userId,
  })

  if (inviteError) return { error: inviteError.message }

  revalidatePath(`/dashboard/organization/${orgId}/members`, "layout")
  return { success: true, token }
}

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to accept an invitation" }

  const admin = createAdminClient()

  const { data: invitation, error: inviteError } = await admin
    .from("invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (inviteError || !invitation) return { error: "Invalid or expired invitation" }

  if (new Date(invitation.expires_at) < new Date()) {
    await admin.from("invitations").update({ status: "expired" }).eq("id", invitation.id)
    return { error: "Invitation has expired" }
  }

  if (invitation.email !== user.email) {
    return { error: "This invitation was sent to a different email address" }
  }

  const { error: memberError } = await admin.from("organization_members").insert({
    organization_id: invitation.organization_id,
    user_id: user.id,
    role: invitation.role,
    invited_by: invitation.invited_by,
  })

  if (memberError) {
    if (memberError.message.includes("duplicate")) {
      return { error: "You are already a member of this organization" }
    }
    return { error: memberError.message }
  }

  await admin.from("invitations").update({
    status: "accepted",
    accepted_at: new Date().toISOString(),
    accepted_by: user.id,
  }).eq("id", invitation.id)

  await admin.from("profiles").update({ organization_id: invitation.organization_id }).eq("id", user.id)

  await logActivity(invitation.organization_id, "member.joined", "organization_members", invitation.id, {
    email: user.email,
  })

  revalidatePath("/dashboard", "layout")
  return { success: true, orgId: invitation.organization_id }
}

export async function removeMember(orgId: string, memberId: string) {
  const hasPerm = await checkPermission(orgId, "member.remove")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin.from("organization_members").delete().eq("id", memberId).eq("organization_id", orgId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/organization/${orgId}/members`, "layout")
  return { success: true }
}

export async function changeMemberRole(orgId: string, memberId: string, newRole: UserRole) {
  const hasPerm = await checkPermission(orgId, "member.edit")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("organization_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("organization_id", orgId)

  if (error) return { error: error.message }

  await logActivity(orgId, "member.role_changed", "organization_members", memberId, { new_role: newRole })

  revalidatePath(`/dashboard/organization/${orgId}/members`, "layout")
  return { success: true }
}

export async function suspendMember(orgId: string, memberId: string) {
  const hasPerm = await checkPermission(orgId, "member.edit")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("organization_members")
    .update({ is_suspended: true })
    .eq("id", memberId)
    .eq("organization_id", orgId)

  if (error) return { error: error.message }

  await logActivity(orgId, "member.suspended", "organization_members", memberId)

  revalidatePath(`/dashboard/organization/${orgId}/members`, "layout")
  return { success: true }
}

export async function reactivateMember(orgId: string, memberId: string) {
  const hasPerm = await checkPermission(orgId, "member.edit")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("organization_members")
    .update({ is_suspended: false })
    .eq("id", memberId)
    .eq("organization_id", orgId)

  if (error) return { error: error.message }

  await logActivity(orgId, "member.reactivated", "organization_members", memberId)

  revalidatePath(`/dashboard/organization/${orgId}/members`, "layout")
  return { success: true }
}

// ────────────────────────────────────────────
// INVITATIONS
// ────────────────────────────────────────────

export async function getInvitations(orgId: string): Promise<Invitation[]> {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from("invitations")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })

  return (data || []) as Invitation[]
}

export async function cancelInvitation(orgId: string, invitationId: string) {
  const hasPerm = await checkPermission(orgId, "member.remove")
  if (!hasPerm) return { error: "Permission denied" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("invitations")
    .update({ status: "cancelled" })
    .eq("id", invitationId)
    .eq("organization_id", orgId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/organization/${orgId}/members`, "layout")
  return { success: true }
}

// ────────────────────────────────────────────
// ACTIVITY LOG
// ────────────────────────────────────────────

export async function logActivity(
  orgId: string,
  action: ActivityLog["action"],
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()
  await admin.from("activity_logs").insert({
    organization_id: orgId,
    user_id: user.id,
    action,
    resource_type: resourceType || null,
    resource_id: resourceId || null,
    metadata: metadata || {},
  })
}

export async function getActivityLogs(orgId: string, limit = 50): Promise<ActivityLog[]> {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from("activity_logs")
    .select(`
      *,
      user:profiles!activity_logs_user_id_fkey(first_name, last_name, email)
    `)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return (data || []) as unknown as ActivityLog[]
}

// ────────────────────────────────────────────
// ORGANIZATION SWITCHING
// ────────────────────────────────────────────

export async function switchOrganization(orgId: string) {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return { error: "Not a member of this organization" }

  const admin = createAdminClient()
  const { error } = await admin
    .from("profiles")
    .update({ organization_id: orgId })
    .eq("id", ctx.userId)

  if (error) return { error: error.message }

  await logActivity(orgId, "login", "organization", orgId)

  revalidatePath("/dashboard", "layout")
  return { success: true }
}

// ────────────────────────────────────────────
// DASHBOARD DATA
// ────────────────────────────────────────────

export async function getOrganizationDashboardData(orgId: string) {
  const ctx = await getCurrentUserRole(orgId)
  if (!ctx) return null

  const [org, settings, members, recentActivity] = await Promise.all([
    getOrganization(orgId),
    getOrganizationSettings(orgId),
    getOrganizationMembers(orgId),
    getActivityLogs(orgId, 10),
  ])

  if (!org) return null

  return {
    organization: org,
    settings,
    members,
    recentActivity,
    memberCount: members.length,
    activeMemberCount: members.filter((m) => !m.is_suspended).length,
  }
}
