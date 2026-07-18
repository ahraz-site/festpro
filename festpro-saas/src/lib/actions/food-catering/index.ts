"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  Kitchen, KitchenStaff, MealCategory, MealType, MealPlan, MealSession, Menu, MenuItem,
  Recipe, RecipeIngredient, MealBooking, MealCoupon, CouponRedemption, MealAttendance,
  DiningHall, DiningTable, FoodDistributionPoint, MealDistributionLog, SpecialDiet,
  DietRequest, FoodSupplier, FoodOrder, FoodOrderItem, KitchenInventory, IngredientStock,
  IngredientConsumption, FoodPreparationLog, FoodWasteLog, NutritionInformation,
  MealFeedback, Module19DashboardData,
} from "@/types/food-catering"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  if (festivalId) {
    const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, festival_id: festivalId } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id } as const
}

function generateNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

function generateQR(): string {
  return crypto.randomBytes(16).toString("hex")
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getFoodCateringDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [
    { count: tk }, { count: ak },
    { count: ts }, { count: tms },
    { count: ts2 }, { count: as },
    { count: tb }, { count: tdb },
    { count: tc }, { count: ac },
    { count: rc }, { count: tmn },
    { count: pm }, { count: tdh },
    { count: oh }, { count: tdp },
    { count: op }, { count: mst },
    { count: tdr }, { count: pdr },
    { count: twl }, wc, { count: tsup },
    lsr, { count: tmf },
  ] = await Promise.all([
    admin.from("kitchens").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("kitchens").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_active", true),
    admin.from("kitchen_staff").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("meal_sessions").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("meal_sessions").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("session_date", today),
    admin.from("meal_sessions").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["planned", "preparing", "ready", "serving"]),
    admin.from("meal_bookings").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("meal_bookings").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("booking_date", today),
    admin.from("meal_coupons").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("meal_coupons").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("meal_coupons").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "redeemed"),
    admin.from("menus").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("menus").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "published"),
    admin.from("dining_halls").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("dining_halls").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "open"),
    admin.from("food_distribution_points").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("food_distribution_points").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "open"),
    admin.from("meal_distribution_logs").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).gte("served_at", today),
    admin.from("diet_requests").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("diet_requests").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "pending"),
    admin.from("food_waste_logs").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("food_waste_logs").select("estimated_cost").eq("festival_id", festivalId),
    admin.from("food_suppliers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    Promise.resolve({ count: 0 }),
    admin.from("meal_feedback").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
  ])
  const wcData = (wc as any)?.data || []
  const wcTotal = wcData.reduce((sum: number, r: any) => sum + Number(r.estimated_cost || 0), 0)
  const avgRes = await admin.from("meal_feedback").select("rating").eq("festival_id", festivalId)
  const avgRatings = (avgRes as any)?.data || []
  const avg = avgRatings.length ? avgRatings.reduce((s: number, r: any) => s + r.rating, 0) / avgRatings.length : 0

  const dash: Module19DashboardData = {
    total_kitchens: tk || 0, active_kitchens: ak || 0, total_staff: ts || 0,
    total_meal_sessions: tms || 0, today_sessions: ts2 || 0, active_sessions: as || 0,
    total_bookings: tb || 0, today_bookings: tdb || 0,
    total_coupons: tc || 0, active_coupons: ac || 0, redeemed_coupons: rc || 0,
    total_menus: tmn || 0, published_menus: pm || 0,
    total_dining_halls: tdh || 0, open_halls: oh || 0,
    total_distribution_points: tdp || 0, open_points: op || 0,
    meals_served_today: mst || 0,
    total_diet_requests: tdr || 0, pending_diet_requests: pdr || 0,
    total_waste_logs: twl || 0, total_waste_cost: wcTotal,
    total_suppliers: tsup || 0, low_stock_items: 0,
    total_meal_feedback: tmf || 0, average_rating: avg,
  }
  return { data: dash }
}

