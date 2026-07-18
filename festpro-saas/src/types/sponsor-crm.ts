export type SponsorCategory = "platinum" | "gold" | "silver" | "bronze" | "media" | "partner" | "associate" | "supporter"
export type SponsorStatus = "lead" | "negotiation" | "active" | "completed" | "cancelled"
export type DonorType = "individual" | "family" | "organization" | "trust" | "institution" | "anonymous"
export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled"
export type DonationMethod = "cash" | "upi" | "bank_transfer" | "cheque" | "card" | "online" | "other"
export type PledgeStatus = "pending" | "partial" | "completed" | "cancelled" | "defaulted"
export type ReceiptStatus = "draft" | "issued" | "cancelled"
export type CrmActivityType = "call" | "meeting" | "email" | "note" | "followup" | "task" | "whatsapp" | "sms"

export interface SponsorCategoryMeta {
  id: string; organization_id: string; name: string; category: SponsorCategory
  description: string | null; min_amount: number; max_amount: number | null
  benefits: string[]; sort_order: number; color: string; is_active: boolean
  created_at: string; updated_at: string
}

export interface Sponsor {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  company_name: string; logo_url: string | null; website: string | null
  contact_person: string; email: string | null; phone: string | null; address: string | null
  tax_id: string | null; gst_number: string | null
  sponsorship_amount: number; amount_received: number
  agreement_status: SponsorStatus; agreement_date: string | null; notes: string | null
  tags: string[]; is_visible: boolean; created_by: string | null
  created_at: string; updated_at: string
}

export interface SponsorPackage {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  name: string; description: string | null; amount: number
  benefits: string[]; max_sponsors: number | null; is_active: boolean
  created_at: string; updated_at: string
}

