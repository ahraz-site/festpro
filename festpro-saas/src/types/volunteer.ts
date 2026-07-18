export type VolunteerStatus = "active" | "inactive" | "on_leave" | "deactivated"
export type StaffDepartment =
  | "reception" | "registration" | "help_desk" | "stage" | "media" | "food"
  | "medical" | "security" | "transport" | "accommodation" | "technical"
  | "cleaning" | "protocol" | "volunteer_coordination" | "general"
export type ShiftType = "morning" | "afternoon" | "evening" | "night" | "custom"
export type DutyStatus = "scheduled" | "checked_in" | "completed" | "cancelled" | "no_show"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled"
export type AttendanceType = "qr_checkin" | "qr_checkout" | "manual" | "late" | "absent"
export type CheckpointType = "gate" | "stage" | "reception" | "help_desk" | "medical" | "parking" | "volunteer_desk"

export interface Volunteer {
  id: string; organization_id: string; festival_id: string | null; user_id: string | null
  photo_url: string | null; first_name: string; last_name: string; phone: string | null
  email: string | null; date_of_birth: string | null; blood_group: string | null
  emergency_contact_name: string | null; emergency_contact_phone: string | null
  skills: string[]; languages: string[]; availability: string | null; address: string | null
  city: string | null; status: VolunteerStatus; qr_code: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
  profiles?: VolunteerProfile
}

export interface VolunteerProfile {
  id: string; volunteer_id: string; total_hours: number; total_shifts: number
  departments_worked: string[]; rating: number | null; certificate_count: number
  joined_at: string; last_activity_at: string | null
}

export interface StaffMember {
  id: string; organization_id: string; festival_id: string | null; user_id: string | null
  department: StaffDepartment; photo_url: string | null; first_name: string; last_name: string
  phone: string | null; email: string | null; position: string | null
  is_supervisor: boolean; supervisor_id: string | null; is_active: boolean; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface StaffDepartmentMeta {
  id: string; organization_id: string; festival_id: string | null; department: StaffDepartment
  display_name: string; description: string | null; color: string | null; icon: string | null
  head_count: number; max_capacity: number | null; created_by: string | null
  created_at: string; updated_at: string
}

export interface Duty {
  id: string; organization_id: string; festival_id: string; title: string; description: string | null
  department: StaffDepartment; location: string | null; is_critical: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface DutyAssignment {
  id: string; duty_id: string; volunteer_id: string | null; staff_id: string | null
  assigned_by: string | null; status: DutyStatus; notes: string | null
  assigned_at: string; started_at: string | null; completed_at: string | null
}

export interface ShiftTemplate {
  id: string; organization_id: string; festival_id: string | null; name: string
  shift_type: ShiftType; start_time: string; end_time: string; break_duration: number
  color: string | null; created_at: string; updated_at: string
}

export interface Shift {
  id: string; organization_id: string; festival_id: string; volunteer_id: string | null
  staff_id: string | null; template_id: string | null; duty_assignment_id: string | null
  date: string; start_time: string; end_time: string; is_overtime: boolean
  status: DutyStatus; checked_in_at: string | null; checked_out_at: string | null
  hours_worked: number | null; notes: string | null; created_by: string | null
  created_at: string; updated_at: string
}

export interface AttendanceLog {
  id: string; organization_id: string; festival_id: string | null; volunteer_id: string | null
  staff_id: string | null; shift_id: string | null; attendance_type: AttendanceType
  checkpoint_id: string | null; timestamp: string; latitude: number | null; longitude: number | null
  ip_address: string | null; photo_url: string | null; notes: string | null; created_at: string
}

export interface Checkpoint {
  id: string; organization_id: string; festival_id: string; name: string
  checkpoint_type: CheckpointType; location: string | null; latitude: number | null
  longitude: number | null; qr_code: string | null; is_active: boolean; created_by: string | null
  created_at: string; updated_at: string
}

export interface Checkin {
  id: string; checkpoint_id: string; volunteer_id: string | null; staff_id: string | null
  checkin_type: string; timestamp: string; photo_url: string | null; latitude: number | null
  longitude: number | null; created_at: string
}

export interface TaskList {
  id: string; organization_id: string; festival_id: string; title: string; description: string | null
  department: StaffDepartment | null; is_template: boolean; created_by: string | null
  created_at: string; updated_at: string
}

export interface TaskItem {
  id: string; task_list_id: string; title: string; description: string | null; priority: TaskPriority
  status: TaskStatus; assigned_to: string | null; assigned_staff: string | null
  due_date: string | null; sort_order: number; created_by: string | null
  completed_by: string | null; completed_at: string | null; created_at: string; updated_at: string
}

export interface TaskComment {
  id: string; task_id: string; user_id: string | null; comment: string; created_at: string
}

export interface TaskFile {
  id: string; task_id: string; file_url: string; file_name: string | null
  file_size: number | null; uploaded_by: string | null; created_at: string
}

export interface VolunteerCertificate {
  id: string; organization_id: string; festival_id: string | null; volunteer_id: string | null
  staff_id: string | null; certificate_code: string; certificate_type: string; title: string
  description: string | null; total_hours: number | null; issue_date: string
  is_verified: boolean; created_by: string | null; created_at: string
}

export interface Module13DashboardData {
  total_volunteers: number; active_volunteers: number; total_staff: number
  total_duties: number; active_shifts: number; present_today: number
  absent_today: number; pending_tasks: number; total_checkpoints: number
}
