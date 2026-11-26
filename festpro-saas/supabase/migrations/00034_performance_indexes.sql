-- ============================================================================
-- Migration 00034: High-Performance Composite Indexes for Multi-Tenant Festival SaaS
-- Optimizes query execution plans for operations dashboard, live results, & stage monitoring
-- ============================================================================

-- 1. Stage Schedules Indexing (Filters by festival and sorts by scheduled date or status)
CREATE INDEX IF NOT EXISTS idx_stage_schedules_fest_date 
  ON stage_schedules (festival_id, scheduled_date ASC);

CREATE INDEX IF NOT EXISTS idx_stage_schedules_fest_status 
  ON stage_schedules (festival_id, status);

-- 2. Team Points & Leaderboard Indexing (Filters by festival and sorts by rank)
CREATE INDEX IF NOT EXISTS idx_team_points_fest_rank 
  ON team_points (festival_id, rank ASC NULLS LAST);

-- 3. Teams Indexing (Filters by festival, sorts by creation)
CREATE INDEX IF NOT EXISTS idx_teams_fest_created 
  ON teams (festival_id, created_at ASC);

-- 4. Festival Stages Indexing (Filters by festival and sorts by display order)
CREATE INDEX IF NOT EXISTS idx_festival_stages_fest_sort 
  ON festival_stages (festival_id, sort_order ASC);

-- 5. Result Items Indexing (Fast exact counting and filtering of published results)
CREATE INDEX IF NOT EXISTS idx_result_items_fest_status 
  ON result_items (festival_id, status);

-- 6. Participants and Competitions Count/Filter Indexes
CREATE INDEX IF NOT EXISTS idx_participants_fest 
  ON participants (festival_id);

CREATE INDEX IF NOT EXISTS idx_competitions_fest 
  ON competitions (festival_id);

-- 7. Organization Activity Logs Indexing
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_created 
  ON activity_logs (organization_id, created_at DESC);

-- 8. Festival Judges Fast Lookup by Username (supports case-insensitive lower match)
CREATE INDEX IF NOT EXISTS idx_festival_judges_username_lower 
  ON festival_judges (LOWER(username));

CREATE INDEX IF NOT EXISTS idx_festival_judges_fest 
  ON festival_judges (festival_id);