export interface SponsorContract {
  id: string; organization_id: string; sponsor_id: string
  contract_number: string; title: string; content: string | null; amount: number
  start_date: string; end_date: string; status: SponsorStatus
  signed_by_sponsor: boolean; signed_by_org: boolean; signed_at: string | null; file_url: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface SponsorBenefit {
  id: string; organization_id: string; sponsor_id: string
  benefit_type: string; description: string; status: string
  delivered_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface SponsorPayment {
  id: string; organization_id: string; sponsor_id: string
  amount: number; payment_method: DonationMethod; transaction_id: string | null
  payment_date: string; receipt_number: string | null; notes: string | null
  created_by: string | null; created_at: string
}

export interface SponsorBrandAsset {
  id: string; organization_id: string; sponsor_id: string
  asset_type: string; file_url: string; file_name: string | null; file_size: number | null
  is_approved: boolean; notes: string | null; uploaded_by: string | null; created_at: string
}

export interface DonorGroup {
  id: string; organization_id: string; festival_id: string | null
  name: string; description: string | null; color: string; is_active: boolean
  created_at: string; updated_at: string
}

export interface Donor {
  id: string; organization_id: string; festival_id: string | null; group_id: string | null
  donor_type: DonorType; photo_url: string | null; name: string; email: string | null; phone: string | null
  address: string | null; city: string | null; state: string | null; occupation: string | null
  company_name: string | null; notes: string | null; tags: string[]
  preferred_contact: string; is_anonymous: boolean
  total_donated: number; last_donation_date: string | null; donor_since: string; is_active: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface DonorContact {
  id: string; organization_id: string; donor_id: string
  contact_type: string; contact_value: string; is_primary: boolean; created_at: string
}

export interface FundCampaign {
  id: string; organization_id: string; festival_id: string | null
  name: string; description: string | null; goal_amount: number; collected_amount: number
  start_date: string; end_date: string; status: CampaignStatus
  banner_url: string | null; is_featured: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface FundTarget {
  id: string; organization_id: string; campaign_id: string
  name: string; target_amount: number; collected_amount: number; due_date: string | null
  created_at: string; updated_at: string
}

export interface FundCollector {
  id: string; organization_id: string; festival_id: string | null; user_id: string | null
  name: string; phone: string | null; email: string | null; photo_url: string | null
  area: string | null; is_active: boolean
  total_collected: number; total_target: number; commission_rate: number
  created_by: string | null; created_at: string; updated_at: string
}

export interface CollectorAssignment {
  id: string; organization_id: string; collector_id: string; campaign_id: string | null
  target_amount: number; collected_amount: number; area: string | null
  start_date: string | null; end_date: string | null; status: string
  created_by: string | null; created_at: string; updated_at: string
}

export interface Pledge {
  id: string; organization_id: string; festival_id: string | null; campaign_id: string | null
  donor_id: string | null; collector_id: string | null
  pledge_number: string; amount: number; amount_paid: number; balance: number
  due_date: string | null; installments: number; purpose: string | null
  status: PledgeStatus; reminder_schedule: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface PledgeInstallment {
  id: string; organization_id: string; pledge_id: string
  installment_number: number; amount: number; due_date: string; paid_date: string | null
  status: string; receipt_number: string | null
  created_at: string; updated_at: string
}

export interface Donation {
  id: string; organization_id: string; festival_id: string | null; campaign_id: string | null
  donor_id: string | null; collector_id: string | null; pledge_id: string | null; receipt_id: string | null
  donation_number: string; donor_name: string; donor_phone: string | null; donor_email: string | null
  amount: number; payment_method: DonationMethod; transaction_id: string | null
  payment_date: string; is_anonymous: boolean; purpose: string | null; notes: string | null
  receipt_status: ReceiptStatus; created_by: string | null; created_at: string
}

export interface DonationReceipt {
  id: string; organization_id: string; donation_id: string
  receipt_number: string; receipt_date: string; donor_name: string; donor_address: string | null
  amount: number; amount_in_words: string | null; payment_method: DonationMethod; purpose: string | null
  receipt_type: string; qr_code_url: string | null; barcode_data: string | null
  digital_signature: string | null; pdf_url: string | null
  is_verified: boolean; status: ReceiptStatus; reprint_count: number
  created_by: string | null; created_at: string
}

export interface ReceiptTemplate {
  id: string; organization_id: string; name: string; content: string | null
  header_text: string | null; footer_text: string | null; logo_position: string
  show_qr: boolean; show_barcode: boolean; show_signature: boolean; is_default: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface PaymentMethodMeta {
  id: string; organization_id: string; festival_id: string | null
  name: string; method: DonationMethod
  account_name: string | null; account_number: string | null; bank_name: string | null
  upi_id: string | null; qr_code_url: string | null; is_active: boolean
  created_at: string; updated_at: string
}

export interface Transaction {
  id: string; organization_id: string; festival_id: string | null
  transaction_number: string; type: string; category: string; amount: number
  payment_method: DonationMethod; transaction_date: string; donor_name: string | null
  description: string | null; reference_id: string | null; reference_type: string | null; status: string
  created_by: string | null; created_at: string
}

export interface CrmTag {
  id: string; organization_id: string; name: string; color: string; created_at: string
}

export interface CrmNote {
  id: string; organization_id: string; entity_type: string; entity_id: string
  content: string; created_by: string | null; created_at: string; updated_at: string
}

export interface CrmTask {
  id: string; organization_id: string; entity_type: string | null; entity_id: string | null
  title: string; description: string | null; priority: string; status: string
  assigned_to: string | null; due_date: string | null; completed_at: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface CrmFollowup {
  id: string; organization_id: string; entity_type: string; entity_id: string
  content: string; followup_date: string; status: string; completed_at: string | null
  created_by: string | null; created_at: string
}

export interface CrmActivity {
  id: string; organization_id: string; entity_type: string; entity_id: string
  activity_type: CrmActivityType; subject: string; description: string | null
  duration_minutes: number | null; outcome: string | null; performed_by: string | null
  performed_at: string; created_at: string
}

export interface ThankYouMessage {
  id: string; organization_id: string; donor_id: string | null; donation_id: string | null
  message: string; channel: string; sent_at: string; is_delivered: boolean; created_by: string | null
}

export interface Module15DashboardData {
  total_sponsors: number; active_sponsors: number; total_donors: number
  total_campaigns: number; active_campaigns: number; total_collectors: number
  total_donations_today: number; donation_amount_today: number
  total_pledges: number; pending_pledges: number; total_receipts: number
  total_collected: number; total_campaign_goal: number
}
