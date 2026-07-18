export type TicketPriority = "low" | "medium" | "high" | "urgent" | "critical"
export type TicketStatus = "new" | "open" | "assigned" | "in_progress" | "resolved" | "closed" | "reopened" | "on_hold" | "cancelled"
export type EscalationLevel = "level1" | "level2" | "level3" | "level4"
export type VisitorCategoryEnum = "general" | "guest" | "vip" | "media" | "sponsor" | "government" | "organization" | "volunteer" | "staff" | "participant"
export type LostItemStatus = "reported" | "matched" | "claimed" | "closed" | "disposed"
export type LostItemCategory = "mobile_phone" | "wallet" | "bag" | "id_card" | "certificate" | "documents" | "jewellery" | "watch" | "electronics" | "keys" | "clothing" | "umbrella" | "water_bottle" | "laptop" | "tablet" | "headphones" | "books" | "other"
export type ClaimStatus = "pending" | "under_review" | "verified" | "approved" | "rejected" | "collected" | "closed"
export type FeedbackFormStatus = "draft" | "published" | "closed"

export interface HelpDesk {
  id: string; organization_id: string; festival_id: string | null
  desk_code: string; desk_name: string; location: string | null; department: string | null
  is_active: boolean; operating_hours: any; contact_number: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface HelpDeskStaff {
  id: string; organization_id: string; festival_id: string | null; desk_id: string | null
  user_id: string | null; staff_role: string; is_active: boolean
  assigned_at: string; created_at: string
}

export interface SupportCategory {
  id: string; organization_id: string; name: string; description: string | null
  icon: string | null; sort_order: number; is_active: boolean; created_at: string
}

export interface SupportPriority {
  id: string; organization_id: string; name: string; priority_level: TicketPriority
  sla_response_minutes: number; sla_resolution_minutes: number
  color: string; sort_order: number; is_active: boolean; created_at: string
}

export interface SupportStatus {
  id: string; organization_id: string; name: string; status: TicketStatus
  color: string; sort_order: number; is_closed: boolean; is_active: boolean; created_at: string
}

export interface SupportTicket {
  id: string; organization_id: string; festival_id: string | null; desk_id: string | null
  ticket_number: string; subject: string; description: string | null
  category_id: string | null; priority_id: string | null
  status: TicketStatus; source: string
  submitted_by: string | null; submitter_name: string | null; submitter_email: string | null; submitter_phone: string | null
  assigned_to: string | null; assigned_at: string | null
  due_at: string | null; resolved_at: string | null; closed_at: string | null; reopened_at: string | null
  resolution_notes: string | null; is_internal: boolean; tags: string[]; metadata: any
  created_at: string; updated_at: string
}

export interface TicketComment {
  id: string; organization_id: string; ticket_id: string
  sender_id: string | null; sender_name: string; sender_role: string | null
  comment: string; is_internal: boolean; created_at: string
}

export interface TicketAttachment {
  id: string; organization_id: string; ticket_id: string; comment_id: string | null
  file_name: string; file_url: string; file_size: number | null; mime_type: string | null
  uploaded_by: string | null; created_at: string
}

export interface TicketHistory {
  id: string; organization_id: string; ticket_id: string
  action: string; field_name: string | null; old_value: string | null; new_value: string | null
  performed_by: string | null; notes: string | null; created_at: string
}

export interface TicketAssignment {
  id: string; organization_id: string; ticket_id: string
  assigned_by: string | null; assigned_to: string | null
  assigned_at: string; unassigned_at: string | null; reason: string | null; created_at: string
}

export interface TicketSla {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  priority: TicketPriority; response_time_minutes: number; resolution_time_minutes: number
  escalation_minutes: number[]; is_active: boolean; created_at: string; updated_at: string
}

export interface TicketEscalation {
  id: string; organization_id: string; ticket_id: string; escalation_level: EscalationLevel
  escalated_by: string | null; escalated_to: string | null; reason: string | null
  previous_assignee: string | null; resolved_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface KnowledgeBaseCategory {
  id: string; organization_id: string; festival_id: string | null
  name: string; description: string | null; icon: string | null; parent_id: string | null
  sort_order: number; is_active: boolean; created_at: string
}

export interface KnowledgeArticle {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  title: string; content: string | null; tags: string[]; attachments: any[]
  is_published: boolean; view_count: number; helpful_count: number; not_helpful_count: number
  sort_order: number; created_by: string | null; created_at: string; updated_at: string
}

export interface FaqItem {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  question: string; answer: string; tags: string[]; sort_order: number
  is_published: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface VisitorCategoryMeta {
  id: string; organization_id: string; festival_id: string | null
  name: string; category: VisitorCategoryEnum; description: string | null
  access_areas: string[]; requires_approval: boolean
  pass_color: string; sort_order: number; is_active: boolean; created_at: string
}

export interface Visitor {
  id: string; organization_id: string; festival_id: string; category_id: string | null
  visitor_category: VisitorCategoryEnum; first_name: string; last_name: string
  email: string | null; phone: string | null; photo_url: string | null
  address: string | null; city: string | null; state: string | null
  id_proof_type: string | null; id_proof_number: string | null; id_proof_url: string | null
  company_name: string | null; designation: string | null; purpose_of_visit: string | null
  host_name: string | null; host_department: string | null; host_contact: string | null
  is_vip: boolean; is_blacklisted: boolean; notes: string | null; tags: string[]
  total_visits: number; last_visit_date: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface VisitorGroup {
  id: string; organization_id: string; festival_id: string
  group_name: string; group_type: string; member_count: number
  contact_person: string | null; contact_phone: string | null; contact_email: string | null
  organization_name: string | null; purpose: string | null; expected_checkin: string | null
  notes: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface VisitorPass {
  id: string; organization_id: string; festival_id: string; visitor_id: string
  pass_number: string;   pass_type: VisitorCategoryEnum
  qr_code: string | null; qr_code_url: string | null; barcode: string | null
  validity_start: string; validity_end: string | null; access_areas: string[]
  is_active: boolean; is_used: boolean; issued_by: string | null
  issued_at: string; used_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface VisitorCheckin {
  id: string; organization_id: string; festival_id: string; visitor_id: string
  pass_id: string | null; group_id: string | null
  check_in_time: string; check_in_method: string
  checked_in_by: string | null; desk_id: string | null
  badge_issued: boolean; badge_number: string | null
  vehicle_number: string | null; escort_required: boolean; escorted_by: string | null
  notes: string | null; created_at: string
}

export interface VisitorCheckoutLog {
  id: string; organization_id: string; festival_id: string; checkin_id: string; visitor_id: string
  check_out_time: string; check_out_method: string
  checked_out_by: string | null; notes: string | null; created_at: string
}

export interface VisitorHost {
  id: string; organization_id: string; festival_id: string | null
  name: string; email: string | null; phone: string | null
  department: string | null; designation: string | null; is_active: boolean
  created_at: string; updated_at: string
}

export interface MeetingLog {
  id: string; organization_id: string; festival_id: string; visitor_id: string | null; host_id: string | null
  subject: string; description: string | null; meeting_time: string | null
  duration_minutes: number | null; location: string | null; status: string; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface LostItem {
  id: string; organization_id: string; festival_id: string
  item_name: string; description: string | null; category: LostItemCategory
  color: string | null; brand: string | null; model: string | null; serial_number: string | null
  distinctive_features: string | null; lost_location: string | null; lost_date: string | null
  reported_by: string | null; reporter_name: string | null; reporter_phone: string | null; reporter_email: string | null
  photo_urls: string[]; status: LostItemStatus; is_valuable: boolean
  estimated_value: number | null; storage_location: string | null
  claimed_at: string | null; disposed_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface FoundItem {
  id: string; organization_id: string; festival_id: string
  item_name: string; description: string | null; category: LostItemCategory
  color: string | null; brand: string | null; model: string | null; serial_number: string | null
  distinctive_features: string | null; found_location: string; found_at: string
  found_by: string | null; finder_name: string | null; finder_phone: string | null; finder_email: string | null
  photo_urls: string[]; status: LostItemStatus; is_valuable: boolean
  estimated_value: number | null; storage_location: string | null
  matched_lost_item_id: string | null; returned_at: string | null; disposed_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface ClaimRequest {
  id: string; organization_id: string; festival_id: string
  lost_item_id: string | null; found_item_id: string | null
  claimant_name: string; claimant_email: string | null; claimant_phone: string | null; claimant_photo_url: string | null
  relationship: string | null; description: string
  id_proof_type: string | null; id_proof_number: string | null; id_proof_url: string | null
  proof_of_ownership: string[]; status: ClaimStatus
  verified_by: string | null; verified_at: string | null; verification_notes: string | null
  approved_by: string | null; approved_at: string | null; rejection_reason: string | null
  collected_at: string | null; collected_by_name: string | null; collector_id_proof: string | null
  digital_signature: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface ClaimVerification {
  id: string; organization_id: string; festival_id: string; claim_id: string
  verification_type: string; verified_by: string | null; is_verified: boolean
  verification_method: string | null; notes: string | null; created_at: string
}

export interface ItemHandoverLog {
  id: string; organization_id: string; festival_id: string; claim_id: string
  handover_by: string | null; handover_to_name: string; handover_to_phone: string | null
  handover_to_id_proof: string | null; item_condition: string | null
  digital_signature: string | null; handover_photo_url: string | null; notes: string | null; created_at: string
}

export interface FeedbackForm {
  id: string; organization_id: string; festival_id: string | null
  title: string; description: string | null; form_type: string
  questions: any[]; is_active: boolean
  valid_from: string; valid_until: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface FeedbackResponse {
  id: string; organization_id: string; festival_id: string; form_id: string
  ticket_id: string | null; visitor_id: string | null
  respondent_name: string | null; respondent_email: string | null; respondent_phone: string | null
  responses: any; submitted_at: string; created_at: string
}

export interface ServiceRating {
  id: string; organization_id: string; festival_id: string
  ticket_id: string | null; desk_id: string | null
  rating: number; category: string | null; comment: string | null
  rated_by: string | null; visitor_name: string | null; created_at: string
}

export interface Module16DashboardData {
  total_tickets: number; open_tickets: number; resolved_tickets: number; escalated_tickets: number
  total_visitors: number; checked_in_today: number; vip_visitors: number
  total_lost_items: number; total_found_items: number; claimed_items: number
  pending_claims: number; total_desks: number; total_staff: number
  avg_resolution_time: number; avg_rating: number; total_feedback: number
}
