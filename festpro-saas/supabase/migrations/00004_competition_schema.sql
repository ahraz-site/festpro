-- FestPro SaaS Module 4: Competition Management System
-- Run after 00003_festival_schema.sql

-- ====================
-- ENUMS
-- ====================

CREATE TYPE competition_status AS ENUM (
  'draft', 'upcoming', 'registration_open', 'registration_closed',
  'running', 'completed', 'cancelled'
);

CREATE TYPE competition_type AS ENUM ('individual', 'team', 'online', 'offline', 'hybrid');
CREATE TYPE age_group AS ENUM ('junior', 'senior', 'higher_secondary', 'college', 'open');
CREATE TYPE gender_restriction AS ENUM ('all', 'male', 'female');
CREATE TYPE round_type AS ENUM ('preliminary', 'quarter_final', 'semi_final', 'final', 'custom');
CREATE TYPE time_slot_status AS ENUM ('scheduled', 'running', 'completed', 'cancelled');

-- Extend activity_action enum
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.deleted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.category_created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.category_updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.category_deleted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.judge_assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.judge_unassigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.stage_assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.scheduled';

-- ====================
-- COMPETITION CATEGORIES
-- ====================

CREATE TABLE competition_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_ml VARCHAR(255),
  short_name VARCHAR(100),
  code VARCHAR(50),
  description TEXT,
  color VARCHAR(7) DEFAULT '#4F46E5',
  icon VARCHAR(100) DEFAULT 'trophy',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- COMPETITION SUBCATEGORIES
-- ====================

CREATE TABLE competition_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES competition_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_ml VARCHAR(255),
  code VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- COMPETITION GROUPS (age-based)
-- ====================

CREATE TABLE competition_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  age_group age_group NOT NULL DEFAULT 'open',
  min_age INTEGER,
  max_age INTEGER,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- COMPETITIONS (core)
-- ====================

CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES competition_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES competition_subcategories(id) ON DELETE SET NULL,
  group_id UUID REFERENCES competition_groups(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_ml VARCHAR(255),
  code VARCHAR(50) UNIQUE,
  description TEXT,
  competition_type competition_type DEFAULT 'individual',
  age_group age_group DEFAULT 'open',
  gender_restriction gender_restriction DEFAULT 'all',
  language VARCHAR(50) DEFAULT 'all',
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 100,
  min_participants INTEGER DEFAULT 1,
  max_teams INTEGER DEFAULT 50,
  max_participants_per_team INTEGER DEFAULT 1,
  is_team_event BOOLEAN DEFAULT false,
  stage_required BOOLEAN DEFAULT true,
  judge_count INTEGER DEFAULT 3,
  round_count INTEGER DEFAULT 1,
  status competition_status DEFAULT 'draft',
  allow_multiple_entries BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  instructions TEXT,
  winning_criteria TEXT,
  scoring_method VARCHAR(50) DEFAULT 'points',
  max_score DECIMAL(5,1) DEFAULT 100,
  passing_score DECIMAL(5,1),
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- COMPETITION ROUNDS
-- ====================

CREATE TABLE competition_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  round_type round_type DEFAULT 'preliminary',
  round_number INTEGER NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER,
  passing_score DECIMAL(5,1),
  has_elimination BOOLEAN DEFAULT true,
  elimination_count INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, round_number)
);

-- ====================
-- COMPETITION RULES
-- ====================

CREATE TABLE competition_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rule_number INTEGER DEFAULT 1,
  file_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- COMPETITION MATERIALS
-- ====================

CREATE TABLE competition_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- STAGE ASSIGNMENTS
-- ====================

CREATE TABLE competition_stage_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES festival_stages(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES festival_venues(id) ON DELETE SET NULL,
  assigned_date DATE,
  start_time TIME,
  end_time TIME,
  is_primary BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, stage_id, assigned_date)
);

-- ====================
-- JUDGE ASSIGNMENTS
-- ====================

CREATE TABLE competition_judge_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'judge',
  is_lead_judge BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- ====================
-- TIME SLOTS
-- ====================

