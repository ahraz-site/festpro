-- 00031_enterprise_sales_crm.sql
-- Enterprise Sales CRM & Customer Lifecycle Management

-- Enable UUID extension if not already enabled (usually is in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sales Teams & Agents
CREATE TABLE IF NOT EXISTS public.sales_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.sales_teams(id) ON DELETE SET NULL,
    target_amount NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Companies & Contacts
CREATE TABLE IF NOT EXISTS public.customer_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    size VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.customer_companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    job_title VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Lead Management Extensions (Modifying existing sales_leads or creating new if needed)
-- We'll create a robust leads table if one doesn't exist, or alter it. We'll create a v2 table for CRM.
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES public.customer_companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL,
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'New', -- New, Contacted, Demo Scheduled, Demo Completed, Quotation Sent, Negotiation, Won, Lost
    value NUMERIC(15, 2) DEFAULT 0,
    score INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- Call, Email, Meeting, Note
    description TEXT,
    activity_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Demo Bookings (v2)
CREATE TABLE IF NOT EXISTS public.crm_demo_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    meeting_mode VARCHAR(50) DEFAULT 'Online', -- Online, Offline
    meeting_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled, Rescheduled
    notes TEXT,
    recording_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.customer_companies(id) ON DELETE CASCADE,
    prepared_by UUID REFERENCES public.sales_agents(id) ON DELETE SET NULL,
    valid_until TIMESTAMPTZ,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    tax NUMERIC(15, 2) DEFAULT 0,
    total NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft', -- Draft, Sent, Accepted, Rejected, Expired
    terms TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    total_price NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Invoices & Payments
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.customer_companies(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid, Overdue, Cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.manual_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.sales_invoices(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL, -- UPI, Bank Transfer, Cheque, Cash
    transaction_id VARCHAR(255),
    amount NUMERIC(15, 2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    proof_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Verification Pending', -- Verification Pending, Verified, Rejected
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Subscriptions & Renewals
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.customer_companies(id) ON DELETE CASCADE,
    plan_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Suspended, Cancelled, Expired
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'Annual', -- Monthly, Annual
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.renewal_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES public.customer_subscriptions(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50), -- 30 Days, 15 Days, 7 Days, 1 Day, Expired
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Sent, Failed
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Customer Timeline
CREATE TABLE IF NOT EXISTS public.customer_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.customer_companies(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- Lead Created, Demo, Quotation, Invoice, Payment, License, Renewal
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- RLS Policies
ALTER TABLE public.sales_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_demo_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;

-- Allow all for authenticated users in the admin/platform side (simplified for this update)
CREATE POLICY "Enable all for auth users" ON public.sales_teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.sales_agents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.customer_companies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.customer_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.crm_leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.lead_activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.crm_demo_bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.quotations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.quotation_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.sales_invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.manual_payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.customer_subscriptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.renewal_reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth users" ON public.customer_timeline FOR ALL USING (auth.role() = 'authenticated');

-- Public policies for lead gen and payment proofs
CREATE POLICY "Allow anon insert leads" ON public.customer_companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert contacts" ON public.customer_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert crm_leads" ON public.crm_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert demo_bookings" ON public.crm_demo_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read quotations" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Allow public read quotation_items" ON public.quotation_items FOR SELECT USING (true);
CREATE POLICY "Allow public read invoices" ON public.sales_invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert payments" ON public.manual_payments FOR INSERT WITH CHECK (true);
