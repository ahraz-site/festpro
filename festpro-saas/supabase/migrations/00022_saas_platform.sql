-- ============================================================
-- MODULE 22: Enterprise SaaS Billing, Subscription, White Label & Tenant Management
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'archived', 'deleted', 'trial');
CREATE TYPE subscription_plan_interval AS ENUM ('monthly', 'yearly', 'custom');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'expired', 'paused');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'semi_annual', 'annual', 'custom');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled', 'refunded', 'partially_paid');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_gateway_provider AS ENUM ('stripe', 'razorpay', 'paypal', 'manual', 'bank_transfer', 'cash');
CREATE TYPE domain_status AS ENUM ('pending', 'verified', 'failed', 'expired', 'ssl_active', 'ssl_failed');
CREATE TYPE license_status AS ENUM ('active', 'inactive', 'expired', 'revoked', 'suspended');
CREATE TYPE usage_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE feature_flag_status AS ENUM ('enabled', 'disabled', 'beta', 'limited');

-- ============================================================
-- 1. TENANTS
-- ============================================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_code TEXT NOT NULL UNIQUE,
  tenant_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan_id UUID,
  status tenant_status NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ DEFAULT now(),
  suspended_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  max_users INTEGER DEFAULT 10,
  max_storage_gb INTEGER DEFAULT 5,
  is_trial BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. TENANT DOMAINS (custom domain mapping)
-- ============================================================

CREATE TABLE tenant_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  dns_record_type TEXT DEFAULT 'TXT',
  dns_record_name TEXT,
  dns_record_value TEXT,
  ssl_status TEXT DEFAULT 'pending',
  ssl_cert ARRAY,
  redirected_to TEXT,
  status domain_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. TENANT SETTINGS
-- ============================================================

CREATE TABLE tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, setting_key)
);
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. TENANT BRANDING (white label)
-- ============================================================

CREATE TABLE tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#7C3AED',
  accent_color TEXT DEFAULT '#F59E0B',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#111827',
  font_family TEXT DEFAULT 'Inter',
  font_url TEXT,
  login_page_bg TEXT,
  login_logo_url TEXT,
  email_header_logo TEXT,
  email_footer_text TEXT,
  email_footer_logo TEXT,
  custom_css TEXT,
  custom_js TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. TENANT THEMES
-- ============================================================

CREATE TABLE tenant_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  theme_type TEXT DEFAULT 'light',
  colors JSONB DEFAULT '{}',
  typography JSONB DEFAULT '{}',
  spacing JSONB DEFAULT '{}',
  border_radius JSONB DEFAULT '{}',
  shadows JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenant_themes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. SUBSCRIPTION PLANS
-- ============================================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL UNIQUE,
  plan_name TEXT NOT NULL,
  description TEXT,
  plan_interval subscription_plan_interval NOT NULL DEFAULT 'monthly',
  price_monthly NUMERIC(10,2) DEFAULT 0,
  price_yearly NUMERIC(10,2) DEFAULT 0,
  trial_days INTEGER DEFAULT 0,
  max_organizations INTEGER DEFAULT 1,
  max_festivals INTEGER DEFAULT 1,
  max_participants INTEGER DEFAULT 100,
  max_users INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 5,
  max_sms INTEGER DEFAULT 0,
  max_emails INTEGER DEFAULT 0,
  max_api_calls INTEGER DEFAULT 0,
  max_ai_credits INTEGER DEFAULT 0,
  white_label_allowed BOOLEAN DEFAULT false,
  custom_domain_allowed BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  advanced_reports BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. PLAN FEATURES
-- ============================================================

CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT,
  feature_type TEXT DEFAULT 'boolean',
  feature_value TEXT,
  max_limit INTEGER,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_id, feature_code)
);
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. TENANT SUBSCRIPTIONS
-- ============================================================

CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  payment_gateway_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. SUBSCRIPTION USAGE (aggregated)
-- ============================================================

CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES tenant_subscriptions(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  resource_type TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  quantity_used NUMERIC NOT NULL DEFAULT 0,
  quantity_limit NUMERIC,
  unit TEXT DEFAULT 'count',
  cost_per_unit NUMERIC(10,4) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, subscription_id, usage_date, resource_type, resource_name)
);
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. BILLING ACCOUNTS
-- ============================================================

CREATE TABLE billing_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  billing_email TEXT NOT NULL,
  tax_id TEXT,
  business_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  currency TEXT DEFAULT 'USD',
  tax_rate NUMERIC(5,2) DEFAULT 0,
  invoice_prefix TEXT DEFAULT 'INV-',
  next_invoice_number INTEGER DEFAULT 1,
  payment_terms_days INTEGER DEFAULT 30,
  late_fee_percent NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE billing_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. PAYMENT GATEWAYS
