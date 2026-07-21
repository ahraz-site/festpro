-- ==========================================
-- ALL_IN_ONE_PART_2
-- ==========================================

-- Compatibility View
CREATE OR REPLACE VIEW user_organizations AS
SELECT organization_id, user_id, role, joined_at FROM public.organization_members;

-- >>> START OF FILE: 00009_finance_reports_analytics.sql <<<
-- FestPro Module 9: Enterprise Finance, Reports & Analytics Engine
-- =================================================================

-- 1. ENUMS
-- =================================================================
DO $$ BEGIN CREATE TYPE finance_account_type AS ENUM ('asset','liability','equity','income','expense'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM ('credit','debit'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending','completed','failed','refunded','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_gateway AS ENUM ('razorpay','stripe','paypal','cash','bank_transfer','upi','other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE expense_status AS ENUM ('draft','approved','paid','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE budget_status AS ENUM ('draft','active','closed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE report_format AS ENUM ('pdf','excel','csv'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE report_schedule AS ENUM ('none','daily','weekly','monthly','quarterly','yearly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE chart_type AS ENUM ('bar','pie','line','area','heatmap'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE widget_type AS ENUM ('stat','chart','table','list','metric'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
-- =================================================================

-- Chart of Accounts
CREATE TABLE finance_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_code VARCHAR(20) NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  account_type finance_account_type NOT NULL DEFAULT 'income',
  description TEXT,
  parent_id UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, account_code)
);

-- Transaction Categories
CREATE TABLE transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type transaction_type NOT NULL DEFAULT 'debit',
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Payment Methods
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  method_name VARCHAR(100) NOT NULL,
  gateway payment_gateway NOT NULL DEFAULT 'cash',
  is_online BOOLEAN NOT NULL DEFAULT false,
  account_details JSONB,
  account_name TEXT,
  account_number TEXT,
  bank_name TEXT,
  upi_id TEXT,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, method_name)
);

-- Core Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  account_id UUID REFERENCES finance_accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  description TEXT,
  reference_number VARCHAR(100),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status payment_status NOT NULL DEFAULT 'pending',
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_festival ON transactions(festival_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Registration Payments
CREATE TABLE registration_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  scholarship_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL CHECK (net_amount >= 0),
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  due_date DATE,
  receipt_number VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_regpayments_festival ON registration_payments(festival_id);
CREATE INDEX idx_regpayments_participant ON registration_payments(participant_id);
CREATE INDEX idx_regpayments_status ON registration_payments(status);

-- Expense Categories
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#ef4444',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_name VARCHAR(200),
  vendor_contact VARCHAR(50),
  invoice_number VARCHAR(100),
  receipt_url TEXT,
  status expense_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_festival ON expenses(festival_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);

-- Income
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  income_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(200),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_income_festival ON income(festival_id);
CREATE INDEX idx_income_date ON income(income_date);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  allocated_amount DECIMAL(12,2) NOT NULL CHECK (allocated_amount > 0),
  spent_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status budget_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budgets_festival ON budgets(festival_id);
CREATE INDEX idx_budgets_status ON budgets(status);





-- Financial Reports
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  report_name VARCHAR(300) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  date_from DATE,
  date_to DATE,
  total_income DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_expense DECIMAL(14,2) NOT NULL DEFAULT 0,
  net_balance DECIMAL(14,2) NOT NULL DEFAULT 0,
  data JSONB,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_finreports_festival ON financial_reports(festival_id);

-- Report Templates (for custom reports)
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name VARCHAR(300) NOT NULL,
  description TEXT,
  report_type VARCHAR(100) NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  sorting JSONB DEFAULT '[]',
  grouping VARCHAR(100),
  chart_type chart_type,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved Reports
CREATE TABLE saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  report_name VARCHAR(300) NOT NULL,
  description TEXT,
  filters JSONB DEFAULT '{}',
  schedule report_schedule NOT NULL DEFAULT 'none',
  last_run_at TIMESTAMPTZ,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  shared_with JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_savedreports_user ON saved_reports(user_id);

-- Analytics Cache
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  cache_key VARCHAR(300) NOT NULL,
  cache_data JSONB NOT NULL,
  period VARCHAR(50),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(organization_id, festival_id, cache_key)
);

-- Dashboard Widgets
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type widget_type NOT NULL DEFAULT 'stat',
  title VARCHAR(200) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  size VARCHAR(20) NOT NULL DEFAULT 'full',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dashboardwidgets_user ON dashboard_widgets(user_id, position);

-- 3. AUTO-UPDATE TRIGGERS
-- =================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_finance_accounts_updated_at BEFORE UPDATE ON finance_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registration_payments_updated_at BEFORE UPDATE ON registration_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_reports_updated_at BEFORE UPDATE ON saved_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. AUDIT LOG TRIGGERS
-- =================================================================
CREATE TABLE finance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  festival_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_finance_audit_org ON finance_audit_log(organization_id);
CREATE INDEX idx_finance_audit_entity ON finance_audit_log(entity_type, entity_id);

-- 5. RLS POLICIES
-- =================================================================
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;


ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_audit_log ENABLE ROW LEVEL SECURITY;

-- Finance Accounts
CREATE POLICY finance_accounts_org_isolation ON finance_accounts
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Transaction Categories
CREATE POLICY transaction_categories_org_isolation ON transaction_categories
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Payment Methods
CREATE POLICY payment_methods_org_isolation ON payment_methods
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Transactions
CREATE POLICY transactions_org_isolation ON transactions
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Registration Payments
CREATE POLICY registration_payments_org_isolation ON registration_payments
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Expense Categories
CREATE POLICY expense_categories_org_isolation ON expense_categories
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Expenses
CREATE POLICY expenses_org_isolation ON expenses
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Income
CREATE POLICY income_org_isolation ON income
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Budgets
CREATE POLICY budgets_org_isolation ON budgets
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));





-- Financial Reports
CREATE POLICY financial_reports_org_isolation ON financial_reports
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Report Templates
CREATE POLICY report_templates_org_isolation ON report_templates
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Saved Reports (user can see own + shared)
CREATE POLICY saved_reports_access ON saved_reports
  USING (user_id = auth.uid() OR shared_with @> jsonb_build_array(auth.uid()));

-- Analytics Cache
CREATE POLICY analytics_cache_org_isolation ON analytics_cache
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- Dashboard Widgets (user can see own)
CREATE POLICY dashboard_widgets_user_isolation ON dashboard_widgets
  USING (user_id = auth.uid());

-- Finance Audit Log
CREATE POLICY finance_audit_log_org_isolation ON finance_audit_log
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- 6. SEED DATA
-- =================================================================

-- Default Expense Categories
INSERT INTO expense_categories (organization_id, name, description, color)
SELECT id, 'Travel', 'Travel expenses for participants and staff', '#3b82f6' FROM organizations
UNION ALL
SELECT id, 'Food', 'Food and catering expenses', '#f59e0b' FROM organizations
UNION ALL
SELECT id, 'Accommodation', 'Lodging and accommodation expenses', '#8b5cf6' FROM organizations
UNION ALL
SELECT id, 'Printing', 'Printing and stationery expenses', '#06b6d4' FROM organizations
UNION ALL
SELECT id, 'Decoration', 'Stage and venue decoration expenses', '#ec4899' FROM organizations
UNION ALL
SELECT id, 'Stage', 'Stage setup and equipment expenses', '#f97316' FROM organizations
UNION ALL
SELECT id, 'Sound', 'Sound system and audio equipment expenses', '#10b981' FROM organizations
UNION ALL
SELECT id, 'Lighting', 'Lighting equipment and setup expenses', '#6366f1' FROM organizations
UNION ALL
SELECT id, 'Prize', 'Prize money and award expenses', '#ef4444' FROM organizations
UNION ALL
SELECT id, 'Miscellaneous', 'Other miscellaneous expenses', '#6b7280' FROM organizations
ON CONFLICT (organization_id, name) DO NOTHING;


-- >>> END OF FILE: 00009_finance_reports_analytics.sql <<<

