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
