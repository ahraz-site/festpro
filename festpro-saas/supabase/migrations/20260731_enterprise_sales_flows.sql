-- Migration: Enterprise Sales Flow (Leads, Offline Payments, License Keys)

-- 1. Enterprise Leads Table (for demo requests, contact sales)
CREATE TABLE IF NOT EXISTS public.enterprise_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    event_size TEXT,
    message TEXT,
    lead_type TEXT DEFAULT 'demo_request', -- 'demo_request', 'contact_sales'
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'closed'
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for enterprise_leads
ALTER TABLE public.enterprise_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" 
    ON public.enterprise_leads FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Platform admins can view all leads" 
    ON public.enterprise_leads FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('platform_owner', 'platform_admin')
        )
    );

CREATE POLICY "Platform admins can update leads" 
    ON public.enterprise_leads FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('platform_owner', 'platform_admin')
        )
    );


-- 2. Offline Payments Table (for tracking bank transfers, checks)
CREATE TABLE IF NOT EXISTS public.offline_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL, -- 'bank_transfer', 'upi', 'check', 'cash'
    reference_number TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for offline_payments
ALTER TABLE public.offline_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view all offline payments" 
    ON public.offline_payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('platform_owner', 'platform_admin')
        )
    );

CREATE POLICY "Platform admins can update offline payments" 
    ON public.offline_payments FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('platform_owner', 'platform_admin')
        )
    );

-- 3. License Keys Table
CREATE TABLE IF NOT EXISTS public.license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    plan_tier TEXT NOT NULL, -- 'starter', 'professional', 'enterprise'
    status TEXT DEFAULT 'active', -- 'active', 'used', 'revoked', 'expired'
    organization_id UUID REFERENCES public.organizations(id), -- Null until activated
    activated_at TIMESTAMP WITH TIME ZONE,
    activated_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for license_keys
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage license keys" 
    ON public.license_keys FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('platform_owner', 'platform_admin')
        )
    );

-- Function to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_enterprise_leads_modtime
    BEFORE UPDATE ON public.enterprise_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offline_payments_modtime
    BEFORE UPDATE ON public.offline_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_license_keys_modtime
    BEFORE UPDATE ON public.license_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
