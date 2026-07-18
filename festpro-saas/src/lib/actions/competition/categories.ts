"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CompetitionCategory, CompetitionSubcategory, CompetitionGroup } from "@/types/competition"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function logOrgActivity(festivalId: string, action: string, metadata: Record<string, any> = {}) {
  const user = await getAuth()
  if (!user) return
  const admin = createAdminClient()
  const { data: f } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!f) return
  await admin.from("activity_logs").insert({
    organization_id: f.organization_id, user_id: user.id, action,
    resource_type: "competition", metadata,
  })
}

// ────────────────────────────────────────────
// CATEGORIES
// ────────────────────────────────────────────

export async function getCategories(festivalId: string): Promise<CompetitionCategory[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_categories").select("*, _count:competitions(count)").eq("festival_id", festivalId).order("display_order", { ascending: true }).order("name", { ascending: true })
  return (data || []) as unknown as CompetitionCategory[]
}

export async function getCategory(categoryId: string): Promise<CompetitionCategory | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_categories").select("*, _count:competitions(count)").eq("id", categoryId).single()
  return data as unknown as CompetitionCategory | null
}

export async function createCategory(festivalId: string, formData: { name: string; name_ml?: string; short_name?: string; code?: string; description?: string; color?: string; icon?: string }) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }

  const admin = createAdminClient()
  const { data, error } = await admin.from("competition_categories").insert({
    festival_id: festivalId, name: formData.name, name_ml: formData.name_ml || null,
    short_name: formData.short_name || null, code: formData.code || null,
    description: formData.description || null, color: formData.color || "#4F46E5",
    icon: formData.icon || "trophy", created_by: user.id,
  }).select().single()

  if (error) return { error: error.message }
  await logOrgActivity(festivalId, "competition.category_created", { category_id: data.id, name: data.name })
  revalidatePath(`/dashboard/organization/*/festivals/${festivalId}/competitions`, "layout")
  return { success: true, id: data.id }
}

export async function updateCategory(categoryId: string, formData: Partial<CompetitionCategory>) {
  const admin = createAdminClient()
  const { data: cat } = await admin.from("competition_categories").select("festival_id").eq("id", categoryId).single()
  if (!cat) return { error: "Category not found" }

  const { error } = await admin.from("competition_categories").update(formData).eq("id", categoryId)
  if (error) return { error: error.message }

  await logOrgActivity(cat.festival_id, "competition.category_updated", { category_id: categoryId })
  revalidatePath(`/dashboard/organization/*/festivals/${cat.festival_id}/competitions`, "layout")
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  const admin = createAdminClient()
  const { data: cat } = await admin.from("competition_categories").select("festival_id").eq("id", categoryId).single()
  if (!cat) return { error: "Category not found" }

  const { error } = await admin.from("competition_categories").update({ is_active: false }).eq("id", categoryId)
  if (error) return { error: error.message }

  await logOrgActivity(cat.festival_id, "competition.category_deleted", { category_id: categoryId })
  revalidatePath(`/dashboard/organization/*/festivals/${cat.festival_id}/competitions`, "layout")
  return { success: true }
}

// ────────────────────────────────────────────
// SUBCATEGORIES
// ────────────────────────────────────────────

export async function getSubcategories(categoryId: string): Promise<CompetitionSubcategory[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_subcategories").select("*").eq("category_id", categoryId).eq("is_active", true).order("display_order", { ascending: true })
  return (data || []) as CompetitionSubcategory[]
}

export async function createSubcategory(categoryId: string, formData: { name: string; name_ml?: string; code?: string; description?: string }) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_subcategories").insert({ category_id: categoryId, name: formData.name, name_ml: formData.name_ml || null, code: formData.code || null, description: formData.description || null })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteSubcategory(subcategoryId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_subcategories").update({ is_active: false }).eq("id", subcategoryId)
  if (error) return { error: error.message }
  return { success: true }
}

// ────────────────────────────────────────────
// GROUPS
// ────────────────────────────────────────────

export async function getGroups(festivalId: string): Promise<CompetitionGroup[]> {
  const admin = createAdminClient()
  const { data } = await admin.from("competition_groups").select("*").eq("festival_id", festivalId).eq("is_active", true).order("display_order", { ascending: true })
  return (data || []) as CompetitionGroup[]
}

export async function createGroup(festivalId: string, formData: { name: string; age_group: string; min_age?: string; max_age?: string; description?: string }) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_groups").insert({
    festival_id: festivalId, name: formData.name, age_group: formData.age_group,
    min_age: formData.min_age ? parseInt(formData.min_age) : null,
    max_age: formData.max_age ? parseInt(formData.max_age) : null,
    description: formData.description || null,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updateGroup(groupId: string, formData: Partial<CompetitionGroup>) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_groups").update(formData).eq("id", groupId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteGroup(groupId: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("competition_groups").update({ is_active: false }).eq("id", groupId)
  if (error) return { error: error.message }
  return { success: true }
}
