"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  MedicalCenter, MedicalStaff, MedicalSpecialization, MedicalShift, MedicalInventory,
  MedicalSupplier, Patient, MedicalCase, MedicalCaseHistory, MedicalObservation,
  MedicalTreatment, Prescription, Medication, MedicineInventory, MedicineTransaction,
  Allergy, MedicalCondition, EmergencyContact, Ambulance, AmbulanceDriver, AmbulanceTrip,
  IncidentCategory, Incident, IncidentUpdate, IncidentAssignment, IncidentEvidence,
  EmergencyResponseTeam, EmergencyDispatchLog, HospitalReferral, InsuranceRecord,
  MedicalCertificate, Module20DashboardData,
} from "@/types/medical-emergency"

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

// ============================================================
// DASHBOARD
// ============================================================

export async function getMedicalEmergencyDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [
    { count: tc }, { count: ac },
    { count: ts }, { count: td },
    { count: tp }, { count: tcas },
    { count: oc }, { count: ec },
    { count: ctdy }, { count: ti },
    { count: oi }, { count: ci },
    { count: ta }, { count: ava },
    { count: atr }, { count: tm },
    { count: lsi }, { count: trf },
    { count: prf }, { count: tcert },
  ] = await Promise.all([
    admin.from("medical_centers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("medical_centers").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("medical_staff").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("medical_staff").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("role", "doctor"),
    admin.from("patients").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("medical_cases").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("medical_cases").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["open", "in_treatment"]),
    admin.from("medical_cases").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_emergency", true),
    admin.from("medical_cases").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).gte("created_at", today),
    admin.from("incidents").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("incidents").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).not("status", "in", "('resolved','closed')"),
    admin.from("incidents").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("severity", "critical"),
    admin.from("ambulances").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("ambulances").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "available"),
    admin.from("ambulance_trips").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).not("status", "in", "('completed','cancelled')"),
    admin.from("medications").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("medicine_inventory").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).lt("quantity", 10),
    admin.from("hospital_referrals").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("hospital_referrals").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "pending"),
    admin.from("medical_certificates").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
  ])
  const dash: Module20DashboardData = {
    total_centers: tc || 0, active_centers: ac || 0, total_staff: ts || 0, total_doctors: td || 0,
    total_patients: tp || 0, total_cases: tcas || 0, open_cases: oc || 0, emergency_cases: ec || 0,
    cases_today: ctdy || 0, total_incidents: ti || 0, open_incidents: oi || 0, critical_incidents: ci || 0,
    total_ambulances: ta || 0, available_ambulances: ava || 0, active_trips: atr || 0,
    total_medications: tm || 0, low_stock_items: lsi || 0,
    total_referrals: trf || 0, pending_referrals: prf || 0, total_certificates: tcert || 0,
  }
  return { data: dash }
}

// ============================================================
// MEDICAL CENTERS
// ============================================================

export async function getMedicalCenters(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_centers").select("*").eq("festival_id", festivalId).order("center_name")
  if (error) return { error: error.message }
  return { data: data as MedicalCenter[] }
}

export async function createMedicalCenter(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("MC")
  const { data, error } = await admin.from("medical_centers").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    center_code: code, center_name: form.center_name, center_type: form.center_type || "first_aid_station",
    location: form.location || null, latitude: form.latitude || null, longitude: form.longitude || null,
    capacity: form.capacity || 0, phone: form.phone || null, contact_person: form.contact_person || null,
    opening_time: form.opening_time || null, closing_time: form.closing_time || null,
    is_24h: form.is_24h || false, has_ambulance_access: form.has_ambulance_access !== false,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as MedicalCenter }
}

// ============================================================
// MEDICAL STAFF
// ============================================================

export async function getMedicalStaff(festivalId: string, centerId?: string) {
  const admin = createAdminClient()
  let query = admin.from("medical_staff").select("*, medical_centers(center_name)").eq("festival_id", festivalId).order("full_name")
  if (centerId) query = query.eq("center_id", centerId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMedicalStaff(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("MS")
  const { data, error } = await admin.from("medical_staff").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    center_id: form.center_id || null, user_id: form.user_id || null, staff_code: code,
    full_name: form.full_name, role: form.role || "nurse",
    specializations: form.specializations || null, license_number: form.license_number || null,
    phone: form.phone, email: form.email || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as MedicalStaff }
}

// ============================================================
// PATIENTS
// ============================================================

export async function getPatients(festivalId: string, search?: string) {
  const admin = createAdminClient()
  let query = admin.from("patients").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (search) query = query.or(`full_name.ilike.%${search}%,patient_code.ilike.%${search}%,phone.ilike.%${search}%`)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as Patient[] }
}

