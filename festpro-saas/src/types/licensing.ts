export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'NEFT' | 'RTGS';
export type PaymentStatus = 'Pending' | 'Verified' | 'Rejected';
export type LicenseStatus = 'Pending' | 'Active' | 'Expired' | 'Suspended';
export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly' | 'Lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  billing_cycle: BillingCycle;
  price: number;
  max_users: number;
  max_festivals: number;
  max_storage_gb: number;
  created_at: string;
  updated_at: string;
}

export interface LicenseFeature {
  id: string;
  plan_id: string;
  feature_key: string;
  is_enabled: boolean;
  created_at: string;
}

export interface License {
  id: string;
  plan_id: string | null;
  status: LicenseStatus;
  max_users: number | null;
  max_festivals: number | null;
  max_storage_gb: number | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseKey {
  id: string;
  license_id: string;
  key_hash: string;
  display_key: string;
  is_activated: boolean;
  created_at: string;
}

export interface OrganizationLicense {
  id: string;
  org_id: string;
  license_id: string;
  assigned_at: string;
}

export interface LicenseActivation {
  id: string;
  license_id: string;
  org_id: string;
  activated_by: string;
  device_info: string | null;
  ip_address: string | null;
  activated_at: string;
}

export interface ActivationLog {
  id: string;
  license_id: string;
  action: string;
  ip_address: string | null;
  created_at: string;
}

export interface SubscriptionHistory {
  id: string;
  org_id: string;
  plan_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

export interface SubscriptionUsage {
  id: string;
  org_id: string;
  current_users: number;
  current_festivals: number;
  current_storage_bytes: number;
  last_updated: string;
}

export interface SalesOrder {
  id: string;
  lead_id: string | null;
  plan_id: string | null;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  id: string;
  order_id: string;
  payment_link: string | null;
  requested_amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface ManualPayment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  transaction_id: string | null;
  payment_date: string;
  remarks: string | null;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentProof {
  id: string;
  manual_payment_id: string;
  file_url: string;
  uploaded_at: string;
}

export interface PaymentVerification {
  id: string;
  manual_payment_id: string;
  verified_by: string | null;
  status: PaymentStatus;
  verification_notes: string | null;
  verified_at: string | null;
}
