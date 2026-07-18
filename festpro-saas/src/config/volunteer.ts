export const STAFF_DEPARTMENTS = [
  { value: "reception", label: "Reception", color: "bg-blue-100 text-blue-700" },
  { value: "registration", label: "Registration", color: "bg-indigo-100 text-indigo-700" },
  { value: "help_desk", label: "Help Desk", color: "bg-green-100 text-green-700" },
  { value: "stage", label: "Stage", color: "bg-purple-100 text-purple-700" },
  { value: "media", label: "Media", color: "bg-pink-100 text-pink-700" },
  { value: "food", label: "Food", color: "bg-orange-100 text-orange-700" },
  { value: "medical", label: "Medical", color: "bg-red-100 text-red-700" },
  { value: "security", label: "Security", color: "bg-gray-100 text-gray-700" },
  { value: "transport", label: "Transport", color: "bg-amber-100 text-amber-700" },
  { value: "accommodation", label: "Accommodation", color: "bg-teal-100 text-teal-700" },
  { value: "technical", label: "Technical", color: "bg-cyan-100 text-cyan-700" },
  { value: "cleaning", label: "Cleaning", color: "bg-lime-100 text-lime-700" },
  { value: "protocol", label: "Protocol", color: "bg-violet-100 text-violet-700" },
  { value: "volunteer_coordination", label: "Volunteer Coordination", color: "bg-rose-100 text-rose-700" },
  { value: "general", label: "General", color: "bg-gray-100 text-gray-600" },
] as const

export const SHIFT_TYPES = [
  { value: "morning", label: "Morning (6AM-2PM)", icon: "Sunrise" },
  { value: "afternoon", label: "Afternoon (2PM-6PM)", icon: "Sun" },
  { value: "evening", label: "Evening (6PM-10PM)", icon: "Sunset" },
  { value: "night", label: "Night (10PM-6AM)", icon: "Moon" },
  { value: "custom", label: "Custom", icon: "Clock" },
] as const

export const DUTY_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "checked_in", label: "Checked In", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-indigo-100 text-indigo-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  { value: "no_show", label: "No Show", color: "bg-red-100 text-red-700" },
] as const

export const TASK_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
] as const

export const TASK_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const CHECKPOINT_TYPES = [
  { value: "gate", label: "Gate", icon: "Door" },
  { value: "stage", label: "Stage", icon: "Music" },
  { value: "reception", label: "Reception", icon: "Users" },
  { value: "help_desk", label: "Help Desk", icon: "HelpCircle" },
  { value: "medical", label: "Medical", icon: "Heart" },
  { value: "parking", label: "Parking", icon: "Car" },
  { value: "volunteer_desk", label: "Volunteer Desk", icon: "UserCheck" },
] as const
