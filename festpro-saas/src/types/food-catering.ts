export type KitchenStatus = "active" | "inactive" | "under_maintenance" | "closed"
export type KitchenStaffRole = "manager" | "chef" | "cook" | "assistant" | "cleaner" | "volunteer"
export type MealTypeEnum = "breakfast" | "morning_tea" | "lunch" | "evening_tea" | "dinner" | "midnight_meal" | "special_meal" | "vip_meal"
export type MealSessionStatus = "planned" | "preparing" | "ready" | "serving" | "completed" | "cancelled"
export type MenuStatus = "draft" | "published" | "archived"
export type MealBookingStatus = "pending" | "confirmed" | "cancelled" | "no_show" | "attended"
export type CouponStatus = "active" | "redeemed" | "expired" | "cancelled"
export type DistributionPointStatus = "open" | "closed" | "paused"
export type DietType = "vegetarian" | "vegan" | "halal" | "gluten_free" | "diabetic" | "allergy_based" | "custom"
export type DietRequestStatus = "pending" | "approved" | "rejected"
export type IngredientUnit = "kg" | "g" | "l" | "ml" | "pcs" | "dozen" | "packet" | "carton" | "bag" | "bottle"
export type WasteCategory = "preparation" | "spoilage" | "overproduction" | "serving_waste" | "expired"
export type DiningHallStatus = "open" | "closed" | "cleaning" | "maintenance"

