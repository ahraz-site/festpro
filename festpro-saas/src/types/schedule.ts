export type ScheduleStatus = "draft" | "published" | "running" | "completed" | "paused" | "cancelled"
export type QueueStatus = "waiting" | "calling" | "performing" | "completed" | "skipped" | "absent" | "cancelled"
export type StageCurrentStatus = "idle" | "running" | "break" | "setup" | "completed" | "maintenance"
export type SessionType = "morning" | "afternoon" | "evening" | "full_day" | "custom"
export type ConflictSeverity = "warning" | "error" | "critical"

export interface ScheduleSession {
  id: string
  festival_id: string
  day_id: string | null
  name: string
  session_type: SessionType
  start_time: string
  end_time: string
  buffer_before_minutes: number
  buffer_after_minutes: number
  is_break: boolean
  break_type: string | null
  display_order: number
  notes: string | null
  created_at: string
  updated_at: string
  day?: { date: string; label: string | null }
}

export interface StageSchedule {
  id: string
  festival_id: string
  day_id: string | null
  stage_id: string
  competition_id: string
  round_id: string | null
  session_id: string | null
  scheduled_date: string
  start_time: string
  end_time: string
  estimated_duration_minutes: number
  actual_start_time: string | null
  actual_end_time: string | null
  delay_minutes: number
  buffer_minutes: number
  max_participants: number
  status: ScheduleStatus
  display_order: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  stage?: { id: string; name: string; code: string | null }
  competition?: { id: string; name: string; code: string | null }
  round?: { id: string; name: string; round_number: number }
  session?: { id: string; name: string; start_time: string }
  day?: { date: string; label: string | null }
}

export interface StageQueue {
  id: string
  festival_id: string
  stage_id: string
  schedule_id: string | null
  participant_id: string | null
  registration_id: string | null
  team_id: string | null
  queue_order: number
  status: QueueStatus
  call_count: number
  last_called_at: string | null
  completed_at: string | null
  wait_time_minutes: number
  notes: string | null
  created_at: string
  updated_at: string
  participant?: { id: string; first_name: string; last_name: string; participant_id: string; chest_number: string | null; photo_url: string | null }
  registration?: { id: string; competition_id: string }
  team?: { id: string; name: string }
}

export interface StageStatusRecord {
  id: string
  festival_id: string
  stage_id: string
  current_status: StageCurrentStatus
  current_schedule_id: string | null
  current_participant_id: string | null
  started_at: string | null
  paused_at: string | null
  resumed_at: string | null
  completed_at: string | null
  is_live: boolean
  notes: string | null
  updated_at: string
  stage?: { id: string; name: string; code: string | null }
  current_participant?: { id: string; first_name: string; last_name: string }
}

export interface StageAnnouncement {
  id: string
  festival_id: string
  stage_id: string | null
  title: string
  message: string
  announcement_type: string
  display_on_screen: boolean
  is_scrolling: boolean
  is_emergency: boolean
  priority: number
  expires_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  stage?: { name: string; code: string | null }
}

export interface LiveEvent {
  id: string
  festival_id: string
  stage_id: string
  event_type: string
  title: string
  subtitle: string | null
  description: string | null
  is_active: boolean
  display_data: Record<string, any>
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
  stage?: { name: string; code: string | null }
}

export interface JudgeAvailability {
  id: string
  festival_id: string
  user_id: string
  day_id: string | null
  date: string
  start_time: string
  end_time: string
  status: string
  session_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  profile?: { first_name: string; last_name: string; email: string }
}

export interface ScheduleConflict {
  id: string
  festival_id: string
  conflict_type: string
  severity: ConflictSeverity
  description: string
  entity_type: string | null
  entity_ids: string[]
  schedule_id: string | null
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export interface CallHistory {
  id: string
  festival_id: string
  stage_id: string
  queue_id: string | null
  participant_id: string | null
  call_type: string
  called_by: string | null
  called_at: string
  response: string | null
  response_time_seconds: number | null
  notes: string | null
  participant?: { first_name: string; last_name: string; participant_id: string }
  stage?: { name: string; code: string | null }
}

export interface PerformanceLog {
  id: string
  festival_id: string
  stage_id: string
  schedule_id: string | null
  participant_id: string | null
  registration_id: string | null
  team_id: string | null
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  delay_minutes: number
  delay_reason: string | null
  status: string
  remarks: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  participant?: { first_name: string; last_name: string; participant_id: string; chest_number: string | null }
}

export interface ScheduleDashboardData {
  active_stages: number
  total_schedules: number
  completed_schedules: number
  delayed_competitions: number
  waiting_participants: number
  live_queue_length: number
  stages: { id: string; name: string; status: string; queue_length: number }[]
}

export interface ScheduleFormData {
  stage_id: string
  competition_id: string
  round_id: string
  session_id: string
  scheduled_date: string
  start_time: string
  end_time: string
  estimated_duration_minutes: string
  max_participants: string
  notes: string
}

export interface SessionFormData {
  day_id: string
  name: string
  session_type: SessionType
  start_time: string
  end_time: string
  buffer_before_minutes: string
  buffer_after_minutes: string
  is_break: boolean
  break_type: string
  notes: string
}