-- >>> START OF FILE: 00010_communication_notification_workflow.sql <<<
-- FestPro Module 10: Communication, Notification & Workflow Engine
-- =================================================================

-- 1. ENUMS
-- =================================================================
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('email','sms','push','in_app','browser','whatsapp'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_priority AS ENUM ('low','normal','high','urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_status AS ENUM ('pending','sent','delivered','read','failed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE announcement_target AS ENUM ('festival','stage','judge','volunteer','participant','organization','all'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE comm_announcement_status AS ENUM ('draft','scheduled','published','archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE workflow_trigger_type AS ENUM ('event','schedule','manual'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE workflow_action_type AS ENUM ('send_email','send_sms','send_push','send_in_app','create_announcement','update_status','webhook','delay'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE workflow_status AS ENUM ('active','inactive','paused','completed','failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
-- =================================================================

-- Notification Templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name VARCHAR(300) NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  subject VARCHAR(500),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, template_name)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title VARCHAR(500) NOT NULL,
  body TEXT,
  priority notification_priority NOT NULL DEFAULT 'normal',
  status notification_status NOT NULL DEFAULT 'pending',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  action_text VARCHAR(200),
  source_entity_type VARCHAR(100),
  source_entity_id UUID,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, is_archived);
CREATE INDEX idx_notifications_festival ON notifications(festival_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Notification Logs
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  recipient VARCHAR(300) NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  response_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_channel ON notification_logs(channel);

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name VARCHAR(300) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]',
  from_name VARCHAR(200),
  from_email VARCHAR(200),
  reply_to VARCHAR(200),
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, template_name)
);

-- Email Logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  to_address VARCHAR(300) NOT NULL,
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',
  subject VARCHAR(500) NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status notification_status NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);

-- SMS Templates
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, template_name)
);

-- SMS Logs
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES sms_templates(id) ON DELETE SET NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  to_number VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Push Notifications
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_type VARCHAR(50),
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Push Notification Logs
CREATE TABLE push_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  status notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE push_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Announcement Templates
CREATE TABLE announcement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_name VARCHAR(300) NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  target announcement_target NOT NULL DEFAULT 'festival',
  priority notification_priority NOT NULL DEFAULT 'normal',
  variables JSONB DEFAULT '[]',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, template_name)
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  template_id UUID REFERENCES announcement_templates(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  target announcement_target NOT NULL DEFAULT 'festival',
  priority notification_priority NOT NULL DEFAULT 'normal',
  status comm_announcement_status NOT NULL DEFAULT 'draft',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_festival ON announcements(festival_id, status);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned, status) WHERE is_pinned = true;
CREATE INDEX idx_announcements_emergency ON announcements(is_emergency, status) WHERE is_emergency = true;

-- Announcement Receivers
CREATE TABLE announcement_receivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE announcement_receivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Workflow Rules
CREATE TABLE workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  rule_name VARCHAR(300) NOT NULL,
  description TEXT,
  trigger_type workflow_trigger_type NOT NULL DEFAULT 'event',
  trigger_event VARCHAR(200),
  trigger_config JSONB DEFAULT '{}',
  conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL DEFAULT '[]',
  status workflow_status NOT NULL DEFAULT 'active',
  priority INTEGER NOT NULL DEFAULT 0,
  max_executions INTEGER,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_rules_status ON workflow_rules(status);
CREATE INDEX idx_workflow_rules_event ON workflow_rules(trigger_event);

-- Workflow History
CREATE TABLE workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_rule_id UUID NOT NULL REFERENCES workflow_rules(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trigger_event VARCHAR(200),
  trigger_data JSONB,
  conditions_result BOOLEAN,
  actions_results JSONB DEFAULT '[]',
  status workflow_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_history_rule ON workflow_history(workflow_rule_id);
CREATE INDEX idx_workflow_history_status ON workflow_history(status);

-- Scheduled Notifications
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  announcement_id UUID REFERENCES announcements(id) ON DELETE SET NULL,
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  recipients JSONB NOT NULL DEFAULT '[]',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status, scheduled_at);

-- 3. AUTO-UPDATE TRIGGERS
-- =================================================================
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_templates_updated_at BEFORE UPDATE ON sms_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcement_templates_updated_at BEFORE UPDATE ON announcement_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_rules_updated_at BEFORE UPDATE ON workflow_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS POLICIES
-- =================================================================
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Organization isolation policies
CREATE POLICY notification_templates_org_access ON notification_templates
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY notifications_user_access ON notifications
  USING (user_id = auth.uid() OR organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY notification_logs_org_access ON notification_logs
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY email_templates_org_access ON email_templates
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY email_logs_org_access ON email_logs
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY sms_templates_org_access ON sms_templates
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY sms_logs_org_access ON sms_logs
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY push_subscriptions_user_access ON push_subscriptions
  USING (user_id = auth.uid());
CREATE POLICY push_logs_user_access ON push_logs
  USING (user_id = auth.uid());
CREATE POLICY announcement_templates_org_access ON announcement_templates
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY announcements_org_access ON announcements
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY announcement_receivers_user_access ON announcement_receivers
  USING (user_id = auth.uid());
CREATE POLICY workflow_rules_org_access ON workflow_rules
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY workflow_history_org_access ON workflow_history
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));
CREATE POLICY scheduled_notifications_org_access ON scheduled_notifications
  USING (organization_id = (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1));

-- 5. SEED DATA - System Templates
-- =================================================================
-- System notification templates are inserted via the application on first setup

-- >>> END OF FILE: 00010_communication_notification_workflow.sql <<<

-- >>> START OF FILE: 00011_security_admin.sql <<<
-- FestPro Module 11: Enterprise Security, Audit & System Administration
-- =================================================================

-- 1. ENUMS
-- =================================================================
DO $$ BEGIN CREATE TYPE audit_action AS ENUM (
  'login','logout','registration','role_change','permission_change',
  'festival_created','competition_updated','participant_registered',
  'result_published','certificate_generated','payment_added',
  'notification_sent','settings_changed','delete_operation',
  'api_token_created','api_token_revoked','backup_created','backup_restored',
  'feature_flag_changed','security_event','system_update','user_impersonated'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE audit_status AS ENUM ('success','failure','pending','blocked'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE security_event_type AS ENUM (
  'suspicious_login','brute_force','account_lockout','password_reset',
  '2fa_attempt','rate_limit_exceeded','ip_blocked','session_hijack',
  'token_reused','unusual_location','mass_operation','data_export'
); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE security_event_severity AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE device_type AS ENUM ('desktop','mobile','tablet','unknown'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE backup_status AS ENUM ('pending','running','completed','failed','verified'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE health_status AS ENUM ('healthy','degraded','down','unknown'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE maintenance_scope AS ENUM ('full','read_only','specific_module'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE token_permission AS ENUM ('read','write','admin','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
-- =================================================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  description TEXT,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  status audit_status NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_search ON audit_logs USING gin(to_tsvector('english', coalesce(description,'') || ' ' || coalesce(entity_type,'')));

-- Login History
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  browser VARCHAR(300),
  device VARCHAR(200),
  os VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(200),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  isp VARCHAR(300),
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_at TIMESTAMPTZ,
  session_duration INTEGER,
  status audit_status NOT NULL DEFAULT 'success',
  failure_reason VARCHAR(500),
  auth_method VARCHAR(50) DEFAULT 'password',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_login ON login_history(login_at DESC);

-- Security Events
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type security_event_type NOT NULL,
  severity security_event_severity NOT NULL DEFAULT 'medium',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  location JSONB,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_security_events_org ON security_events(organization_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_unresolved ON security_events(is_resolved) WHERE is_resolved = false;

-- Failed Logins
CREATE TABLE failed_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(300),
  ip_address VARCHAR(45) NOT NULL,
  browser VARCHAR(300),
  device VARCHAR(200),
  os VARCHAR(200),
  country VARCHAR(100),
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE failed_logins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX idx_failed_logins_email ON failed_logins(email);

-- Active Sessions
CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  browser VARCHAR(300),
  device VARCHAR(200),
  os VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(200),
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_mobile BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX idx_active_sessions_expires ON active_sessions(expires_at);

-- Devices
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  device_name VARCHAR(300),
  device_type device_type NOT NULL DEFAULT 'unknown',
  browser VARCHAR(300),
  os VARCHAR(200),
  ip_address VARCHAR(45),
  fingerprint VARCHAR(500),
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_fingerprint ON devices(fingerprint);

-- IP Whitelist / Blacklist
CREATE TABLE ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  label VARCHAR(200),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, ip_address)
);

CREATE TABLE ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(organization_id, ip_address)
);
CREATE INDEX idx_ip_blacklist_active ON ip_blacklist(organization_id, is_active) WHERE is_active = true;

-- System Settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  setting_key VARCHAR(200) NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_group VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, setting_key)
);
CREATE INDEX idx_system_settings_group ON system_settings(setting_group);

-- Maintenance Mode
CREATE TABLE maintenance_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  scope maintenance_scope NOT NULL DEFAULT 'full',
  message TEXT,
  allowed_roles TEXT[] DEFAULT '{}',
  allowed_user_ids UUID[] DEFAULT '{}',
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  started_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Health
CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  component VARCHAR(200) NOT NULL,
  status health_status NOT NULL DEFAULT 'unknown',
  latency_ms INTEGER,
  error_rate DECIMAL(5,2),
  message TEXT,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_system_health_component ON system_health(component);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  flag_key VARCHAR(200) NOT NULL,
  flag_name VARCHAR(300) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  is_beta BOOLEAN NOT NULL DEFAULT false,
  allowed_roles TEXT[] DEFAULT '{}',
  percentage DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, flag_key)
);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(organization_id, is_enabled) WHERE is_enabled = true;

-- API Tokens
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_name VARCHAR(200) NOT NULL,
  token_hash VARCHAR(500) NOT NULL,
  token_prefix VARCHAR(20),
  permissions token_permission NOT NULL DEFAULT 'read',
  allowed_ips TEXT[] DEFAULT '{}',
  allowed_modules TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_tokens_org ON api_tokens(organization_id);
CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_revoked) WHERE is_revoked = false;

