export type MedicalCenterType = "medical_desk" | "first_aid_station" | "emergency_clinic" | "isolation_room" | "mobile_medical_unit" | "ambulance_station"
export type MedicalCenterStatus = "active" | "inactive" | "under_maintenance" | "closed"
export type MedicalStaffRole = "medical_director" | "doctor" | "nurse" | "paramedic" | "medical_volunteer" | "emergency_coordinator" | "security"
export type PatientType = "participant" | "judge" | "volunteer" | "guest" | "visitor" | "staff"
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
export type MedicalCaseStatus = "open" | "in_treatment" | "referred" | "discharged" | "closed"
export type CaseSeverity = "minor" | "moderate" | "serious" | "critical" | "deceased"
export type MedicineCategory = "tablet" | "capsule" | "syrup" | "injection" | "cream" | "ointment" | "drops" | "spray" | "inhaler" | "other"
export type MedicineTransactionType = "received" | "issued" | "returned" | "expired" | "damaged" | "transferred"
export type IncidentCategory = "medical" | "fire" | "security" | "accident" | "missing_person" | "natural_disaster" | "technical_failure" | "other_emergency"
export type IncidentSeverity = "low" | "medium" | "high" | "critical"
export type IncidentStatus = "reported" | "investigating" | "assigned" | "in_progress" | "resolved" | "closed"
export type AmbulanceStatus = "available" | "en_route" | "on_scene" | "transporting" | "unavailable" | "maintenance"
export type EmergencyDispatchStatus = "pending" | "dispatched" | "en_route" | "on_scene" | "completed" | "cancelled"

