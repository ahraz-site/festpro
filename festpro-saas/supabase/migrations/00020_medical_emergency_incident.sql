-- ============================================================
-- MODULE 20: Enterprise Medical Desk, Emergency Response & Incident Management
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE medical_center_type AS ENUM ('medical_desk', 'first_aid_station', 'emergency_clinic', 'isolation_room', 'mobile_medical_unit', 'ambulance_station');
CREATE TYPE medical_center_status AS ENUM ('active', 'inactive', 'under_maintenance', 'closed');
CREATE TYPE medical_staff_role AS ENUM ('medical_director', 'doctor', 'nurse', 'paramedic', 'medical_volunteer', 'emergency_coordinator', 'security');
CREATE TYPE patient_type AS ENUM ('participant', 'judge', 'volunteer', 'guest', 'visitor', 'staff');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE medical_case_status AS ENUM ('open', 'in_treatment', 'referred', 'discharged', 'closed');
CREATE TYPE case_severity AS ENUM ('minor', 'moderate', 'serious', 'critical', 'deceased');
CREATE TYPE medicine_category AS ENUM ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'spray', 'inhaler', 'other');
CREATE TYPE medicine_transaction_type AS ENUM ('received', 'issued', 'returned', 'expired', 'damaged', 'transferred');
CREATE TYPE incident_category AS ENUM ('medical', 'fire', 'security', 'accident', 'missing_person', 'natural_disaster', 'technical_failure', 'other_emergency');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE ambulance_status AS ENUM ('available', 'en_route', 'on_scene', 'transporting', 'unavailable', 'maintenance');
CREATE TYPE emergency_dispatch_status AS ENUM ('pending', 'dispatched', 'en_route', 'on_scene', 'completed', 'cancelled');

-- ============================================================
-- 1. MEDICAL CENTERS
-- ============================================================

CREATE TABLE medical_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  center_code TEXT NOT NULL UNIQUE,
  center_name TEXT NOT NULL,
  center_type medical_center_type NOT NULL DEFAULT 'first_aid_station',
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  capacity INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  phone TEXT,
  contact_person TEXT,
  opening_time TIME,
  closing_time TIME,
  status medical_center_status NOT NULL DEFAULT 'active',
  is_24h BOOLEAN DEFAULT false,
  has_ambulance_access BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_centers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. MEDICAL STAFF
-- ============================================================

CREATE TABLE medical_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  center_id UUID REFERENCES medical_centers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role medical_staff_role NOT NULL DEFAULT 'nurse',
  specializations TEXT,
  license_number TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_staff ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. MEDICAL SPECIALIZATIONS
-- ============================================================

