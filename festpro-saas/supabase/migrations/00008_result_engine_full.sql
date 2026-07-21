-- FestPro Module 8: Results, Team Points, Appeals & Certificate Engine
-- Production-ready migration with full RLS, triggers, and indexes

-- ============================================================
-- 1. ENUMS
-- ============================================================
DO $$ BEGIN CREATE TYPE result_publish_status AS ENUM ('draft', 'internal_review', 'published', 'live', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE appeal_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE certificate_type AS ENUM ('participant', 'winner', 'judge', 'volunteer', 'organizer', 'chief_guest', 'staff', 'participation'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- 2. EXISTING TABLES (referenced from 00007 & 00008)
-- We reference: results_final, result_grades, result_rankings, result_publish_queue
-- These are already created in 00008_result_schema.sql
-- ============================================================

-- ============================================================
-- 3. RESULT ITEMS — individual participant result entries
-- ============================================================
CREATE TABLE result_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  round_id UUID REFERENCES competition_rounds(id),
  -- Core scores
  total_score NUMERIC(10,3),
  average_score NUMERIC(10,3),
  weighted_score NUMERIC(10,3),
  final_score NUMERIC(10,3),
  -- Ranking
  rank INT,
  rank_category VARCHAR(50), -- e.g. 'category_a', 'overall'
  is_tie BOOLEAN DEFAULT false,
  tie_broken_by VARCHAR(100),
  -- Grade
  grade VARCHAR(5),
  grade_label VARCHAR(100),
  is_passed BOOLEAN DEFAULT true,
  -- Position labels
  position VARCHAR(50), -- 1st, 2nd, 3rd, A Grade, B Grade, C Grade, Participation
  remarks TEXT,
  -- Status
  status result_publish_status DEFAULT 'draft',
  is_winner BOOLEAN DEFAULT false,
  is_medalist BOOLEAN DEFAULT false,
  medal_type VARCHAR(20) CHECK (medal_type IN ('gold', 'silver', 'bronze')),
  -- Override tracking
  rank_overridden BOOLEAN DEFAULT false,
  rank_overridden_by UUID REFERENCES profiles(id),
  rank_override_reason TEXT,
  -- Timestamps
  processed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(competition_id, participant_id, round_id)
);

-- ============================================================
-- 4. RESULT PUBLICATIONS — published result records
-- ============================================================
CREATE TABLE result_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id),
  stage_id UUID REFERENCES festival_stages(id),
  category_id UUID REFERENCES competition_categories(id),
  publish_scope VARCHAR(50) NOT NULL CHECK (publish_scope IN ('competition', 'stage', 'category', 'festival')),
  title VARCHAR(255),
  description TEXT,
  published_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  status result_publish_status DEFAULT 'published',
  is_live BOOLEAN DEFAULT false,
  live_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. TEAM POINT RULES — configurable scoring rules
-- ============================================================
CREATE TABLE team_point_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('unit', 'sector', 'division', 'organization')),
  point_type VARCHAR(50) NOT NULL CHECK (point_type IN ('rank', 'participation', 'special', 'bonus')),
  rank_from INT,
  rank_to INT,
  points NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE team_point_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================
-- 6. TEAM POINTS — calculated team scores
-- ============================================================
CREATE TABLE team_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('unit', 'sector', 'division', 'organization')),
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255),
  total_points NUMERIC(10,2) DEFAULT 0,
  rank INT,
  medals_gold INT DEFAULT 0,
  medals_silver INT DEFAULT 0,
  medals_bronze INT DEFAULT 0,
  participation_count INT DEFAULT 0,
  competition_count INT DEFAULT 0,
  status result_publish_status DEFAULT 'draft',
  calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(festival_id, entity_type, entity_id)
);

-- ============================================================
-- 7. OVERALL CHAMPIONSHIP — championship standings
-- ============================================================
CREATE TABLE overall_championship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  championship_type VARCHAR(50) NOT NULL CHECK (championship_type IN ('overall', 'unit', 'sector', 'division', 'special')),
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255),
  total_points NUMERIC(10,2) DEFAULT 0,
  rank INT,
  is_champion BOOLEAN DEFAULT false,
  is_runner_up BOOLEAN DEFAULT false,
  medals_gold INT DEFAULT 0,
  medals_silver INT DEFAULT 0,
  medals_bronze INT DEFAULT 0,
  status result_publish_status DEFAULT 'draft',
  calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(festival_id, championship_type, entity_id)
);

