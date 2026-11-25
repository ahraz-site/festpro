"use server"

import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ADMIN_EMAILS } from "@/config/admin"

async function verifySuperAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { allowed: false, error: "Not authenticated" } as const
  }

  const email = (user.email || "").toLowerCase().trim()
  if (ADMIN_EMAILS.includes(email)) {
    return { allowed: true, user } as const
  }

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "platform_owner" || profile?.role === "platform_admin") {
    return { allowed: true, user } as const
  }

  return { allowed: false, error: "Unauthorized: Super Admin access required" } as const
}

export async function getAdminDashboardOverview() {
  const auth = await verifySuperAdmin()
  if (!auth.allowed) {
    return { error: auth.error }
  }

  const admin = createAdminClient()

  try {
    // 1. Fetch all festivals with organization details
    const { data: festivalsData, error: festError } = await admin
      .from("festivals")
      .select(`
        id,
        organization_id,
        name,
        short_name,
        code,
        description,
        logo_url,
        status,
        start_date,
        end_date,
        created_at,
        created_by,
        organization:organizations(id, name, slug)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    // 2. Fetch count stats for each festival
    const festivalIds = (festivalsData || []).map((f) => f.id)
    
    let participantsMap = new Map<string, number>()
    let competitionsMap = new Map<string, number>()
    let teamsMap = new Map<string, number>()

    if (festivalIds.length > 0) {
      const [parts, comps, teams] = await Promise.all([
        admin.from("participants").select("festival_id"),
        admin.from("competitions").select("festival_id"),
        admin.from("teams").select("festival_id"),
      ])

      ;(parts.data || []).forEach((p: any) => {
        participantsMap.set(p.festival_id, (participantsMap.get(p.festival_id) || 0) + 1)
      })
      ;(comps.data || []).forEach((c: any) => {
        competitionsMap.set(c.festival_id, (competitionsMap.get(c.festival_id) || 0) + 1)
      })
      ;(teams.data || []).forEach((t: any) => {
        teamsMap.set(t.festival_id, (teamsMap.get(t.festival_id) || 0) + 1)
      })
    }

    const festivals = (festivalsData || []).map((f: any) => ({
      ...f,
      organizationName: f.organization?.name || "Independent",
      organizationSlug: f.organization?.slug || "",
      participantsCount: participantsMap.get(f.id) || 0,
      competitionsCount: competitionsMap.get(f.id) || 0,
      teamsCount: teamsMap.get(f.id) || 0,
      subdomain: f.code || f.short_name || f.id.slice(0, 8),
    }))

    // 3. Fetch all user profiles with organization
    const { data: profilesData } = await admin
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        phone,
        organization_id,
        created_at,
        organization:organizations(id, name, slug)
      `)
      .order("created_at", { ascending: false })

    // Also fetch auth users from supabase auth admin if available
    let authUsersMap = new Map<string, any>()
    try {
      const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (authUsers?.users) {
        authUsers.users.forEach((u) => {
          authUsersMap.set(u.id, u)
        })
      }
    } catch (e) {
      console.warn("Could not list auth.users directly:", e)
    }

    const accounts = (profilesData || []).map((p: any) => {
      const authUser = authUsersMap.get(p.id)
      const email = p.email || authUser?.email || ""
      const isMaster = ADMIN_EMAILS.includes(email.toLowerCase().trim())
      return {
        id: p.id,
        email: email,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || email.split("@")[0] || "User",
        role: isMaster ? "platform_owner" : p.role || "organization_owner",
        organizationName: p.organization?.name || "—",
        organizationId: p.organization_id,
        createdAt: p.created_at || authUser?.created_at || new Date().toISOString(),
        lastSignIn: authUser?.last_sign_in_at || null,
        isMasterAdmin: isMaster,
        emailConfirmed: authUser?.email_confirmed_at != null,
      }
    })

    // Also check for any auth users without profiles
    authUsersMap.forEach((u, uid) => {
      if (!accounts.some((a) => a.id === uid)) {
        const email = u.email || ""
        const isMaster = ADMIN_EMAILS.includes(email.toLowerCase().trim())
        accounts.push({
          id: uid,
          email: email,
          name: email.split("@")[0] || "User",
          role: isMaster ? "platform_owner" : "user",
          organizationName: "—",
          organizationId: null,
          createdAt: u.created_at,
          lastSignIn: u.last_sign_in_at || null,
          isMasterAdmin: isMaster,
          emailConfirmed: u.email_confirmed_at != null,
        })
      }
    })

    // 4. Fetch all Organizations
    const { data: orgsData } = await admin
      .from("organizations")
      .select("id, name, slug, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    // 5. Fetch Licenses
    let licenses: any[] = []
    try {
      const { data: dbLicenses } = await admin
        .from("saas_licenses")
        .select("*")
        .order("created_at", { ascending: false })
      licenses = dbLicenses || []
    } catch (e) {
      console.warn("Direct saas_licenses query:", e)
    }

    if (licenses.length === 0) {
      try {
        const local = (await import("@/config/local-licenses.json")).default
        licenses = local as any[]
      } catch (e) {}
    }

    return {
      success: true,
      data: {
        stats: {
          totalFestivals: festivals.length,
          totalAccounts: accounts.length,
          totalOrganizations: (orgsData || []).length,
          totalLicenses: licenses.length,
        },
        festivals,
        accounts,
        organizations: orgsData || [],
        licenses,
      },
    }
  } catch (error: any) {
    console.error("getAdminDashboardOverview error:", error)
    return { error: error.message || "Failed to load admin overview" }
  }
}

/**
 * Super Admin: Change or set a password for any user directly
 */
export async function adminSetUserPasswordAction(userId: string, newPassword: string) {
  const auth = await verifySuperAdmin()
  if (!auth.allowed) return { error: auth.error }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  const admin = createAdminClient()
  try {
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, message: `Password updated successfully for user ${data.user.email}` }
  } catch (err: any) {
    return { error: err.message || "Failed to update password" }
  }
}