CREATE TABLE medical_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES medical_staff(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  certificate TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_specializations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. MEDICAL SHIFTS
-- ============================================================

CREATE TABLE medical_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES medical_staff(id) ON DELETE CASCADE,
  center_id UUID REFERENCES medical_centers(id) ON DELETE SET NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_shifts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. MEDICAL INVENTORY (supplies)
-- ============================================================

CREATE TABLE medical_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  center_id UUID REFERENCES medical_centers(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  expiry_date DATE,
  batch_number TEXT,
  supplier TEXT,
  storage_condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. MEDICAL SUPPLIERS
-- ============================================================

CREATE TABLE medical_suppliers (
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
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_suppliers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. PATIENTS
-- ============================================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  patient_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  patient_type patient_type NOT NULL DEFAULT 'participant',
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  volunteer_id UUID REFERENCES volunteer_profiles(id) ON DELETE SET NULL,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_group blood_group,
  height NUMERIC,
  weight NUMERIC,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  nationality TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  known_allergies TEXT,
  existing_conditions TEXT,
  medications TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. MEDICAL CASES
-- ============================================================

CREATE TABLE medical_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  center_id UUID REFERENCES medical_centers(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  chief_complaint TEXT NOT NULL,
  symptoms TEXT,
  severity case_severity NOT NULL DEFAULT 'minor',
  diagnosis TEXT,
  status medical_case_status NOT NULL DEFAULT 'open',
  assigned_doctor_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  assigned_nurse_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  is_emergency BOOLEAN DEFAULT false,
  incident_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_cases ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. MEDICAL CASE HISTORY
-- ============================================================

CREATE TABLE medical_case_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT,
  performed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);
ALTER TABLE medical_case_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. MEDICAL OBSERVATIONS
-- ============================================================

CREATE TABLE medical_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  observation_type TEXT NOT NULL,
  observation_value TEXT NOT NULL,
  unit TEXT,
  notes TEXT,
  observed_by UUID REFERENCES auth.users(id),
  observed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_observations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. MEDICAL TREATMENTS
-- ============================================================

CREATE TABLE medical_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  treatment_name TEXT NOT NULL,
  treatment_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT now(),
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_treatments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. PRESCRIPTIONS
-- ============================================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  prescription_number TEXT NOT NULL UNIQUE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  route TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  prescribed_by UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  prescribed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. MEDICATIONS (master list)
-- ============================================================

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  generic_name TEXT,
  category medicine_category NOT NULL DEFAULT 'tablet',
  dosage_form TEXT,
  strength TEXT,
  manufacturer TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. MEDICINE INVENTORY
-- ============================================================

CREATE TABLE medicine_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  center_id UUID REFERENCES medical_centers(id) ON DELETE SET NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  expiry_date DATE NOT NULL,
  manufacturer TEXT,
  supplier_id UUID REFERENCES medical_suppliers(id) ON DELETE SET NULL,
  storage_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medicine_inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. MEDICINE TRANSACTIONS
-- ============================================================

CREATE TABLE medicine_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES medicine_inventory(id) ON DELETE SET NULL,
  transaction_type medicine_transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  case_id UUID REFERENCES medical_cases(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medicine_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. ALLERGIES
-- ============================================================

CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergy_name TEXT NOT NULL,
  allergy_type TEXT,
  severity TEXT DEFAULT 'moderate',
  reaction TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. MEDICAL CONDITIONS
-- ============================================================

CREATE TABLE medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosed_date DATE,
  is_chronic BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. EMERGENCY CONTACTS
-- ============================================================

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. AMBULANCES
-- ============================================================

CREATE TABLE ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  ambulance_code TEXT NOT NULL UNIQUE,
  vehicle_number TEXT NOT NULL,
  ambulance_type TEXT NOT NULL DEFAULT 'basic_life_support',
  capacity INTEGER DEFAULT 1,
  equipment_level TEXT,
  is_active BOOLEAN DEFAULT true,
  status ambulance_status NOT NULL DEFAULT 'available',
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  last_location_update TIMESTAMPTZ,
  has_gps BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  fitness_expiry DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. AMBULANCE DRIVERS
-- ============================================================

CREATE TABLE ambulance_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_type TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ambulance_drivers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. AMBULANCE TRIPS
-- ============================================================

CREATE TABLE ambulance_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  trip_number TEXT NOT NULL UNIQUE,
  ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES ambulance_drivers(id) ON DELETE SET NULL,
  case_id UUID REFERENCES medical_cases(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  dispatch_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  status emergency_dispatch_status NOT NULL DEFAULT 'pending',
  distance_km NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ambulance_trips ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. INCIDENT CATEGORIES
-- ============================================================

CREATE TABLE incident_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_type incident_category NOT NULL,
  description TEXT,
  requires_medical BOOLEAN DEFAULT false,
  requires_security BOOLEAN DEFAULT false,
  requires_fire BOOLEAN DEFAULT false,
  escalation_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE incident_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. INCIDENTS
-- ============================================================

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  incident_number TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES incident_categories(id) ON DELETE SET NULL,
  incident_type incident_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  severity incident_severity NOT NULL DEFAULT 'medium',
  status incident_status NOT NULL DEFAULT 'reported',
  reported_by UUID REFERENCES auth.users(id),
  reported_by_name TEXT,
  assigned_team_id UUID,
  is_emergency BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. INCIDENT UPDATES
-- ============================================================

CREATE TABLE incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_by_name TEXT,
  new_status incident_status,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. INCIDENT ASSIGNMENTS
-- ============================================================

CREATE TABLE incident_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  team_id UUID,
  role TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);
ALTER TABLE incident_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. INCIDENT EVIDENCE
-- ============================================================

CREATE TABLE incident_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  file_url TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. EMERGENCY RESPONSE TEAMS
-- ============================================================

CREATE TABLE emergency_response_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_type TEXT NOT NULL DEFAULT 'medical',
  leader_id UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  member_ids TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE emergency_response_teams ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 28. EMERGENCY DISPATCH LOGS
-- ============================================================

CREATE TABLE emergency_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  case_id UUID REFERENCES medical_cases(id) ON DELETE SET NULL,
  dispatch_type TEXT NOT NULL,
  dispatched_to TEXT,
  dispatch_time TIMESTAMPTZ DEFAULT now(),
  arrival_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  status emergency_dispatch_status NOT NULL DEFAULT 'pending',
  notes TEXT
);
ALTER TABLE emergency_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 29. HOSPITAL REFERRALS
-- ============================================================

CREATE TABLE hospital_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  referral_number TEXT NOT NULL UNIQUE,
  case_id UUID NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  hospital_address TEXT,
  hospital_phone TEXT,
  doctor_name TEXT,
  doctor_specialty TEXT,
  referral_reason TEXT NOT NULL,
  case_summary TEXT,
  ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
  referred_by UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  referred_at TIMESTAMPTZ DEFAULT now(),
  transfer_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE hospital_referrals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 30. INSURANCE RECORDS
-- ============================================================

CREATE TABLE insurance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  coverage_type TEXT,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE insurance_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 31. MEDICAL CERTIFICATES
-- ============================================================

CREATE TABLE medical_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  case_id UUID REFERENCES medical_cases(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  diagnosis TEXT,
  recommendation TEXT,
  issued_by UUID REFERENCES medical_staff(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_medical_centers_festival ON medical_centers(festival_id);
CREATE INDEX idx_medical_staff_center ON medical_staff(center_id);
CREATE INDEX idx_medical_shifts_staff ON medical_shifts(staff_id);
CREATE INDEX idx_medical_inventory_center ON medical_inventory(center_id);
CREATE INDEX idx_patients_festival ON patients(festival_id);
CREATE INDEX idx_medical_cases_festival ON medical_cases(festival_id);
CREATE INDEX idx_medical_cases_patient ON medical_cases(patient_id);
CREATE INDEX idx_medical_case_history_case ON medical_case_history(case_id);
CREATE INDEX idx_medical_observations_case ON medical_observations(case_id);
CREATE INDEX idx_medical_treatments_case ON medical_treatments(case_id);
CREATE INDEX idx_prescriptions_case ON prescriptions(case_id);
CREATE INDEX idx_medicine_inventory_center ON medicine_inventory(center_id);
CREATE INDEX idx_medicine_transactions_case ON medicine_transactions(case_id);
CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_medical_conditions_patient ON medical_conditions(patient_id);
CREATE INDEX idx_emergency_contacts_patient ON emergency_contacts(patient_id);
CREATE INDEX idx_ambulances_festival ON ambulances(festival_id);
CREATE INDEX idx_ambulance_trips_festival ON ambulance_trips(festival_id);
CREATE INDEX idx_incidents_festival ON incidents(festival_id);
CREATE INDEX idx_incident_updates_incident ON incident_updates(incident_id);
CREATE INDEX idx_hospital_referrals_festival ON hospital_referrals(festival_id);
CREATE INDEX idx_insurance_records_patient ON insurance_records(patient_id);
CREATE INDEX idx_medical_certificates_patient ON medical_certificates(patient_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

CREATE POLICY "org_access_all" ON medical_centers FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_staff FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_specializations FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_shifts FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_inventory FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_suppliers FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON patients FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_cases FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_case_history FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_observations FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_treatments FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON prescriptions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medications FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medicine_inventory FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medicine_transactions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON allergies FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_conditions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON emergency_contacts FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ambulances FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ambulance_drivers FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON ambulance_trips FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON incident_categories FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON incidents FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON incident_updates FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON incident_assignments FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON incident_evidence FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON emergency_response_teams FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON emergency_dispatch_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON hospital_referrals FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON insurance_records FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
CREATE POLICY "org_access_all" ON medical_certificates FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_medical_centers_updated_at BEFORE UPDATE ON medical_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medical_staff_updated_at BEFORE UPDATE ON medical_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medical_shifts_updated_at BEFORE UPDATE ON medical_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medical_inventory_updated_at BEFORE UPDATE ON medical_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medical_suppliers_updated_at BEFORE UPDATE ON medical_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medical_cases_updated_at BEFORE UPDATE ON medical_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medicine_inventory_updated_at BEFORE UPDATE ON medicine_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ambulances_updated_at BEFORE UPDATE ON ambulances FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ambulance_drivers_updated_at BEFORE UPDATE ON ambulance_drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ambulance_trips_updated_at BEFORE UPDATE ON ambulance_trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_emergency_response_teams_updated_at BEFORE UPDATE ON emergency_response_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hospital_referrals_updated_at BEFORE UPDATE ON hospital_referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_insurance_records_updated_at BEFORE UPDATE ON insurance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_medical_certificates_updated_at BEFORE UPDATE ON medical_certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