-- ============================================================
-- 8. APPEALS — participant appeal management
-- ============================================================
CREATE TABLE appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  result_item_id UUID REFERENCES result_items(id),
  -- Appeal details
  appeal_type VARCHAR(50) NOT NULL CHECK (appeal_type IN ('score_review', 'rank_dispute', 'eligibility', 'technical_issue', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  -- Status
  status appeal_status DEFAULT 'submitted',
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  -- Committee
  assigned_to UUID REFERENCES profiles(id),
  committee_notes TEXT,
  decision TEXT,
  decision_by UUID REFERENCES profiles(id),
  decided_at TIMESTAMPTZ,
  -- Result recalculation
  requires_recalculation BOOLEAN DEFAULT false,
  recalculated_result_id UUID REFERENCES result_items(id),
  -- Timestamps
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. APPEAL DOCUMENTS — evidence uploads
-- ============================================================
CREATE TABLE appeal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id UUID NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================
-- 10. APPEAL HISTORY — status change tracking
-- ============================================================
CREATE TABLE appeal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id UUID NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
  from_status appeal_status,
  to_status appeal_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE appeal_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================
-- 11. CERTIFICATE TEMPLATES — certificate design
-- ============================================================
CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  certificate_type certificate_type NOT NULL DEFAULT 'participant',
  template_name VARCHAR(255) NOT NULL,
  orientation VARCHAR(10) DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
  page_size VARCHAR(20) DEFAULT 'A4',
  -- Content
  background_image_url TEXT,
  logo_url TEXT,
  header_text TEXT,
  body_template TEXT NOT NULL,
  footer_text TEXT,
  -- Styling
  font_family VARCHAR(100) DEFAULT 'serif',
  primary_color VARCHAR(20) DEFAULT '#1a365d',
  accent_color VARCHAR(20) DEFAULT '#d4af37',
  -- Fields
  show_qr BOOLEAN DEFAULT true,
  show_serial BOOLEAN DEFAULT true,
  show_date BOOLEAN DEFAULT true,
  show_signature BOOLEAN DEFAULT true,
  show_logo BOOLEAN DEFAULT true,
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. CERTIFICATES — generated certificates
-- ============================================================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES certificate_templates(id),
  -- Recipient
  recipient_type certificate_type NOT NULL DEFAULT 'participant',
  recipient_id UUID NOT NULL, -- participant_id, judge_id, volunteer_id, etc.
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255),
  -- Certificate details
  competition_id UUID REFERENCES competitions(id),
  result_item_id UUID REFERENCES result_items(id),
  certificate_type VARCHAR(100), -- 'winner_1st', 'participation', etc.
  position VARCHAR(50), -- 1st, 2nd, 3rd, Participation
  rank INT,
  grade VARCHAR(5),
  score NUMERIC(10,3),
  -- Security
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  qr_data TEXT,
  digital_signature TEXT,
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'published', 'revoked')),
  is_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  -- Timestamps
  generated_by UUID REFERENCES profiles(id),
  generated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. CERTIFICATE BATCHES — bulk generation tracking
-- ============================================================
CREATE TABLE certificate_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES certificate_templates(id),
  batch_name VARCHAR(255) NOT NULL,
  total_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  generated_by UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 14. CERTIFICATE VERIFICATIONS — QR scan audit