export interface Kitchen {
  id: string; organization_id: string; festival_id: string
  kitchen_code: string; kitchen_name: string; description: string | null
  kitchen_type: string; location: string | null; capacity: number; preparation_areas: number
  is_active: boolean; opening_time: string | null; closing_time: string | null
  contact_person: string | null; contact_phone: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface KitchenStaff {
  id: string; organization_id: string; festival_id: string; kitchen_id: string
  user_id: string | null; full_name: string; role: KitchenStaffRole
  phone: string | null; email: string | null
  shift_start: string | null; shift_end: string | null; is_active: boolean
  joined_date: string; notes: string | null; created_at: string; updated_at: string
}

export interface MealCategory {
  id: string; organization_id: string; name: string; description: string | null
  sort_order: number; is_active: boolean; created_at: string
}

export interface MealType {
  id: string; organization_id: string; name: string; code: MealTypeEnum
  meal_time: string; description: string | null; sort_order: number; is_active: boolean; created_at: string
}

export interface MealPlan {
  id: string; organization_id: string; festival_id: string
  plan_name: string; plan_date: string; meal_type_id: string | null; kitchen_id: string | null
  expected_attendance: number; actual_attendance: number; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface MealSession {
  id: string; organization_id: string; festival_id: string; kitchen_id: string
  meal_plan_id: string | null; session_name: string; meal_type: MealTypeEnum
  session_date: string; start_time: string; end_time: string
  status: MealSessionStatus; total_portions: number; served_portions: number
  cancelled_notes: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface Menu {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  menu_name: string; menu_date: string | null; meal_session_id: string | null
  category_id: string | null; status: MenuStatus; is_template: boolean
  notes: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface MenuItem {
  id: string; organization_id: string; menu_id: string
  item_name: string; description: string | null; diet_type: DietType | null
  is_vegetarian: boolean; is_vegan: boolean; is_gluten_free: boolean; is_halal: boolean
  allergens: string | null; calories: number | null; protein_g: number | null
  carbs_g: number | null; fat_g: number | null; serving_size: string | null
  preparation_time_minutes: number | null; instructions: string | null
  sort_order: number; is_active: boolean; created_at: string; updated_at: string
}

export interface Recipe {
  id: string; organization_id: string; festival_id: string; menu_item_id: string | null
  recipe_name: string; cuisine_type: string | null
  preparation_time: number | null; cooking_time: number | null
  servings: number; instructions: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface RecipeIngredient {
  id: string; organization_id: string; recipe_id: string
  ingredient_name: string; quantity: number; unit: IngredientUnit
  notes: string | null; created_at: string
}

export interface MealBooking {
  id: string; organization_id: string; festival_id: string; booking_number: string
  meal_session_id: string | null; menu_id: string | null
  participant_id: string | null; volunteer_id: string | null; judge_id: string | null
  guest_name: string | null; guest_phone: string | null; guest_email: string | null
  requester_type: string; requester_id: string | null
  num_meals: number; diet_type: DietType | null; diet_notes: string | null
  status: MealBookingStatus; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface MealCoupon {
  id: string; organization_id: string; festival_id: string; coupon_code: string
  booking_id: string | null; meal_session_id: string | null; menu_id: string | null
  qr_code: string; barcode: string | null; holder_name: string; holder_type: string
  diet_type: DietType | null; is_printed: boolean; is_digital: boolean
  status: CouponStatus; issued_at: string; expires_at: string | null
  redeemed_at: string | null; redeemed_by: string | null; redemption_point_id: string | null
  notes: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface CouponRedemption {
  id: string; organization_id: string; festival_id: string; coupon_id: string
  session_id: string | null; distribution_point_id: string | null
  redeemed_by: string | null; redeemed_at: string
  verification_method: string; notes: string | null
}

export interface MealAttendance {
  id: string; organization_id: string; festival_id: string; meal_session_id: string
  booking_id: string | null; coupon_id: string | null
  participant_id: string | null; volunteer_id: string | null
  attended_at: string; attended_by: string | null; diet_type: DietType | null; notes: string | null
}

export interface DiningHall {
  id: string; organization_id: string; festival_id: string
  hall_name: string; hall_code: string; location: string | null
  capacity: number; current_occupancy: number; status: DiningHallStatus
  is_ac: boolean; has_wheelchair_access: boolean
  contact_person: string | null; contact_phone: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface DiningTable {
  id: string; organization_id: string; festival_id: string; hall_id: string
  table_number: string; capacity: number; current_occupancy: number
  is_available: boolean; created_at: string; updated_at: string
}

export interface FoodDistributionPoint {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  hall_id: string | null; point_name: string; point_code: string; location: string | null
  counter_type: string; status: DistributionPointStatus
  queue_length: number; estimated_wait_minutes: number
  opened_at: string | null; closed_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface MealDistributionLog {
  id: string; organization_id: string; festival_id: string
  distribution_point_id: string | null; meal_session_id: string | null; coupon_id: string | null
  participant_name: string; participant_type: string | null
  meal_count: number; diet_type: DietType | null
  served_at: string; served_by: string | null; notes: string | null
}

export interface SpecialDiet {
  id: string; organization_id: string; festival_id: string
  diet_name: string; diet_type: DietType; description: string | null
  guidelines: string | null; restrictions: string | null; is_active: boolean
  created_at: string; updated_at: string
}

export interface DietRequest {
  id: string; organization_id: string; festival_id: string
  participant_id: string | null; volunteer_id: string | null
  diet_type: DietType; diet_id: string | null; dietary_requirements: string | null
  allergies: string | null; medical_reason: string | null
  status: DietRequestStatus; approved_by: string | null; approved_at: string | null
  notes: string | null; created_at: string; updated_at: string
}

export interface FoodSupplier {
  id: string; organization_id: string; festival_id: string
  supplier_name: string; supplier_code: string; contact_person: string | null
  contact_phone: string | null; contact_email: string | null; address: string | null
  supply_categories: string | null; payment_terms: string | null
  is_active: boolean; rating: number; notes: string | null
  created_at: string; updated_at: string
}

export interface FoodOrder {
  id: string; organization_id: string; festival_id: string; order_number: string
  supplier_id: string | null; kitchen_id: string | null
  order_date: string; delivery_date: string | null
  status: string; total_amount: number; paid_amount: number; payment_status: string
  notes: string | null; ordered_by: string | null; created_at: string; updated_at: string
}

export interface FoodOrderItem {
  id: string; organization_id: string; order_id: string
  ingredient_name: string; quantity: number; unit: IngredientUnit
  unit_price: number; total_price: number; notes: string | null; created_at: string
}

export interface KitchenInventory {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  item_name: string; category: string | null; quantity: number; unit: IngredientUnit
  unit_price: number; total_value: number; min_stock_level: number; max_stock_level: number | null
  expiry_date: string | null; supplier_id: string | null; storage_location: string | null
  batch_number: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface IngredientStock {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  inventory_id: string | null; ingredient_name: string; quantity: number; unit: IngredientUnit
  unit_price: number; total_cost: number; stock_date: string; expiry_date: string | null
  batch_number: string | null; supplier_id: string | null; notes: string | null; created_at: string
}

export interface IngredientConsumption {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  inventory_id: string | null; meal_session_id: string | null
  ingredient_name: string; quantity: number; unit: IngredientUnit
  cost_per_unit: number; total_cost: number
  consumed_at: string; recorded_by: string | null; notes: string | null
}

export interface FoodPreparationLog {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  meal_session_id: string | null; menu_id: string | null
  item_name: string; quantity_prepared: number; quantity_served: number
  chef_name: string | null; preparation_start: string | null; preparation_end: string | null
  notes: string | null; created_by: string | null; created_at: string
}

export interface FoodWasteLog {
  id: string; organization_id: string; festival_id: string; kitchen_id: string | null
  meal_session_id: string | null; item_name: string; waste_category: WasteCategory
  quantity: number; unit: IngredientUnit; estimated_cost: number
  reason: string | null; notes: string | null; recorded_by: string | null; recorded_at: string
}

export interface NutritionInformation {
  id: string; organization_id: string; menu_item_id: string
  serving_size: string | null; calories: number | null; protein_g: number | null
  carbs_g: number | null; fat_g: number | null; fiber_g: number | null
  sugar_g: number | null; sodium_mg: number | null; cholesterol_mg: number | null
  vitamins: string | null; allergens: string | null
  created_at: string; updated_at: string
}

export interface MealFeedback {
  id: string; organization_id: string; festival_id: string
  meal_session_id: string | null; menu_id: string | null; menu_item_id: string | null
  participant_id: string | null; volunteer_id: string | null; guest_name: string | null
  rating: number; taste_rating: number | null; quality_rating: number | null; service_rating: number | null
  comments: string | null; submitted_at: string
}

export interface Module19DashboardData {
  total_kitchens: number
  active_kitchens: number
  total_staff: number
  total_meal_sessions: number
  today_sessions: number
  active_sessions: number
  total_bookings: number
  today_bookings: number
  total_coupons: number
  active_coupons: number
  redeemed_coupons: number
  total_menus: number
  published_menus: number
  total_dining_halls: number
  open_halls: number
  total_distribution_points: number
  open_points: number
  meals_served_today: number
  total_diet_requests: number
  pending_diet_requests: number
  total_waste_logs: number
  total_waste_cost: number
  total_suppliers: number
  low_stock_items: number
  total_meal_feedback: number
  average_rating: number
}
