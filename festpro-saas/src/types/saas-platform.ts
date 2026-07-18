export type TenantStatus = "active" | "suspended" | "archived" | "deleted" | "trial"
export type SubscriptionPlanInterval = "monthly" | "yearly" | "custom"
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "expired" | "paused"
export type BillingCycle = "monthly" | "quarterly" | "semi_annual" | "annual" | "custom"
export type InvoiceStatus = "draft" | "pending" | "sent" | "paid" | "overdue" | "cancelled" | "refunded" | "partially_paid"
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "partially_refunded"
export type PaymentGatewayProvider = "stripe" | "razorpay" | "paypal" | "manual" | "bank_transfer" | "cash"
export type DomainStatus = "pending" | "verified" | "failed" | "expired" | "ssl_active" | "ssl_failed"
export type LicenseStatus = "active" | "inactive" | "expired" | "revoked" | "suspended"
export type UsagePeriod = "daily" | "weekly" | "monthly" | "yearly"
export type FeatureFlagStatus = "enabled" | "disabled" | "beta" | "limited"

export interface Tenant {
  id: string; organization_id: string; tenant_code: string; tenant_name: string; slug: string
  plan_id: string | null; status: TenantStatus; trial_ends_at: string | null; activated_at: string | null
  suspended_at: string | null; archived_at: string | null; owner_id: string | null
  contact_email: string; contact_phone: string | null; address_line1: string | null
  address_line2: string | null; city: string | null; state: string | null; postal_code: string | null
  country: string; currency: string; timezone: string; locale: string; max_users: number
  max_storage_gb: number; is_trial: boolean; metadata: any; created_at: string; updated_at: string
}

export interface SubscriptionPlan {
  id: string; plan_code: string; plan_name: string; description: string | null
  plan_interval: SubscriptionPlanInterval; price_monthly: number; price_yearly: number
  trial_days: number; max_organizations: number; max_festivals: number; max_participants: number
  max_users: number; max_storage_gb: number; max_sms: number; max_emails: number
  max_api_calls: number; max_ai_credits: number; white_label_allowed: boolean
  custom_domain_allowed: boolean; priority_support: boolean; api_access: boolean
  advanced_reports: boolean; features: any; is_public: boolean; is_active: boolean
  sort_order: number; created_at: string; updated_at: string
}

export interface PlanFeature {
  id: string; plan_id: string; feature_code: string; feature_name: string; description: string | null
  feature_type: string; feature_value: string | null; max_limit: number | null
  is_visible: boolean; sort_order: number; created_at: string
}

export interface TenantSubscription {
  id: string; tenant_id: string; plan_id: string; status: SubscriptionStatus
  billing_cycle: BillingCycle; current_period_start: string; current_period_end: string
  trial_start: string | null; trial_end: string | null; canceled_at: string | null
  paused_at: string | null; resumed_at: string | null; ended_at: string | null
  auto_renew: boolean; payment_gateway_subscription_id: string | null; metadata: any
  created_at: string; updated_at: string
}

export interface Invoice {
  id: string; tenant_id: string; subscription_id: string | null; billing_account_id: string | null
  invoice_number: string; invoice_date: string; due_date: string; paid_date: string | null
  status: InvoiceStatus; currency: string; subtotal: number; tax_percent: number
  tax_amount: number; discount_amount: number; total: number; amount_paid: number
  amount_due: number; notes: string | null; terms: string | null; billing_address: any
  metadata: any; created_at: string; updated_at: string
}

export interface InvoicePayment {
  id: string; invoice_id: string; payment_method_id: string | null; gateway_id: string | null
  gateway_payment_id: string | null; amount: number; currency: string; status: PaymentStatus
  payment_date: string; fee_amount: number; net_amount: number; failure_reason: string | null
  receipt_url: string | null; metadata: any; created_at: string
}

export interface TenantBranding {
  id: string; tenant_id: string; logo_url: string | null; favicon_url: string | null
  primary_color: string; secondary_color: string; accent_color: string
  background_color: string; text_color: string; font_family: string; font_url: string | null
  login_page_bg: string | null; login_logo_url: string | null; email_header_logo: string | null
  email_footer_text: string | null; email_footer_logo: string | null; custom_css: string | null
  custom_js: string | null; is_active: boolean; created_at: string; updated_at: string
}

export interface BillingAccount {
  id: string; tenant_id: string; account_name: string; billing_email: string; tax_id: string | null
  business_name: string | null; address_line1: string | null; address_line2: string | null
  city: string | null; state: string | null; postal_code: string | null; country: string
  currency: string; tax_rate: number; invoice_prefix: string; next_invoice_number: number
  payment_terms_days: number; late_fee_percent: number; is_active: boolean
  created_at: string; updated_at: string
}

export interface PaymentGateway {
  id: string; tenant_id: string | null; provider: PaymentGatewayProvider; gateway_name: string
  is_global: boolean; is_active: boolean; is_default: boolean; environment: string
  configuration: any; created_at: string; updated_at: string
}

export interface CustomDomain {
  id: string; tenant_id: string; domain: string; is_primary: boolean; is_verified: boolean
  verification_method: string; dns_verified_at: string | null; ssl_status: string
  ssl_provider: string; ssl_certificate: string | null; ssl_private_key: string | null
  ssl_expires_at: string | null; is_active: boolean; created_at: string; updated_at: string
}

export interface LicenseKey {
  id: string; tenant_id: string; license_key: string; license_type: string
  max_activations: number; current_activations: number; hardware_ids: string[] | null
  status: LicenseStatus; issued_at: string; activated_at: string | null
  expires_at: string | null; revoked_at: string | null; metadata: any
  created_at: string; updated_at: string
}

export interface SaasDashboardData {
  total_tenants: number; active_tenants: number; trial_tenants: number; suspended_tenants: number
  total_plans: number; total_subscriptions: number; mrr: number; arr: number
  total_invoices: number; paid_invoices: number; overdue_invoices: number
  total_revenue: number; monthly_revenue: number; total_domains: number; verified_domains: number
  total_backups: number; total_storage_gb: number
}
