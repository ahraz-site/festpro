# FesPro Enterprise – Database Optimization Report

**Target Database**: Supabase PostgreSQL 15+  
**Architecture**: Multi-Tenant Schema with Organization and Festival-level Row Level Security (RLS)  
**Migration Reference**: `supabase/migrations/00034_performance_indexes.sql`

---

## 1. Query Plan Analysis & N+1 Elimination

### 1.1 Root Problem in `getFestivalDashboardData`
Previously, `getFestivalDashboardData` executed 17 separate queries per invocation. Several of these were either duplicates, redundant counts of tables already fetched, or completely unused on the Operations Dashboard.

### 1.2 Applied Database Optimizations

#### A. Dual Access Check Elimination
- **Before**: `checkFestivalAccess(festivalId)` executed 3 queries (`auth.getUser`, `festivals`, and `organization_members`). Immediately following this, `getFestival(festivalId)` called `checkFestivalAccess` again, causing 3 duplicate queries.
- **After**: Permission is verified once. If allowed, `festivals` is fetched directly with `admin.from("festivals").select("*").eq("id", festivalId).single()`.
- **Query Savings**: 3 redundant database queries eliminated per call.

#### B. Redundant Count Query Pruning
- **Before**: 
  - `admin.from("teams").select("id", { count: "exact", head: true })`
  - `admin.from("teams").select("id, name, code, color")`
  - `admin.from("festival_stages").select("id", { count: "exact", head: true })`
  - `admin.from("festival_stages").select("id, name, code, ...")`
- **After**: The separate count queries were removed. `total_teams` and `total_stages` are derived directly from the lengths of `teamsRes.data` and `stagesRes.data`.
- **Query Savings**: 2 redundant database queries eliminated per call.

#### C. Unused Entity Pruning
- **Before**: Fetched `festival_days`, `festival_venues`, `festival_announcements`, and `festival_sponsors` even though none of these are rendered on the operational overview.
- **After**: Pruned from the critical dashboard action. Dedicated detail views continue to fetch these on-demand when the user visits those specific management pages.
- **Query Savings**: 4 unused queries eliminated from the critical path.

---

## 2. Composite PostgreSQL Indexes Added

Migration `00034_performance_indexes.sql` introduces specialized B-Tree composite indexes to eliminate sequential scans:

```sql
-- 1. Stage Schedules Indexing
CREATE INDEX IF NOT EXISTS idx_stage_schedules_fest_date 
  ON stage_schedules (festival_id, scheduled_date ASC);

CREATE INDEX IF NOT EXISTS idx_stage_schedules_fest_status 
  ON stage_schedules (festival_id, status);

-- 2. Team Points & Leaderboard Indexing
CREATE INDEX IF NOT EXISTS idx_team_points_fest_rank 
  ON team_points (festival_id, rank ASC NULLS LAST);

-- 3. Teams Indexing
CREATE INDEX IF NOT EXISTS idx_teams_fest_created 
  ON teams (festival_id, created_at ASC);

-- 4. Festival Stages Indexing
CREATE INDEX IF NOT EXISTS idx_festival_stages_fest_sort 
  ON festival_stages (festival_id, sort_order ASC);

-- 5. Result Items Indexing
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

-- 8. Festival Judges Fast Lookup by Username
CREATE INDEX IF NOT EXISTS idx_festival_judges_username_lower 
  ON festival_judges (LOWER(username));

CREATE INDEX IF NOT EXISTS idx_festival_judges_fest 
  ON festival_judges (festival_id);
```

---

## 3. Multi-Tenant Isolation & RLS Security

All optimized queries preserve tenant boundary isolation:
1. Every query strictly qualifies `eq("festival_id", festivalId)` or `eq("organization_id", orgId)`.
2. Admin client calls are only executed after validating caller membership in `organization_members`.
3. No cross-tenant data can leak into memory caches because cache keys are strictly scoped per `festivalId`.
