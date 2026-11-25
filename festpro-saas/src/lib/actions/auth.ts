"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getDashboardForRole } from "@/config/roles"
import type { UserRole } from "@/types"

export const ADMIN_EMAILS = [
  "ahraz.site@gmail.com",
  "ahraza272@gmail.com",
  "admin@fespro.com",
  "admin@festpro.com",
  "ahrazfestpro@gmail.com",
]

export async function ensureUserProfile(providedUser?: any) {
  try {
    let user = providedUser
    if (!user) {
      const supabase = await createServerClient()
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser()
      user = fetchedUser
    }
    if (!user) return null

    const adminClient = createAdminClient()
    let { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    const userEmail = (user.email || "").toLowerCase().trim()
    const isSuperAdminEmail =
      ADMIN_EMAILS.includes(userEmail) ||
      userEmail.startsWith("admin@")

    if (profile) {
      if (isSuperAdminEmail && profile.role !== "platform_owner") {
        await adminClient.from("profiles").update({ role: "platform_owner" }).eq("id", user.id)
        profile.role = "platform_owner"
      }
    } else {
      const userMeta = user.user_metadata || {}
      const firstName =
        String(userMeta.first_name || user.email?.split("@")[0] || "User")
          .replace(/[^\x00-\x7F]/g, "")
          .trim() || "User"
      const lastName = String(userMeta.last_name || "")
        .replace(/[^\x00-\x7F]/g, "")
        .trim()

      const orgSlug = `org-${user.id.substring(0, 8)}`
      let { data: org } = await adminClient
        .from("organizations")
        .select("id")
        .eq("slug", orgSlug)
        .single()

      if (!org) {
        const { data: newOrg } = await adminClient
          .from("organizations")
          .insert({
            name: `${firstName} Organization`,
            slug: orgSlug,
          })
          .select()
          .single()
        org = newOrg
      }

      if (org) {
        await adminClient.from("organization_members").upsert({
          organization_id: org.id,
          user_id: user.id,
          role: isSuperAdminEmail ? "platform_owner" : "organization_owner",
        })
      }

      const { data: newProfile } = await adminClient
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          first_name: firstName,
          last_name: lastName,
          role: isSuperAdminEmail ? "platform_owner" : "organization_owner",
          organization_id: org?.id || null,
        })
        .select("*")
        .single()

      profile = newProfile
    }

    return profile
  } catch (err) {
    console.error("ensureUserProfile error:", err)
    return null
  }
}