-- ============================================================

CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider payment_gateway_provider NOT NULL,
  gateway_name TEXT NOT NULL,
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  api_key TEXT,
  api_secret TEXT,
  webhook_secret TEXT,
  merchant_id TEXT,
  public_key TEXT,
  private_key TEXT,
  environment TEXT DEFAULT 'sandbox',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. PAYMENT CUSTOMERS
-- ============================================================

CREATE TABLE payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  gateway_id UUID REFERENCES payment_gateways(id) ON DELETE SET NULL,
  gateway_customer_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  metadata JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. PAYMENT METHODS
-- ============================================================

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES payment_customers(id) ON DELETE CASCADE,
  gateway_payment_method_id TEXT,
  method_type TEXT NOT NULL,
  last_four TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  card_brand TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  billing_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. INVOICES
-- ============================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  billing_account_id UUID REFERENCES billing_accounts(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  status invoice_status NOT NULL DEFAULT 'draft',
  currency TEXT DEFAULT 'USD',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  amount_due NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  billing_address JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_due ON invoices(due_date, status);

-- ============================================================
-- 15. INVOICE ITEMS
-- ============================================================

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  type TEXT DEFAULT 'subscription',
  metadata JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. INVOICE PAYMENTS
-- ============================================================

CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  gateway_id UUID REFERENCES payment_gateways(id) ON DELETE SET NULL,
  gateway_payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_date TIMESTAMPTZ DEFAULT now(),
  fee_amount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) DEFAULT 0,
  failure_reason TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. CREDIT NOTES
-- ============================================================

CREATE TABLE credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  credit_note_number TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status invoice_status DEFAULT 'pending',
  applied_to_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. DISCOUNTS
-- ============================================================

CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  discount_code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applies_to_plan_ids UUID[],
  min_subtotal NUMERIC(10,2),
  max_discount_amount NUMERIC(10,2),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. COUPON CODES
-- ============================================================

CREATE TABLE coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  min_amount NUMERIC(10,2),
  applies_to_plan_ids UUID[],
  is_reusable BOOLEAN DEFAULT false,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. COUPON REDEMPTIONS
-- ============================================================

CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. USAGE LIMITS
-- ============================================================

CREATE TABLE usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  hard_limit NUMERIC NOT NULL,
  soft_limit NUMERIC,
  warning_threshold NUMERIC,
  period usage_period NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, resource_type, period)
);
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. FEATURE USAGE (daily tracking)
-- ============================================================

CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_code TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  usage_count NUMERIC DEFAULT 0,
  usage_value NUMERIC,
  unit TEXT DEFAULT 'count',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, feature_code, usage_date)
);
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. TENANT STORAGE
-- ============================================================

CREATE TABLE tenant_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  storage_type TEXT NOT NULL DEFAULT 'database',
  storage_name TEXT NOT NULL,
  used_bytes NUMERIC DEFAULT 0,
  allocated_bytes NUMERIC DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  bucket_name TEXT,
  region TEXT,
  last_measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, storage_type, storage_name)
);
ALTER TABLE tenant_storage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. TENANT BACKUPS
-- ============================================================

CREATE TABLE tenant_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL DEFAULT 'full',
  backup_size_bytes NUMERIC,
  file_path TEXT,
  storage_location TEXT,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tenant_backups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. CUSTOM DOMAINS (alias for tenant_domains, web-facing)
-- ============================================================

CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT DEFAULT 'dns',
  dns_verified_at TIMESTAMPTZ,
  ssl_status TEXT DEFAULT 'pending',
  ssl_provider TEXT DEFAULT 'letsencrypt',
  ssl_certificate TEXT,
  ssl_private_key TEXT,
  ssl_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. DNS VERIFICATIONS
-- ============================================================

CREATE TABLE dns_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL DEFAULT 'TXT',
  record_name TEXT,
  record_value TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE dns_verifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. LICENSE KEYS
-- ============================================================

CREATE TABLE license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  license_type TEXT NOT NULL DEFAULT 'standard',
  max_activations INTEGER DEFAULT 1,
  current_activations INTEGER DEFAULT 0,
  hardware_ids TEXT[],
  status license_status NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE license_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Tenants (platform admins see all, tenant users see own)
CREATE POLICY "platform_admin_all" ON tenants FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));
CREATE POLICY "tenant_owner_all" ON tenants FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');

-- Tenant Domains
CREATE POLICY "platform_admin_domains" ON tenant_domains FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "tenant_owner_domains" ON tenant_domains FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));

