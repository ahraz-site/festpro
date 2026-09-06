-- Supabase Migration: Licensing, Payment Controls & 1-Festival Policy
-- Created: 2026-09-06

CREATE TABLE IF NOT EXISTS public.saas_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'blocked', 'expired')),
    hold_reason TEXT,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    pending_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_festivals INT NOT NULL DEFAULT 1,
    is_activated BOOLEAN NOT NULL DEFAULT false,
    activated_at TIMESTAMPTZ,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by key and organization
CREATE INDEX IF NOT EXISTS idx_saas_licenses_key ON public.saas_licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_saas_licenses_org ON public.saas_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_saas_licenses_status ON public.saas_licenses(status);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saas_licenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_saas_licenses_updated_at ON public.saas_licenses;
CREATE TRIGGER trigger_saas_licenses_updated_at
    BEFORE UPDATE ON public.saas_licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_saas_licenses_updated_at();

-- RLS Policies
ALTER TABLE public.saas_licenses ENABLE ROW LEVEL SECURITY;

-- Platform owners / admins can do everything
CREATE POLICY "Admins can manage all licenses" ON public.saas_licenses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('platform_owner', 'platform_admin')
        )
    );

-- Organization members can read their own license status
CREATE POLICY "Organizations can view own license" ON public.saas_licenses
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );
