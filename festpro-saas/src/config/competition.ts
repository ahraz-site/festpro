import type { CompetitionStatus, CompetitionType, AgeGroup, GenderRestriction, RoundType } from "@/types/competition"

export const COMPETITION_STATUSES: { value: CompetitionStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-gray-600 bg-gray-100" },
  { value: "upcoming", label: "Upcoming", color: "text-blue-600 bg-blue-100" },
  { value: "registration_open", label: "Registration Open", color: "text-green-600 bg-green-100" },
  { value: "registration_closed", label: "Registration Closed", color: "text-amber-600 bg-amber-100" },
  { value: "running", label: "Running", color: "text-purple-600 bg-purple-100" },
  { value: "completed", label: "Completed", color: "text-indigo-600 bg-indigo-100" },
  { value: "cancelled", label: "Cancelled", color: "text-red-600 bg-red-100" },
]

export const COMPETITION_TYPES: { value: CompetitionType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "team", label: "Team" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
]

export const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
  { value: "higher_secondary", label: "Higher Secondary" },
  { value: "college", label: "College" },
  { value: "open", label: "Open" },
]

export const GENDER_OPTIONS: { value: GenderRestriction; label: string }[] = [
  { value: "all", label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
]

export const ROUND_TYPES: { value: RoundType; label: string }[] = [
  { value: "preliminary", label: "Preliminary" },
  { value: "quarter_final", label: "Quarter Final" },
  { value: "semi_final", label: "Semi Final" },
  { value: "final", label: "Final" },
  { value: "custom", label: "Custom" },
]

export const SCORING_METHODS = [
  { value: "points", label: "Points" },
  { value: "percentage", label: "Percentage" },
  { value: "grade", label: "Grade" },
  { value: "rank", label: "Rank" },
  { value: "pass_fail", label: "Pass/Fail" },
]

export const LANGUAGES = [
  { value: "all", label: "All Languages" },
  { value: "english", label: "English" },
  { value: "malayalam", label: "Malayalam" },
  { value: "hindi", label: "Hindi" },
  { value: "arabic", label: "Arabic" },
  { value: "sanskrit", label: "Sanskrit" },
]

export const CATEGORY_COLORS = [
  "#4F46E5", "#7C3AED", "#EC4899", "#EF4444", "#F97316",
  "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6",
]

export const CATEGORY_ICONS = [
  "trophy", "music", "palette", "book-open", "pen-tool",
  "mic", "cpu", "dumbbell", "globe", "star",
]