-- ============================================================
CREATE TABLE certificate_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES profiles(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  verification_method VARCHAR(20) DEFAULT 'qr' CHECK (verification_method IN ('qr', 'manual', 'api')),
  is_valid BOOLEAN DEFAULT true,
  details TEXT,
  verified_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE certificate_verifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================
-- 15. RESULT AUDIT LOGS — comprehensive audit trail
-- ============================================================
CREATE TABLE result_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  performed_by UUID REFERENCES profiles(id),
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 16. INDEXES
-- ============================================================
CREATE INDEX idx_result_items_competition ON result_items(competition_id);
CREATE INDEX idx_result_items_participant ON result_items(participant_id);
CREATE INDEX idx_result_items_rank ON result_items(competition_id, rank);
CREATE INDEX idx_result_items_status ON result_items(status, festival_id);
CREATE INDEX idx_result_publications_festival ON result_publications(festival_id);
CREATE INDEX idx_result_publications_scope ON result_publications(publish_scope);
CREATE INDEX idx_team_points_festival ON team_points(festival_id);
CREATE INDEX idx_team_points_entity ON team_points(entity_type, entity_id);
CREATE INDEX idx_team_point_rules_festival ON team_point_rules(festival_id);
CREATE INDEX idx_overall_championship_festival ON overall_championship(festival_id);
CREATE INDEX idx_overall_championship_rank ON overall_championship(festival_id, rank);
CREATE INDEX idx_appeals_festival ON appeals(festival_id);
CREATE INDEX idx_appeals_status ON appeals(status);
CREATE INDEX idx_appeals_participant ON appeals(participant_id);
CREATE INDEX idx_appeal_documents_appeal ON appeal_documents(appeal_id);
CREATE INDEX idx_appeal_history_appeal ON appeal_history(appeal_id);
CREATE INDEX idx_certificates_festival ON certificates(festival_id);
CREATE INDEX idx_certificates_recipient ON certificates(recipient_type, recipient_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_certificate_templates_festival ON certificate_templates(festival_id);
CREATE INDEX idx_certificate_batches_festival ON certificate_batches(festival_id);
CREATE INDEX idx_certificate_verifications_cert ON certificate_verifications(certificate_id);
CREATE INDEX idx_result_audit_logs_festival ON result_audit_logs(festival_id);
CREATE INDEX idx_result_audit_logs_action ON result_audit_logs(action, created_at);
CREATE INDEX idx_result_audit_logs_entity ON result_audit_logs(entity_type, entity_id);

-- ============================================================
-- 17. TRIGGERS
-- ============================================================
CREATE TRIGGER update_result_items_updated_at
  BEFORE UPDATE ON result_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_result_publications_updated_at
  BEFORE UPDATE ON result_publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_points_updated_at
  BEFORE UPDATE ON team_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overall_championship_updated_at
  BEFORE UPDATE ON overall_championship
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appeals_updated_at
  BEFORE UPDATE ON appeals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-set medal_type based on rank
CREATE OR REPLACE FUNCTION set_medal_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rank = 1 THEN
    NEW.medal_type := 'gold';
    NEW.is_winner := true;
    NEW.is_medalist := true;
    NEW.position := '1st';
  ELSIF NEW.rank = 2 THEN
    NEW.medal_type := 'silver';
    NEW.is_medalist := true;
    NEW.position := '2nd';
  ELSIF NEW.rank = 3 THEN
    NEW.medal_type := 'bronze';
    NEW.is_medalist := true;
    NEW.position := '3rd';
  ELSIF NEW.rank IS NOT NULL THEN
    NEW.medal_type := NULL;
    NEW.is_medalist := false;
    NEW.position := NEW.rank::TEXT || 'th';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_medal_type
  BEFORE INSERT OR UPDATE OF rank ON result_items
  FOR EACH ROW EXECUTE FUNCTION set_medal_type();

-- Auto-generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
  fest_code VARCHAR(10);
  seq_num INT;
BEGIN
  SELECT COALESCE(code, SUBSTRING(id::TEXT, 1, 6)) INTO fest_code FROM festivals WHERE id = NEW.festival_id;
  seq_num := nextval('certificate_number_seq');
  NEW.certificate_number := UPPER(fest_code) || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq_num::TEXT, 6, '0');
  NEW.verification_code := encode(gen_random_bytes(16), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS certificate_number_seq START 1;

CREATE TRIGGER trg_generate_certificate_number
  BEFORE INSERT ON certificates
  FOR EACH ROW
  WHEN (NEW.certificate_number IS NULL)
  EXECUTE FUNCTION generate_certificate_number();

-- Audit log trigger
CREATE OR REPLACE FUNCTION log_result_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO result_audit_logs (
    festival_id, organization_id, action, entity_type, entity_id,
    performed_by, old_values, new_values, metadata
  ) VALUES (
    COALESCE(NEW.festival_id, OLD.festival_id),
    COALESCE(NEW.organization_id, OLD.organization_id),
    TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id),
    NULL, -- will be set by application
    to_jsonb(OLD), to_jsonb(NEW),
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_result_items_audit
  AFTER INSERT OR UPDATE OR DELETE ON result_items
  FOR EACH ROW EXECUTE FUNCTION log_result_audit();

-- Appeal history trigger
CREATE OR REPLACE FUNCTION log_appeal_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO appeal_history (appeal_id, from_status, to_status, changed_by, change_notes)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.decision_by, NEW.committee_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appeal_history
  AFTER UPDATE OF status ON appeals
  FOR EACH ROW EXECUTE FUNCTION log_appeal_history();

-- ============================================================
-- 18. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE result_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE overall_championship ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_audit_logs ENABLE ROW LEVEL SECURITY;

-- Organization isolation helper function
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS TABLE (org_id UUID) LANGUAGE SQL STABLE AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
$$;

-- === RESULT ITEMS RLS ===
CREATE POLICY result_items_org_select ON result_items FOR SELECT
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));
CREATE POLICY result_items_org_insert ON result_items FOR INSERT
  WITH CHECK (organization_id IN (SELECT org_id FROM user_org_ids()));