-- System Backups
CREATE TABLE system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  backup_name VARCHAR(300) NOT NULL,
  backup_type VARCHAR(50) NOT NULL DEFAULT 'full',
  file_size BIGINT,
  file_path TEXT,
  checksum VARCHAR(128),
  includes_data TEXT[] DEFAULT '{}',
  includes_files TEXT[] DEFAULT '{}',
  status backup_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_system_backups_org ON system_backups(organization_id);
CREATE INDEX idx_system_backups_status ON system_backups(status);

-- Error Logs
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  route VARCHAR(500),
  method VARCHAR(10),
  status_code INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSONB,
  response_body JSONB,
  headers JSONB,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_error_logs_org ON error_logs(organization_id);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_unresolved ON error_logs(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);

-- Activity Stream
CREATE TABLE activity_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_stream_org ON activity_stream(organization_id);
CREATE INDEX idx_activity_stream_festival ON activity_stream(festival_id);
CREATE INDEX idx_activity_stream_created ON activity_stream(created_at DESC);

-- 3. AUTO-UPDATE TRIGGERS
-- =================================================================
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS
-- =================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_stream ENABLE ROW LEVEL SECURITY;

-- Organization-level access
CREATE POLICY audit_logs_org_access ON audit_logs FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY login_history_org_access ON login_history FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY security_events_org_access ON security_events FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY failed_logins_org_access ON failed_logins FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY active_sessions_org_access ON active_sessions FOR ALL USING (
  user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role::text IN ('organization_owner','organization_admin','platform_owner','platform_admin')
  )
);

CREATE POLICY devices_org_access ON devices FOR ALL USING (
  user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role::text IN ('organization_owner','organization_admin','platform_owner','platform_admin')
  )
);

