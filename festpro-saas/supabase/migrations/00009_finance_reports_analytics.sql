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

