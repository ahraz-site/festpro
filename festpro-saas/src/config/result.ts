export const RESULT_PUBLISH_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "internal_review", label: "Internal Review", color: "bg-blue-100 text-blue-600" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-600" },
  { value: "live", label: "Live", color: "bg-emerald-100 text-emerald-600" },
  { value: "archived", label: "Archived", color: "bg-gray-50 text-gray-400" },
] as const

export const APPEAL_STATUSES = [
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-600" },
  { value: "under_review", label: "Under Review", color: "bg-amber-100 text-amber-600" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-600" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-600" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-gray-100 text-gray-500" },
] as const

export const APPEAL_TYPES = [
  { value: "score_review", label: "Score Review" },
  { value: "rank_dispute", label: "Rank Dispute" },
  { value: "eligibility", label: "Eligibility Issue" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "other", label: "Other" },
] as const

export const CERTIFICATE_TYPES = [
  { value: "participant", label: "Participant" },
  { value: "winner", label: "Winner" },
  { value: "judge", label: "Judge" },
  { value: "volunteer", label: "Volunteer" },
  { value: "organizer", label: "Organizer" },
  { value: "chief_guest", label: "Chief Guest" },
  { value: "staff", label: "Staff" },
  { value: "participation", label: "Participation" },
] as const

export const ENTITY_TYPES = [
  { value: "unit", label: "Unit" },
  { value: "sector", label: "Sector" },
  { value: "division", label: "Division" },
  { value: "organization", label: "Organization" },
] as const

export const POINT_TYPES = [
  { value: "rank", label: "Rank Based" },
  { value: "participation", label: "Participation" },
  { value: "special", label: "Special Award" },
  { value: "bonus", label: "Bonus Points" },
] as const

export const PUBLISH_SCOPES = [
  { value: "competition", label: "By Competition" },
  { value: "stage", label: "By Stage" },
  { value: "category", label: "By Category" },
  { value: "festival", label: "By Festival (All)" },
] as const

export const CERTIFICATE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "generated", label: "Generated", color: "bg-blue-100 text-blue-600" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-600" },
  { value: "revoked", label: "Revoked", color: "bg-red-100 text-red-600" },
] as const

export const DEFAULT_POINT_RULES = [
  { entity_type: "unit", point_type: "rank", rank_from: 1, rank_to: 1, points: 10, label: "1st Place" },
  { entity_type: "unit", point_type: "rank", rank_from: 2, rank_to: 2, points: 7, label: "2nd Place" },
  { entity_type: "unit", point_type: "rank", rank_from: 3, rank_to: 3, points: 5, label: "3rd Place" },
  { entity_type: "unit", point_type: "rank", rank_from: 4, rank_to: 5, points: 3, label: "4th-5th Place" },
  { entity_type: "unit", point_type: "participation", rank_from: 1, rank_to: null, points: 1, label: "Participation" },
  { entity_type: "division", point_type: "rank", rank_from: 1, rank_to: 1, points: 15, label: "1st Place (Division)" },
  { entity_type: "division", point_type: "rank", rank_from: 2, rank_to: 2, points: 10, label: "2nd Place (Division)" },
  { entity_type: "division", point_type: "rank", rank_from: 3, rank_to: 3, points: 7, label: "3rd Place (Division)" },
] as const

export const MEDAL_EMOJIS = { gold: "🥇", silver: "🥈", bronze: "🥉" } as const

export const POSITION_LABELS: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" }

export const GRADE_COLORS: Record<string, string> = {
  "A+": "text-green-600 bg-green-50 border-green-200",
  "A": "text-green-700 bg-green-50 border-green-300",
  "B+": "text-yellow-600 bg-yellow-50 border-yellow-200",
  "B": "text-amber-600 bg-amber-50 border-amber-200",
  "C+": "text-orange-600 bg-orange-50 border-orange-200",
  "C": "text-red-500 bg-red-50 border-red-200",
  "D": "text-red-600 bg-red-50 border-red-300",
  "E": "text-red-700 bg-red-50 border-red-400",
}

export const GRADE_LABELS: Record<string, string> = {
  "A+": "Outstanding", "A": "Excellent", "B+": "Very Good", "B": "Good",
  "C+": "Above Average", "C": "Average", "D": "Below Average", "E": "Needs Improvement",
}

export const DEFAULT_GRADES = [
  { grade: "A+", min: 90, max: 100, label: "Outstanding", pass: true, color: "#22c55e", order: 1 },
  { grade: "A", min: 80, max: 89.99, label: "Excellent", pass: true, color: "#16a34a", order: 2 },
  { grade: "B+", min: 70, max: 79.99, label: "Very Good", pass: true, color: "#eab308", order: 3 },
  { grade: "B", min: 60, max: 69.99, label: "Good", pass: true, color: "#f59e0b", order: 4 },
  { grade: "C+", min: 50, max: 59.99, label: "Above Average", pass: true, color: "#f97316", order: 5 },
  { grade: "C", min: 40, max: 49.99, label: "Average", pass: true, color: "#ef4444", order: 6 },
  { grade: "D", min: 30, max: 39.99, label: "Below Average", pass: false, color: "#dc2626", order: 7 },
  { grade: "E", min: 0, max: 29.99, label: "Needs Improvement", pass: false, color: "#991b1b", order: 8 },
]

export const RANKING_ENTITY_TYPES = [
  { value: "team", label: "Team" },
  { value: "institution", label: "Institution" },
  { value: "group", label: "Group" },
  { value: "individual", label: "Individual" },
] as const
