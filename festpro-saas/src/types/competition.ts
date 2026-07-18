export type CompetitionStatus = "draft" | "upcoming" | "registration_open" | "registration_closed" | "running" | "completed" | "cancelled"
export type CompetitionType = "individual" | "team" | "online" | "offline" | "hybrid"
export type AgeGroup = "junior" | "senior" | "higher_secondary" | "college" | "open"
export type GenderRestriction = "all" | "male" | "female"
export type RoundType = "preliminary" | "quarter_final" | "semi_final" | "final" | "custom"
export type TimeSlotStatus = "scheduled" | "running" | "completed" | "cancelled"

export interface CompetitionCategory {
  id: string
  festival_id: string
  name: string
  name_ml: string | null
  short_name: string | null
  code: string | null
  description: string | null
  color: string
  icon: string
  display_order: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  _count?: { competitions: number }
}

export interface CompetitionSubcategory {
  id: string
  category_id: string
  name: string
  name_ml: string | null
  code: string | null
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompetitionGroup {
  id: string
  festival_id: string
  name: string
  code: string | null
  age_group: AgeGroup
  min_age: number | null
  max_age: number | null
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Competition {
  id: string
  festival_id: string
  category_id: string
  subcategory_id: string | null
  group_id: string | null
  name: string
  name_ml: string | null
  code: string | null
  description: string | null
  competition_type: CompetitionType
  age_group: AgeGroup
  gender_restriction: GenderRestriction
  language: string
  duration_minutes: number
  max_participants: number
  min_participants: number
  max_teams: number
  max_participants_per_team: number
  is_team_event: boolean
  stage_required: boolean
  judge_count: number
  round_count: number
  status: CompetitionStatus
  allow_multiple_entries: boolean
  requires_approval: boolean
  instructions: string | null
  winning_criteria: string | null
  scoring_method: string
  max_score: number
  passing_score: number | null
  display_order: number
  created_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  category?: CompetitionCategory
  group?: CompetitionGroup
  rounds?: CompetitionRound[]
  stage_assignments?: CompetitionStageAssignment[]
  judge_assignments?: CompetitionJudgeAssignment[]
}

export interface CompetitionRound {
  id: string
  competition_id: string
  name: string
  round_type: RoundType
  round_number: number
  description: string | null
  duration_minutes: number
  max_participants: number | null
  passing_score: number | null
  has_elimination: boolean
  elimination_count: number | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface CompetitionRule {
  id: string
  competition_id: string
  title: string
  description: string | null
  rule_number: number
  file_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface CompetitionMaterial {
  id: string
  competition_id: string
  name: string
  description: string | null
  is_required: boolean
  quantity: number
  created_at: string
  updated_at: string
}

export interface CompetitionStageAssignment {
  id: string
  competition_id: string
  stage_id: string
  venue_id: string | null
  assigned_date: string | null
  start_time: string | null
  end_time: string | null
  is_primary: boolean
  notes: string | null
  created_at: string
  updated_at: string
  stage?: { name: string; code: string | null }
  venue?: { name: string }
}

export interface CompetitionJudgeAssignment {
  id: string
  competition_id: string
  user_id: string
  role: string
  is_lead_judge: boolean
  assigned_at: string
  created_at: string
  profile?: { first_name: string; last_name: string; email: string }
}

export interface CompetitionTimeSlot {
  id: string
  competition_id: string
  round_id: string | null
  stage_id: string | null
  venue_id: string | null
  slot_date: string
  start_time: string
  end_time: string
  status: TimeSlotStatus
  max_participants: number | null
  notes: string | null
  created_at: string
  updated_at: string
  stage?: { name: string }
  venue?: { name: string }
  round?: { name: string; round_number: number }
  competition?: { name: string; code: string | null }
}

export interface CompetitionResult {
  id: string
  competition_id: string
  round_id: string | null
  participant_id: string | null
  score: number | null
  rank: number | null
  is_winner: boolean
  is_passed: boolean
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface CompetitionEligibility {
  id: string
  competition_id: string
  allowed_units: string[]
  allowed_divisions: string[]
  allowed_sectors: string[]
  min_age: number | null
  max_age: number | null
  gender_restriction: GenderRestriction
  requires_qualification: boolean
  qualification_details: string | null
  created_at: string
  updated_at: string
}

export interface CompetitionFormData {
  name: string
  name_ml: string
  code: string
  description: string
  category_id: string
  subcategory_id: string
  group_id: string
  competition_type: CompetitionType
  age_group: AgeGroup
  gender_restriction: GenderRestriction
  language: string
  duration_minutes: string
  max_participants: string
  min_participants: string
  max_teams: string
  max_participants_per_team: string
  is_team_event: boolean
  stage_required: boolean
  judge_count: string
  round_count: string
  status: CompetitionStatus
  allow_multiple_entries: boolean
  requires_approval: boolean
  instructions: string
  winning_criteria: string
  scoring_method: string
  max_score: string
  passing_score: string
}
