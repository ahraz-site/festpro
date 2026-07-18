export type IdCardType =
  | "participant" | "judge" | "volunteer" | "staff" | "team_manager"
  | "organization_admin" | "festival_director" | "reception" | "media"
  | "guest" | "vip" | "security" | "medical" | "technical"
export type BadgeType = "stage_access" | "judge" | "volunteer" | "staff" | "guest" | "vip" | "media" | "security"
export type PassType = "general" | "vip" | "guest" | "media" | "vehicle" | "parking" | "backstage" | "stage_access"
export type PassStatus = "active" | "used" | "expired" | "revoked" | "cancelled"
export type CardStatus = "draft" | "active" | "expired" | "revoked" | "cancelled"
export type PrintStatus = "queued" | "processing" | "completed" | "failed" | "cancelled"
export type VerificationMethod = "qr_scan" | "barcode_scan" | "manual_search" | "api"
export type VerificationResult = "valid" | "invalid" | "expired" | "revoked" | "not_found"

export interface IdCardTemplate {
  id: string; organization_id: string; festival_id: string | null; name: string
  card_type: IdCardType; width_mm: number; height_mm: number; orientation: string
  background_color: string; text_color: string; accent_color: string; font_family: string
  logo_position: string; photo_position: string; photo_width_mm: number; photo_height_mm: number
  show_qr: boolean; show_barcode: boolean; qr_position: string
  fields: any[]; layout_data: any; is_active: boolean; created_by: string | null
  created_at: string; updated_at: string
}

export interface IdCard {
  id: string; organization_id: string; festival_id: string | null; template_id: string | null
  participant_id: string | null; user_id: string | null
  card_type: IdCardType; card_number: string; chest_number: string | null
  registration_number: string | null; photo_url: string | null
  first_name: string; last_name: string; role_title: string | null
  unit: string | null; division: string | null; sector: string | null
  competition_info: string | null; emergency_contact_name: string | null
  emergency_contact_phone: string | null; blood_group: string | null
  organization_name: string | null
  validity_start: string; validity_end: string; status: CardStatus
  qr_code_id: string | null; barcode_id: string | null; metadata: any
  issued_by: string | null; issued_at: string | null; revoked_at: string | null; revoked_reason: string | null
  created_at: string; updated_at: string
}

export interface BadgeTemplate {
  id: string; organization_id: string; festival_id: string | null; name: string
  badge_type: BadgeType; width_mm: number; height_mm: number
  background_color: string; text_color: string; accent_color: string
  show_photo: boolean; show_qr: boolean; show_barcode: boolean
  access_levels: string[]; layout_data: any; is_active: boolean; created_by: string | null
  created_at: string; updated_at: string
}

export interface Badge {
  id: string; organization_id: string; festival_id: string | null; template_id: string | null
  user_id: string | null; badge_type: BadgeType; badge_number: string; holder_name: string
  role_title: string | null; department: string | null; photo_url: string | null
  access_levels: string[]; validity_start: string; validity_end: string; status: CardStatus
  qr_code_id: string | null; barcode_id: string | null
  issued_by: string | null; issued_at: string | null; revoked_at: string | null; revoked_reason: string | null
  created_at: string; updated_at: string
}