export async function getPatient(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("patients").select("*, medical_cases(*), allergies(*), medical_conditions(*), emergency_contacts(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createPatient(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("PAT")
  const { data, error } = await admin.from("patients").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    patient_code: code, full_name: form.full_name, patient_type: form.patient_type || "participant",
    participant_id: form.participant_id || null, volunteer_id: form.volunteer_id || null,
    phone: form.phone || null, email: form.email || null, date_of_birth: form.date_of_birth || null,
    gender: form.gender || null, blood_group: form.blood_group || null,
    height: form.height || null, weight: form.weight || null,
    emergency_contact_name: form.emergency_contact_name || null,
    emergency_contact_phone: form.emergency_contact_phone || null,
    emergency_contact_relation: form.emergency_contact_relation || null,
    address: form.address || null, city: form.city || null, state: form.state || null,
    nationality: form.nationality || null, id_proof_type: form.id_proof_type || null,
    id_proof_number: form.id_proof_number || null, known_allergies: form.known_allergies || null,
    existing_conditions: form.existing_conditions || null, medications: form.medications || null,
    insurance_provider: form.insurance_provider || null, insurance_policy_number: form.insurance_policy_number || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as Patient }
}

// ============================================================
// MEDICAL CASES
// ============================================================

export async function getMedicalCases(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("medical_cases").select("*, patients(full_name, patient_code, blood_group), medical_centers(center_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getMedicalCase(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_cases").select("*, patients(*), medical_centers(*), medical_staff!assigned_doctor_id(*), medical_case_history(*), medical_observations(*), medical_treatments(*), prescriptions(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createMedicalCase(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const cn = generateNumber("CAS")
  const { data, error } = await admin.from("medical_cases").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    case_number: cn, patient_id: form.patient_id, center_id: form.center_id || null,
    chief_complaint: form.chief_complaint, symptoms: form.symptoms || null,
    severity: form.severity || "minor", assigned_doctor_id: form.assigned_doctor_id || null,
    assigned_nurse_id: form.assigned_nurse_id || null, is_emergency: form.is_emergency || false,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("medical_case_history").insert({
    organization_id: auth.organization_id, case_id: data.id,
    action: "created", description: "Medical case created", performed_by: auth.user.id,
    performed_by_name: form.created_by_name || "System",
  })
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as MedicalCase }
}

export async function updateMedicalCaseStatus(id: string, status: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_cases").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  await admin.from("medical_case_history").insert({
    organization_id: data.organization_id, case_id: id,
    action: "status_updated", description: `Status changed to ${status}`,
    performed_by: auth?.id, performed_by_name: "System",
  })
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as MedicalCase }
}

export async function addMedicalObservation(form: any) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_observations").insert({
    organization_id: form.organization_id, case_id: form.case_id,
    observation_type: form.observation_type, observation_value: form.observation_value,
    unit: form.unit || null, notes: form.notes || null, observed_by: auth?.id,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MedicalObservation }
}

export async function addMedicalTreatment(form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_treatments").insert({
    organization_id: form.organization_id, case_id: form.case_id,
    treatment_name: form.treatment_name, treatment_type: form.treatment_type,
    description: form.description || null, performed_by: form.performed_by || null,
    follow_up_date: form.follow_up_date || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MedicalTreatment }
}

export async function addPrescription(form: any) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const pn = generateNumber("RX")
  const { data, error } = await admin.from("prescriptions").insert({
    organization_id: form.organization_id, case_id: form.case_id,
    prescription_number: pn, medication_name: form.medication_name,
    dosage: form.dosage, frequency: form.frequency, duration: form.duration || null,
    route: form.route || null, quantity: form.quantity || 1, notes: form.notes || null,
    prescribed_by: auth?.id,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as Prescription }
}

