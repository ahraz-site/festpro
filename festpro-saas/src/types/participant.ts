export type RegistrationStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled"
export type ParticipantGender = "male" | "female" | "other"
export type AttendanceStatus = "present" | "absent" | "late" | "excused"
export type TeamRole = "leader" | "member" | "substitute"

export interface Institution {
  id: string
  organization_id: string
  name: string
  code: string | null
  type: string
  address: string | null
  city: string | null
  district: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  festival_id: string
  organization_id: string
  participant_id: string
  registration_number: string
  chest_number: string | null
  first_name: string
  last_name: string
  date_of_birth: string | null
  age: number | null
  gender: ParticipantGender
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  district: string | null
  state: string | null
  photo_url: string | null
  signature_url: string | null
  unit: string | null
  division: string | null
  sector: string | null
  institution_id: string | null
  institution_name: string | null
  is_team_leader: boolean
  max_registrations: number
  notes: string | null
  created_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  guardians?: Guardian[]
  registrations?: Registration[]
  documents?: ParticipantDocument[]
  medical?: MedicalInformation
  attendance?: Attendance[]
  qr_card?: QrCard
  institution?: Institution
}

export interface Guardian {
  id: string
  participant_id: string
  name: string
  relationship: string | null
  phone: string | null
  email: string | null
  occupation: string | null
  address: string | null
  is_emergency_contact: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  festival_id: string
  competition_id: string
  name: string
  code: string | null
  team_leader_id: string | null
  max_members: number
  min_members: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  members?: TeamMember[]
  team_leader?: Participant
  competition?: { id: string; name: string; code: string | null }
}

export interface TeamMember {
  id: string
  team_id: string
  participant_id: string
  role: TeamRole
  joined_at: string
  participant?: Participant
}

export interface Registration {
  id: string
  participant_id: string
  competition_id: string
  festival_id: string
  team_id: string | null
  status: RegistrationStatus
  chest_number: string | null
  registered_at: string
  approved_at: string | null
  approved_by: string | null
  rejection_reason: string | null
  is_attended: boolean
  score: number | null
  rank: number | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  competition?: { id: string; name: string; code: string | null; competition_type: string }
  participant?: Participant
  team?: Team
}

export interface ChestNumberSequence {
  id: string
  festival_id: string
  prefix: string
  last_number: number
  created_at: string
  updated_at: string
}

export interface ParticipantDocument {
  id: string
  participant_id: string
  document_type: string
  document_name: string | null
  file_url: string
  file_type: string | null
  file_size: number | null
  is_verified: boolean
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

export interface MedicalInformation {
  id: string
  participant_id: string
  blood_group: string | null
  allergies: string | null
  medical_conditions: string | null
  medications: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  insurance_provider: string | null
  insurance_number: string | null
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  participant_id: string
  registration_id: string | null
  festival_id: string
  competition_id: string | null
  attendance_date: string
  check_in_time: string | null
  check_out_time: string | null
  status: AttendanceStatus
  marked_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  participant?: Participant
  competition?: { id: string; name: string }
}

export interface QrCard {
  id: string
  participant_id: string
  festival_id: string
  qr_data: string
  qr_image_url: string | null
  card_design: Record<string, any>
  is_printed: boolean
  printed_at: string | null
  created_at: string
  updated_at: string
}

export interface ParticipantDashboardData {
  total: number
  approved: number
  pending: number
  rejected: number
  checked_in: number
  absent: number
  competition_wise: { name: string; count: number }[]
  gender_distribution: { male: number; female: number; other: number }
}

export interface ParticipantFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: ParticipantGender
  email: string
  phone: string
  address: string
  city: string
  district: string
  state: string
  unit: string
  division: string
  sector: string
  institution_id: string
  institution_name: string
  notes: string
}

export interface RegistrationFormData {
  participant_id: string
  competition_id: string
  team_id: string
  notes: string
}

export interface TeamFormData {
  name: string
  code: string
  competition_id: string
  team_leader_id?: string
  max_members: string
  min_members: string
}
