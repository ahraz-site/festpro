-- ============================================================
-- Module 18: Enterprise Accommodation, Room Allocation &
--            Transport Management
-- ============================================================

-- ENUMS
DO $$ BEGIN CREATE TYPE room_type_enum AS ENUM ('dormitory','standard','vip','judge','volunteer','staff','medical','guest'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE allocation_status AS ENUM ('confirmed','checked_in','checked_out','cancelled','no_show'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending','confirmed','cancelled','completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE vehicle_category AS ENUM ('bus','van','car','mini_bus','ambulance','utility'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE vehicle_status AS ENUM ('available','in_use','under_maintenance','out_of_service','retired'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE driver_status AS ENUM ('available','on_trip','off_duty','sick','vacation'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE trip_status AS ENUM ('scheduled','in_progress','completed','cancelled','delayed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transport_maintenance_type AS ENUM ('routine','repair','emergency','inspection','insurance'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transport_request_status AS ENUM ('pending','approved','rejected','assigned','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 1. ACCOMMODATION LOCATIONS (centers/venues)
-- ============================================================
CREATE TABLE accommodation_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_code TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  total_buildings INTEGER DEFAULT 0,
  total_rooms INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE accommodation_locations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. ACCOMMODATION BUILDINGS
-- ============================================================
CREATE TABLE accommodation_buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES accommodation_locations(id) ON DELETE CASCADE,
  building_name TEXT NOT NULL,
  building_code TEXT NOT NULL,
  total_floors INTEGER DEFAULT 1,
  total_rooms INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  building_type TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE accommodation_buildings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. BUILDING FLOORS
-- ============================================================
CREATE TABLE building_floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES accommodation_buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  floor_name TEXT,
  total_rooms INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE building_floors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. ROOM TYPES
-- ============================================================
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type room_type_enum NOT NULL DEFAULT 'standard',
  description TEXT,
  max_occupancy INTEGER NOT NULL DEFAULT 1,
  default_bed_count INTEGER DEFAULT 1,
  has_attached_bathroom BOOLEAN DEFAULT true,
  amenities JSONB DEFAULT '[]',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. ROOMS
-- ============================================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES accommodation_buildings(id) ON DELETE CASCADE,
  floor_id UUID REFERENCES building_floors(id) ON DELETE SET NULL,
  room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL,
  room_number TEXT NOT NULL,
  room_name TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  current_occupancy INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 1,
  available_beds INTEGER GENERATED ALWAYS AS (total_beds - current_occupancy) STORED,
  floor_area NUMERIC,
  is_accessible BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'available',
  notes TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. BEDS
-- ============================================================
CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  bed_type TEXT DEFAULT 'single',
  is_available BOOLEAN DEFAULT true,
  is_reserved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. ROOM FACILITIES
-- ============================================================
CREATE TABLE room_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  facility_name TEXT NOT NULL,
  facility_type TEXT,
  quantity INTEGER DEFAULT 1,
  is_working BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE room_facilities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. ROOM MAINTENANCE
-- ============================================================
CREATE TABLE room_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'reported',
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE room_maintenance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. ROOM ALLOCATIONS
-- ============================================================
CREATE TABLE room_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  occupant_type TEXT NOT NULL,
  occupant_id UUID,
  occupant_name TEXT NOT NULL,
  occupant_email TEXT,
  occupant_phone TEXT,
  allocation_type TEXT DEFAULT 'manual',
  status allocation_status NOT NULL DEFAULT 'confirmed',
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  expected_check_in TIMESTAMPTZ,
  expected_check_out TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. BED ALLOCATIONS
-- ============================================================
CREATE TABLE bed_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  allocation_id UUID NOT NULL REFERENCES room_allocations(id) ON DELETE CASCADE,
  occupant_name TEXT NOT NULL,
  occupant_type TEXT,
  occupant_id UUID,
  is_active BOOLEAN DEFAULT true,
  allocated_at TIMESTAMPTZ DEFAULT now(),
  released_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE bed_allocations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. ROOM CHANGE REQUESTS
-- ============================================================
CREATE TABLE room_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  allocation_id UUID NOT NULL REFERENCES room_allocations(id) ON DELETE CASCADE,
  from_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  to_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE room_change_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. CHECK-INS
-- ============================================================
CREATE TABLE room_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  allocation_id UUID NOT NULL REFERENCES room_allocations(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  occupant_name TEXT NOT NULL,
  occupant_type TEXT,
  occupant_id UUID,
  check_in_method TEXT DEFAULT 'manual',
  qr_code TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_photo TEXT,
  photo_url TEXT,
  checked_in_by UUID REFERENCES auth.users(id),
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE room_checkins ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. CHECK-OUTS
-- ============================================================
CREATE TABLE checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  allocation_id UUID NOT NULL REFERENCES room_allocations(id) ON DELETE CASCADE,
  checkin_id UUID REFERENCES room_checkins(id) ON DELETE SET NULL,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  occupant_name TEXT NOT NULL,
  occupant_type TEXT,
  occupant_id UUID,
  check_out_method TEXT DEFAULT 'manual',
  checked_out_by UUID REFERENCES auth.users(id),
  checked_out_at TIMESTAMPTZ DEFAULT now(),
  room_condition TEXT,
  keys_returned BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. OCCUPANCY LOGS (historical)
-- ============================================================
CREATE TABLE occupancy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  occupancy_count INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now(),
  logged_by UUID REFERENCES auth.users(id)
);
ALTER TABLE occupancy_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. TRANSPORT HUBS
-- ============================================================
CREATE TABLE transport_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  hub_name TEXT NOT NULL,
  hub_code TEXT NOT NULL UNIQUE,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transport_hubs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. ROUTES
-- ============================================================
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  route_code TEXT NOT NULL UNIQUE,
  from_hub_id UUID REFERENCES transport_hubs(id) ON DELETE SET NULL,
  to_hub_id UUID REFERENCES transport_hubs(id) ON DELETE SET NULL,
  distance_km NUMERIC,
  estimated_duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. ROUTE STOPS
-- ============================================================
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  estimated_arrival_time INTERVAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. VEHICLE CATEGORIES
-- ============================================================
CREATE TABLE vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category vehicle_category NOT NULL DEFAULT 'bus',
  description TEXT,
  seating_capacity INTEGER NOT NULL DEFAULT 1,
  baggage_capacity TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vehicle_categories(id) ON DELETE SET NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  registration_number TEXT NOT NULL UNIQUE,
  chassis_number TEXT,
  engine_number TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  seating_capacity INTEGER NOT NULL DEFAULT 1,
  fuel_type TEXT DEFAULT 'diesel',
  ownership_type TEXT DEFAULT 'owned',
  insurance_expiry DATE,
  fitness_expiry DATE,
  permit_expiry DATE,
  pollution_expiry DATE,
  status vehicle_status NOT NULL DEFAULT 'available',
  current_km_reading NUMERIC DEFAULT 0,
  last_service_km NUMERIC DEFAULT 0,
  last_service_date DATE,
  qr_code TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. VEHICLE DOCUMENTS
-- ============================================================
CREATE TABLE vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. DRIVERS
-- ============================================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  driver_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  license_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_group TEXT,
  photo_url TEXT,
  status driver_status NOT NULL DEFAULT 'available',
  total_trips INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. DRIVER DOCUMENTS
-- ============================================================
CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. DRIVER ASSIGNMENTS (vehicle assignment history)
-- ============================================================
CREATE TABLE driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. TRIP SCHEDULES
-- ============================================================
CREATE TABLE trip_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  trip_name TEXT NOT NULL,
  trip_type TEXT DEFAULT 'regular',
  scheduled_date DATE NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  estimated_arrival_time TIMESTAMPTZ,
  actual_departure_time TIMESTAMPTZ,
  actual_arrival_time TIMESTAMPTZ,
  status trip_status NOT NULL DEFAULT 'scheduled',
  max_passengers INTEGER DEFAULT 1,
  current_passengers INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE trip_schedules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. TRIP ASSIGNMENTS (which driver+vehicle on which trip)
-- ============================================================
CREATE TABLE trip_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE trip_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. TRIP LOGS
-- ============================================================
CREATE TABLE trip_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trip_schedules(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL,
  description TEXT,
  odometer_reading NUMERIC,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  logged_by UUID REFERENCES auth.users(id),
  logged_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE trip_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. FUEL LOGS
-- ============================================================
CREATE TABLE fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trip_schedules(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  fuel_type TEXT DEFAULT 'diesel',
  quantity_liters NUMERIC NOT NULL,
  cost_per_liter NUMERIC NOT NULL,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_liters * cost_per_liter) STORED,
  odometer_reading NUMERIC,
  fuel_station TEXT,
  receipt_url TEXT,
  refilled_by UUID REFERENCES auth.users(id),
  refilled_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 28. VEHICLE MAINTENANCE
-- ============================================================
CREATE TABLE vehicle_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  transport_maintenance_type transport_maintenance_type NOT NULL DEFAULT 'routine',
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  odometer_at_service NUMERIC,
  cost NUMERIC DEFAULT 0,
  vendor_name TEXT,
  invoice_number TEXT,
  invoice_url TEXT,
  next_service_date DATE,
  next_service_km NUMERIC,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 29. TRANSPORT REQUESTS
-- ============================================================
CREATE TABLE transport_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL UNIQUE,
  requester_type TEXT NOT NULL,
  requester_id UUID,
  requester_name TEXT NOT NULL,
  requester_phone TEXT,
  requester_email TEXT,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  num_passengers INTEGER DEFAULT 1,
  vehicle_type TEXT,
  purpose TEXT,
  status transport_request_status NOT NULL DEFAULT 'pending',
  assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 30. TRANSPORT BOOKINGS
-- ============================================================
CREATE TABLE transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  request_id UUID REFERENCES transport_requests(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trip_schedules(id) ON DELETE SET NULL,
  booking_number TEXT NOT NULL UNIQUE,
  passenger_name TEXT NOT NULL,
  passenger_type TEXT,
  passenger_id UUID,
  passenger_phone TEXT,
  pickup_point TEXT,
  drop_point TEXT,
  booking_status booking_status NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 31. PICKUP POINTS
-- ============================================================
CREATE TABLE pickup_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 32. DROP POINTS
-- ============================================================
CREATE TABLE drop_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE drop_points ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 33. GPS TRACKING LOGS
-- ============================================================
CREATE TABLE gps_tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trip_schedules(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude NUMERIC,
  speed NUMERIC,
  heading NUMERIC,
  accuracy NUMERIC,
  logged_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE gps_tracking_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "org_access_all" ON accommodation_locations FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON accommodation_buildings FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON building_floors FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON room_types FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON rooms FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON beds FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON room_facilities FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON room_maintenance FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON room_allocations FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON bed_allocations FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON room_change_requests FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON room_checkins FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON checkouts FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON occupancy_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON transport_hubs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON routes FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON route_stops FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vehicle_categories FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vehicles FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vehicle_documents FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON drivers FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON driver_documents FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON driver_assignments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON trip_schedules FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON trip_assignments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON trip_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON fuel_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON vehicle_maintenance FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON transport_requests FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON transport_bookings FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON pickup_points FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON drop_points FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON gps_tracking_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE TRIGGER update_accommodation_locations_updated_at BEFORE UPDATE ON accommodation_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_accommodation_buildings_updated_at BEFORE UPDATE ON accommodation_buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_room_maintenance_updated_at BEFORE UPDATE ON room_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_room_allocations_updated_at BEFORE UPDATE ON room_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bed_allocations_updated_at BEFORE UPDATE ON bed_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_room_change_requests_updated_at BEFORE UPDATE ON room_change_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transport_hubs_updated_at BEFORE UPDATE ON transport_hubs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_trip_schedules_updated_at BEFORE UPDATE ON trip_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transport_requests_updated_at BEFORE UPDATE ON transport_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transport_bookings_updated_at BEFORE UPDATE ON transport_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicle_maintenance_updated_at BEFORE UPDATE ON vehicle_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
