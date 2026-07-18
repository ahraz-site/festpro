-- ============================================================
-- MODULE 19: Enterprise Food, Catering, Kitchen & Meal Management
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE kitchen_status AS ENUM ('active', 'inactive', 'under_maintenance', 'closed');
CREATE TYPE kitchen_staff_role AS ENUM ('manager', 'chef', 'cook', 'assistant', 'cleaner', 'volunteer');
CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'morning_tea', 'lunch', 'evening_tea', 'dinner', 'midnight_meal', 'special_meal', 'vip_meal');
CREATE TYPE meal_session_status AS ENUM ('planned', 'preparing', 'ready', 'serving', 'completed', 'cancelled');
CREATE TYPE menu_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE meal_booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show', 'attended');
CREATE TYPE coupon_status AS ENUM ('active', 'redeemed', 'expired', 'cancelled');
CREATE TYPE distribution_point_status AS ENUM ('open', 'closed', 'paused');
CREATE TYPE diet_type AS ENUM ('vegetarian', 'vegan', 'halal', 'gluten_free', 'diabetic', 'allergy_based', 'custom');
CREATE TYPE diet_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE ingredient_unit AS ENUM ('kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'packet', 'carton', 'bag', 'bottle');
CREATE TYPE waste_category AS ENUM ('preparation', 'spoilage', 'overproduction', 'serving_waste', 'expired');
CREATE TYPE dining_hall_status AS ENUM ('open', 'closed', 'cleaning', 'maintenance');

-- ============================================================
-- 1. KITCHENS
-- ============================================================

CREATE TABLE kitchens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_code TEXT NOT NULL UNIQUE,
  kitchen_name TEXT NOT NULL,
  description TEXT,
  kitchen_type TEXT NOT NULL DEFAULT 'main',
  location TEXT,
  capacity INTEGER DEFAULT 0,
  preparation_areas INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  opening_time TIME,
  closing_time TIME,
  contact_person TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE kitchens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. KITCHEN STAFF
-- ============================================================

CREATE TABLE kitchen_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role kitchen_staff_role NOT NULL DEFAULT 'assistant',
  phone TEXT,
  email TEXT,
  shift_start TIME,
  shift_end TIME,
  is_active BOOLEAN DEFAULT true,
  joined_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE kitchen_staff ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. MEAL CATEGORIES
-- ============================================================

CREATE TABLE meal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. MEAL TYPES
-- ============================================================

CREATE TABLE meal_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code meal_type_enum NOT NULL,
  meal_time TIME NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_types ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. MEAL PLANS
-- ============================================================

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_date DATE NOT NULL,
  meal_type_id UUID REFERENCES meal_types(id) ON DELETE SET NULL,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  expected_attendance INTEGER DEFAULT 0,
  actual_attendance INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. MEAL SESSIONS
-- ============================================================

CREATE TABLE meal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  session_name TEXT NOT NULL,
  meal_type meal_type_enum NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status meal_session_status NOT NULL DEFAULT 'planned',
  total_portions INTEGER DEFAULT 0,
  served_portions INTEGER DEFAULT 0,
  cancelled_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. MENUS
-- ============================================================

CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  menu_name TEXT NOT NULL,
  menu_date DATE,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  category_id UUID REFERENCES meal_categories(id) ON DELETE SET NULL,
  status menu_status NOT NULL DEFAULT 'draft',
  is_template BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. MENU ITEMS
-- ============================================================

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  diet_type diet_type,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_halal BOOLEAN DEFAULT false,
  allergens TEXT,
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  serving_size TEXT,
  preparation_time_minutes INTEGER,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. RECIPES
-- ============================================================

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  recipe_name TEXT NOT NULL,
  cuisine_type TEXT,
  preparation_time INTEGER,
  cooking_time INTEGER,
  servings INTEGER DEFAULT 1,
  instructions TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. RECIPE INGREDIENTS
-- ============================================================

CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit ingredient_unit NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. MEAL BOOKINGS
-- ============================================================

CREATE TABLE meal_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  booking_number TEXT NOT NULL UNIQUE,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES volunteer_profiles(id) ON DELETE SET NULL,
  judge_id UUID,
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  requester_type TEXT NOT NULL DEFAULT 'participant',
  requester_id UUID,
  num_meals INTEGER NOT NULL DEFAULT 1,
  diet_type diet_type,
  diet_notes TEXT,
  status meal_booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. MEAL COUPONS
-- ============================================================

CREATE TABLE meal_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL UNIQUE,
  booking_id UUID REFERENCES meal_bookings(id) ON DELETE SET NULL,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  qr_code TEXT NOT NULL UNIQUE,
  barcode TEXT,
  holder_name TEXT NOT NULL,
  holder_type TEXT NOT NULL,
  diet_type diet_type,
  is_printed BOOLEAN DEFAULT false,
  is_digital BOOLEAN DEFAULT true,
  status coupon_status NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES auth.users(id),
  redemption_point_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_coupons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. COUPON REDEMPTIONS
-- ============================================================

CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES meal_coupons(id) ON DELETE CASCADE,
  session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  distribution_point_id UUID,
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  verification_method TEXT NOT NULL DEFAULT 'qr_scan',
  notes TEXT
);
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. MEAL ATTENDANCE
-- ============================================================

