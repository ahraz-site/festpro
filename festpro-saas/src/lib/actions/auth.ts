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

  // Profile auto-created by on_auth_user_created trigger

  const orgSlug = `${formData.first_name.toLowerCase()}-${Math.random().toString(36).substring(2, 6)}`

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

  const { error: memberError } = await adminClient.from("organization_members").insert({
    organization_id: org.id,
    user_id: authData.user.id,
    role: "organization_owner",
  })

  if (memberError) {
    return { error: memberError.message }
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ organization_id: org.id })
    .eq("id", authData.user.id)

  if (updateError) {
    return { error: updateError.message }
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
  const { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single()

  if (!profile) {
    return { error: "Profile not found" }
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
