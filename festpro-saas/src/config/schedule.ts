import type { ScheduleStatus, QueueStatus, StageCurrentStatus, SessionType, ConflictSeverity } from "@/types/schedule"

export const SCHEDULE_STATUSES: { value: ScheduleStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-gray-600 bg-gray-100" },
  { value: "published", label: "Published", color: "text-blue-600 bg-blue-100" },
  { value: "running", label: "Running", color: "text-green-600 bg-green-100" },
  { value: "completed", label: "Completed", color: "text-indigo-600 bg-indigo-100" },
  { value: "paused", label: "Paused", color: "text-amber-600 bg-amber-100" },
  { value: "cancelled", label: "Cancelled", color: "text-red-600 bg-red-100" },
]

export const QUEUE_STATUSES: { value: QueueStatus; label: string; color: string }[] = [
  { value: "waiting", label: "Waiting", color: "text-gray-600 bg-gray-100" },
  { value: "calling", label: "Calling", color: "text-blue-600 bg-blue-100" },
  { value: "performing", label: "Performing", color: "text-green-600 bg-green-100" },
  { value: "completed", label: "Completed", color: "text-indigo-600 bg-indigo-100" },
  { value: "skipped", label: "Skipped", color: "text-amber-600 bg-amber-100" },
  { value: "absent", label: "Absent", color: "text-red-600 bg-red-100" },
  { value: "cancelled", label: "Cancelled", color: "text-gray-400 bg-gray-100" },
]

export const STAGE_STATUSES: { value: StageCurrentStatus; label: string; color: string }[] = [
  { value: "idle", label: "Idle", color: "text-gray-600 bg-gray-100" },
  { value: "running", label: "Running", color: "text-green-600 bg-green-100" },
  { value: "break", label: "Break", color: "text-amber-600 bg-amber-100" },
  { value: "setup", label: "Setup", color: "text-blue-600 bg-blue-100" },
  { value: "completed", label: "Completed", color: "text-indigo-600 bg-indigo-100" },
  { value: "maintenance", label: "Maintenance", color: "text-red-600 bg-red-100" },
]

export const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "full_day", label: "Full Day" },
  { value: "custom", label: "Custom" },
]

export const CONFLICT_SEVERITIES: { value: ConflictSeverity; label: string; color: string }[] = [
  { value: "warning", label: "Warning", color: "text-amber-600 bg-amber-100" },
  { value: "error", label: "Error", color: "text-red-600 bg-red-100" },
  { value: "critical", label: "Critical", color: "text-red-800 bg-red-200" },
]

export const CONFLICT_TYPES = [
  "stage_double_booking",
  "judge_double_booking",
  "participant_double_booking",
  "team_double_booking",
  "venue_double_booking",
  "time_overlap",
  "judge_unavailable",
  "stage_unavailable",
]

export const CALL_TYPES = [
  { value: "first_call", label: "First Call" },
  { value: "second_call", label: "Second Call" },
  { value: "final_call", label: "Final Call" },
  { value: "recall", label: "Recall" },
  { value: "absent_mark", label: "Absent Mark" },
]

export const ANNOUNCEMENT_TYPES = [
  { value: "general", label: "General" },
  { value: "schedule_change", label: "Schedule Change" },
  { value: "emergency", label: "Emergency" },
  { value: "result", label: "Result" },
  { value: "notice", label: "Notice" },
]

export const BREAK_TYPES = [
  { value: "lunch", label: "Lunch Break" },
  { value: "prayer", label: "Prayer Break" },
  { value: "tea", label: "Tea Break" },
  { value: "technical", label: "Technical Break" },
  { value: "custom", label: "Custom Break" },
]

export const DEFAULT_BUFFER_MINUTES = 5
export const DEFAULT_DURATION_MINUTES = 30
export const MAX_QUEUE_PER_STAGE = 200