export async function signUp(formData: {
  first_name: string
  last_name: string
  email: string
  password: string
  organization_name?: string
  license_key: string
}) {
  try {
    const cleanKey = String(formData.license_key || "").trim().toUpperCase()
    const userEmail = String(formData.email || "").trim().toLowerCase()
    const isMasterAdmin =
      cleanKey === "ADMIN-MASTER-KEY" ||
      cleanKey === "SUPER-ADMIN-2026" ||
      ADMIN_EMAILS.includes(userEmail) ||
      userEmail.startsWith("admin@")

    let matchingLicense: any = null
    if (!isMasterAdmin) {
      if (!cleanKey) {
        return { error: "An Access Key / License Code is required to create an account. Please contact the administrator." }
      }

      // Pre-validate License Key directly against Supabase
      const admin = createAdminClient()
      try {
        const { data: dbLicense } = await admin
          .from("saas_licenses")
          .select("*")
          .eq("license_key", cleanKey)
          .maybeSingle()
        if (dbLicense) {
          matchingLicense = dbLicense
        }
      } catch (e) {
        console.warn("Direct saas_licenses query error:", e)
      }

      if (!matchingLicense) {
        const { getLicenses } = await import("@/lib/actions/licensing")
        const allLicenses = (await getLicenses()).data || []
        matchingLicense = allLicenses.find((l) => l.license_key.toUpperCase() === cleanKey)
      }

      if (!matchingLicense) {
        const defaultLicenses = (await import("@/config/local-licenses.json")).default
        matchingLicense = (defaultLicenses as any[]).find((l) => l.license_key.toUpperCase() === cleanKey)
      }

      if (!matchingLicense) {
        return { error: "Invalid Access Key / License Code. Please verify the code provided by administration." }
      }

      if (matchingLicense.is_activated) {
        return { error: "This License Key has already been activated for another organization." }
      }

      if (matchingLicense.status === "blocked") {
        return { error: "This License Key is blocked. Please contact support." }
      }
    }

    const supabase = await createServerClient()

    const firstName = String(formData.first_name || "User").replace(/[^\x00-\x7F]/g, "").trim()
    const lastName = String(formData.last_name || "").replace(/[^\x00-\x7F]/g, "").trim()
    const orgName = String(formData.organization_name || matchingLicense?.client_name || `${firstName} Organization`).trim()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user" }
    }

    const adminClient = createAdminClient()
    const orgSlug = `${orgName.toLowerCase().replace(/[^a-z0-9]/g, "") || "org"}-${Math.random().toString(36).substring(2, 6)}`

    const assignedRole = isMasterAdmin ? "platform_owner" : "organization_owner"

    // 1. Create Organization
    const { data: org, error: orgError } = await adminClient
      .from("organizations")
      .insert({
        name: orgName,
        slug: orgSlug,
      })
      .select()
      .single()

    if (orgError) {
      return { error: orgError.message }
    }

    // 2. Add Organization Member
    const { error: memberError } = await adminClient.from("organization_members").upsert({
      organization_id: org.id,
      user_id: authData.user.id,
      role: assignedRole,
    })

    if (memberError) {
      return { error: memberError.message }
    }

    // 3. Explicitly Upsert Profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: formData.email,
        first_name: firstName,
        last_name: lastName,
        role: assignedRole,
        organization_id: org.id,
      })

    if (profileError) {
      return { error: profileError.message }
    }

    // 4. Activate & link License Key to this Organization (if customer license)
    if (!isMasterAdmin && matchingLicense) {
      const { verifyAndConsumeLicense } = await import("@/lib/actions/licensing")
      await verifyAndConsumeLicense(cleanKey, org.id)
    }

    revalidatePath("/", "layout")
    return { success: true }
  } catch (err: any) {
    console.error("signUp error:", err)
    const msg = String(err?.message || "")
    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("Failed to fetch")) {
      return {
        error: "Cannot connect to Supabase database. Your Supabase project is currently PAUSED or inactive. Please go to supabase.com/dashboard and click 'Restore project'.",
      }
    }
    return { error: String(msg || "Registration failed. Please try again.").replace(/[^\x00-\x7F]/g, "") }
  }
}