-- Tenant Settings
CREATE POLICY "platform_admin_settings" ON tenant_settings FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "tenant_owner_settings" ON tenant_settings FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));

-- Tenant Branding
CREATE POLICY "platform_admin_branding" ON tenant_branding FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "tenant_owner_branding" ON tenant_branding FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));

-- Tenant Themes
CREATE POLICY "platform_admin_themes" ON tenant_themes FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "tenant_owner_themes" ON tenant_themes FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));

-- Subscription Plans (public read)
CREATE POLICY "public_read" ON subscription_plans FOR SELECT USING (is_public = true);
CREATE POLICY "platform_admin_plans" ON subscription_plans FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Plan Features
CREATE POLICY "public_read_features" ON plan_features FOR SELECT USING (true);
CREATE POLICY "platform_admin_features" ON plan_features FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Tenant Subscriptions
CREATE POLICY "tenant_sub_own" ON tenant_subscriptions FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_sub" ON tenant_subscriptions FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Subscription Usage
CREATE POLICY "tenant_usage_own" ON subscription_usage FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_usage" ON subscription_usage FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Billing Accounts
CREATE POLICY "tenant_billing_own" ON billing_accounts FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_billing" ON billing_accounts FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Payment Gateways
CREATE POLICY "platform_admin_gateways" ON payment_gateways FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));
CREATE POLICY "tenant_gateways" ON payment_gateways FOR SELECT USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id') OR is_global = true);

-- Payment Customers
CREATE POLICY "tenant_customers_own" ON payment_customers FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_customers" ON payment_customers FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Payment Methods
CREATE POLICY "platform_admin_methods" ON payment_methods FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));
CREATE POLICY "tenant_methods" ON payment_methods FOR ALL USING (EXISTS (SELECT 1 FROM payment_customers pc JOIN tenants t ON t.id = pc.tenant_id WHERE pc.id = customer_id AND t.organization_id = auth.jwt() ->> 'org_id'));

-- Invoices
CREATE POLICY "tenant_invoices_own" ON invoices FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_invoices" ON invoices FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Invoice Items
CREATE POLICY "tenant_invoice_items" ON invoice_items FOR ALL USING (EXISTS (SELECT 1 FROM invoices i JOIN tenants t ON t.id = i.tenant_id WHERE i.id = invoice_id AND t.organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_invoice_items" ON invoice_items FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Invoice Payments
CREATE POLICY "tenant_payments_own" ON invoice_payments FOR ALL USING (EXISTS (SELECT 1 FROM invoices i JOIN tenants t ON t.id = i.tenant_id WHERE i.id = invoice_id AND t.organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_payments" ON invoice_payments FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Credit Notes
CREATE POLICY "tenant_credit_notes" ON credit_notes FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_credit_notes" ON credit_notes FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Discounts
CREATE POLICY "platform_admin_discounts" ON discounts FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Coupon Codes
CREATE POLICY "platform_admin_coupons" ON coupon_codes FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Coupon Redemptions
CREATE POLICY "platform_admin_redemptions" ON coupon_redemptions FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Usage Limits
CREATE POLICY "tenant_limits_own" ON usage_limits FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_limits" ON usage_limits FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Feature Usage
CREATE POLICY "tenant_feature_usage" ON feature_usage FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_feature_usage" ON feature_usage FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Tenant Storage
CREATE POLICY "tenant_storage_own" ON tenant_storage FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_storage" ON tenant_storage FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Tenant Backups
CREATE POLICY "tenant_backups_own" ON tenant_backups FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_backups" ON tenant_backups FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- Custom Domains
CREATE POLICY "tenant_domains_own" ON custom_domains FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_custom_domains" ON custom_domains FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- DNS Verifications
CREATE POLICY "platform_admin_dns" ON dns_verifications FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- License Keys
CREATE POLICY "tenant_licenses_own" ON license_keys FOR ALL USING (EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND organization_id = auth.jwt() ->> 'org_id'));
CREATE POLICY "platform_admin_licenses" ON license_keys FOR ALL USING (auth.jwt() ->> 'role' IN ('platform_owner', 'platform_admin'));

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_domains_updated_at BEFORE UPDATE ON tenant_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_branding_updated_at BEFORE UPDATE ON tenant_branding FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_themes_updated_at BEFORE UPDATE ON tenant_themes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_billing_accounts_updated_at BEFORE UPDATE ON billing_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON payment_gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payment_customers_updated_at BEFORE UPDATE ON payment_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON usage_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tenant_storage_updated_at BEFORE UPDATE ON tenant_storage FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE ON custom_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_license_keys_updated_at BEFORE UPDATE ON license_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at();