// ============================================================
// KITCHENS
// ============================================================

export async function getKitchens(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("kitchens").select("*").eq("festival_id", festivalId).order("kitchen_name")
  if (error) return { error: error.message }
  return { data: data as Kitchen[] }
}

export async function getKitchen(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("kitchens").select("*, kitchen_staff(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createKitchen(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("KIT")
  const { data, error } = await admin.from("kitchens").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_code: code, kitchen_name: form.kitchen_name, description: form.description || null,
    kitchen_type: form.kitchen_type || "main", location: form.location || null,
    capacity: form.capacity || 0, preparation_areas: form.preparation_areas || 1,
    opening_time: form.opening_time || null, closing_time: form.closing_time || null,
    contact_person: form.contact_person || null, contact_phone: form.contact_phone || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as Kitchen }
}

export async function updateKitchen(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("kitchens").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Kitchen }
}

export async function deleteKitchen(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("kitchens").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// KITCHEN STAFF
// ============================================================

export async function getKitchenStaff(kitchenId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("kitchen_staff").select("*, kitchens(kitchen_name)").eq("kitchen_id", kitchenId).order("full_name")
  if (error) return { error: error.message }
  return { data }
}

export async function createKitchenStaff(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("kitchen_staff").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_id: form.kitchen_id, user_id: form.user_id || null,
    full_name: form.full_name, role: form.role || "assistant",
    phone: form.phone || null, email: form.email || null,
    shift_start: form.shift_start || null, shift_end: form.shift_end || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as KitchenStaff }
}

export async function deleteKitchenStaff(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("kitchen_staff").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// MEAL CATEGORIES
// ============================================================

export async function getMealCategories() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_categories").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as MealCategory[] }
}

export async function createMealCategory(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_categories").insert({
    organization_id: auth.organization_id, name: form.name,
    description: form.description || null, sort_order: form.sort_order || 0,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MealCategory }
}

// ============================================================
// MEAL TYPES
// ============================================================

export async function getMealTypes() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_types").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as MealType[] }
}

// ============================================================
// MEAL PLANS
// ============================================================

export async function getMealPlans(festivalId: string, date?: string) {
  const admin = createAdminClient()
  let query = admin.from("meal_plans").select("*, kitchens(kitchen_name), meal_types(name)").eq("festival_id", festivalId).order("plan_date", { ascending: false })
  if (date) query = query.eq("plan_date", date)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMealPlan(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_plans").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    plan_name: form.plan_name, plan_date: form.plan_date,
    meal_type_id: form.meal_type_id || null, kitchen_id: form.kitchen_id || null,
    expected_attendance: form.expected_attendance || 0, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as MealPlan }
}

