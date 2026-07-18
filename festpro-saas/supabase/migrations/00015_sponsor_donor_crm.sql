-- ============================================================
-- Module 15: Enterprise Sponsor, Donor, Fund Collection & CRM
-- ============================================================

-- ENUMS
CREATE TYPE sponsor_category AS ENUM ('platinum','gold','silver','bronze','media','partner','associate','supporter');
CREATE TYPE sponsor_status AS ENUM ('lead','negotiation','active','completed','cancelled');
CREATE TYPE donor_type AS ENUM ('individual','family','organization','trust','institution','anonymous');
CREATE TYPE campaign_status AS ENUM ('draft','active','paused','completed','cancelled');
CREATE TYPE donation_method AS ENUM ('cash','upi','bank_transfer','cheque','card','online','other');
CREATE TYPE pledge_status AS ENUM ('pending','partial','completed','cancelled','defaulted');
CREATE TYPE receipt_status AS ENUM ('draft','issued','cancelled');
CREATE TYPE crm_activity_type AS ENUM ('call','meeting','email','note','followup','task','whatsapp','sms');

-- ============================================================
-- 1. SPONSOR CATEGORIES
-- ============================================================
CREATE TABLE sponsor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category sponsor_category NOT NULL DEFAULT 'silver',
  description TEXT,
  min_amount NUMERIC DEFAULT 0,
  max_amount NUMERIC,
  benefits TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsor_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. SPONSORS