CREATE POLICY result_items_org_update ON result_items FOR UPDATE
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));

-- Public read for published/live results
CREATE POLICY result_items_public_select ON result_items FOR SELECT
  USING (status IN ('published', 'live'));

-- === RESULT PUBLICATIONS RLS ===
CREATE POLICY result_publications_org ON result_publications
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));

-- === TEAM POINTS RLS ===
CREATE POLICY team_points_org ON team_points
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));

-- === TEAM POINT RULES RLS ===
CREATE POLICY team_point_rules_festival ON team_point_rules
  USING (festival_id IN (
    SELECT id FROM festivals WHERE organization_id IN (SELECT org_id FROM user_org_ids())
  ));

-- === OVERALL CHAMPIONSHIP RLS ===
CREATE POLICY overall_championship_org ON overall_championship
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));

-- === APPEALS RLS ===
CREATE POLICY appeals_org ON appeals
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));
-- Participants can see their own appeals
CREATE POLICY appeals_self ON appeals FOR SELECT
  USING (participant_id IN (
    SELECT id FROM participants WHERE user_id = auth.uid()
  ));

-- === APPEAL DOCUMENTS RLS ===
CREATE POLICY appeal_documents_org ON appeal_documents
  USING (appeal_id IN (SELECT id FROM appeals WHERE organization_id IN (SELECT org_id FROM user_org_ids())));

-- === APPEAL HISTORY RLS ===
CREATE POLICY appeal_history_org ON appeal_history
  USING (appeal_id IN (SELECT id FROM appeals WHERE organization_id IN (SELECT org_id FROM user_org_ids())));

-- === CERTIFICATE TEMPLATES RLS ===
CREATE POLICY certificate_templates_org ON certificate_templates
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));

-- === CERTIFICATES RLS ===
CREATE POLICY certificates_org ON certificates
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));
-- Public read for verification
CREATE POLICY certificates_public ON certificates FOR SELECT
  USING (status = 'published');

-- === CERTIFICATE BATCHES RLS ===
CREATE POLICY certificate_batches_org ON certificate_batches
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));

-- === CERTIFICATE VERIFICATIONS RLS ===
-- Anyone can insert (QR scan)
CREATE POLICY certificate_verifications_insert ON certificate_verifications FOR INSERT
  WITH CHECK (true);
-- Org members can view
CREATE POLICY certificate_verifications_org ON certificate_verifications FOR SELECT
  USING (certificate_id IN (
    SELECT id FROM certificates WHERE organization_id IN (SELECT org_id FROM user_org_ids())
  ));

-- === RESULT AUDIT LOGS RLS ===
CREATE POLICY result_audit_logs_org ON result_audit_logs
  USING (organization_id IN (SELECT org_id FROM user_org_ids()));
