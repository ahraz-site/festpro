import type { RegistrationStatus, ParticipantGender, AttendanceStatus, TeamRole } from "@/types/participant"

export const REGISTRATION_STATUSES: { value: RegistrationStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-gray-600 bg-gray-100" },
  { value: "pending", label: "Pending", color: "text-amber-600 bg-amber-100" },
  { value: "approved", label: "Approved", color: "text-green-600 bg-green-100" },
  { value: "rejected", label: "Rejected", color: "text-red-600 bg-red-100" },
  { value: "cancelled", label: "Cancelled", color: "text-gray-400 bg-gray-100" },
]

export const GENDER_OPTIONS: { value: ParticipantGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
]

export const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "present", label: "Present", color: "text-green-600 bg-green-100" },
  { value: "absent", label: "Absent", color: "text-red-600 bg-red-100" },
  { value: "late", label: "Late", color: "text-amber-600 bg-amber-100" },
  { value: "excused", label: "Excused", color: "text-blue-600 bg-blue-100" },
]

export const TEAM_ROLES: { value: TeamRole; label: string }[] = [
  { value: "leader", label: "Team Leader" },
  { value: "member", label: "Member" },
  { value: "substitute", label: "Substitute" },
]

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export const DOCUMENT_TYPES = [
  { value: "photo", label: "Photo" },
  { value: "id_proof", label: "ID Proof" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "school_certificate", label: "School Certificate" },
  { value: "other", label: "Other" },
]

export const UNITS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
]

export const DIVISIONS = [
  "Junior", "Senior", "Higher Secondary", "College", "Open",
]

export const SECTORS = [
  "Education", "Cultural", "Sports", "Technology", "Arts",
]

export const MAX_REGISTRATIONS_PER_PARTICIPANT = 5

export const CHEST_NUMBER_PREFIXES = ["CH", "FST", "REG"]

export const PARTICIPANT_SORT_OPTIONS = [
  { value: "created_at", label: "Date Added" },
  { value: "first_name", label: "Name" },
  { value: "participant_id", label: "Participant ID" },
  { value: "chest_number", label: "Chest Number" },
]