export interface PassTypeMeta {
  id: string; organization_id: string; festival_id: string | null; name: string
  type: PassType; description: string | null; color: string; icon: string | null
  access_areas: string[]; max_quantity: number | null; validity_days: number | null
  is_transferable: boolean; requires_approval: boolean; price: number; is_active: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface PassCategory {
  id: string; organization_id: string; festival_id: string | null; name: string
  description: string | null; parent_id: string | null; sort_order: number; is_active: boolean
  created_at: string
}

export interface Pass {
  id: string; organization_id: string; festival_id: string | null; pass_type_id: string | null
  category_id: string | null; pass_number: string; pass_type: PassType; holder_name: string
  holder_contact: string | null; organization_name: string | null; photo_url: string | null
  access_areas: string[]; validity_start: string; validity_end: string; status: PassStatus
  is_transferable: boolean; qr_code_id: string | null; barcode_id: string | null
  issued_by: string | null; issued_at: string | null; used_at: string | null
  revoked_at: string | null; revoked_reason: string | null; metadata: any
  created_at: string; updated_at: string
}

export interface VehiclePass {
  id: string; organization_id: string; festival_id: string; pass_id: string | null
  vehicle_number: string; vehicle_type: string; driver_name: string | null
  driver_phone: string | null; parking_zone: string | null
  validity_start: string; validity_end: string; status: PassStatus
  qr_code_id: string | null; issued_by: string | null; issued_at: string | null
  created_at: string; updated_at: string
}

export interface GuestPass {
  id: string; organization_id: string; festival_id: string; pass_id: string | null
  guest_name: string; guest_phone: string | null; guest_email: string | null
  host_name: string; host_department: string | null; purpose: string | null; company: string | null
  validity_start: string; validity_end: string; status: PassStatus
  qr_code_id: string | null; checked_in_at: string | null; checked_out_at: string | null
  issued_by: string | null; issued_at: string | null; created_at: string; updated_at: string
}

export interface VipPass {
  id: string; organization_id: string; festival_id: string; pass_id: string | null
  vip_name: string; vip_title: string | null; vip_phone: string | null; vip_email: string | null
  vip_level: number; personal_assistant: string | null; security_clearance: string | null
  special_requirements: string | null; has_parking: boolean; has_hospitality: boolean
  validity_start: string; validity_end: string; status: PassStatus
  qr_code_id: string | null; issued_by: string | null; issued_at: string | null
  created_at: string; updated_at: string
}

export interface MediaPass {
  id: string; organization_id: string; festival_id: string; pass_id: string | null
  media_name: string; media_organization: string; media_type: string
  media_phone: string | null; media_email: string | null; press_id_number: string | null
  equipment_list: string | null; has_camera_permit: boolean; has_drone_permit: boolean
  has_interview_access: boolean; validity_start: string; validity_end: string; status: PassStatus
  qr_code_id: string | null; issued_by: string | null; issued_at: string | null
  created_at: string; updated_at: string
}

export interface QrCode {
  id: string; organization_id: string; festival_id: string | null
  entity_type: string; entity_id: string
  token: string; encrypted_data: string | null; expires_at: string | null
  max_scans: number; scan_count: number; is_revoked: boolean; metadata: any
  created_by: string | null; created_at: string
}

export interface BarcodeRecord {
  id: string; organization_id: string; festival_id: string | null
  entity_type: string; entity_id: string; barcode_type: string
  barcode_data: string; barcode_image_url: string | null; is_revoked: boolean
  created_by: string | null; created_at: string
}

export interface PrintJob {
  id: string; organization_id: string; festival_id: string | null
  job_name: string; entity_type: string; entity_ids: string[]
  total_items: number; completed_items: number; status: PrintStatus
  print_type: string; template_id: string | null; pdf_url: string | null
  error_message: string | null; started_at: string | null; completed_at: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface PrintHistory {
  id: string; print_job_id: string | null; organization_id: string
  entity_type: string; entity_id: string; card_number: string | null
  printed_at: string; printed_by: string | null; printer_name: string | null; copies: number
}

export interface VerificationLog {
  id: string; organization_id: string; festival_id: string | null
  entity_type: string; entity_id: string | null; verification_method: VerificationMethod
  result: VerificationResult; scanned_data: string | null
  scanner_user_id: string | null; scanner_location: string | null; metadata: any
  created_at: string
}

export interface Module14DashboardData {
  total_id_cards: number; active_id_cards: number; total_badges: number; active_badges: number
  total_passes: number; active_passes: number; total_qr_codes: number
  verifications_today: number; valid_verifications: number; failed_verifications: number
  print_queue_count: number; recent_prints: number
}