CREATE TABLE meal_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  meal_session_id UUID NOT NULL REFERENCES meal_sessions(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES meal_bookings(id) ON DELETE SET NULL,
  coupon_id UUID REFERENCES meal_coupons(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES volunteer_profiles(id) ON DELETE SET NULL,
  attended_at TIMESTAMPTZ DEFAULT now(),
  attended_by UUID REFERENCES auth.users(id),
  diet_type diet_type,
  notes TEXT
);
ALTER TABLE meal_attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. DINING HALLS
-- ============================================================

CREATE TABLE dining_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  hall_name TEXT NOT NULL,
  hall_code TEXT NOT NULL UNIQUE,
  location TEXT,
  capacity INTEGER NOT NULL DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  status dining_hall_status NOT NULL DEFAULT 'open',
  is_ac BOOLEAN DEFAULT false,
  has_wheelchair_access BOOLEAN DEFAULT true,
  contact_person TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE dining_halls ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. DINING TABLES
-- ============================================================

CREATE TABLE dining_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  hall_id UUID NOT NULL REFERENCES dining_halls(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  current_occupancy INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hall_id, table_number)
);
ALTER TABLE dining_tables ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. FOOD DISTRIBUTION POINTS
-- ============================================================

CREATE TABLE food_distribution_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  hall_id UUID REFERENCES dining_halls(id) ON DELETE SET NULL,
  point_name TEXT NOT NULL,
  point_code TEXT NOT NULL UNIQUE,
  location TEXT,
  counter_type TEXT NOT NULL DEFAULT 'regular',
  status distribution_point_status NOT NULL DEFAULT 'open',
  queue_length INTEGER DEFAULT 0,
  estimated_wait_minutes INTEGER DEFAULT 0,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE food_distribution_points ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. MEAL DISTRIBUTION LOGS
-- ============================================================

CREATE TABLE meal_distribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  distribution_point_id UUID REFERENCES food_distribution_points(id) ON DELETE SET NULL,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  coupon_id UUID REFERENCES meal_coupons(id) ON DELETE SET NULL,
  participant_name TEXT NOT NULL,
  participant_type TEXT,
  meal_count INTEGER DEFAULT 1,
  diet_type diet_type,
  served_at TIMESTAMPTZ DEFAULT now(),
  served_by UUID REFERENCES auth.users(id),
  notes TEXT
);
ALTER TABLE meal_distribution_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. SPECIAL DIETS
-- ============================================================

CREATE TABLE special_diets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  diet_name TEXT NOT NULL,
  diet_type diet_type NOT NULL,
  description TEXT,
  guidelines TEXT,
  restrictions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE special_diets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. DIET REQUESTS
-- ============================================================

CREATE TABLE diet_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES volunteer_profiles(id) ON DELETE SET NULL,
  diet_type diet_type NOT NULL,
  diet_id UUID REFERENCES special_diets(id) ON DELETE SET NULL,
  dietary_requirements TEXT,
  allergies TEXT,
  medical_reason TEXT,
  status diet_request_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE diet_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. FOOD SUPPLIERS
-- ============================================================

CREATE TABLE food_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  supplier_code TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  supply_categories TEXT,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE food_suppliers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. FOOD ORDERS
-- ============================================================

CREATE TABLE food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES food_suppliers(id) ON DELETE SET NULL,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  ordered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. FOOD ORDER ITEMS
-- ============================================================

CREATE TABLE food_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit ingredient_unit NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE food_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. KITCHEN INVENTORY
-- ============================================================

CREATE TABLE kitchen_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit ingredient_unit NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  min_stock_level NUMERIC DEFAULT 0,
  max_stock_level NUMERIC,
  expiry_date DATE,
  supplier_id UUID REFERENCES food_suppliers(id) ON DELETE SET NULL,
  storage_location TEXT,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE kitchen_inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. INGREDIENT STOCK
-- ============================================================

CREATE TABLE ingredient_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  inventory_id UUID REFERENCES kitchen_inventory(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit ingredient_unit NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  stock_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  batch_number TEXT,
  supplier_id UUID REFERENCES food_suppliers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ingredient_stock ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. INGREDIENT CONSUMPTION
-- ============================================================

CREATE TABLE ingredient_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  inventory_id UUID REFERENCES kitchen_inventory(id) ON DELETE SET NULL,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit ingredient_unit NOT NULL,
  cost_per_unit NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  consumed_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id),
  notes TEXT
);
ALTER TABLE ingredient_consumption ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. FOOD PREPARATION LOGS
-- ============================================================

