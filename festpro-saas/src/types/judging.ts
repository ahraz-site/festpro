export type ScoringMethod = "average" | "total" | "weighted" | "best_of" | "cumulative"
export type JudgeProfileStatus = "active" | "inactive" | "unavailable"
export type ScoreStatus = "draft" | "submitted" | "locked" | "approved" | "rejected"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "correction_requested"

export interface JudgeProfile {
  id: string
  user_id: string
  organization_id: string
  photo_url: string | null
  phone: string | null
  qualification: string | null
  specialization: string | null
  experience_years: number
  languages: string[]
  status: JudgeProfileStatus
  is_certified: boolean
  certification_details: string | null
  notes: string | null
  created_at: string
  updated_at: string
  profile?: { first_name: string; last_name: string; email: string }
}

export interface JudgeSession {
  id: string
  judge_assignment_id: string
  schedule_id: string | null
  session_id: string | null
  is_available: boolean
  check_in_at: string | null
  check_out_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CriteriaGroup {
  id: string
  festival_id: string
  name: string
  name_ml: string | null
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
  criteria?: ScoringCriteria[]
}

export interface ScoringCriteria {
  id: string
  festival_id: string
  group_id: string | null
  name: string
  name_ml: string | null
  description: string | null
  max_score: number
  min_score: number
  weight: number
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  group?: { name: string }
}

export interface CompetitionScoringRule {
  id: string
  competition_id: string
  scoring_method: ScoringMethod
  max_total_score: number
  min_total_score: number
  passing_score: number | null
  tie_break_rule: string
  requires_chief_approval: boolean
  judge_count_required: number
  allow_live_scoring: boolean
  allow_judge_comments: boolean
  allow_spectator_view: boolean
  auto_publish: boolean
  created_at: string
  updated_at: string
}

export interface CompetitionCriteria {
  id: string
  competition_id: string
  criteria_id: string
  max_score: number | null
  weight: number | null
  display_order: number
  is_required: boolean
  created_at: string
  criteria?: ScoringCriteria
}

export interface Score {
  id: string
  festival_id: string
  competition_id: string
  participant_id: string
  registration_id: string | null
  judge_id: string
  round_id: string | null
  total_score: number | null
  weighted_score: number | null
  status: ScoreStatus
  is_locked: boolean
  locked_at: string | null
  locked_by: string | null
  submitted_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  items?: ScoreItem[]
  participant?: { id: string; first_name: string; last_name: string; participant_id: string; chest_number: string | null; photo_url: string | null }
  judge?: { id: string; user_id: string; role: string; is_lead_judge: boolean }
}

export interface ScoreItem {
  id: string
  score_id: string
  criteria_id: string
  score: number
  max_score: number | null
  weight: number
  weighted_score: number | null
  remarks: string | null
  created_at: string
  criteria?: ScoringCriteria
}

export interface ScoreHistory {
  id: string
  score_id: string
  action: string
  old_value: Record<string, any> | null
  new_value: Record<string, any> | null
  performed_by: string | null
  performed_at: string
}

export interface JudgeComment {
  id: string
  score_id: string
  judge_id: string
  comment_type: string
  comment: string
  is_private: boolean
  created_at: string
}

export interface ScoreLock {
  id: string
  competition_id: string
  locked_by: string
  lock_type: string
  is_active: boolean
  locked_at: string
  unlocked_at: string | null
  reason: string | null
}

export interface ChiefApproval {
  id: string
  competition_id: string
  participant_id: string | null
  score_id: string | null
  chief_judge_id: string
  status: ApprovalStatus
  remarks: string | null
  correction_notes: string | null
  decided_at: string | null
  created_at: string
  updated_at: string
}

export interface ResultProcessing {
  id: string
  competition_id: string
  round_id: string | null
  participant_id: string
  registration_id: string | null
  final_score: number | null
  weighted_score: number | null
  rank: number | null
  is_tie_broken: boolean
  tie_break_method: string | null
  is_winner: boolean
  is_passed: boolean
  grade: string | null
  points: number | null
  processed_at: string | null
  created_at: string
  updated_at: string
  participant?: { first_name: string; last_name: string; participant_id: string; chest_number: string | null }
}

export interface TieBreakRule {
  id: string
  festival_id: string
  name: string
  priority_order: string[]
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ScoreAuditLog {
  id: string
  organization_id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  metadata: Record<string, any>
  ip_address: string | null
  created_at: string
}

export interface JudgingDashboardData {
  total_judges: number
  active_judges: number
  total_scores: number
  locked_scores: number
  pending_approvals: number
  completed_competitions: number
}
