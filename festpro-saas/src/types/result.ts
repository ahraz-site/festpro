export type ResultPublishStatus = "draft" | "internal_review" | "published" | "live" | "archived"
export type AppealStatus = "submitted" | "under_review" | "approved" | "rejected" | "withdrawn"
export type CertificateType = "participant" | "winner" | "judge" | "volunteer" | "organizer" | "chief_guest" | "staff" | "participation"
export type EntityType = "unit" | "sector" | "division" | "organization"
export type PointType = "rank" | "participation" | "special" | "bonus"
export type AppealType = "score_review" | "rank_dispute" | "eligibility" | "technical_issue" | "other"
export type PublishScope = "competition" | "stage" | "category" | "festival"

export interface ResultItem {
  id: string; competition_id: string; participant_id: string; festival_id: string; organization_id: string; round_id: string | null
  total_score: number | null; average_score: number | null; weighted_score: number | null; final_score: number | null
  rank: number | null; rank_category: string | null; is_tie: boolean; tie_broken_by: string | null
  grade: string | null; grade_label: string | null; is_passed: boolean; position: string | null; remarks: string | null
  status: ResultPublishStatus; is_winner: boolean; is_medalist: boolean; medal_type: string | null
  rank_overridden: boolean; rank_overridden_by: string | null; rank_override_reason: string | null
  processed_at: string | null; published_at: string | null; created_at: string; updated_at: string
  participant?: { id: string; first_name: string; last_name: string; participant_id: string; chest_number: string | null; photo_url: string | null; unit: string | null; division: string | null }
  competition?: { id: string; name: string; code: string | null }
}

export interface ResultPublication {
  id: string; festival_id: string; organization_id: string; competition_id: string | null; stage_id: string | null; category_id: string | null
  publish_scope: PublishScope; title: string | null; description: string | null; published_by: string | null
  published_at: string; status: ResultPublishStatus; is_live: boolean; live_at: string | null; archived_at: string | null
}

export interface TeamPointRule {
  id: string; festival_id: string; rule_name: string; entity_type: EntityType; point_type: PointType
  rank_from: number | null; rank_to: number | null; points: number; is_active: boolean; description: string | null
}

export interface TeamPoint {
  id: string; festival_id: string; organization_id: string; entity_type: EntityType; entity_id: string; entity_name: string | null
  total_points: number; rank: number | null; medals_gold: number; medals_silver: number; medals_bronze: number
  participation_count: number; competition_count: number; status: ResultPublishStatus; calculated_at: string | null
}

export interface OverallChampionship {
  id: string; festival_id: string; organization_id: string; championship_type: string; entity_id: string; entity_name: string | null
  total_points: number; rank: number | null; is_champion: boolean; is_runner_up: boolean
  medals_gold: number; medals_silver: number; medals_bronze: number; status: ResultPublishStatus; calculated_at: string | null
}

export interface Appeal {
  id: string; festival_id: string; organization_id: string; competition_id: string; participant_id: string; result_item_id: string | null
  appeal_type: AppealType; title: string; description: string; status: AppealStatus; priority: string
  assigned_to: string | null; committee_notes: string | null; decision: string | null; decision_by: string | null; decided_at: string | null
  requires_recalculation: boolean; recalculated_result_id: string | null
  submitted_by: string | null; submitted_at: string; resolved_at: string | null
  participant?: { id: string; first_name: string; last_name: string; participant_id: string }
  competition?: { id: string; name: string }
  documents?: AppealDocument[]
  history?: AppealHistory[]
}

export interface AppealDocument {
  id: string; appeal_id: string; file_name: string; file_path: string; file_type: string | null; file_size: number | null; uploaded_by: string | null
}

export interface AppealHistory {
  id: string; appeal_id: string; from_status: AppealStatus | null; to_status: AppealStatus; changed_by: string | null; change_notes: string | null
}

export interface CertificateTemplate {
  id: string; festival_id: string; organization_id: string; certificate_type: CertificateType; template_name: string
  orientation: string; page_size: string; background_image_url: string | null; logo_url: string | null
  header_text: string | null; body_template: string; footer_text: string | null
  font_family: string; primary_color: string; accent_color: string
  show_qr: boolean; show_serial: boolean; show_date: boolean; show_signature: boolean; show_logo: boolean
  is_active: boolean; version: number
}

export interface Certificate {
  id: string; festival_id: string; organization_id: string; template_id: string | null
  recipient_type: CertificateType; recipient_id: string; recipient_name: string; recipient_email: string | null
  competition_id: string | null; result_item_id: string | null
  certificate_type: string | null; position: string | null; rank: number | null; grade: string | null; score: number | null
  certificate_number: string; verification_code: string; qr_data: string | null; digital_signature: string | null
  status: string; is_verified: boolean; last_verified_at: string | null; generated_by: string | null; generated_at: string | null
  published_at: string | null; revoked_at: string | null; revoke_reason: string | null
}

export interface CertificateBatch {
  id: string; festival_id: string; organization_id: string; template_id: string | null; batch_name: string
  total_count: number; success_count: number; failed_count: number; status: string; started_at: string | null; completed_at: string | null; error_log: string | null
}

export interface CertificateVerification {
  id: string; certificate_id: string; verified_by: string | null; ip_address: string | null; user_agent: string | null; verification_method: string; is_valid: boolean; details: string | null
}

export interface ResultAuditLog {
  id: string; festival_id: string; organization_id: string; action: string; entity_type: string; entity_id: string | null
  performed_by: string | null; old_values: any; new_values: any; metadata: any; created_at: string
}

export interface ResultGrade {
  id: string; festival_id: string; grade: string; min_percentage: number; max_percentage: number
  label: string | null; is_pass: boolean; color: string; display_order: number; created_at: string; updated_at: string
}

export type GradeLetter = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "E"

export interface ResultRanking {
  id: string; entity_type: string; entity_id: string; entity_name: string | null; total_points: number
  rank: number | null; medals_gold: number; medals_silver: number; medals_bronze: number
  participation_count: number; status: string
}

export interface Module8DashboardData {
  total_results: number; published_results: number; draft_results: number; live_results: number
  total_team_points: number; team_rankings_count: number; championship_count: number
  pending_appeals: number; total_appeals: number
  total_certificates: number; certificates_generated: number; certificates_published: number
  total_verifications: number
}