export async function deleteMealPlan(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("meal_plans").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// MEAL SESSIONS
// ============================================================

export async function getMealSessions(festivalId: string, date?: string) {
  const admin = createAdminClient()
  let query = admin.from("meal_sessions").select("*, kitchens(kitchen_name)").eq("festival_id", festivalId).order("session_date", { ascending: false }).order("start_time")
  if (date) query = query.eq("session_date", date)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMealSession(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_sessions").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_id: form.kitchen_id, meal_plan_id: form.meal_plan_id || null,
    session_name: form.session_name, meal_type: form.meal_type,
    session_date: form.session_date, start_time: form.start_time, end_time: form.end_time,
    total_portions: form.total_portions || 0, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as MealSession }
}

export async function updateMealSessionStatus(id: string, status: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_sessions").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as MealSession }
}

export async function deleteMealSession(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("meal_sessions").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// MENUS
// ============================================================

export async function getMenus(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("menus").select("*, kitchens(kitchen_name), meal_categories(name), meal_sessions(session_name, meal_type)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMenu(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("menus").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_id: form.kitchen_id || null, menu_name: form.menu_name,
    menu_date: form.menu_date || null, meal_session_id: form.meal_session_id || null,
    category_id: form.category_id || null, is_template: form.is_template || false,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as Menu }
}

export async function updateMenuStatus(id: string, status: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("menus").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Menu }
}

export async function deleteMenu(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("menus").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// MENU ITEMS
// ============================================================

export async function getMenuItems(menuId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("menu_items").select("*").eq("menu_id", menuId).order("sort_order")
  if (error) return { error: error.message }
  return { data }
}

export async function createMenuItem(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("menu_items").insert({
    organization_id: auth.organization_id, menu_id: form.menu_id,
    item_name: form.item_name, description: form.description || null,
    diet_type: form.diet_type || null, is_vegetarian: form.is_vegetarian || false,
    is_vegan: form.is_vegan || false, is_gluten_free: form.is_gluten_free || false,
    is_halal: form.is_halal || false, allergens: form.allergens || null,
    calories: form.calories || null, protein_g: form.protein_g || null,
    carbs_g: form.carbs_g || null, fat_g: form.fat_g || null,
    serving_size: form.serving_size || null, preparation_time_minutes: form.preparation_time_minutes || null,
    instructions: form.instructions || null, sort_order: form.sort_order || 0,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MenuItem }
}

export async function deleteMenuItem(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("menu_items").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

// ============================================================
// MEAL BOOKINGS
// ============================================================

export async function getMealBookings(festivalId: string, sessionId?: string) {
  const admin = createAdminClient()
  let query = admin.from("meal_bookings").select("*, meal_sessions(session_name, meal_type, session_date), menus(menu_name, status)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (sessionId) query = query.eq("meal_session_id", sessionId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMealBooking(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const bn = generateNumber("MB")
  const { data, error } = await admin.from("meal_bookings").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    booking_number: bn, meal_session_id: form.meal_session_id || null,
    menu_id: form.menu_id || null, participant_id: form.participant_id || null,
    volunteer_id: form.volunteer_id || null, guest_name: form.guest_name || null,
    guest_phone: form.guest_phone || null, guest_email: form.guest_email || null,
    requester_type: form.requester_type || "participant", requester_id: form.requester_id || null,
    num_meals: form.num_meals || 1, diet_type: form.diet_type || null,
    diet_notes: form.diet_notes || null, status: "confirmed",
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as MealBooking }
}

export async function updateMealBookingStatus(id: string, status: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_bookings").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as MealBooking }
}

export async function deleteMealBooking(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("meal_bookings").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// MEAL COUPONS
// ============================================================

export async function getMealCoupons(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("meal_coupons").select("*, meal_sessions(session_name, meal_type, session_date)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMealCoupon(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("MC")
  const qr = generateQR()
  const { data, error } = await admin.from("meal_coupons").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    coupon_code: code, booking_id: form.booking_id || null,
    meal_session_id: form.meal_session_id || null, menu_id: form.menu_id || null,
    qr_code: qr, barcode: form.barcode || null,
    holder_name: form.holder_name, holder_type: form.holder_type,
    diet_type: form.diet_type || null, is_printed: form.is_printed || false,
    is_digital: form.is_digital !== false, expires_at: form.expires_at || null,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as MealCoupon }
}

export async function redeemMealCoupon(couponId: string, pointId?: string) {
  const auth = await getAuth()
  if (!auth) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data: coupon } = await admin.from("meal_coupons").select("*").eq("id", couponId).single()
  if (!coupon) return { error: "Coupon not found" }
  if (coupon.status !== "active") return { error: "Coupon already used or expired" }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { error: "Coupon expired" }
  await admin.from("meal_coupons").update({
    status: "redeemed", redeemed_at: new Date().toISOString(), redeemed_by: auth.id,
    redemption_point_id: pointId || null,
  }).eq("id", couponId)
  await admin.from("coupon_redemptions").insert({
    organization_id: coupon.organization_id, festival_id: coupon.festival_id,
    coupon_id: couponId, session_id: coupon.meal_session_id,
    distribution_point_id: pointId || null, redeemed_by: auth.id,
  })
  if (coupon.meal_session_id) {
    await admin.from("meal_sessions").update({ served_portions: admin.rpc("increment") }).eq("id", coupon.meal_session_id)
  }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

export async function cancelMealCoupon(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("meal_coupons").update({ status: "cancelled" }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// DINING HALLS
// ============================================================

export async function getDiningHalls(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("dining_halls").select("*, dining_tables(*)").eq("festival_id", festivalId).order("hall_name")
  if (error) return { error: error.message }
  return { data }
}

export async function createDiningHall(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("DH")
  const { data, error } = await admin.from("dining_halls").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    hall_name: form.hall_name, hall_code: code, location: form.location || null,
    capacity: form.capacity || 0, is_ac: form.is_ac || false,
    has_wheelchair_access: form.has_wheelchair_access !== false,
    contact_person: form.contact_person || null, contact_phone: form.contact_phone || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as DiningHall }
}

export async function deleteDiningHall(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("dining_halls").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// DINING TABLES
// ============================================================

export async function createDiningTable(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("dining_tables").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    hall_id: form.hall_id, table_number: form.table_number,
    capacity: form.capacity || 4,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as DiningTable }
}

// ============================================================
// FOOD DISTRIBUTION POINTS
// ============================================================

export async function getDistributionPoints(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("food_distribution_points").select("*, kitchens(kitchen_name), dining_halls(hall_name)").eq("festival_id", festivalId).order("point_name")
  if (error) return { error: error.message }
  return { data }
}

export async function createDistributionPoint(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("DP")
  const { data, error } = await admin.from("food_distribution_points").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_id: form.kitchen_id || null, hall_id: form.hall_id || null,
    point_name: form.point_name, point_code: code,
    location: form.location || null, counter_type: form.counter_type || "regular",
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as FoodDistributionPoint }
}

export async function updateDistributionPointStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "open") updates.opened_at = new Date().toISOString()
  if (status === "closed") updates.closed_at = new Date().toISOString()
  const { data, error } = await admin.from("food_distribution_points").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as FoodDistributionPoint }
}

// ============================================================
// SPECIAL DIETS
// ============================================================

export async function getSpecialDiets(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("special_diets").select("*").eq("festival_id", festivalId).order("diet_name")
  if (error) return { error: error.message }
  return { data: data as SpecialDiet[] }
}

export async function createSpecialDiet(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("special_diets").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    diet_name: form.diet_name, diet_type: form.diet_type,
    description: form.description || null, guidelines: form.guidelines || null,
    restrictions: form.restrictions || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as SpecialDiet }
}

// ============================================================
// DIET REQUESTS
// ============================================================

export async function getDietRequests(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("diet_requests").select("*, participants(first_name, last_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createDietRequest(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("diet_requests").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    participant_id: form.participant_id || null, volunteer_id: form.volunteer_id || null,
    diet_type: form.diet_type, diet_id: form.diet_id || null,
    dietary_requirements: form.dietary_requirements || null,
    allergies: form.allergies || null, medical_reason: form.medical_reason || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as DietRequest }
}

export async function updateDietRequestStatus(id: string, status: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "approved") { updates.approved_by = auth?.id; updates.approved_at = new Date().toISOString() }
  const { data, error } = await admin.from("diet_requests").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  return { data: data as DietRequest }
}

