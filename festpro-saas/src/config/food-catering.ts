export const KITCHEN_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600" },
  { value: "under_maintenance", label: "Under Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-700" },
] as const

export const KITCHEN_STAFF_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "chef", label: "Chef" },
  { value: "cook", label: "Cook" },
  { value: "assistant", label: "Assistant" },
  { value: "cleaner", label: "Cleaner" },
  { value: "volunteer", label: "Volunteer" },
] as const

export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", time: "07:00" },
  { value: "morning_tea", label: "Morning Tea", time: "10:00" },
  { value: "lunch", label: "Lunch", time: "13:00" },
  { value: "evening_tea", label: "Evening Tea", time: "16:00" },
  { value: "dinner", label: "Dinner", time: "19:00" },
  { value: "midnight_meal", label: "Midnight Meal", time: "23:00" },
  { value: "special_meal", label: "Special Meal", time: "12:00" },
  { value: "vip_meal", label: "VIP Meal", time: "20:00" },
] as const

export const MEAL_SESSION_STATUSES = [
  { value: "planned", label: "Planned", color: "bg-blue-100 text-blue-700" },
  { value: "preparing", label: "Preparing", color: "bg-amber-100 text-amber-700" },
  { value: "ready", label: "Ready", color: "bg-green-100 text-green-700" },
  { value: "serving", label: "Serving", color: "bg-purple-100 text-purple-700" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const MENU_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-700" },
  { value: "archived", label: "Archived", color: "bg-amber-100 text-amber-700" },
] as const

export const MEAL_BOOKING_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "no_show", label: "No Show", color: "bg-gray-100 text-gray-600" },
  { value: "attended", label: "Attended", color: "bg-blue-100 text-blue-700" },
] as const

export const COUPON_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "redeemed", label: "Redeemed", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Expired", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const DIET_TYPES = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "diabetic", label: "Diabetic" },
  { value: "allergy_based", label: "Allergy Based" },
  { value: "custom", label: "Custom Diet" },
] as const

export const DIET_REQUEST_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
] as const

export const INGREDIENT_UNITS = [
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "l", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "pcs", label: "Pieces" },
  { value: "dozen", label: "Dozen" },
  { value: "packet", label: "Packet" },
  { value: "carton", label: "Carton" },
  { value: "bag", label: "Bag" },
  { value: "bottle", label: "Bottle" },
] as const

export const WASTE_CATEGORIES = [
  { value: "preparation", label: "Preparation Waste", color: "bg-amber-100 text-amber-700" },
  { value: "spoilage", label: "Spoilage", color: "bg-red-100 text-red-700" },
  { value: "overproduction", label: "Overproduction", color: "bg-orange-100 text-orange-700" },
  { value: "serving_waste", label: "Serving Waste", color: "bg-yellow-100 text-yellow-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
] as const

export const DINING_HALL_STATUSES = [
  { value: "open", label: "Open", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-700" },
  { value: "cleaning", label: "Cleaning", color: "bg-blue-100 text-blue-700" },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-700" },
] as const

export const DISTRIBUTION_POINT_STATUSES = [
  { value: "open", label: "Open", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-700" },
  { value: "paused", label: "Paused", color: "bg-amber-100 text-amber-700" },
] as const

export const FOOD_ORDER_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "delivered", label: "Delivered", color: "bg-purple-100 text-purple-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const KITCHEN_TYPES = [
  { value: "main", label: "Main Kitchen" },
  { value: "satellite", label: "Satellite Kitchen" },
  { value: "vip", label: "VIP Kitchen" },
  { value: "halal", label: "Halal Kitchen" },
  { value: "vegetarian", label: "Vegetarian Kitchen" },
] as const