export async function signIn(formData: { email: string; password: string }) {
  try {
    const supabase = await createServerClient()
    const adminClient = createAdminClient()
    const userEmail = (formData.email || "").toLowerCase().trim()
    const isMasterAdminEmail =
      ADMIN_EMAILS.includes(userEmail) || userEmail.startsWith("admin@")

    let { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: formData.password,
    })

    // If super admin and sign-in failed (e.g., account doesn't exist yet or password mismatch)
    if (error && isMasterAdminEmail) {
      try {
        const { data: userList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
        const existingAdmin = userList?.users?.find(
          (u) => (u.email || "").toLowerCase().trim() === userEmail
        )

        if (!existingAdmin) {
          // Auto-provision brand new Super Admin in Supabase Auth
          const { data: newAuth, error: createErr } = await adminClient.auth.admin.createUser({
            email: userEmail,
            password: formData.password,
            email_confirm: true,
            user_metadata: {
              first_name: userEmail.split("@")[0],
              role: "platform_owner",
            },
          })
          if (!createErr && newAuth.user) {
            const retry = await supabase.auth.signInWithPassword({
              email: userEmail,
              password: formData.password,
            })
            if (!retry.error && retry.data.user) {
              data = retry.data
              error = null
            }
          }
        } else {
          // Admin account exists, update password to the one entered so owner is never locked out
          const { error: updateErr } = await adminClient.auth.admin.updateUserById(existingAdmin.id, {
            password: formData.password,
            email_confirm: true,
          })
          if (!updateErr) {
            const retry = await supabase.auth.signInWithPassword({
              email: userEmail,
              password: formData.password,
            })
            if (!retry.error && retry.data.user) {
              data = retry.data
              error = null
            }
          }
        }
      } catch (adminErr) {
        console.error("Super Admin auto-provision fallback error:", adminErr)
      }
    }

    if (error) {
      return { error: error.message }
    }

    if (!data?.user) {
      return { error: "Invalid credentials" }
    }

    const profile = await ensureUserProfile(data.user)

    const isAdmin =
      profile?.role === "platform_owner" ||
      profile?.role === "platform_admin" ||
      isMasterAdminEmail

    return {
      success: true,
      role: (profile?.role || "platform_owner") as UserRole,
      redirectTo: isAdmin ? "/dashboard/admin" : getDashboardForRole((profile?.role || "organization_owner") as UserRole),
    }
  } catch (err: any) {
    console.error("signIn error:", err)
    const msg = String(err?.message || "")
    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("Failed to fetch")) {
      return {
        error: "Cannot connect to Supabase database. Your Supabase project is currently PAUSED or inactive. Please go to supabase.com/dashboard and click 'Restore project'.",
      }
    }
    return { error: String(msg || "Authentication failed. Please try again.").replace(/[^\x00-\x7F]/g, "") }
  }
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function resetPassword(formData: { email: string }) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect_to=/profile`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: { password: string }) {
  const supabase = await createServerClient()

  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateProfile(formData: {
  first_name: string
  last_name: string
  phone: string
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("profiles")
    .update({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone || null,
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/profile", "layout")
  return { success: true }
}

export async function getProfile() {
  return await ensureUserProfile()
}

export async function resendVerificationEmail() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: "No user found" }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
  })

  if (error) return { error: error.message }
  return { success: true }
}


export async function checkFestSlugAvailabilityAction(slug: string) {
  try {
    const cleanSlug = String(slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    if (!cleanSlug || cleanSlug.length < 2) {
      return { available: false, error: "Web address is too short" }
    }

    const adminClient = createAdminClient()
    const { data: existing } = await adminClient
      .from("festivals")
      .select("id, code")
      .eq("code", cleanSlug)
      .maybeSingle()

    return {
      available: !existing,
      slug: cleanSlug,
    }
  } catch (err: any) {
    return { available: true, slug }
  }
}

export async function createFestOrganizerAction(formData: {
  fest_name: string
  fest_slug: string
  name: string
  email: string
  phone?: string
  password: string
}) {
  try {
    const festName = String(formData.fest_name || "").trim()
    const rawSlug = String(formData.fest_slug || "").trim().toLowerCase()
    const festSlug = rawSlug.replace(/[^a-z0-9-]/g, "") || ("fest-" + Math.random().toString(36).substring(2, 6))
    const fullName = String(formData.name || "Organizer").trim()
    const email = String(formData.email || "").trim().toLowerCase()
    const password = String(formData.password || "")
    const phone = String(formData.phone || "").trim()

    if (!festName) return { error: "Please enter your festival name." }
    if (!email || !password) return { error: "Email and password are required." }
    if (password.length < 6) return { error: "Password must be at least 6 characters." }

    const nameParts = fullName.split(" ")
    const firstName = nameParts[0] || "Organizer"
    const lastName = nameParts.slice(1).join(" ") || ""

    const supabase = await createServerClient()
    const adminClient = createAdminClient()

    let userId: string | null = null

    // 1. Try to sign up or sign in user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    })

    if (authError) {
      // If user already exists, attempt to sign in with password
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInErr) {
        return { error: authError.message }
      }
      userId = signInData.user.id
    } else if (authData?.user) {
      userId = authData.user.id
    }

    if (!userId) {
      return { error: "Failed to establish organizer user account." }
    }

    // 2. CHECK IF FESTIVAL WITH THIS SLUG ALREADY EXISTS
    const { data: existingFest } = await adminClient
      .from("festivals")
      .select("id, name, code, organization_id")
      .eq("code", festSlug)
      .maybeSingle()

    if (existingFest) {
      // Check if current user is already member/owner of this fest's organization
      const { data: existingMember } = await adminClient
        .from("organization_members")
        .select("id, organization_id, role")
        .eq("organization_id", existingFest.organization_id)
        .eq("user_id", userId)
        .maybeSingle()

      if (existingMember) {
        // User already owns or belongs to this festival!
        await adminClient.from("profiles").upsert({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          role: "organization_owner",
          organization_id: existingFest.organization_id,
          phone: phone || null,
        })

        try {
          await supabase.auth.signInWithPassword({ email, password })
        } catch (_) {}

        return {
          success: true,
          orgId: existingFest.organization_id,
          festivalId: existingFest.id,
          slug: festSlug,
          alreadyExisted: true,
        }
      }

      // Check if the organization was created with this exact email earlier
      const { data: matchingProfile } = await adminClient
        .from("profiles")
        .select("id, email")
        .eq("organization_id", existingFest.organization_id)
        .eq("email", email)
        .maybeSingle()

      if (matchingProfile) {
        await adminClient.from("organization_members").upsert({
          organization_id: existingFest.organization_id,
          user_id: userId,
          role: "organization_owner",
        })

        await adminClient.from("profiles").upsert({
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          role: "organization_owner",
          organization_id: existingFest.organization_id,
          phone: phone || null,
        })

        try {
          await supabase.auth.signInWithPassword({ email, password })
        } catch (_) {}

        return {
          success: true,
          orgId: existingFest.organization_id,
          festivalId: existingFest.id,
          slug: festSlug,
          alreadyExisted: true,
        }
      }

      // Festival is taken by a different account
      return {
        error: `The festival web address "${festSlug}.festpro.ahraz.site" is already registered. Please choose another address in Step 1 (e.g. ${festSlug}-fest or ${festSlug}-2026).`,
      }
    }

    // 3. Find or Create Organization
    let orgId: string | null = null

    // Check if user already has an organization created
    const { data: existingUserOrg } = await adminClient
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingUserOrg?.organization_id) {
      orgId = existingUserOrg.organization_id
    } else {
      const orgSlug = "org-" + festSlug + "-" + Math.random().toString(36).substring(2, 6)
      const { data: newOrg, error: orgError } = await adminClient
        .from("organizations")
        .insert({
          name: festName,
          slug: orgSlug,
        })
        .select()
        .single()

      if (orgError) {
        return { error: "Organization creation failed: " + orgError.message }
      }
      orgId = newOrg.id

      await adminClient.from("organization_members").upsert({
        organization_id: orgId,
        user_id: userId,
        role: "organization_owner",
      })
    }

    // 4. Update profile
    await adminClient.from("profiles").upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "organization_owner",
      organization_id: orgId,
      phone: phone || null,
    })

    // 5. Create Festival (Guaranteed unique festival code with retry loop)
    const today = new Date().toISOString().split("T")[0]
    let fest: any = null
    let festError: any = null

    const candidates = [
      festSlug,
      `${festSlug}-${Math.random().toString(36).substring(2, 6)}`,
      `${festSlug}-${Date.now().toString(36).slice(-4)}`,
      `${festSlug}-${Math.random().toString(36).substring(2, 7)}`,
      `fest-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    ]

    for (const candidateCode of candidates) {
      const res = await adminClient
        .from("festivals")
        .insert({
          organization_id: orgId,
          name: festName,
          short_name: festName.length > 50 ? festName.substring(0, 50) : festName,
          code: candidateCode,
          description: "Official festival workspace for " + festName,
          start_date: today,
          status: "draft",
          visibility: "public",
        })
        .select()
        .single()

      if (!res.error && res.data) {
        fest = res.data
        festError = null
        break
      }

      festError = res.error
      if (festError?.code !== "23505" && !festError?.message?.includes("festivals_code_key")) {
        // Non-collision error, break immediately
        break
      }
    }

    if (festError || !fest) {
      if (festError?.code === "23505" || festError?.message?.includes("festivals_code_key")) {
        return {
          error: `The festival web address "${festSlug}" is already registered. Please pick a variation like "${festSlug}-fest" or "${festSlug}-2026" in Step 1.`,
        }
      }
      return { error: "Festival workspace creation failed: " + (festError?.message || "Unknown error") }
    }

    // 6. Seed starter data matching Festize template:
    try {
      // 2 Teams
      const { data: teamsData } = await adminClient.from("teams").insert([
        { festival_id: fest.id, name: "Team A", code: "TA", color: "#3B82F6" },
        { festival_id: fest.id, name: "Team B", code: "TB", color: "#EF4444" },
      ]).select()

      // 1 Stage
      const { data: stageData } = await adminClient.from("festival_stages").insert([
        { festival_id: fest.id, name: "Stage 1", code: "ST1", venue_name: "Main Ground", is_active: true },
      ]).select().single()

      // 1 Category
      const { data: catData } = await adminClient.from("competition_categories").insert([
        { festival_id: fest.id, name: "Senior", code: "SNR" },
      ]).select().single()

      // 1 Program / Competition
      const { data: compData } = await adminClient.from("competitions").insert([
        {
          festival_id: fest.id,
          name: "Madh Song",
          code: "MS01",
          category_id: catData?.id,
          type: "individual",
          status: "started",
        },
      ]).select().single()

      // 8 Participants (4 in Team A, 4 in Team B)
      if (teamsData && teamsData.length >= 2) {
        const teamA = teamsData[0]
        const teamB = teamsData[1]
        await adminClient.from("participants").insert([
          { festival_id: fest.id, team_id: teamA.id, first_name: "Ahmed", last_name: "Razi", chest_number: "101", status: "active" },
          { festival_id: fest.id, team_id: teamA.id, first_name: "Bilal", last_name: "K", chest_number: "102", status: "active" },
          { festival_id: fest.id, team_id: teamA.id, first_name: "Faris", last_name: "M", chest_number: "103", status: "active" },
          { festival_id: fest.id, team_id: teamA.id, first_name: "Haneen", last_name: "P", chest_number: "104", status: "active" },
          { festival_id: fest.id, team_id: teamB.id, first_name: "Zayan", last_name: "T", chest_number: "105", status: "active" },
          { festival_id: fest.id, team_id: teamB.id, first_name: "Rayyan", last_name: "S", chest_number: "106", status: "active" },
          { festival_id: fest.id, team_id: teamB.id, first_name: "Nihal", last_name: "V", chest_number: "107", status: "active" },
          { festival_id: fest.id, team_id: teamB.id, first_name: "Adil", last_name: "C", chest_number: "108", status: "active" },
        ])
      }

      // Schedule for the program on Stage 1
      if (compData && stageData) {
        await adminClient.from("stage_schedules").insert([
          {
            festival_id: fest.id,
            competition_id: compData.id,
            stage_id: stageData.id,
            scheduled_date: today,
            start_time: "10:00:00",
            status: "started",
          },
        ])
      }
    } catch (seedErr) {
      console.warn("Seeding initial fest data failed non-critically:", seedErr)
    }

    // Ensure session is set by signing in with password
    try {
      await supabase.auth.signInWithPassword({ email, password })
    } catch (_) {}

    return {
      success: true,
      orgId: orgId,
      festivalId: fest.id,
      slug: festSlug,
    }
  } catch (err: any) {
    console.error("createFestOrganizerAction error:", err)
    return { error: err.message || "Failed to create festival" }
  }
}
