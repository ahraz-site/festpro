-- Supabase Migration: CRM, Manual Payments & Licensing

-- 1. ENUMS
CREATE TYPE lead_status AS ENUM ('New Lead', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Won', 'Lost');
CREATE TYPE payment_method AS ENUM ('UPI', 'Bank Transfer', 'Cash', 'Cheque', 'NEFT', 'RTGS');
CREATE TYPE payment_status AS ENUM ('Pending', 'Verified', 'Rejected');
CREATE TYPE license_status AS ENUM ('Pending', 'Active', 'Expired', 'Suspended');
CREATE TYPE billing_cycle AS ENUM ('Monthly', 'Quarterly', 'Yearly', 'Lifetime');

-- 2. CRM TABLES
CREATE TABLE public.sales_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    plan_interested TEXT,
    expected_launch_date DATE,
    status lead_status DEFAULT 'New Lead',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.demo_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    valid_until DATE,
    pdf_url TEXT,
    status TEXT DEFAULT 'Sent',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE,
    pdf_url TEXT,
    status TEXT DEFAULT 'Unpaid',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    author_id UUID, -- References auth.users or admin table
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. LICENSING & SUBSCRIPTION TABLES
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., Starter, Professional, Enterprise
    description TEXT,
    billing_cycle billing_cycle DEFAULT 'Yearly',
    price NUMERIC(10, 2) NOT NULL,
    max_users INT DEFAULT 10,
    max_festivals INT DEFAULT 1,
    max_storage_gb INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.license_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL, -- e.g., 'white_label', 'ai_access', 'api_access'
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.subscription_plans(id),
    status license_status DEFAULT 'Pending',
    max_users INT,
    max_festivals INT,
    max_storage_gb INT,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE, -- Encrypted/Hashed key for security
    display_key TEXT NOT NULL UNIQUE, -- e.g., FP-2026-AB7X-K92P-QW81
    is_activated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.organization_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL, -- References organizations table in existing schema
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.license_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    activated_by UUID NOT NULL, -- References auth.users
    device_info TEXT,
    ip_address TEXT,
    activated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    current_users INT DEFAULT 0,
    current_festivals INT DEFAULT 0,
    current_storage_bytes BIGINT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 4. SALES & PAYMENTS TABLES
CREATE TABLE public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.sales_leads(id),
    plan_id UUID REFERENCES public.subscription_plans(id),
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    payment_link TEXT,
    requested_amount NUMERIC(10, 2) NOT NULL,
    status payment_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.manual_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_id TEXT,
    payment_date DATE NOT NULL,
    remarks TEXT,
    status payment_status DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_payment_id UUID REFERENCES public.manual_payments(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.payment_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_payment_id UUID REFERENCES public.manual_payments(id) ON DELETE CASCADE,
    verified_by UUID, -- References auth.users (admin)
    status payment_status DEFAULT 'Pending',
    verification_notes TEXT,
    verified_at TIMESTAMPTZ
);

-- RLS POLICIES (Basic Admin & Read logic)
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Note: We are creating broad policies for initial implementation. In a real environment, 
-- these would be tied to `auth.uid()` and an `admin` role or `organization_members` mapping.
CREATE POLICY "Public can insert leads" ON public.sales_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can view their own org licenses" ON public.organization_licenses FOR SELECT USING (true); -- Requires auth.uid() join logic later
