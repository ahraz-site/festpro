export const MEDICAL_CENTER_TYPES = [
  { value: "medical_desk", label: "Medical Desk" },
  { value: "first_aid_station", label: "First Aid Station" },
  { value: "emergency_clinic", label: "Emergency Clinic" },
  { value: "isolation_room", label: "Isolation Room" },
  { value: "mobile_medical_unit", label: "Mobile Medical Unit" },
  { value: "ambulance_station", label: "Ambulance Station" },
] as const

export const MEDICAL_CENTER_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600" },
  { value: "under_maintenance", label: "Under Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-700" },
] as const

export const MEDICAL_STAFF_ROLES = [
  { value: "medical_director", label: "Medical Director" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "paramedic", label: "Paramedic" },
  { value: "medical_volunteer", label: "Medical Volunteer" },
  { value: "emergency_coordinator", label: "Emergency Coordinator" },
  { value: "security", label: "Security" },
] as const

export const PATIENT_TYPES = [
  { value: "participant", label: "Participant" },
  { value: "judge", label: "Judge" },
  { value: "volunteer", label: "Volunteer" },
  { value: "guest", label: "Guest" },
  { value: "visitor", label: "Visitor" },
  { value: "staff", label: "Staff" },
] as const

export const BLOOD_GROUPS = [
  { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
  { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
] as const

export const CASE_SEVERITIES = [
  { value: "minor", label: "Minor", color: "bg-green-100 text-green-700" },
  { value: "moderate", label: "Moderate", color: "bg-amber-100 text-amber-700" },
  { value: "serious", label: "Serious", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
  { value: "deceased", label: "Deceased", color: "bg-gray-100 text-gray-600" },
] as const

export const MEDICAL_CASE_STATUSES = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-700" },
  { value: "in_treatment", label: "In Treatment", color: "bg-amber-100 text-amber-700" },
  { value: "referred", label: "Referred", color: "bg-purple-100 text-purple-700" },
  { value: "discharged", label: "Discharged", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
] as const

export const MEDICINE_CATEGORIES = [
  { value: "tablet", label: "Tablet" }, { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" }, { value: "injection", label: "Injection" },
  { value: "cream", label: "Cream" }, { value: "ointment", label: "Ointment" },
  { value: "drops", label: "Drops" }, { value: "spray", label: "Spray" },
  { value: "inhaler", label: "Inhaler" }, { value: "other", label: "Other" },
] as const

export const MEDICINE_TRANSACTION_TYPES = [
  { value: "received", label: "Received", color: "bg-green-100 text-green-700" },
  { value: "issued", label: "Issued", color: "bg-blue-100 text-blue-700" },
  { value: "returned", label: "Returned", color: "bg-purple-100 text-purple-700" },
  { value: "expired", label: "Expired", color: "bg-red-100 text-red-700" },
  { value: "damaged", label: "Damaged", color: "bg-amber-100 text-amber-700" },
  { value: "transferred", label: "Transferred", color: "bg-gray-100 text-gray-600" },
] as const

export const INCIDENT_CATEGORIES = [
  { value: "medical", label: "Medical Emergency" },
  { value: "fire", label: "Fire Incident" },
  { value: "security", label: "Security Incident" },
  { value: "accident", label: "Accident" },
  { value: "missing_person", label: "Missing Person" },
  { value: "natural_disaster", label: "Natural Disaster" },
  { value: "technical_failure", label: "Technical Failure" },
  { value: "other_emergency", label: "Other Emergency" },
] as const

export const INCIDENT_SEVERITIES = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
] as const

export const INCIDENT_STATUSES = [
  { value: "reported", label: "Reported", color: "bg-blue-100 text-blue-700" },
  { value: "investigating", label: "Investigating", color: "bg-purple-100 text-purple-700" },
  { value: "assigned", label: "Assigned", color: "bg-amber-100 text-amber-700" },
  { value: "in_progress", label: "In Progress", color: "bg-indigo-100 text-indigo-700" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
] as const

export const AMBULANCE_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { value: "en_route", label: "En Route", color: "bg-blue-100 text-blue-700" },
  { value: "on_scene", label: "On Scene", color: "bg-amber-100 text-amber-700" },
  { value: "transporting", label: "Transporting", color: "bg-purple-100 text-purple-700" },
  { value: "unavailable", label: "Unavailable", color: "bg-red-100 text-red-700" },
  { value: "maintenance", label: "Maintenance", color: "bg-gray-100 text-gray-600" },
] as const

export const AMBULANCE_TYPES = [
  { value: "basic_life_support", label: "Basic Life Support" },
  { value: "advanced_life_support", label: "Advanced Life Support" },
  { value: "patient_transport", label: "Patient Transport" },
  { value: "emergency_medical", label: "Emergency Medical" },
] as const

export const EMERGENCY_DISPATCH_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "dispatched", label: "Dispatched", color: "bg-blue-100 text-blue-700" },
  { value: "en_route", label: "En Route", color: "bg-indigo-100 text-indigo-700" },
  { value: "on_scene", label: "On Scene", color: "bg-purple-100 text-purple-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const REFERRAL_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "accepted", label: "Accepted", color: "bg-blue-100 text-blue-700" },
  { value: "declined", label: "Declined", color: "bg-red-100 text-red-700" },
  { value: "in_progress", label: "In Progress", color: "bg-indigo-100 text-indigo-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const REFERRAL_PRIORITIES = [
  { value: "low", label: "Low", color: "text-green-600" },
  { value: "normal", label: "Normal", color: "text-blue-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "urgent", label: "Urgent", color: "text-red-600" },
] as const

export const MEDICAL_CERTIFICATE_TYPES = [
  { value: "fitness", label: "Fitness Certificate" },
  { value: "medical_clearance", label: "Medical Clearance" },
  { value: "treatment_summary", label: "Treatment Summary" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "referral_note", label: "Referral Note" },
  { value: "sick_leave", label: "Sick Leave" },
  { value: "death_certificate", label: "Death Certificate" },
  { value: "other", label: "Other" },
] as const