CREATE TABLE food_preparation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity_prepared INTEGER NOT NULL,
  quantity_served INTEGER DEFAULT 0,
  chef_name TEXT,
  preparation_start TIMESTAMPTZ,
  preparation_end TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE food_preparation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 28. FOOD WASTE LOGS
-- ============================================================

CREATE TABLE food_waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  kitchen_id UUID REFERENCES kitchens(id) ON DELETE SET NULL,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  waste_category waste_category NOT NULL,
  quantity NUMERIC NOT NULL,
  unit ingredient_unit NOT NULL DEFAULT 'kg',
  estimated_cost NUMERIC DEFAULT 0,
  reason TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE food_waste_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 29. NUTRITION INFORMATION
-- ============================================================

CREATE TABLE nutrition_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  serving_size TEXT,
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sugar_g NUMERIC,
  sodium_mg NUMERIC,
  cholesterol_mg NUMERIC,
  vitamins TEXT,
  allergens TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE nutrition_information ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 30. MEAL FEEDBACK
-- ============================================================

CREATE TABLE meal_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  meal_session_id UUID REFERENCES meal_sessions(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES volunteer_profiles(id) ON DELETE SET NULL,
  guest_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  taste_rating INTEGER,
  quality_rating INTEGER,
  service_rating INTEGER,
  comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meal_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_kitchens_festival ON kitchens(festival_id);
CREATE INDEX idx_kitchen_staff_kitchen ON kitchen_staff(kitchen_id);
CREATE INDEX idx_meal_plans_festival ON meal_plans(festival_id);
CREATE INDEX idx_meal_sessions_festival ON meal_sessions(festival_id);
CREATE INDEX idx_meal_sessions_kitchen ON meal_sessions(kitchen_id);
CREATE INDEX idx_menus_festival ON menus(festival_id);
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_meal_bookings_festival ON meal_bookings(festival_id);
CREATE INDEX idx_meal_bookings_session ON meal_bookings(meal_session_id);
CREATE INDEX idx_meal_coupons_festival ON meal_coupons(festival_id);
CREATE INDEX idx_meal_coupons_booking ON meal_coupons(booking_id);
CREATE INDEX idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_meal_attendance_session ON meal_attendance(meal_session_id);
CREATE INDEX idx_dining_halls_festival ON dining_halls(festival_id);
CREATE INDEX idx_dining_tables_hall ON dining_tables(hall_id);
CREATE INDEX idx_food_distribution_points_festival ON food_distribution_points(festival_id);
CREATE INDEX idx_food_waste_logs_festival ON food_waste_logs(festival_id);
CREATE INDEX idx_ingredient_consumption_festival ON ingredient_consumption(festival_id);
CREATE INDEX idx_kitchen_inventory_festival ON kitchen_inventory(festival_id);
CREATE INDEX idx_food_orders_festival ON food_orders(festival_id);
CREATE INDEX idx_diet_requests_festival ON diet_requests(festival_id);
CREATE INDEX idx_meal_feedback_festival ON meal_feedback(festival_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

CREATE POLICY "org_access_all" ON kitchens FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON kitchen_staff FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_categories FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_types FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_plans FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_sessions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON menus FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON menu_items FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON recipes FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON recipe_ingredients FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_bookings FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_coupons FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON coupon_redemptions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_attendance FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON dining_halls FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON dining_tables FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON food_distribution_points FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_distribution_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON special_diets FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON diet_requests FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON food_suppliers FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON food_orders FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON food_order_items FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON kitchen_inventory FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ingredient_stock FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ingredient_consumption FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON food_preparation_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON food_waste_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON nutrition_information FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON meal_feedback FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_kitchens_updated_at BEFORE UPDATE ON kitchens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_kitchen_staff_updated_at BEFORE UPDATE ON kitchen_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meal_sessions_updated_at BEFORE UPDATE ON meal_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meal_bookings_updated_at BEFORE UPDATE ON meal_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meal_coupons_updated_at BEFORE UPDATE ON meal_coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_dining_halls_updated_at BEFORE UPDATE ON dining_halls FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_dining_tables_updated_at BEFORE UPDATE ON dining_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_food_distribution_points_updated_at BEFORE UPDATE ON food_distribution_points FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_special_diets_updated_at BEFORE UPDATE ON special_diets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_diet_requests_updated_at BEFORE UPDATE ON diet_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_food_suppliers_updated_at BEFORE UPDATE ON food_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_food_orders_updated_at BEFORE UPDATE ON food_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_kitchen_inventory_updated_at BEFORE UPDATE ON kitchen_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_nutrition_information_updated_at BEFORE UPDATE ON nutrition_information FOR EACH ROW EXECUTE FUNCTION update_updated_at();
