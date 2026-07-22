"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getDashboardForRole } from "@/config/roles"
import type { UserRole } from "@/types"

export async function signUp(formData: {
  first_name: string
  last_name: string
  email: string
  password: string
}) {
  const supabase = await createServerClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        first_name: formData.first_name,
        last_name: formData.last_name,
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
  const orgSlug = `${formData.first_name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`

  // 1. Create Organization
  const { data: org, error: orgError } = await adminClient
    .from("organizations")
    .insert({
      name: `${formData.first_name}'s Organization`,
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

  // 3. Explicitly Upsert Profile (Guarantees profile row exists regardless of DB trigger)
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: authData.user.id,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: "organization_owner",
      organization_id: org.id,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function signIn(formData: { email: string; password: string }) {
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

  const adminClient = createAdminClient()
  let { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  // Auto-heal missing profile
  if (!profile) {
    const userMeta = data.user.user_metadata || {}
    const firstName = userMeta.first_name || data.user.email?.split("@")[0] || "User"
    const lastName = userMeta.last_name || ""

    const orgSlug = `org-${data.user.id.substring(0, 8)}`
    let { data: org } = await adminClient
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single()

    if (!org) {
      const { data: newOrg } = await adminClient
        .from("organizations")
        .insert({
          name: `${firstName}'s Organization`,
          slug: orgSlug,
        })
        .select()
        .single()
      org = newOrg
    }

    if (org) {
      await adminClient.from("organization_members").upsert({
        organization_id: org.id,
        user_id: data.user.id,
        role: "organization_owner",
      })
    }

    const { data: newProfile, error: createProfileError } = await adminClient
      .from("profiles")
      .upsert({
        id: data.user.id,
        email: data.user.email!,
        first_name: firstName,
        last_name: lastName,
        role: "organization_owner",
        organization_id: org?.id || null,
      })
      .select("*")
      .single()

    if (createProfileError || !newProfile) {
      return { error: createProfileError?.message || "Profile initialization error" }
    }

    profile = newProfile
  }

  revalidatePath("/", "layout")
  return {
    success: true,
    role: profile.role as UserRole,
    redirectTo: getDashboardForRole(profile.role as UserRole),
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
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const adminClient = createAdminClient()
  const { data } = await adminClient.from("profiles").select("*").eq("id", user.id).single()

  return data
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