CREATE TABLE competition_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  round_id UUID REFERENCES competition_rounds(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES festival_stages(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES festival_venues(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status time_slot_status DEFAULT 'scheduled',
  max_participants INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- COMPETITION RESULTS
-- ====================

CREATE TABLE competition_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  round_id UUID REFERENCES competition_rounds(id) ON DELETE CASCADE,
  participant_id UUID, -- will reference participants table in Module 5
  score DECIMAL(5,1),
  rank INTEGER,
  is_winner BOOLEAN DEFAULT false,
  is_passed BOOLEAN DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- ELIGIBILITY RULES
-- ====================

CREATE TABLE competition_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  allowed_units TEXT[] DEFAULT '{}',
  allowed_divisions TEXT[] DEFAULT '{}',
  allowed_sectors TEXT[] DEFAULT '{}',
  min_age INTEGER,
  max_age INTEGER,
  gender_restriction gender_restriction DEFAULT 'all',
  requires_qualification BOOLEAN DEFAULT false,
  qualification_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- INDEXES
-- ====================

CREATE INDEX idx_comp_categories_fest ON competition_categories(festival_id);
CREATE INDEX idx_comp_subcategories_cat ON competition_subcategories(category_id);
CREATE INDEX idx_comp_groups_fest ON competition_groups(festival_id);
CREATE INDEX idx_competitions_fest ON competitions(festival_id);
CREATE INDEX idx_competitions_cat ON competitions(category_id);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_code ON competitions(code);
CREATE INDEX idx_comp_rounds_comp ON competition_rounds(competition_id);
CREATE INDEX idx_comp_rules_comp ON competition_rules(competition_id);
CREATE INDEX idx_comp_materials_comp ON competition_materials(competition_id);
CREATE INDEX idx_comp_stage_assign_comp ON competition_stage_assignments(competition_id);
CREATE INDEX idx_comp_stage_assign_stage ON competition_stage_assignments(stage_id);
CREATE INDEX idx_comp_judge_assign_comp ON competition_judge_assignments(competition_id);
CREATE INDEX idx_comp_judge_assign_user ON competition_judge_assignments(user_id);
CREATE INDEX idx_comp_time_slots_comp ON competition_time_slots(competition_id);
CREATE INDEX idx_comp_time_slots_date ON competition_time_slots(slot_date);
CREATE INDEX idx_comp_results_comp ON competition_results(competition_id);
CREATE INDEX idx_comp_eligibility_comp ON competition_eligibility(competition_id);

-- ====================
-- TRIGGERS
-- ====================

CREATE TRIGGER update_comp_categories_updated_at
  BEFORE UPDATE ON competition_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_subcategories_updated_at
  BEFORE UPDATE ON competition_subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_groups_updated_at
  BEFORE UPDATE ON competition_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_rounds_updated_at
  BEFORE UPDATE ON competition_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_rules_updated_at
  BEFORE UPDATE ON competition_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_materials_updated_at
  BEFORE UPDATE ON competition_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_stage_assign_updated_at
  BEFORE UPDATE ON competition_stage_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_time_slots_updated_at
  BEFORE UPDATE ON competition_time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_results_updated_at
  BEFORE UPDATE ON competition_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comp_eligibility_updated_at
  BEFORE UPDATE ON competition_eligibility
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Log competition creation
CREATE OR REPLACE FUNCTION log_competition_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, metadata)
  SELECT f.organization_id, NEW.created_by, 'competition.created', 'competition', NEW.id,
    jsonb_build_object('name', NEW.name, 'code', NEW.code)
  FROM festivals f WHERE f.id = NEW.festival_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_competition_created_log
  AFTER INSERT ON competitions
  FOR EACH ROW EXECUTE FUNCTION log_competition_created();

-- ====================
-- ROW LEVEL SECURITY
-- ====================

CREATE OR REPLACE FUNCTION apply_competition_rls(table_name TEXT, festival_col TEXT DEFAULT 'festival_id')
RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', table_name);
  EXECUTE format('
    CREATE POLICY "Members can view %s" ON %I FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM organization_members om
        JOIN festivals f ON f.organization_id = om.organization_id
        WHERE f.id = %I.%s AND om.user_id = auth.uid()
      )
    );', table_name, table_name, table_name, festival_col);
  EXECUTE format('
    CREATE POLICY "Admins can manage %s" ON %I FOR ALL USING (
      EXISTS (
        SELECT 1 FROM organization_members om
        JOIN festivals f ON f.organization_id = om.organization_id
        WHERE f.id = %I.%s AND om.user_id = auth.uid()
        AND om.role IN (''organization_owner'', ''organization_admin'', ''festival_director'', ''platform_owner'', ''platform_admin'')
      )
    );', table_name, table_name, table_name, festival_col);
END;
$$ LANGUAGE plpgsql;

SELECT apply_competition_rls('competition_categories');
SELECT apply_competition_rls('competition_subcategories', 'category_id');
SELECT apply_competition_rls('competition_groups');
SELECT apply_competition_rls('competitions');
SELECT apply_competition_rls('competition_rounds');
SELECT apply_competition_rls('competition_rules');
SELECT apply_competition_rls('competition_materials');
SELECT apply_competition_rls('competition_stage_assignments');
SELECT apply_competition_rls('competition_judge_assignments');
SELECT apply_competition_rls('competition_time_slots');
SELECT apply_competition_rls('competition_results');
SELECT apply_competition_rls('competition_eligibility');

-- Seed default age groups
INSERT INTO competition_groups (festival_id, name, code, age_group, min_age, max_age, display_order)
SELECT f.id, 'Junior', 'JUN', 'junior', 5, 10, 1
FROM festivals f
WHERE NOT EXISTS (SELECT 1 FROM competition_groups WHERE festival_id = f.id AND code = 'JUN');

INSERT INTO competition_groups (festival_id, name, code, age_group, min_age, max_age, display_order)
SELECT f.id, 'Senior', 'SEN', 'senior', 11, 15, 2
FROM festivals f
WHERE NOT EXISTS (SELECT 1 FROM competition_groups WHERE festival_id = f.id AND code = 'SEN');

INSERT INTO competition_groups (festival_id, name, code, age_group, min_age, max_age, display_order)
SELECT f.id, 'Higher Secondary', 'HS', 'higher_secondary', 16, 17, 3
FROM festivals f
WHERE NOT EXISTS (SELECT 1 FROM competition_groups WHERE festival_id = f.id AND code = 'HS');

INSERT INTO competition_groups (festival_id, name, code, age_group, min_age, max_age, display_order)
SELECT f.id, 'College', 'COL', 'college', 18, 25, 4
FROM festivals f
WHERE NOT EXISTS (SELECT 1 FROM competition_groups WHERE festival_id = f.id AND code = 'COL');

INSERT INTO competition_groups (festival_id, name, code, age_group, min_age, max_age, display_order)
SELECT f.id, 'Open', 'OPEN', 'open', NULL, NULL, 5
FROM festivals f
WHERE NOT EXISTS (SELECT 1 FROM competition_groups WHERE festival_id = f.id AND code = 'OPEN');
