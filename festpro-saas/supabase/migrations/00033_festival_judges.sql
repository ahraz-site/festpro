-- FestPro: Festival Judges & Username/Password Authentication Table
-- Enables judges to log in using simple username and password as in Quaf / Festize.

CREATE TABLE IF NOT EXISTS festival_judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  raw_password VARCHAR(255),
  stage_id UUID REFERENCES festival_stages(id) ON DELETE SET NULL,
  stage_name VARCHAR(100),
  phone VARCHAR(50),
  is_lead BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  assigned_competitions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festival_judges_username ON festival_judges(username);
CREATE INDEX IF NOT EXISTS idx_festival_judges_fest ON festival_judges(festival_id);

ALTER TABLE festival_judges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'festival_judges' 
    AND policyname = 'allow_public_judge_auth_read'
  ) THEN
    CREATE POLICY allow_public_judge_auth_read ON festival_judges
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'festival_judges' 
    AND policyname = 'allow_org_manage_judges'
  ) THEN
    CREATE POLICY allow_org_manage_judges ON festival_judges
      FOR ALL USING (true);
  END IF;
END $$;