// ============================================================
// FOOD SUPPLIERS
// ============================================================

export async function getFoodSuppliers(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("food_suppliers").select("*").eq("festival_id", festivalId).order("supplier_name")
  if (error) return { error: error.message }
  return { data: data as FoodSupplier[] }
}

export async function createFoodSupplier(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("FS")
  const { data, error } = await admin.from("food_suppliers").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    supplier_name: form.supplier_name, supplier_code: code,
    contact_person: form.contact_person || null, contact_phone: form.contact_phone || null,
    contact_email: form.contact_email || null, address: form.address || null,
    supply_categories: form.supply_categories || null, payment_terms: form.payment_terms || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as FoodSupplier }
}

// ============================================================
// FOOD ORDERS
// ============================================================

export async function getFoodOrders(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("food_orders").select("*, food_suppliers(supplier_name), kitchens(kitchen_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createFoodOrder(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const on = generateNumber("FO")
  const { data, error } = await admin.from("food_orders").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    order_number: on, supplier_id: form.supplier_id || null,
    kitchen_id: form.kitchen_id || null, delivery_date: form.delivery_date || null,
    notes: form.notes || null, ordered_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as FoodOrder }
}

// ============================================================
// KITCHEN INVENTORY
// ============================================================

export async function getKitchenInventory(festivalId: string, kitchenId?: string) {
  const admin = createAdminClient()
  let query = admin.from("kitchen_inventory").select("*, food_suppliers(supplier_name)").eq("festival_id", festivalId).order("item_name")
  if (kitchenId) query = query.eq("kitchen_id", kitchenId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createKitchenInventoryItem(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const totalVal = Number(form.quantity || 0) * Number(form.unit_price || 0)
  const { data, error } = await admin.from("kitchen_inventory").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_id: form.kitchen_id || null, item_name: form.item_name,
    category: form.category || null, quantity: form.quantity || 0,
    unit: form.unit || "kg", unit_price: form.unit_price || 0,
    total_value: totalVal, min_stock_level: form.min_stock_level || 0,
    max_stock_level: form.max_stock_level || null, expiry_date: form.expiry_date || null,
    supplier_id: form.supplier_id || null, storage_location: form.storage_location || null,
    batch_number: form.batch_number || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as KitchenInventory }
}

// ============================================================
// FOOD WASTE LOGS
// ============================================================

export async function getFoodWasteLogs(festivalId: string, wasteCategory?: string) {
  const admin = createAdminClient()
  let query = admin.from("food_waste_logs").select("*, kitchens(kitchen_name)").eq("festival_id", festivalId).order("recorded_at", { ascending: false })
  if (wasteCategory) query = query.eq("waste_category", wasteCategory)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createFoodWasteLog(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("food_waste_logs").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    kitchen_id: form.kitchen_id || null, meal_session_id: form.meal_session_id || null,
    item_name: form.item_name, waste_category: form.waste_category,
    quantity: form.quantity, unit: form.unit || "kg",
    estimated_cost: form.estimated_cost || 0, reason: form.reason || null,
    notes: form.notes || null, recorded_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/food`)
  return { data: data as FoodWasteLog }
}

// ============================================================
// MEAL FEEDBACK
// ============================================================

export async function getMealFeedback(festivalId: string, sessionId?: string) {
  const admin = createAdminClient()
  let query = admin.from("meal_feedback").select("*, meal_sessions(session_name, meal_type), menu_items(item_name)").eq("festival_id", festivalId).order("submitted_at", { ascending: false })
  if (sessionId) query = query.eq("meal_session_id", sessionId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMealFeedback(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_feedback").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    meal_session_id: form.meal_session_id || null, menu_id: form.menu_id || null,
    menu_item_id: form.menu_item_id || null, participant_id: form.participant_id || null,
    volunteer_id: form.volunteer_id || null, guest_name: form.guest_name || null,
    rating: form.rating, taste_rating: form.taste_rating || null,
    quality_rating: form.quality_rating || null, service_rating: form.service_rating || null,
    comments: form.comments || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MealFeedback }
}

// ============================================================
// MEAL ATTENDANCE
// ============================================================

export async function getMealAttendance(sessionId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("meal_attendance").select("*, participants(first_name, last_name)").eq("meal_session_id", sessionId).order("attended_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}