// ============================================================
// MEDICATIONS / MEDICINE INVENTORY
// ============================================================

export async function getMedications(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("medications").select("*").eq("festival_id", festivalId).order("medication_name")
  if (error) return { error: error.message }
  return { data: data as Medication[] }
}

export async function createMedication(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("medications").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    medication_name: form.medication_name, generic_name: form.generic_name || null,
    category: form.category || "tablet", dosage_form: form.dosage_form || null,
    strength: form.strength || null, manufacturer: form.manufacturer || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as Medication }
}

export async function getMedicineInventory(festivalId: string, centerId?: string) {
  const admin = createAdminClient()
  let query = admin.from("medicine_inventory").select("*, medications(medication_name, category), medical_centers(center_name)").eq("festival_id", festivalId).order("expiry_date")
  if (centerId) query = query.eq("center_id", centerId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createMedicineStock(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("medicine_inventory").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    center_id: form.center_id || null, medication_id: form.medication_id || null,
    batch_number: form.batch_number, quantity: form.quantity || 0,
    unit_price: form.unit_price || 0, expiry_date: form.expiry_date,
    manufacturer: form.manufacturer || null, supplier_id: form.supplier_id || null,
    storage_location: form.storage_location || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("medicine_transactions").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    inventory_id: data.id, transaction_type: "received",
    quantity: form.quantity || 0, unit_price: form.unit_price || 0,
    total_price: (form.quantity || 0) * (form.unit_price || 0),
    performed_by: auth.user.id, notes: "Stock received",
  })
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as MedicineInventory }
}

// ============================================================
// INCIDENTS
// ============================================================

export async function getIncidents(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("incidents").select("*, incident_categories(*), incident_updates(*)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createIncident(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const inc = generateNumber("INC")
  const { data, error } = await admin.from("incidents").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    incident_number: inc, category_id: form.category_id || null,
    incident_type: form.incident_type || "other_emergency",
    title: form.title, description: form.description, location: form.location || null,
    latitude: form.latitude || null, longitude: form.longitude || null,
    severity: form.severity || "medium", reported_by: auth.user.id,
    reported_by_name: form.reported_by_name || "System",
    is_emergency: form.is_emergency || false, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("incident_updates").insert({
    organization_id: auth.organization_id, incident_id: data.id,
    update_text: "Incident reported", updated_by: auth.user.id,
    updated_by_name: form.reported_by_name || "System", new_status: "reported",
  })
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as Incident }
}

export async function updateIncidentStatus(id: string, status: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "resolved") updates.resolved_at = new Date().toISOString()
  const { data, error } = await admin.from("incidents").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  await admin.from("incident_updates").insert({
    organization_id: data.organization_id, incident_id: id,
    update_text: `Status changed to ${status}`, updated_by: auth?.id,
    updated_by_name: "System", new_status: status as any,
  })
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Incident }
}

export async function addIncidentUpdate(form: any) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data, error } = await admin.from("incident_updates").insert({
    organization_id: form.organization_id, incident_id: form.incident_id,
    update_text: form.update_text, updated_by: auth?.id,
    updated_by_name: form.updated_by_name || "System",
    new_status: form.new_status || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// AMBULANCES
// ============================================================

export async function getAmbulances(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ambulances").select("*, ambulance_drivers(*)").eq("festival_id", festivalId).order("vehicle_number")
  if (error) return { error: error.message }
  return { data }
}

export async function createAmbulance(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const code = generateNumber("AMB")
  const { data, error } = await admin.from("ambulances").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    ambulance_code: code, vehicle_number: form.vehicle_number,
    ambulance_type: form.ambulance_type || "basic_life_support",
    capacity: form.capacity || 1, equipment_level: form.equipment_level || null,
    has_gps: form.has_gps || false, insurance_expiry: form.insurance_expiry || null,
    fitness_expiry: form.fitness_expiry || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as Ambulance }
}

export async function updateAmbulanceStatus(id: string, status: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ambulances").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Ambulance }
}

// ============================================================
// HOSPITAL REFERRALS
// ============================================================

export async function getHospitalReferrals(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("hospital_referrals").select("*, patients(full_name, patient_code), medical_cases(case_number, chief_complaint)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createHospitalReferral(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const rn = generateNumber("REF")
  const { data, error } = await admin.from("hospital_referrals").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    referral_number: rn, case_id: form.case_id, patient_id: form.patient_id,
    hospital_name: form.hospital_name, hospital_address: form.hospital_address || null,
    hospital_phone: form.hospital_phone || null, doctor_name: form.doctor_name || null,
    doctor_specialty: form.doctor_specialty || null, referral_reason: form.referral_reason,
    case_summary: form.case_summary || null, ambulance_id: form.ambulance_id || null,
    referred_by: form.referred_by || null, follow_up_date: form.follow_up_date || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await updateMedicalCaseStatus(form.case_id, "referred")
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as HospitalReferral }
}

// ============================================================
// ALLERGIES & CONDITIONS
// ============================================================

export async function addAllergy(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("allergies").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    patient_id: form.patient_id, allergy_name: form.allergy_name,
    allergy_type: form.allergy_type || null, severity: form.severity || "moderate",
    reaction: form.reaction || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as Allergy }
}

