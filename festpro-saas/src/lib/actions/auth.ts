"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getDashboardForRole } from "@/config/roles"
import type { UserRole } from "@/types"

export async function ensureUserProfile() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const adminClient = createAdminClient()
    let { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
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
          role: "organization_owner",
        })
      }

      const { data: newProfile } = await adminClient
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          first_name: firstName,
          last_name: lastName,
          role: "organization_owner",
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
    if (!cleanKey) {
      return { error: "An Access Key / License Code is required to create an account. Please contact the administrator." }
    }

    // Pre-validate License Key
    const { getLicenses, verifyAndConsumeLicense } = await import("@/lib/actions/licensing")
    const allLicenses = (await getLicenses()).data || []
    const matchingLicense = allLicenses.find((l) => l.license_key.toUpperCase() === cleanKey)

    if (!matchingLicense) {
      return { error: "Invalid Access Key / License Code. Please verify the code provided by administration." }
    }

    if (matchingLicense.is_activated) {
      return { error: "This License Key has already been activated for another organization." }
    }

    if (matchingLicense.status === "blocked") {
      return { error: "This License Key is blocked. Please contact support." }
    }

    const supabase = await createServerClient()

    const firstName = String(formData.first_name || "User").replace(/[^\x00-\x7F]/g, "").trim()
    const lastName = String(formData.last_name || "").replace(/[^\x00-\x7F]/g, "").trim()
    const orgName = String(formData.organization_name || matchingLicense.client_name || `${firstName} Organization`).trim()

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
      role: "organization_owner",
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
        role: "organization_owner",
        organization_id: org.id,
      })

    if (profileError) {
      return { error: profileError.message }
    }

    // 4. Activate & link License Key to this Organization
    await verifyAndConsumeLicense(cleanKey, org.id)

    revalidatePath("/", "layout")
    return { success: true }
  } catch (err: any) {
    console.error("signUp error:", err)
    return { error: String(err?.message || "Registration failed. Please try again.").replace(/[^\x00-\x7F]/g, "") }
  }
}

export async function signIn(formData: { email: string; password: string }) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: "Invalid credentials" }
    }

    const profile = await ensureUserProfile()

    if (!profile) {
      return { error: "Profile initialization error" }
    }

    revalidatePath("/", "layout")
    return {
      success: true,
      role: profile.role as UserRole,
      redirectTo: getDashboardForRole(profile.role as UserRole),
    }
  } catch (err: any) {
    console.error("signIn error:", err)
    return { error: String(err?.message || "Authentication failed. Please try again.").replace(/[^\x00-\x7F]/g, "") }
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