/**
 * Super Admin: Send password reset email
 */
export async function adminSendResetEmailAction(email: string) {
  const auth = await verifySuperAdmin()
  if (!auth.allowed) return { error: auth.error }

  const admin = createAdminClient()
  try {
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://fespro.ahraz.site"}/auth/callback?redirect_to=/profile`,
    })

    if (error) return { error: error.message }
    return { success: true, message: `Password reset link sent to ${email}` }
  } catch (err: any) {
    return { error: err.message || "Failed to send reset link" }
  }
}

/**
 * Super Admin: Delete a single user account
 */
export async function adminDeleteUserAccountAction(userId: string) {
  const auth = await verifySuperAdmin()
  if (!auth.allowed) return { error: auth.error }

  const admin = createAdminClient()

  // Protect master admins
  const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle()
  const email = (profile?.email || "").toLowerCase().trim()
  if (email === "ahraza272@gmail.com" || email === "ahraz.site@gmail.com") {
    return { error: "Cannot delete master super admin account!" }
  }

  try {
    await admin.from("organization_members").delete().eq("user_id", userId)
    await admin.from("profiles").delete().eq("id", userId)
    await admin.auth.admin.deleteUser(userId)

    revalidatePath("/dashboard/admin")
    return { success: true, message: "User account deleted successfully" }
  } catch (err: any) {
    return { error: err.message || "Failed to delete user" }
  }
}

/**
 * Super Admin: Delete a festival and all related records
 */
export async function adminDeleteFestivalAction(festivalId: string) {
  const auth = await verifySuperAdmin()
  if (!auth.allowed) return { error: auth.error }

  const admin = createAdminClient()
  try {
    // Delete in sequence to avoid foreign key constraints
    await admin.from("result_items").delete().eq("festival_id", festivalId)
    await admin.from("results").delete().eq("festival_id", festivalId)
    await admin.from("team_points").delete().eq("festival_id", festivalId)
    await admin.from("stage_schedules").delete().eq("festival_id", festivalId)
    await admin.from("participants").delete().eq("festival_id", festivalId)
    await admin.from("competitions").delete().eq("festival_id", festivalId)
    await admin.from("festival_stages").delete().eq("festival_id", festivalId)
    await admin.from("teams").delete().eq("festival_id", festivalId)
    await admin.from("festival_settings").delete().eq("festival_id", festivalId)
    await admin.from("festival_statistics").delete().eq("festival_id", festivalId)
    await admin.from("festivals").delete().eq("id", festivalId)

    revalidatePath("/dashboard/admin")
    return { success: true, message: "Festival removed completely" }
  } catch (err: any) {
    return { error: err.message || "Failed to delete festival" }
  }
}

/**
 * Super Admin: Purge all accounts except ahraza272@gmail.com and ahraz.site@gmail.com
 * As requested by the user:
 * "nilavil ulla all accounts remove akko ahraza272@gmail.com allathath ellam"
 */
export async function adminPurgeNonAdminAccountsAction() {
  const auth = await verifySuperAdmin()
  if (!auth.allowed) return { error: auth.error }

  const admin = createAdminClient()
  const preservedEmails = ["ahraza272@gmail.com", "ahraz.site@gmail.com"]

  try {
    let deletedCount = 0

    // 1. Get all profiles
    const { data: profiles } = await admin.from("profiles").select("id, email")

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        const email = (p.email || "").toLowerCase().trim()
        if (!preservedEmails.includes(email)) {
          await admin.from("organization_members").delete().eq("user_id", p.id)
          await admin.from("profiles").delete().eq("id", p.id)
          try {
            await admin.auth.admin.deleteUser(p.id)
          } catch (e) {
            console.warn(`Could not delete auth user ${p.id}:`, e)
          }
          deletedCount++
        }
      }
    }

    // 2. Also check auth.users directly in case some users don't have profiles
    try {
      const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          const email = (u.email || "").toLowerCase().trim()
          if (!preservedEmails.includes(email)) {
            await admin.from("organization_members").delete().eq("user_id", u.id)
            await admin.from("profiles").delete().eq("id", u.id)
            await admin.auth.admin.deleteUser(u.id)
            deletedCount++
          }
        }
      }
    } catch (e) {
      console.warn("auth.admin.listUsers error during purge:", e)
    }

    revalidatePath("/dashboard/admin")
    return {
      success: true,
      message: `Successfully removed ${deletedCount} non-admin accounts. Preserved: ${preservedEmails.join(", ")}`,
    }
  } catch (err: any) {
    return { error: err.message || "Failed to purge non-admin accounts" }
  }
}