export async function addMedicalCondition(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_conditions").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    patient_id: form.patient_id, condition_name: form.condition_name,
    diagnosed_date: form.diagnosed_date || null, is_chronic: form.is_chronic || false,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MedicalCondition }
}

// ============================================================
// MEDICAL CERTIFICATES
// ============================================================

export async function getMedicalCertificates(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("medical_certificates").select("*, patients(full_name), medical_cases(case_number)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createMedicalCertificate(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const cn = generateNumber("CERT")
  const { data, error } = await admin.from("medical_certificates").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    certificate_number: cn, case_id: form.case_id || null, patient_id: form.patient_id,
    certificate_type: form.certificate_type, diagnosis: form.diagnosis || null,
    recommendation: form.recommendation || null, valid_until: form.valid_until || null,
    issued_by: form.issued_by || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  return { data: data as MedicalCertificate }
}

// ============================================================
// AMBULANCE TRIPS
// ============================================================

export async function getAmbulanceTrips(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ambulance_trips").select("*, ambulances(vehicle_number, ambulance_code), ambulance_drivers(full_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createAmbulanceTrip(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const tn = generateNumber("TRIP")
  const { data, error } = await admin.from("ambulance_trips").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    trip_number: tn, ambulance_id: form.ambulance_id || null,
    driver_id: form.driver_id || null, case_id: form.case_id || null,
    pickup_location: form.pickup_location, dropoff_location: form.dropoff_location,
    dispatch_time: new Date().toISOString(), notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("ambulances").update({ status: "en_route" }).eq("id", form.ambulance_id)
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data: data as AmbulanceTrip }
}

export async function updateAmbulanceTripStatus(id: string, status: string, ambulanceId?: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "arrived" || status === "on_scene") updates.arrival_time = new Date().toISOString()
  if (status === "completed") updates.completion_time = new Date().toISOString()
  const { data, error } = await admin.from("ambulance_trips").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  if (status === "completed" && ambulanceId) {
    await admin.from("ambulances").update({ status: "available" }).eq("id", ambulanceId)
  }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as AmbulanceTrip }
}

// ============================================================
// ADDITIONAL HELPERS (referenced by medical UI pages)
// ============================================================

export async function assignAmbulance(id: string, centerId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("ambulances").update({ center_id: centerId }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization", false as any)
  return { data }
}

export async function getReferrals(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let q = admin.from("hospital_referrals").select("*, medical_cases(case_number, patients(full_name)), referred_center:medical_centers!referred_to(center_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) q = q.eq("status", status)
  const { data, error } = await q
  if (error) return { error: error.message }
  return { data }
}

export async function createReferral(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const rn = generateNumber("REF")
  const { data, error } = await admin.from("hospital_referrals").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    referral_number: rn, case_id: form.case_id, referred_to: form.referred_to,
    referral_reason: form.referral_reason, priority: form.priority || "normal",
    referral_note: form.referral_note || null, referred_by: form.referred_by || auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/medical`)
  return { data }
}

export async function updateReferralStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "accepted") updates.accepted_at = new Date().toISOString()
  if (status === "completed") updates.completed_at = new Date().toISOString()
  const { data, error } = await admin.from("hospital_referrals").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/organization", false as any)
  return { data }
}