export interface MedicalCenter {
  id: string; organization_id: string; festival_id: string; center_code: string
  center_name: string; center_type: MedicalCenterType; location: string | null
  latitude: number | null; longitude: number | null; capacity: number; current_occupancy: number
  phone: string | null; contact_person: string | null; opening_time: string | null; closing_time: string | null
  status: MedicalCenterStatus; is_24h: boolean; has_ambulance_access: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface MedicalStaff {
  id: string; organization_id: string; festival_id: string; center_id: string | null
  user_id: string | null; staff_code: string; full_name: string; role: MedicalStaffRole
  specializations: string | null; license_number: string | null; phone: string; email: string | null
  is_active: boolean; notes: string | null; created_at: string; updated_at: string
}

export interface MedicalSpecialization {
  id: string; organization_id: string; staff_id: string; specialization: string
  certificate: string | null; is_verified: boolean; created_at: string
}

export interface MedicalShift {
  id: string; organization_id: string; festival_id: string; staff_id: string; center_id: string | null
  shift_date: string; start_time: string; end_time: string; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface MedicalInventory {
  id: string; organization_id: string; festival_id: string; center_id: string | null
  item_name: string; category: string; quantity: number; unit: string; unit_price: number
  total_value: number; min_stock_level: number; max_stock_level: number | null
  expiry_date: string | null; batch_number: string | null; supplier: string | null
  storage_condition: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface MedicalSupplier {
  id: string; organization_id: string; festival_id: string; supplier_name: string; supplier_code: string
  contact_person: string | null; contact_phone: string | null; contact_email: string | null
  address: string | null; supply_categories: string | null; payment_terms: string | null
  is_active: boolean; notes: string | null; created_at: string; updated_at: string
}

export interface Patient {
  id: string; organization_id: string; festival_id: string; patient_code: string; full_name: string
  patient_type: PatientType; participant_id: string | null; volunteer_id: string | null
  phone: string | null; email: string | null; date_of_birth: string | null; gender: string | null
  blood_group: BloodGroup | null; height: number | null; weight: number | null
  emergency_contact_name: string | null; emergency_contact_phone: string | null; emergency_contact_relation: string | null
  address: string | null; city: string | null; state: string | null; nationality: string | null
  id_proof_type: string | null; id_proof_number: string | null; known_allergies: string | null
  existing_conditions: string | null; medications: string | null; insurance_provider: string | null
  insurance_policy_number: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface MedicalCase {
  id: string; organization_id: string; festival_id: string; case_number: string
  patient_id: string; center_id: string | null; reported_at: string; chief_complaint: string
  symptoms: string | null; severity: CaseSeverity; diagnosis: string | null
  status: MedicalCaseStatus; assigned_doctor_id: string | null; assigned_nurse_id: string | null
  is_emergency: boolean; incident_id: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface MedicalCaseHistory {
  id: string; organization_id: string; case_id: string; action: string; description: string | null
  performed_by: string | null; performed_by_name: string | null; performed_at: string; notes: string | null
}

export interface MedicalObservation {
  id: string; organization_id: string; case_id: string; observation_type: string; observation_value: string
  unit: string | null; notes: string | null; observed_by: string | null; observed_at: string
}

export interface MedicalTreatment {
  id: string; organization_id: string; case_id: string; treatment_name: string; treatment_type: string
  description: string | null; performed_by: string | null; performed_at: string | null
  follow_up_date: string | null; notes: string | null; created_at: string
}

export interface Prescription {
  id: string; organization_id: string; case_id: string; prescription_number: string
  medication_name: string; dosage: string; frequency: string; duration: string | null; route: string | null
  quantity: number; notes: string | null; prescribed_by: string | null; prescribed_at: string | null; created_at: string
}

export interface Medication {
  id: string; organization_id: string; festival_id: string; medication_name: string; generic_name: string | null
  category: MedicineCategory; dosage_form: string | null; strength: string | null; manufacturer: string | null
  is_active: boolean; notes: string | null; created_at: string; updated_at: string
}

export interface MedicineInventory {
  id: string; organization_id: string; festival_id: string; center_id: string | null
  medication_id: string | null; batch_number: string; quantity: number; unit_price: number
  expiry_date: string; manufacturer: string | null; supplier_id: string | null
  storage_location: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface MedicineTransaction {
  id: string; organization_id: string; festival_id: string; inventory_id: string | null
  transaction_type: MedicineTransactionType; quantity: number; unit_price: number; total_price: number
  case_id: string | null; patient_id: string | null; performed_by: string | null; notes: string | null; created_at: string
}

export interface Allergy {
  id: string; organization_id: string; festival_id: string; patient_id: string; allergy_name: string
  allergy_type: string | null; severity: string; reaction: string | null; notes: string | null; created_at: string
}

export interface MedicalCondition {
  id: string; organization_id: string; festival_id: string; patient_id: string; condition_name: string
  diagnosed_date: string | null; is_chronic: boolean; is_active: boolean; notes: string | null; created_at: string
}

export interface EmergencyContact {
  id: string; organization_id: string; festival_id: string; patient_id: string; contact_name: string
  relation: string; phone: string; alternate_phone: string | null; email: string | null
  address: string | null; is_primary: boolean; notes: string | null; created_at: string
}

export interface Ambulance {
  id: string; organization_id: string; festival_id: string; ambulance_code: string; vehicle_number: string
  ambulance_type: string; capacity: number; equipment_level: string | null; is_active: boolean
  status: AmbulanceStatus; current_latitude: number | null; current_longitude: number | null
  last_location_update: string | null; has_gps: boolean; insurance_expiry: string | null
  fitness_expiry: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface AmbulanceDriver {
  id: string; organization_id: string; festival_id: string; ambulance_id: string | null
  full_name: string; phone: string; license_number: string; license_type: string | null
  is_active: boolean; notes: string | null; created_at: string; updated_at: string
}

export interface AmbulanceTrip {
  id: string; organization_id: string; festival_id: string; trip_number: string
  ambulance_id: string | null; driver_id: string | null; case_id: string | null
  pickup_location: string; dropoff_location: string; dispatch_time: string; arrival_time: string | null
  completion_time: string | null; status: EmergencyDispatchStatus; distance_km: number | null; notes: string | null
  created_at: string; updated_at: string
}

export interface IncidentCategoryRecord {
  id: string; organization_id: string; category_name: string; category_type: IncidentCategory
  description: string | null; requires_medical: boolean; requires_security: boolean; requires_fire: boolean
  escalation_level: number; is_active: boolean; created_at: string
}

export interface Incident {
  id: string; organization_id: string; festival_id: string; incident_number: string
  category_id: string | null; incident_type: IncidentCategory; title: string; description: string
  location: string | null; latitude: number | null; longitude: number | null; severity: IncidentSeverity
  status: IncidentStatus; reported_by: string | null; reported_by_name: string | null
  assigned_team_id: string | null; is_emergency: boolean; resolution_notes: string | null
  resolved_at: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface IncidentUpdate {
  id: string; organization_id: string; incident_id: string; update_text: string
  updated_by: string | null; updated_by_name: string | null; new_status: IncidentStatus | null; created_at: string
}

export interface IncidentAssignment {
  id: string; organization_id: string; incident_id: string; staff_id: string | null; team_id: string | null
  role: string | null; assigned_at: string; completed_at: string | null; notes: string | null
}

export interface IncidentEvidence {
  id: string; organization_id: string; incident_id: string; evidence_type: string; file_url: string | null
  description: string | null; uploaded_by: string | null; uploaded_at: string
}

export interface EmergencyResponseTeam {
  id: string; organization_id: string; festival_id: string; team_name: string; team_type: string
  leader_id: string | null; member_ids: string | null; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface EmergencyDispatchLog {
  id: string; organization_id: string; festival_id: string; incident_id: string | null; case_id: string | null
  dispatch_type: string; dispatched_to: string | null; dispatch_time: string; arrival_time: string | null
  completion_time: string | null; status: EmergencyDispatchStatus; notes: string | null
}

export interface HospitalReferral {
  id: string; organization_id: string; festival_id: string; referral_number: string
  case_id: string; patient_id: string; hospital_name: string; hospital_address: string | null
  hospital_phone: string | null; doctor_name: string | null; doctor_specialty: string | null
  referral_reason: string; case_summary: string | null; ambulance_id: string | null
  referred_by: string | null; referred_at: string | null; transfer_time: string | null
  status: string; follow_up_date: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface InsuranceRecord {
  id: string; organization_id: string; festival_id: string; patient_id: string; provider_name: string
  policy_number: string; group_number: string | null; coverage_type: string | null
  valid_from: string | null; valid_until: string | null; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface MedicalCertificate {
  id: string; organization_id: string; festival_id: string; certificate_number: string
  case_id: string | null; patient_id: string; certificate_type: string; issue_date: string
  valid_until: string | null; diagnosis: string | null; recommendation: string | null
  issued_by: string | null; notes: string | null; created_at: string; updated_at: string
}

export interface Module20DashboardData {
  total_centers: number; active_centers: number; total_staff: number; total_doctors: number
  total_patients: number; total_cases: number; open_cases: number; emergency_cases: number
  cases_today: number; total_incidents: number; open_incidents: number; critical_incidents: number
  total_ambulances: number; available_ambulances: number; active_trips: number
  total_medications: number; low_stock_items: number; total_referrals: number; pending_referrals: number
  total_certificates: number
}