CREATE POLICY ip_whitelist_org_access ON ip_whitelist FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY ip_blacklist_org_access ON ip_blacklist FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY system_settings_org_access ON system_settings FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY feature_flags_org_access ON feature_flags FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY api_tokens_org_access ON api_tokens FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY system_backups_org_access ON system_backups FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY error_logs_org_access ON error_logs FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY activity_stream_org_access ON activity_stream FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 5. AUDIT LOG HELPER FUNCTION
-- =================================================================
CREATE OR REPLACE FUNCTION create_audit_log(
  p_organization_id UUID,
  p_action audit_action,
  p_festival_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_status audit_status DEFAULT 'success'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_logs (organization_id, festival_id, user_id, action, entity_type, entity_id, description, changes, metadata, status, ip_address, user_agent)
  VALUES (p_organization_id, p_festival_id, COALESCE(p_user_id, auth.uid()), p_action, p_entity_type, p_entity_id, p_description, p_changes, p_metadata, p_status,
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FEATURE FLAGS SEED
-- =================================================================
INSERT INTO system_settings (organization_id, setting_key, setting_value, setting_group, description) VALUES
  (NULL, 'app_name', '"FestPro"', 'general', 'Application name'),
  (NULL, 'app_logo', '""', 'branding', 'Application logo URL'),
  (NULL, 'default_timezone', '"UTC"', 'regional', 'Default timezone'),
  (NULL, 'default_language', '"en"', 'regional', 'Default language'),
  (NULL, 'default_currency', '"USD"', 'regional', 'Default currency'),
  (NULL, 'session_timeout_minutes', '480', 'security', 'Session timeout in minutes'),
  (NULL, 'max_login_attempts', '5', 'security', 'Maximum failed login attempts before lockout'),
  (NULL, 'lockout_duration_minutes', '30', 'security', 'Account lockout duration'),
  (NULL, 'password_min_length', '8', 'security', 'Minimum password length'),
  (NULL, 'require_2fa', 'false', 'security', 'Require two-factor authentication'),
  (NULL, 'maintenance_mode', 'false', 'system', 'Global maintenance mode')
ON CONFLICT (organization_id, setting_key) DO NOTHING;

INSERT INTO feature_flags (organization_id, flag_key, flag_name, description, is_enabled) VALUES
  (NULL, 'module_results', 'Results Engine', 'Results, grades, rankings module', true),
  (NULL, 'module_finance', 'Finance Module', 'Finance, reports, analytics module', true),
  (NULL, 'module_communication', 'Communication Module', 'Notifications, announcements, workflow module', true),
  (NULL, 'module_public_website', 'Public Website', 'Public festival website and live portal', false),
  (NULL, 'module_mobile_app', 'Mobile App', 'PWA mobile application', false),
  (NULL, 'module_billing', 'Billing & Subscriptions', 'SaaS billing and subscription management', false),
  (NULL, 'module_ai', 'AI Features', 'AI-powered judging and insights', false),
  (NULL, 'beta_live_streaming', 'Live Streaming (Beta)', 'Live streaming integration', false),
  (NULL, 'beta_multi_language', 'Multi Language (Beta)', 'Multi-language support', false)
ON CONFLICT (organization_id, flag_key) DO NOTHING;

-- >>> END OF FILE: 00011_security_admin.sql <<<

-- >>> START OF FILE: 00012_public_portal.sql <<<
-- FestPro Module 12: Public Portal + Live Portal + API Gateway
-- =================================================================

-- 1. ENUMS
-- =================================================================
DO $$ BEGIN CREATE TYPE public_sponsor_tier AS ENUM ('platinum','gold','silver','bronze','partner','media'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public_news_category AS ENUM ('news','blog','press_release','update','announcement'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public_gallery_type AS ENUM ('photo','video','album'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public_registration_status AS ENUM ('draft','submitted','confirmed','waiting','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public_registration_type AS ENUM ('individual','team'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public_cache_status AS ENUM ('fresh','stale','generating'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
-- =================================================================

-- Homepage Settings
CREATE TABLE public_homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  hero_title VARCHAR(300),
  hero_subtitle TEXT,
  hero_image_url TEXT,
  about_title VARCHAR(300),
  about_body TEXT,
  about_image_url TEXT,
  stats JSONB DEFAULT '[]',
  featured_sections JSONB DEFAULT '[]',
  seo_meta JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(festival_id)
);
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_homepage_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Festival Details (public view)
CREATE TABLE public_festival_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  vision TEXT,
  mission TEXT,
  history TEXT,
  organizing_committee JSONB DEFAULT '[]',
  venue_name VARCHAR(300),
  venue_address TEXT,
  venue_map_url TEXT,
  venue_contact VARCHAR(100),
  faqs JSONB DEFAULT '[]',
  seo_meta JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(festival_id)
);
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_festival_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- News / Blog / Press Releases
CREATE TABLE public_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category public_news_category NOT NULL DEFAULT 'news',
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT,
  cover_image_url TEXT,
  author VARCHAR(200),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  seo_meta JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_news ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_news_festival ON public_news(festival_id);
CREATE INDEX idx_public_news_published ON public_news(is_published, published_at DESC) WHERE is_published = true;
CREATE INDEX idx_public_news_category ON public_news(category);
CREATE INDEX idx_public_news_slug ON public_news(slug);

-- Gallery
CREATE TABLE public_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  gallery_type public_gallery_type NOT NULL DEFAULT 'photo',
  album_id UUID REFERENCES public_gallery(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER, height INTEGER, file_size INTEGER,
  mime_type VARCHAR(100),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_gallery ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_gallery_festival ON public_gallery(festival_id);
CREATE INDEX idx_public_gallery_type ON public_gallery(gallery_type);
CREATE INDEX idx_public_gallery_album ON public_gallery(album_id);

-- Downloads
CREATE TABLE public_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category VARCHAR(200) NOT NULL DEFAULT 'general',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_published BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_downloads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_downloads_festival ON public_downloads(festival_id);
CREATE INDEX idx_public_downloads_category ON public_downloads(category);

-- Sponsors
CREATE TABLE public_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  sponsor_name VARCHAR(300) NOT NULL,
  sponsor_logo_url TEXT,
  website_url TEXT,
  tier public_sponsor_tier NOT NULL DEFAULT 'bronze',
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_sponsors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_sponsors_festival ON public_sponsors(festival_id);
CREATE INDEX idx_public_sponsors_tier ON public_sponsors(tier);

-- FAQ
CREATE TABLE public_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category VARCHAR(200) DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_faqs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_faqs_festival ON public_faqs(festival_id);

-- Contact Inquiries
CREATE TABLE public_contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(300) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_contact_inquiries ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Public Registrations
CREATE TABLE public_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  registration_type public_registration_type NOT NULL DEFAULT 'individual',
  status public_registration_status NOT NULL DEFAULT 'draft',
  registration_number VARCHAR(50) UNIQUE,
  tracking_token VARCHAR(100) UNIQUE,
  first_name VARCHAR(200) NOT NULL, last_name VARCHAR(200) NOT NULL,
  email VARCHAR(300) NOT NULL, phone VARCHAR(50),
  date_of_birth DATE, gender VARCHAR(20),
  address TEXT, city VARCHAR(200), state VARCHAR(200), country VARCHAR(200),
  postal_code VARCHAR(20),
  institution_name VARCHAR(300), grade VARCHAR(50),
  team_name VARCHAR(300),
  team_members JSONB DEFAULT '[]',
  competition_ids UUID[] DEFAULT '{}',
  special_requirements TEXT,
  documents JSONB DEFAULT '[]',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_amount DECIMAL(12,2),
  payment_reference VARCHAR(200),
  registered_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_registrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_registrations_festival ON public_registrations(festival_id);
CREATE INDEX idx_public_registrations_email ON public_registrations(email);
CREATE INDEX idx_public_registrations_tracking ON public_registrations(tracking_token);
CREATE INDEX idx_public_registrations_status ON public_registrations(status);

-- Live Schedule Cache
CREATE TABLE live_schedule_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES festival_stages(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES schedule_sessions(id) ON DELETE CASCADE,
  cache_key VARCHAR(300) NOT NULL,
  cache_data JSONB NOT NULL DEFAULT '{}',
  status public_cache_status NOT NULL DEFAULT 'fresh',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_schedule_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_live_schedule_cache_festival ON live_schedule_cache(festival_id);
CREATE INDEX idx_live_schedule_cache_key ON live_schedule_cache(cache_key);

-- Live Results Cache
CREATE TABLE live_results_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  cache_key VARCHAR(300) NOT NULL,
  cache_data JSONB NOT NULL DEFAULT '{}',
  status public_cache_status NOT NULL DEFAULT 'fresh',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_results_cache ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_live_results_cache_festival ON live_results_cache(festival_id);
CREATE INDEX idx_live_results_cache_key ON live_results_cache(cache_key);

-- Live Stage Status
CREATE TABLE live_stage_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES festival_stages(id) ON DELETE CASCADE,
  is_live BOOLEAN NOT NULL DEFAULT false,
  current_competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  current_session_id UUID REFERENCES schedule_sessions(id) ON DELETE SET NULL,
  current_participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  queue_count INTEGER DEFAULT 0,
  stream_url TEXT,
  stream_platform VARCHAR(100),
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE live_stage_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_live_stage_status_festival ON live_stage_status(festival_id);
CREATE UNIQUE INDEX idx_live_stage_status_stage ON live_stage_status(stage_id);

-- Public API Tokens (for external apps)
CREATE TABLE public_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  token_name VARCHAR(200) NOT NULL,
  token_hash VARCHAR(500) NOT NULL,
  token_prefix VARCHAR(20),
  allowed_origins TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 60,
  is_active BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_api_tokens ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_public_api_tokens_festival ON public_api_tokens(festival_id);

-- API Rate Limit Log
CREATE TABLE public_rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_token_id UUID REFERENCES public_api_tokens(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  route VARCHAR(500),
  method VARCHAR(10),
  status_code INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE public_rate_limit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_rate_limit_log_ip ON public_rate_limit_log(ip_address);
CREATE INDEX idx_rate_limit_log_created ON public_rate_limit_log(created_at);

-- 3. TRIGGERS
-- =================================================================
CREATE TRIGGER update_public_homepage_updated_at BEFORE UPDATE ON public_homepage_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_festival_details_updated_at BEFORE UPDATE ON public_festival_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_news_updated_at BEFORE UPDATE ON public_news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_gallery_updated_at BEFORE UPDATE ON public_gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_downloads_updated_at BEFORE UPDATE ON public_downloads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_sponsors_updated_at BEFORE UPDATE ON public_sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_faqs_updated_at BEFORE UPDATE ON public_faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_public_registrations_updated_at BEFORE UPDATE ON public_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS
-- =================================================================
ALTER TABLE public_homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_festival_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_schedule_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_results_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stage_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY public_read_homepage ON public_homepage_settings FOR SELECT USING (is_published = true);
CREATE POLICY public_read_festival_details ON public_festival_details FOR SELECT USING (is_published = true);
CREATE POLICY public_read_news ON public_news FOR SELECT USING (is_published = true);
CREATE POLICY public_read_gallery ON public_gallery FOR SELECT USING (is_published = true);
CREATE POLICY public_read_downloads ON public_downloads FOR SELECT USING (is_published = true);
CREATE POLICY public_read_sponsors ON public_sponsors FOR SELECT USING (is_published = true);
CREATE POLICY public_read_faqs ON public_faqs FOR SELECT USING (is_published = true);
CREATE POLICY public_read_live_schedule ON live_schedule_cache FOR SELECT USING (true);
CREATE POLICY public_read_live_results ON live_results_cache FOR SELECT USING (true);
CREATE POLICY public_read_live_stage ON live_stage_status FOR SELECT USING (true);
CREATE POLICY public_read_registrations ON public_registrations FOR SELECT USING (true);
CREATE POLICY public_insert_contact ON public_contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY public_insert_registration ON public_registrations FOR INSERT WITH CHECK (true);

-- Organization access for management
CREATE POLICY org_write_homepage ON public_homepage_settings FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_festival_details ON public_festival_details FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_news ON public_news FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_gallery ON public_gallery FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_downloads ON public_downloads FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_sponsors ON public_sponsors FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_faqs ON public_faqs FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_read_contact ON public_contact_inquiries FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_cache ON live_schedule_cache FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_results_cache ON live_results_cache FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_stage_status ON live_stage_status FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY org_write_api_tokens ON public_api_tokens FOR ALL USING (
  festival_id IN (SELECT id FROM festivals WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);

-- >>> END OF FILE: 00012_public_portal.sql <<<

-- >>> START OF FILE: 00013_volunteer_staff.sql <<<
-- FestPro Module 13: Enterprise Volunteer, Staff & Duty Management
-- =================================================================

-- 1. ENUMS
-- =================================================================
DO $$ BEGIN CREATE TYPE volunteer_status AS ENUM ('active','inactive','on_leave','deactivated'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE staff_department AS ENUM (
  'reception','registration','help_desk','stage','media','food',
  'medical','security','transport','accommodation','technical',
  'cleaning','protocol','volunteer_coordination','general'
); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE shift_type AS ENUM ('morning','afternoon','evening','night','custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE duty_status AS ENUM ('scheduled','checked_in','completed','cancelled','no_show'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_priority AS ENUM ('low','medium','high','urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_status_enum AS ENUM ('pending','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE attendance_type AS ENUM ('qr_checkin','qr_checkout','manual','late','absent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE checkpoint_type AS ENUM ('gate','stage','reception','help_desk','medical','parking','volunteer_desk'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES
-- =================================================================

-- Volunteers
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url TEXT,
  first_name VARCHAR(200) NOT NULL,
  last_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(300),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  emergency_contact_name VARCHAR(300),
  emergency_contact_phone VARCHAR(50),
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  availability TEXT,
  address TEXT,
  city VARCHAR(200),
  status volunteer_status NOT NULL DEFAULT 'active',
  qr_code VARCHAR(200) UNIQUE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_volunteers_org ON volunteers(organization_id);
CREATE INDEX idx_volunteers_festival ON volunteers(festival_id);
CREATE INDEX idx_volunteers_status ON volunteers(status);

-- Volunteer Profiles (extended)
CREATE TABLE volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  total_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_shifts INTEGER NOT NULL DEFAULT 0,
  departments_worked TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2),
  certificate_count INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  UNIQUE(volunteer_id)
);
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE volunteer_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Staff Members
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department staff_department NOT NULL DEFAULT 'general',
  photo_url TEXT,
  first_name VARCHAR(200) NOT NULL,
  last_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(300),
  position VARCHAR(200),
  is_supervisor BOOLEAN NOT NULL DEFAULT false,
  supervisor_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_staff_members_org ON staff_members(organization_id);
CREATE INDEX idx_staff_members_department ON staff_members(department);

-- Staff Departments (metadata)
CREATE TABLE staff_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  department staff_department NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(100),
  head_count INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, festival_id, department)
);

-- Duties
CREATE TABLE duties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  department staff_department NOT NULL DEFAULT 'general',
  location TEXT,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_duties_festival ON duties(festival_id);
CREATE INDEX idx_duties_department ON duties(department);

-- Duty Assignments
CREATE TABLE duty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duty_id UUID NOT NULL REFERENCES duties(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status duty_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE duty_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_duty_assignments_duty ON duty_assignments(duty_id);
CREATE INDEX idx_duty_assignments_volunteer ON duty_assignments(volunteer_id);
CREATE INDEX idx_duty_assignments_status ON duty_assignments(status);

-- Shift Templates
CREATE TABLE shift_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  shift_type shift_type NOT NULL DEFAULT 'morning',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 30,
  color VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shifts
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  template_id UUID REFERENCES shift_templates(id) ON DELETE SET NULL,
  duty_assignment_id UUID REFERENCES duty_assignments(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_overtime BOOLEAN NOT NULL DEFAULT false,
  status duty_status NOT NULL DEFAULT 'scheduled',
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  hours_worked DECIMAL(5,2),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_shifts_festival ON shifts(festival_id);
CREATE INDEX idx_shifts_volunteer ON shifts(volunteer_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_status ON shifts(status);

-- Checkpoints
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  checkpoint_type checkpoint_type NOT NULL DEFAULT 'gate',
  location TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  qr_code VARCHAR(200) UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_checkpoints_festival ON checkpoints(festival_id);

-- Attendance Logs
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  attendance_type attendance_type NOT NULL DEFAULT 'manual',
  checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  ip_address VARCHAR(45),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_attendance_logs_volunteer ON attendance_logs(volunteer_id);
CREATE INDEX idx_attendance_logs_date ON attendance_logs(timestamp);


-- Check-ins (QR based)
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  checkin_type VARCHAR(20) NOT NULL DEFAULT 'checkin',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  photo_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_checkins_checkpoint ON checkins(checkpoint_id);
CREATE INDEX idx_checkins_volunteer ON checkins(volunteer_id);

-- Task Lists
CREATE TABLE task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  department staff_department,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_lists_festival ON task_lists(festival_id);

-- Task Status (individual tasks within a list)
CREATE TABLE task_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status_enum NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES volunteers(id) ON DELETE SET NULL,
  assigned_staff UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_task_status_list ON task_status(task_list_id);
CREATE INDEX idx_task_status_assignee ON task_status(assigned_to);
CREATE INDEX idx_task_status_status ON task_status(status);

-- Task Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES task_status(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Task Files
CREATE TABLE task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES task_status(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(300),
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE task_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Volunteer / Staff Certificates
CREATE TABLE volunteer_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  certificate_code VARCHAR(100) UNIQUE NOT NULL,
  certificate_type VARCHAR(50) NOT NULL DEFAULT 'volunteer',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  total_hours DECIMAL(10,2),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_volunteer_certificates_code ON volunteer_certificates(certificate_code);
CREATE INDEX idx_volunteer_certificates_volunteer ON volunteer_certificates(volunteer_id);

-- 3. TRIGGERS
-- =================================================================
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_duties_updated_at BEFORE UPDATE ON duties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_status_updated_at BEFORE UPDATE ON task_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. AUTO-CREATE VOLUNTEER PROFILE
CREATE OR REPLACE FUNCTION create_volunteer_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO volunteer_profiles (volunteer_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_volunteer_insert AFTER INSERT ON volunteers FOR EACH ROW EXECUTE FUNCTION create_volunteer_profile();

-- 5. RLS
-- =================================================================
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_certificates ENABLE ROW LEVEL SECURITY;

-- Organization-level access
CREATE POLICY volunteers_org_access ON volunteers FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY volunteer_profiles_org_access ON volunteer_profiles FOR ALL USING (
  volunteer_id IN (SELECT id FROM volunteers WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY staff_members_org_access ON staff_members FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY staff_departments_org_access ON staff_departments FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY duties_org_access ON duties FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY duty_assignments_org_access ON duty_assignments FOR ALL USING (
  duty_id IN (SELECT id FROM duties WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY shift_templates_org_access ON shift_templates FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY shifts_org_access ON shifts FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY attendance_logs_org_access ON attendance_logs FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY checkpoints_org_access ON checkpoints FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY checkins_org_access ON checkins FOR ALL USING (
  checkpoint_id IN (SELECT id FROM checkpoints WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY task_lists_org_access ON task_lists FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY task_status_org_access ON task_status FOR ALL USING (
  task_list_id IN (SELECT id FROM task_lists WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()))
);
CREATE POLICY task_comments_org_access ON task_comments FOR ALL USING (
  task_id IN (SELECT id FROM task_status WHERE task_list_id IN (SELECT id FROM task_lists WHERE organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())))
);
CREATE POLICY volunteer_certificates_org_access ON volunteer_certificates FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

-- 6. SEED DEPARTMENTS
-- =================================================================

-- >>> END OF FILE: 00013_volunteer_staff.sql <<<

-- >>> START OF FILE: 00014_id_card_pass_qr.sql <<<
-- ============================================================
-- Module 14: Enterprise ID Card, Badge, Pass & QR Management
-- ============================================================

-- ENUMS
DO $$ BEGIN CREATE TYPE id_card_type AS ENUM ('participant','judge','volunteer','staff','team_manager','organization_admin','festival_director','reception','media','guest','vip','security','medical','technical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE badge_type AS ENUM ('stage_access','judge','volunteer','staff','guest','vip','media','security'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE pass_type AS ENUM ('general','vip','guest','media','vehicle','parking','backstage','stage_access'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE pass_status AS ENUM ('active','used','expired','revoked','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE card_status AS ENUM ('draft','active','expired','revoked','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE print_status AS ENUM ('queued','processing','completed','failed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE verification_method AS ENUM ('qr_scan','barcode_scan','manual_search','api'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE verification_result AS ENUM ('valid','invalid','expired','revoked','not_found'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE OR REPLACE FUNCTION get_current_org()
RETURNS UUID AS $$
  SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- 1. ID CARD TEMPLATES
-- ============================================================
CREATE TABLE id_card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_type id_card_type NOT NULL DEFAULT 'participant',
  width_mm NUMERIC NOT NULL DEFAULT 85.6,
  height_mm NUMERIC NOT NULL DEFAULT 53.98,
  orientation TEXT NOT NULL DEFAULT 'landscape',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#6366f1',
  font_family TEXT DEFAULT 'Inter',
  logo_position TEXT DEFAULT 'top-left',
  photo_position TEXT DEFAULT 'left',
  photo_width_mm NUMERIC DEFAULT 25,
  photo_height_mm NUMERIC DEFAULT 32,
  show_qr BOOLEAN DEFAULT true,
  show_barcode BOOLEAN DEFAULT false,
  qr_position TEXT DEFAULT 'bottom-right',
  fields JSONB NOT NULL DEFAULT '[]',
  layout_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE id_card_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. ID CARDS
-- ============================================================
CREATE TABLE id_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  template_id UUID REFERENCES id_card_templates(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type id_card_type NOT NULL,
  card_number TEXT NOT NULL UNIQUE,
  chest_number TEXT,
  registration_number TEXT,
  photo_url TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role_title TEXT,
  unit TEXT,
  division TEXT,
  sector TEXT,
  competition_info TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_group TEXT,
  organization_name TEXT,
  validity_start DATE NOT NULL,
  validity_end DATE NOT NULL,
  status card_status NOT NULL DEFAULT 'draft',
  qr_code_id UUID,
  barcode_id UUID,
  metadata JSONB DEFAULT '{}',
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE id_cards ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. BADGE TEMPLATES
-- ============================================================
CREATE TABLE badge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  badge_type badge_type NOT NULL DEFAULT 'volunteer',
  width_mm NUMERIC NOT NULL DEFAULT 90,
  height_mm NUMERIC NOT NULL DEFAULT 60,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#6366f1',
  show_photo BOOLEAN DEFAULT true,
  show_qr BOOLEAN DEFAULT true,
  show_barcode BOOLEAN DEFAULT false,
  access_levels TEXT[] DEFAULT '{}',
  layout_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE badge_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. BADGES
-- ============================================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  template_id UUID REFERENCES badge_templates(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  badge_number TEXT NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  role_title TEXT,
  department TEXT,
  photo_url TEXT,
  access_levels TEXT[] DEFAULT '{}',
  validity_start DATE NOT NULL,
  validity_end DATE NOT NULL,
  status card_status NOT NULL DEFAULT 'active',
  qr_code_id UUID,
  barcode_id UUID,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. PASS TYPES
-- ============================================================
CREATE TABLE pass_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type pass_type NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  access_areas TEXT[] DEFAULT '{}',
  max_quantity INTEGER,
  validity_days INTEGER,
  is_transferable BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  price NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pass_types ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. PASS CATEGORIES
-- ============================================================
CREATE TABLE pass_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES pass_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE pass_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. PASSES (unified)
-- ============================================================
CREATE TABLE passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  pass_type_id UUID REFERENCES pass_types(id) ON DELETE SET NULL,
  category_id UUID REFERENCES pass_categories(id) ON DELETE SET NULL,
  pass_number TEXT NOT NULL UNIQUE,
  pass_type pass_type NOT NULL,
  holder_name TEXT NOT NULL,
  holder_contact TEXT,
  organization_name TEXT,
  photo_url TEXT,
  access_areas TEXT[] DEFAULT '{}',
  validity_start TIMESTAMPTZ NOT NULL,
  validity_end TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'active',
  is_transferable BOOLEAN DEFAULT false,
  qr_code_id UUID,
  barcode_id UUID,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. VEHICLE PASSES
-- ============================================================
CREATE TABLE vehicle_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES passes(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'car',
  driver_name TEXT,
  driver_phone TEXT,
  parking_zone TEXT,
  validity_start TIMESTAMPTZ NOT NULL,
  validity_end TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'active',
  qr_code_id UUID,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vehicle_passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. GUEST PASSES
-- ============================================================
CREATE TABLE guest_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES passes(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  host_name TEXT NOT NULL,
  host_department TEXT,
  purpose TEXT,
  company TEXT,
  validity_start TIMESTAMPTZ NOT NULL,
  validity_end TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'active',
  qr_code_id UUID,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE guest_passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. VIP PASSES
-- ============================================================
CREATE TABLE vip_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES passes(id) ON DELETE CASCADE,
  vip_name TEXT NOT NULL,
  vip_title TEXT,
  vip_phone TEXT,
  vip_email TEXT,
  vip_level INTEGER DEFAULT 1,
  personal_assistant TEXT,
  security_clearance TEXT,
  special_requirements TEXT,
  has_parking BOOLEAN DEFAULT true,
  has_hospitality BOOLEAN DEFAULT true,
  validity_start TIMESTAMPTZ NOT NULL,
  validity_end TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'active',
  qr_code_id UUID,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vip_passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. MEDIA PASSES
-- ============================================================
CREATE TABLE media_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES passes(id) ON DELETE CASCADE,
  media_name TEXT NOT NULL,
  media_organization TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'press',
  media_phone TEXT,
  media_email TEXT,
  press_id_number TEXT,
  equipment_list TEXT,
  has_camera_permit BOOLEAN DEFAULT false,
  has_drone_permit BOOLEAN DEFAULT false,
  has_interview_access BOOLEAN DEFAULT true,
  validity_start TIMESTAMPTZ NOT NULL,
  validity_end TIMESTAMPTZ NOT NULL,
  status pass_status NOT NULL DEFAULT 'active',
  qr_code_id UUID,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE media_passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. QR CODES
-- ============================================================
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  encrypted_data TEXT,
  expires_at TIMESTAMPTZ,
  max_scans INTEGER DEFAULT 0,
  scan_count INTEGER DEFAULT 0,
  is_revoked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. BARCODE RECORDS
-- ============================================================
CREATE TABLE barcode_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  barcode_type TEXT NOT NULL DEFAULT 'code128',
  barcode_data TEXT NOT NULL,
  barcode_image_url TEXT,
  is_revoked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE barcode_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. PRINT JOBS
-- ============================================================
CREATE TABLE print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_ids UUID[] NOT NULL DEFAULT '{}',
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  status print_status NOT NULL DEFAULT 'queued',
  print_type TEXT NOT NULL DEFAULT 'single',
  template_id UUID,
  pdf_url TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. PRINT HISTORY
-- ============================================================
CREATE TABLE print_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  print_job_id UUID REFERENCES print_jobs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  card_number TEXT,
  printed_at TIMESTAMPTZ DEFAULT now(),
  printed_by UUID REFERENCES auth.users(id),
  printer_name TEXT,
  copies INTEGER DEFAULT 1
);
ALTER TABLE print_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. VERIFICATION LOGS
-- ============================================================
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  verification_method verification_method NOT NULL,
  result verification_result NOT NULL,
  scanned_data TEXT,
  scanner_user_id UUID REFERENCES auth.users(id),
  scanner_location TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_id_cards_org_fest ON id_cards(organization_id, festival_id);
CREATE INDEX idx_id_cards_card_type ON id_cards(card_type);
CREATE INDEX idx_id_cards_card_number ON id_cards(card_number);
CREATE INDEX idx_id_cards_status ON id_cards(status);
CREATE INDEX idx_badges_org_fest ON badges(organization_id, festival_id);
CREATE INDEX idx_badges_type ON badges(badge_type);
CREATE INDEX idx_passes_org_fest ON passes(organization_id, festival_id);
CREATE INDEX idx_passes_type ON passes(pass_type);
CREATE INDEX idx_passes_status ON passes(status);
CREATE INDEX idx_passes_number ON passes(pass_number);
CREATE INDEX idx_qr_codes_token ON qr_codes(token);
CREATE INDEX idx_qr_codes_entity ON qr_codes(entity_type, entity_id);
CREATE INDEX idx_barcode_entity ON barcode_records(entity_type, entity_id);
CREATE INDEX idx_print_jobs_status ON print_jobs(status);
CREATE INDEX idx_verification_logs_fest ON verification_logs(festival_id);
CREATE INDEX idx_vehicle_passes_vehicle ON vehicle_passes(vehicle_number);
CREATE INDEX idx_guest_passes_host ON guest_passes(host_name);
CREATE INDEX idx_vip_passes_name ON vip_passes(vip_name);
CREATE INDEX idx_media_passes_org ON media_passes(media_organization);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_id_card_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_id_cards_updated_at BEFORE UPDATE ON id_cards FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_id_card_templates_updated_at BEFORE UPDATE ON id_card_templates FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_badges_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_badge_templates_updated_at BEFORE UPDATE ON badge_templates FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_passes_updated_at BEFORE UPDATE ON passes FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_pass_types_updated_at BEFORE UPDATE ON pass_types FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_vehicle_passes_updated_at BEFORE UPDATE ON vehicle_passes FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_guest_passes_updated_at BEFORE UPDATE ON guest_passes FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_vip_passes_updated_at BEFORE UPDATE ON vip_passes FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_media_passes_updated_at BEFORE UPDATE ON media_passes FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();
CREATE TRIGGER trg_print_jobs_updated_at BEFORE UPDATE ON print_jobs FOR EACH ROW EXECUTE FUNCTION update_id_card_updated_at();

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY org_isolation_select ON id_card_templates FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON id_card_templates FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON id_card_templates FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON id_card_templates FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON id_cards FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON id_cards FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON id_cards FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON id_cards FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON badge_templates FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON badge_templates FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON badge_templates FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON badge_templates FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON badges FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON badges FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON badges FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON badges FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON pass_types FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON pass_types FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON pass_types FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON pass_types FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON pass_categories FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON pass_categories FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON pass_categories FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON pass_categories FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON passes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON passes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON passes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON passes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON vehicle_passes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON vehicle_passes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON vehicle_passes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON vehicle_passes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON guest_passes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON guest_passes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON guest_passes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON guest_passes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON vip_passes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON vip_passes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON vip_passes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON vip_passes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON media_passes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON media_passes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON media_passes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON media_passes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON qr_codes FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON qr_codes FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON qr_codes FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON qr_codes FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON barcode_records FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON barcode_records FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON barcode_records FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON barcode_records FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON print_jobs FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON print_jobs FOR INSERT WITH CHECK (organization_id = get_current_org());
CREATE POLICY org_isolation_update ON print_jobs FOR UPDATE USING (organization_id = get_current_org());
CREATE POLICY org_isolation_delete ON print_jobs FOR DELETE USING (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON print_history FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON print_history FOR INSERT WITH CHECK (organization_id = get_current_org());

CREATE POLICY org_isolation_select ON verification_logs FOR SELECT USING (organization_id = get_current_org());
CREATE POLICY org_isolation_insert ON verification_logs FOR INSERT WITH CHECK (organization_id = get_current_org());

-- >>> END OF FILE: 00014_id_card_pass_qr.sql <<<

-- >>> START OF FILE: 00015_sponsor_donor_crm.sql <<<
-- ============================================================
-- Module 15: Enterprise Sponsor, Donor, Fund Collection & CRM
-- ============================================================

-- ENUMS
DO $$ BEGIN CREATE TYPE crm_sponsor_category AS ENUM ('platinum','gold','silver','bronze','media','partner','associate','supporter'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE sponsor_status AS ENUM ('lead','negotiation','active','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE donor_type AS ENUM ('individual','family','organization','trust','institution','anonymous'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE campaign_status AS ENUM ('draft','active','paused','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE donation_method AS ENUM ('cash','upi','bank_transfer','cheque','card','online','other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE pledge_status AS ENUM ('pending','partial','completed','cancelled','defaulted'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE receipt_status AS ENUM ('draft','issued','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE crm_activity_type AS ENUM ('call','meeting','email','note','followup','task','whatsapp','sms'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 1. SPONSOR CATEGORIES
-- ============================================================
CREATE TABLE sponsor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category crm_sponsor_category NOT NULL DEFAULT 'silver',
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


-- ============================================================
-- 21. TRANSACTIONS
-- ============================================================



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

-- >>> END OF FILE: 00015_sponsor_donor_crm.sql <<<

-- >>> START OF FILE: 00016_help_desk_reception_visitor_lost_found.sql <<<
-- ============================================================
-- Module 16: Enterprise Help Desk, Reception, Visitor &
--            Lost & Found Management
-- ============================================================

-- ENUMS
DO $$ BEGIN CREATE TYPE ticket_priority AS ENUM ('low','medium','high','urgent','critical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_status AS ENUM ('new','open','assigned','in_progress','resolved','closed','reopened','on_hold','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE escalation_level AS ENUM ('level1','level2','level3','level4'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE visitor_category AS ENUM ('general','guest','vip','media','sponsor','government','organization','volunteer','staff','participant'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lost_item_category AS ENUM ('mobile_phone','wallet','bag','id_card','certificate','documents','jewellery','watch','electronics','keys','clothing','umbrella','water_bottle','laptop','tablet','headphones','books','other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE claim_status AS ENUM ('pending','under_review','verified','approved','rejected','collected','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE feedback_status AS ENUM ('draft','published','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lost_item_status AS ENUM ('reported','claimed','matched','disposed','returned'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 1. HELP DESKS (physical desk locations)
-- ============================================================
CREATE TABLE help_desks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  desk_code TEXT NOT NULL,
  desk_name TEXT NOT NULL,
  location TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{}',
  contact_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE help_desks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. HELP DESK STAFF
-- ============================================================
CREATE TABLE help_desk_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  desk_id UUID REFERENCES help_desks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_role TEXT NOT NULL DEFAULT 'agent',
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE help_desk_staff ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. SUPPORT CATEGORIES
-- ============================================================
CREATE TABLE support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. SUPPORT PRIORITIES
-- ============================================================
CREATE TABLE support_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority_level ticket_priority NOT NULL DEFAULT 'medium',
  sla_response_minutes INTEGER DEFAULT 60,
  sla_resolution_minutes INTEGER DEFAULT 1440,
  color TEXT DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_priorities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. SUPPORT STATUSES
-- ============================================================
CREATE TABLE support_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  color TEXT DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_statuses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  desk_id UUID REFERENCES help_desks(id) ON DELETE SET NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES support_categories(id) ON DELETE SET NULL,
  priority_id UUID REFERENCES support_priorities(id) ON DELETE SET NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'desk',
  submitted_by UUID REFERENCES auth.users(id),
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  reopened_at TIMESTAMPTZ,
  resolution_notes TEXT,
  is_internal BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. TICKET COMMENTS
-- ============================================================
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. TICKET ATTACHMENTS
-- ============================================================
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES ticket_comments(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 9. TICKET HISTORY (audit trail)
-- ============================================================
CREATE TABLE ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. TICKET ASSIGNMENTS
-- ============================================================
CREATE TABLE ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. TICKET SLA
-- ============================================================
CREATE TABLE ticket_sla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES support_categories(id) ON DELETE CASCADE,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  response_time_minutes INTEGER NOT NULL DEFAULT 60,
  resolution_time_minutes INTEGER NOT NULL DEFAULT 1440,
  escalation_minutes INTEGER[] DEFAULT '{120, 240, 480}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_sla ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. TICKET ESCALATIONS
-- ============================================================
CREATE TABLE ticket_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  escalation_level escalation_level NOT NULL DEFAULT 'level1',
  escalated_by UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  reason TEXT,
  previous_assignee UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ticket_escalations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 13. KNOWLEDGE BASE CATEGORIES
-- ============================================================
CREATE TABLE knowledge_base_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE knowledge_base_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. KNOWLEDGE ARTICLES
-- ============================================================
CREATE TABLE knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 15. FAQ ITEMS
-- ============================================================
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. VISITOR CATEGORIES
-- ============================================================
CREATE TABLE visitor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category visitor_category NOT NULL DEFAULT 'general',
  description TEXT,
  access_areas TEXT[] DEFAULT '{}',
  requires_approval BOOLEAN DEFAULT false,
  pass_color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 17. VISITORS
-- ============================================================
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES visitor_categories(id) ON DELETE SET NULL,
  visitor_category visitor_category NOT NULL DEFAULT 'general',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_url TEXT,
  company_name TEXT,
  designation TEXT,
  purpose_of_visit TEXT,
  host_name TEXT,
  host_department TEXT,
  host_contact TEXT,
  is_vip BOOLEAN DEFAULT false,
  is_blacklisted BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  total_visits INTEGER DEFAULT 1,
  last_visit_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 18. VISITOR GROUPS
-- ============================================================
CREATE TABLE visitor_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  group_type TEXT DEFAULT 'general',
  member_count INTEGER DEFAULT 0,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  organization_name TEXT,
  purpose TEXT,
  expected_checkin TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_groups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 19. VISITOR PASSES
-- ============================================================
CREATE TABLE visitor_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  pass_number TEXT NOT NULL UNIQUE,
  pass_type visitor_category NOT NULL DEFAULT 'general',
  qr_code TEXT,
  qr_code_url TEXT,
  barcode TEXT,
  validity_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  validity_end TIMESTAMPTZ,
  access_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_used BOOLEAN DEFAULT false,
  issued_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 20. VISITOR CHECK-INS
-- ============================================================
CREATE TABLE visitor_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  pass_id UUID REFERENCES visitor_passes(id) ON DELETE SET NULL,
  group_id UUID REFERENCES visitor_groups(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_in_method TEXT DEFAULT 'manual',
  checked_in_by UUID REFERENCES auth.users(id),
  desk_id UUID REFERENCES help_desks(id) ON DELETE SET NULL,
  badge_issued BOOLEAN DEFAULT false,
  badge_number TEXT,
  vehicle_number TEXT,
  escort_required BOOLEAN DEFAULT false,
  escorted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_checkins ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 21. VISITOR CHECKOUT LOGS
-- ============================================================
CREATE TABLE visitor_checkout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  checkin_id UUID NOT NULL REFERENCES visitor_checkins(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  check_out_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_method TEXT DEFAULT 'manual',
  checked_out_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_checkout_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 22. VISITOR HOSTS
-- ============================================================
CREATE TABLE visitor_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department TEXT,
  designation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE visitor_hosts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 23. MEETING LOGS
-- ============================================================
CREATE TABLE meeting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  host_id UUID REFERENCES visitor_hosts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  meeting_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE meeting_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 24. LOST ITEMS
-- ============================================================
CREATE TABLE lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category lost_item_category NOT NULL DEFAULT 'other',
  color TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  distinctive_features TEXT,
  lost_location TEXT,
  lost_date TIMESTAMPTZ,
  reported_by UUID REFERENCES auth.users(id),
  reporter_name TEXT,
  reporter_phone TEXT,
  reporter_email TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status lost_item_status NOT NULL DEFAULT 'reported',
  is_valuable BOOLEAN DEFAULT false,
  estimated_value NUMERIC,
  storage_location TEXT,
  claimed_at TIMESTAMPTZ,
  disposed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 25. FOUND ITEMS
-- ============================================================
CREATE TABLE found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  category lost_item_category NOT NULL DEFAULT 'other',
  color TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  distinctive_features TEXT,
  found_location TEXT NOT NULL,
  found_at TIMESTAMPTZ DEFAULT now(),
  found_by UUID REFERENCES auth.users(id),
  finder_name TEXT,
  finder_phone TEXT,
  finder_email TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status lost_item_status NOT NULL DEFAULT 'reported',
  is_valuable BOOLEAN DEFAULT false,
  estimated_value NUMERIC,
  storage_location TEXT,
  matched_lost_item_id UUID REFERENCES lost_items(id) ON DELETE SET NULL,
  returned_at TIMESTAMPTZ,
  disposed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 26. CLAIM REQUESTS
-- ============================================================
CREATE TABLE claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  lost_item_id UUID REFERENCES lost_items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES found_items(id) ON DELETE CASCADE,
  claimant_name TEXT NOT NULL,
  claimant_email TEXT,
  claimant_phone TEXT,
  claimant_photo_url TEXT,
  relationship TEXT,
  description TEXT NOT NULL,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_url TEXT,
  proof_of_ownership TEXT[] DEFAULT '{}',
  status claim_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  collected_at TIMESTAMPTZ,
  collected_by_name TEXT,
  collector_id_proof TEXT,
  digital_signature TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 27. CLAIM VERIFICATIONS
-- ============================================================
CREATE TABLE claim_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claim_requests(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'identity',
  verified_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  verification_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE claim_verifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 28. ITEM HANDOVER LOGS
-- ============================================================
CREATE TABLE item_handover_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claim_requests(id) ON DELETE CASCADE,
  handover_by UUID REFERENCES auth.users(id),
  handover_to_name TEXT NOT NULL,
  handover_to_phone TEXT,
  handover_to_id_proof TEXT,
  item_condition TEXT,
  digital_signature TEXT,
  handover_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE item_handover_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 29. FEEDBACK FORMS
-- ============================================================
CREATE TABLE feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL DEFAULT 'general',
  questions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 30. FEEDBACK RESPONSES
-- ============================================================
CREATE TABLE feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  respondent_name TEXT,
  respondent_email TEXT,
  respondent_phone TEXT,
  responses JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 31. SERVICE RATINGS
-- ============================================================
CREATE TABLE service_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  desk_id UUID REFERENCES help_desks(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT,
  comment TEXT,
  rated_by UUID REFERENCES auth.users(id),
  visitor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "org_access_all" ON help_desks FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON help_desk_staff FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON support_categories FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON support_priorities FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON support_statuses FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON support_tickets FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON ticket_comments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON ticket_attachments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON ticket_history FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON ticket_assignments FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON ticket_sla FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON ticket_escalations FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON knowledge_base_categories FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON knowledge_articles FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON faq_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitor_categories FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitors FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitor_groups FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitor_passes FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitor_checkins FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitor_checkout_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON visitor_hosts FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON meeting_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON lost_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON found_items FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON claim_requests FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON claim_verifications FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON item_handover_logs FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON feedback_forms FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON feedback_responses FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
CREATE POLICY "org_access_all" ON service_ratings FOR ALL USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE TRIGGER update_help_desks_updated_at BEFORE UPDATE ON help_desks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ticket_sla_updated_at BEFORE UPDATE ON ticket_sla FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ticket_escalations_updated_at BEFORE UPDATE ON ticket_escalations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON faq_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitor_groups_updated_at BEFORE UPDATE ON visitor_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitor_passes_updated_at BEFORE UPDATE ON visitor_passes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_visitor_hosts_updated_at BEFORE UPDATE ON visitor_hosts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meeting_logs_updated_at BEFORE UPDATE ON meeting_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lost_items_updated_at BEFORE UPDATE ON lost_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_found_items_updated_at BEFORE UPDATE ON found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_claim_requests_updated_at BEFORE UPDATE ON claim_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_feedback_forms_updated_at BEFORE UPDATE ON feedback_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- >>> END OF FILE: 00016_help_desk_reception_visitor_lost_found.sql <<<

