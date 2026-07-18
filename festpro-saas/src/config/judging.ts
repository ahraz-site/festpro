import type { ScoringMethod, ScoreStatus, ApprovalStatus, JudgeProfileStatus } from "@/types/judging"

export const SCORING_METHODS: { value: ScoringMethod; label: string; description: string }[] = [
  { value: "average", label: "Average", description: "Average of all judge scores" },
  { value: "total", label: "Total", description: "Sum of all judge scores" },
  { value: "weighted", label: "Weighted", description: "Weighted average by judge role" },
  { value: "best_of", label: "Best Of", description: "Highest score among judges" },
  { value: "cumulative", label: "Cumulative", description: "Cumulative across rounds" },
]

export const SCORE_STATUSES: { value: ScoreStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-gray-600 bg-gray-100" },
  { value: "submitted", label: "Submitted", color: "text-blue-600 bg-blue-100" },
  { value: "locked", label: "Locked", color: "text-amber-600 bg-amber-100" },
  { value: "approved", label: "Approved", color: "text-green-600 bg-green-100" },
  { value: "rejected", label: "Rejected", color: "text-red-600 bg-red-100" },
]

export const APPROVAL_STATUSES: { value: ApprovalStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "text-amber-600 bg-amber-100" },
  { value: "approved", label: "Approved", color: "text-green-600 bg-green-100" },
  { value: "rejected", label: "Rejected", color: "text-red-600 bg-red-100" },
  { value: "correction_requested", label: "Correction", color: "text-blue-600 bg-blue-100" },
]

export const JUDGE_STATUSES: { value: JudgeProfileStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "text-green-600 bg-green-100" },
  { value: "inactive", label: "Inactive", color: "text-gray-600 bg-gray-100" },
  { value: "unavailable", label: "Unavailable", color: "text-red-600 bg-red-100" },
]

export const JUDGE_ROLES = [
  { value: "judge", label: "Judge" },
  { value: "lead_judge", label: "Lead Judge" },
  { value: "chief_judge", label: "Chief Judge" },
  { value: "assistant_judge", label: "Assistant Judge" },
  { value: "trainee_judge", label: "Trainee Judge" },
]

export const TIE_BREAK_RULES = [
  { value: "highest_presentation", label: "Highest Presentation Marks" },
  { value: "highest_content", label: "Highest Content Marks" },
  { value: "highest_total", label: "Highest Total Before Tie" },
  { value: "manual", label: "Manual Decision" },
  { value: "chief_decision", label: "Chief Judge Decision" },
  { value: "random_draw", label: "Random Draw" },
]

export const LOCK_TYPES = [
  { value: "judge_lock", label: "Judge Lock" },
  { value: "competition_lock", label: "Competition Lock" },
  { value: "chief_lock", label: "Chief Judge Lock" },
  { value: "system_lock", label: "System Lock" },
]

export const COMMENT_TYPES = [
  { value: "general", label: "General" },
  { value: "praise", label: "Praise" },
  { value: "improvement", label: "Improvement" },
  { value: "discrepancy", label: "Score Discrepancy" },
  { value: "appeal", label: "Appeal" },
]

export const GRADES = [
  { value: "A+", label: "A+", min: 90 },
  { value: "A", label: "A", min: 80 },
  { value: "B+", label: "B+", min: 70 },
  { value: "B", label: "B", min: 60 },
  { value: "C+", label: "C+", min: 50 },
  { value: "C", label: "C", min: 40 },
  { value: "D", label: "D", min: 30 },
  { value: "E", label: "E", min: 0 },
]

export const SPECIALIZATIONS = [
  "Music", "Dance", "Drama", "Literature", "Fine Arts",
  "Elocution", "Debate", "Quiz", "IT", "Sports",
  "General", "Cultural", "Academic",
]

export const EXPERIENCE_LEVELS = [
  { value: "1", label: "1-3 Years" },
  { value: "3", label: "3-5 Years" },
  { value: "5", label: "5-10 Years" },
  { value: "10", label: "10+ Years" },
  { value: "20", label: "20+ Years" },
]