-- ============================================================
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  category_id UUID REFERENCES sponsor_categories(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  contact_person TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  gst_number TEXT,
  sponsorship_amount NUMERIC DEFAULT 0,
  amount_received NUMERIC DEFAULT 0,
  agreement_status sponsor_status NOT NULL DEFAULT 'lead',
  agreement_date DATE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. SPONSOR PACKAGES
-- ============================================================
CREATE TABLE sponsor_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES sponsor_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  benefits TEXT[] DEFAULT '{}',
  max_sponsors INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsor_packages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. SPONSOR CONTRACTS
-- ============================================================
CREATE TABLE sponsor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status sponsor_status NOT NULL DEFAULT 'negotiation',
  signed_by_sponsor BOOLEAN DEFAULT false,
  signed_by_org BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  file_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsor_contracts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. SPONSOR BENEFITS
-- ============================================================
CREATE TABLE sponsor_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsor_benefits ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. SPONSOR PAYMENTS
-- ============================================================
CREATE TABLE sponsor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method donation_method NOT NULL DEFAULT 'bank_transfer',
  transaction_id TEXT,
  payment_date DATE NOT NULL,
  receipt_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsor_payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. SPONSOR BRAND ASSETS
-- ============================================================
CREATE TABLE sponsor_brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  is_approved BOOLEAN DEFAULT false,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sponsor_brand_assets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. DONOR GROUPS
-- ============================================================
CREATE TABLE donor_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE donor_groups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. DONORS
-- ============================================================
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  group_id UUID REFERENCES donor_groups(id) ON DELETE SET NULL,
  donor_type donor_type NOT NULL DEFAULT 'individual',
  photo_url TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  occupation TEXT,
  company_name TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  preferred_contact TEXT DEFAULT 'phone',
  is_anonymous BOOLEAN DEFAULT false,
  total_donated NUMERIC DEFAULT 0,
  last_donation_date DATE,
  donor_since DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. DONOR CONTACTS
-- ============================================================
CREATE TABLE donor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL DEFAULT 'phone',
  contact_value TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE donor_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. FUND CAMPAIGNS
-- ============================================================
CREATE TABLE fund_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  collected_amount NUMERIC DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  banner_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fund_campaigns ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. FUND TARGETS
-- ============================================================
CREATE TABLE fund_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES fund_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  collected_amount NUMERIC DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fund_targets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. FUND COLLECTORS
-- ============================================================
CREATE TABLE fund_collectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  area TEXT,
  is_active BOOLEAN DEFAULT true,
  total_collected NUMERIC DEFAULT 0,
  total_target NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fund_collectors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. COLLECTOR ASSIGNMENTS
-- ============================================================
CREATE TABLE collector_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  collector_id UUID NOT NULL REFERENCES fund_collectors(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES fund_campaigns(id) ON DELETE SET NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  collected_amount NUMERIC DEFAULT 0,
  area TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE collector_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. PLEDGES
-- ============================================================
CREATE TABLE pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES fund_campaigns(id) ON DELETE SET NULL,
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  collector_id UUID REFERENCES fund_collectors(id) ON DELETE SET NULL,
  pledge_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  due_date DATE,
  installments INTEGER DEFAULT 1,
  purpose TEXT,
  status pledge_status NOT NULL DEFAULT 'pending',
  reminder_schedule TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. PLEDGE INSTALLMENTS
-- ============================================================
CREATE TABLE pledge_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pledge_id UUID NOT NULL REFERENCES pledges(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pledge_installments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. DONATIONS
-- ============================================================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES fund_campaigns(id) ON DELETE SET NULL,
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  collector_id UUID REFERENCES fund_collectors(id) ON DELETE SET NULL,
  pledge_id UUID REFERENCES pledges(id) ON DELETE SET NULL,
  receipt_id UUID,
  donation_number TEXT NOT NULL UNIQUE,
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  payment_method donation_method NOT NULL DEFAULT 'cash',
  transaction_id TEXT,
  payment_date DATE NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  purpose TEXT,
  notes TEXT,
  receipt_status receipt_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. DONATION RECEIPTS
-- ============================================================
CREATE TABLE donation_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  donor_name TEXT NOT NULL,
  donor_address TEXT,
  amount NUMERIC NOT NULL,
  amount_in_words TEXT,
  payment_method donation_method NOT NULL,
  purpose TEXT,
  receipt_type TEXT DEFAULT 'standard',
  qr_code_url TEXT,
  barcode_data TEXT,
  digital_signature TEXT,
  pdf_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  status receipt_status NOT NULL DEFAULT 'draft',
  reprint_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE donation_receipts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. RECEIPT TEMPLATES
-- ============================================================
CREATE TABLE receipt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  header_text TEXT,
  footer_text TEXT,
  logo_position TEXT DEFAULT 'top',
  show_qr BOOLEAN DEFAULT true,
  show_barcode BOOLEAN DEFAULT false,
  show_signature BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. PAYMENT METHODS
-- ============================================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  method donation_method NOT NULL DEFAULT 'cash',
  account_name TEXT,
  account_number TEXT,
  bank_name TEXT,
  upi_id TEXT,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. TRANSACTIONS
-- ============================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  transaction_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'donation',
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method donation_method NOT NULL,
  transaction_date DATE NOT NULL,
  donor_name TEXT,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  status TEXT DEFAULT 'completed',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. CRM TAGS
-- ============================================================
CREATE TABLE crm_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE crm_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. CRM NOTES
-- ============================================================
CREATE TABLE crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. CRM TASKS
-- ============================================================
CREATE TABLE crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT,
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. CRM FOLLOW-UPS
-- ============================================================
CREATE TABLE crm_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  followup_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE crm_followups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. CRM ACTIVITIES
-- ============================================================
CREATE TABLE crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  activity_type crm_activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  outcome TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. THANK YOU MESSAGES
-- ============================================================
CREATE TABLE thank_you_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  channel TEXT DEFAULT 'email',
  sent_at TIMESTAMPTZ DEFAULT now(),
  is_delivered BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE thank_you_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_sponsors_festival ON sponsors(festival_id);
CREATE INDEX idx_sponsors_status ON sponsors(agreement_status);
CREATE INDEX idx_donors_festival ON donors(festival_id);
CREATE INDEX idx_donors_type ON donors(donor_type);
CREATE INDEX idx_fund_campaigns_festival ON fund_campaigns(festival_id);
CREATE INDEX idx_fund_campaigns_status ON fund_campaigns(status);
CREATE INDEX idx_donations_festival ON donations(festival_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_date ON donations(payment_date);
CREATE INDEX idx_pledges_status ON pledges(status);
CREATE INDEX idx_donation_receipts_number ON donation_receipts(receipt_number);
CREATE INDEX idx_crm_activities_entity ON crm_activities(entity_type, entity_id);
CREATE INDEX idx_crm_notes_entity ON crm_notes(entity_type, entity_id);
CREATE INDEX idx_transactions_festival ON transactions(festival_id);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_sponsor_crm_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_sponsors_updated_at BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_sponsor_categories_updated_at BEFORE UPDATE ON sponsor_categories FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_sponsor_packages_updated_at BEFORE UPDATE ON sponsor_packages FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_sponsor_contracts_updated_at BEFORE UPDATE ON sponsor_contracts FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_sponsor_benefits_updated_at BEFORE UPDATE ON sponsor_benefits FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_donors_updated_at BEFORE UPDATE ON donors FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_donor_groups_updated_at BEFORE UPDATE ON donor_groups FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_fund_campaigns_updated_at BEFORE UPDATE ON fund_campaigns FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_fund_targets_updated_at BEFORE UPDATE ON fund_targets FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_fund_collectors_updated_at BEFORE UPDATE ON fund_collectors FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_collector_assignments_updated_at BEFORE UPDATE ON collector_assignments FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_pledges_updated_at BEFORE UPDATE ON pledges FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_pledge_installments_updated_at BEFORE UPDATE ON pledge_installments FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_receipt_templates_updated_at BEFORE UPDATE ON receipt_templates FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_crm_notes_updated_at BEFORE UPDATE ON crm_notes FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();
CREATE TRIGGER trg_crm_tasks_updated_at BEFORE UPDATE ON crm_tasks FOR EACH ROW EXECUTE FUNCTION update_sponsor_crm_updated_at();

-- ============================================================
-- RLS POLICIES (org_isolation for all tables)
-- ============================================================
CREATE POLICY org_isolation_select ON sponsor_categories FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsor_categories FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsor_categories FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsor_categories FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON sponsors FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsors FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsors FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsors FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON sponsor_packages FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsor_packages FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsor_packages FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsor_packages FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON sponsor_contracts FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsor_contracts FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsor_contracts FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsor_contracts FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON sponsor_benefits FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsor_benefits FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsor_benefits FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsor_benefits FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON sponsor_payments FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsor_payments FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsor_payments FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsor_payments FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON sponsor_brand_assets FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON sponsor_brand_assets FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON sponsor_brand_assets FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON sponsor_brand_assets FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON donor_groups FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON donor_groups FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON donor_groups FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON donor_groups FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON donors FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON donors FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON donors FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON donors FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON donor_contacts FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON donor_contacts FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON donor_contacts FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON donor_contacts FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON fund_campaigns FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON fund_campaigns FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON fund_campaigns FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON fund_campaigns FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON fund_targets FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON fund_targets FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON fund_targets FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON fund_targets FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON fund_collectors FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON fund_collectors FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON fund_collectors FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON fund_collectors FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON collector_assignments FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON collector_assignments FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON collector_assignments FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON collector_assignments FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON pledges FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON pledges FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON pledges FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON pledges FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON pledge_installments FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON pledge_installments FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON pledge_installments FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON pledge_installments FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON donations FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON donations FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON donations FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON donations FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON donation_receipts FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON donation_receipts FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON donation_receipts FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON donation_receipts FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON receipt_templates FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON receipt_templates FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON receipt_templates FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON receipt_templates FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON payment_methods FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON payment_methods FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON payment_methods FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON payment_methods FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON transactions FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON transactions FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON transactions FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON transactions FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON crm_tags FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON crm_tags FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON crm_tags FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON crm_tags FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON crm_notes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON crm_notes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON crm_notes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON crm_notes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON crm_tasks FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON crm_tasks FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON crm_tasks FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON crm_tasks FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON crm_followups FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON crm_followups FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON crm_followups FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON crm_followups FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON crm_activities FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON crm_activities FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON crm_activities FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON crm_activities FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON thank_you_messages FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON thank_you_messages FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON thank_you_messages FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON thank_you_messages FOR DELETE USING (organization_id = get_current_org());
