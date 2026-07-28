# FestPro Database Schema — Complete Official Documentation

**Module:** 21 — Database Schema  
**Version:** 2.0  
**Dependencies:** Supabase PostgreSQL 16  
**Applies To:** Developers, Database Administrators

---

# Section 1: Introduction

FestPro uses PostgreSQL 16 on Supabase as its database. The schema follows a strict multi-tenant design where every data-bearing table carries an `organization_id` foreign key, and Row-Level Security (RLS) enforces complete data isolation between organisations. This document covers all core tables, enums, indexes, relationships, RLS policies, and migration management.

## Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| Multi-Tenancy | `organization_id` on every table + RLS |
| Soft Deletes | `deleted_at` timestamp on major entities |
| Audit Trail | `created_at`, `updated_at` on every table |
| Monetary Values | Stored in cents (integer) to avoid floating-point issues |
| Timezone | All timestamps in UTC; display converted to user timezone |
| UUIDs | Primary keys use UUID v4 for distributed-friendly IDs |

---

# Section 2: Core Tables

## 2.1 `organizations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Organization name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| logo_url | TEXT | NULLABLE | Logo image URL |
| favicon_url | TEXT | NULLABLE | Browser tab icon |
| primary_color | VARCHAR(7) | DEFAULT '#6366f1' | Brand primary color |
| contact_email | VARCHAR(255) | NULLABLE | Public contact email |
| contact_phone | VARCHAR(50) | NULLABLE | Contact phone |
| address | TEXT | NULLABLE | Physical address |
| website | TEXT | NULLABLE | Organization website |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Kolkata' | Default timezone |
| locale | VARCHAR(10) | DEFAULT 'en' | Default language |
| is_active | BOOLEAN | DEFAULT true | Active status |
| subscription_tier | VARCHAR(50) | DEFAULT 'free' | Plan level |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.2 `profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | User identifier (matches auth.users) |
| email | VARCHAR(255) | NOT NULL | Email address |
| first_name | VARCHAR(100) | NOT NULL | Given name |
| last_name | VARCHAR(100) | NOT NULL | Family name |
| avatar_url | TEXT | NULLABLE | Profile picture |
| phone | VARCHAR(50) | NULLABLE | Phone number |
| role | user_role | NOT NULL, DEFAULT 'participant' | Platform role |
| organization_id | UUID | FK → organizations(id) ON DELETE SET NULL | Current organization |
| is_active | BOOLEAN | DEFAULT true | Account status |
| mfa_enabled | BOOLEAN | DEFAULT false | Multi-factor authentication |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.3 `organization_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| organization_id | UUID | FK → organizations(id), NOT NULL | Organization |
| user_id | UUID | FK → auth.users(id), NOT NULL | User |
| role | user_role | NOT NULL | Member's role |
| invited_by | UUID | FK → auth.users(id) | Who invited |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | When member joined |
| is_active | BOOLEAN | DEFAULT true | Membership active? |

## 2.4 `festivals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations(id), NOT NULL | Parent organization |
| name | VARCHAR(200) | NOT NULL | Festival name |
| slug | VARCHAR(200) | NULLABLE | URL-friendly name |
| description | TEXT | NOT NULL | Festival description |
| start_date | DATE | NOT NULL | Festival start date |
| end_date | DATE | NOT NULL | Festival end date |
| registration_start | DATE | NULLABLE | Registration open date |
| registration_end | DATE | NULLABLE | Registration close date |
| status | festival_status | NOT NULL, DEFAULT 'draft' | Current status |
| registration_fee | DECIMAL(10,2) | DEFAULT 0 | Base registration fee |
| max_participants | INTEGER | NULLABLE | Maximum participants |
| venue | TEXT | NOT NULL | Main venue / location |
| banner_url | TEXT | NULLABLE | Hero banner image |
| poster_url | TEXT | NULLABLE | Festival poster |
| created_by | UUID | FK → auth.users(id) | Creator |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.5 `competitions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| festival_id | UUID | FK → festivals(id), NOT NULL | Parent festival |
| organization_id | UUID | FK → organizations(id), NOT NULL | (denormalized for RLS) |
| name | VARCHAR(200) | NOT NULL | Competition name |
| category_id | UUID | FK → competition_categories(id) | Category |
| age_group_id | UUID | FK → age_groups(id) | Age group |
| description | TEXT | NULLABLE | Rules and description |
| max_participants | INTEGER | NULLABLE | Entry limit per competition |
| duration_minutes | INTEGER | DEFAULT 10 | Duration per participant |
| judging_method | VARCHAR(50) | NOT NULL | points, rank, pass_fail, hybrid |
| status | competition_status | DEFAULT 'draft' | Competition status |
| fee | DECIMAL(10,2) | DEFAULT 0 | Registration fee for this competition |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.6 `participants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations(id) | (denormalized for RLS) |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| date_of_birth | DATE | NOT NULL | Date of birth |
| gender | VARCHAR(20) | NOT NULL | Gender |
| email | VARCHAR(255) | NOT NULL | Email |
| phone | VARCHAR(50) | NOT NULL | Phone |
| address | TEXT | NULLABLE | Address |
| institution | VARCHAR(200) | NULLABLE | School/college/institution |
| institution_id | VARCHAR(100) | NULLABLE | Student/employee ID |
| guardian_name | VARCHAR(200) | NULLABLE | Parent/guardian |
| guardian_phone | VARCHAR(50) | NULLABLE | Guardian contact |
| medical_conditions | TEXT | NULLABLE | Pre-existing conditions |
| allergies | TEXT | NULLABLE | Known allergies |
| blood_group | VARCHAR(5) | NULLABLE | Blood group |
| emergency_contact | VARCHAR(200) | NULLABLE | Emergency contact name |
| emergency_phone | VARCHAR(50) | NULLABLE | Emergency contact phone |
| created_by | UUID | FK → auth.users(id) | Who registered |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.7 `registrations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| festival_id | UUID | FK → festivals(id), NOT NULL | Festival |
| participant_id | UUID | FK → participants(id), NOT NULL | Participant |
| competition_id | UUID | FK → competitions(id), NOT NULL | Competition |
| organization_id | UUID | FK → organizations(id) | (denormalized for RLS) |
| status | registration_status | NOT NULL, DEFAULT 'pending' | Registration status |
| fee | DECIMAL(10,2) | DEFAULT 0 | Fee charged |
| payment_status | payment_status | NOT NULL, DEFAULT 'unpaid' | Payment status |
| chest_number | VARCHAR(50) | NULLABLE | Assigned chest number |
| checked_in_at | TIMESTAMPTZ | NULLABLE | When checked in |
| checked_in_by | UUID | FK → auth.users(id) | Who checked in |
| notes | TEXT | NULLABLE | Internal notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.8 `scores`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| registration_id | UUID | FK → registrations(id), NOT NULL | Registration |
| judge_id | UUID | FK → auth.users(id), NOT NULL | Judge |
| competition_id | UUID | FK → competitions(id) | (denormalized) |
| total_score | DECIMAL(10,2) | NULLABLE | Sum of criteria scores |
| comments | TEXT | NULLABLE | Judge comments |
| status | VARCHAR(50) | DEFAULT 'draft' | draft, submitted, locked, approved |
| submitted_at | TIMESTAMPTZ | NULLABLE | When submitted |
| locked_at | TIMESTAMPTZ | NULLABLE | When locked |
| approved_at | TIMESTAMPTZ | NULLABLE | When chief-approved |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

## 2.9 `finance_transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations(id), NOT NULL | Organization |
| festival_id | UUID | FK → festivals(id) | Festival |
| registration_id | UUID | FK → registrations(id) | Related registration |
| type | VARCHAR(50) | NOT NULL | fee, refund, expense |
| amount | INTEGER | NOT NULL | Amount in cents |
| method | VARCHAR(50) | NULLABLE | UPI, Card, Cash, Cheque, Bank Transfer |
| status | VARCHAR(50) | NOT NULL | pending, completed, failed, refunded |
| gateway | VARCHAR(50) | NULLABLE | razorpay, stripe, null (offline) |
| gateway_transaction_id | VARCHAR(255) | NULLABLE | Gateway reference |
| invoice_id | VARCHAR(100) | NULLABLE | Invoice number |
| notes | TEXT | NULLABLE | Additional information |
| created_by | UUID | FK → auth.users(id) | Who recorded |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

# Section 3: Enums

| Enum Name | Values |
|-----------|--------|
| user_role | `platform_owner`, `platform_admin`, `organization_owner`, `organization_admin`, `festival_director`, `manager`, `staff`, `judge`, `finance`, `media`, `reception`, `volunteer`, `participant` |
| festival_status | `draft`, `published`, `registration_open`, `registration_closed`, `active`, `completed`, `archived`, `cancelled` |
| competition_status | `draft`, `published`, `registration_open`, `registration_closed`, `judging`, `results_pending`, `results_published`, `completed` |
| registration_status | `pending`, `confirmed`, `checked_in`, `attended`, `withdrawn`, `cancelled` |
| payment_status | `unpaid`, `paid`, `refunded`, `partial`, `failed` |
| scoring_method | `points`, `rank`, `pass_fail`, `hybrid` |

---

# Section 4: Indexes

| Table | Index Name | Column(s) | Type | Purpose |
|-------|-----------|-----------|------|---------|
| profiles | idx_profiles_email | email | UNIQUE | Fast login lookup |
| profiles | idx_profiles_role | role | BTREE | Role-based filtering |
| profiles | idx_profiles_organization | organization_id | BTREE | Organization-based queries |
| organizations | idx_orgs_slug | slug | UNIQUE | URL lookup |
| festivals | idx_festivals_org | organization_id | BTREE | Organization festival listing |
| festivals | idx_festivals_status | status | BTREE | Status-based filtering |
| festivals | idx_festivals_dates | start_date, end_date | BTREE | Date range queries |
| competitions | idx_competitions_festival | festival_id | BTREE | Festival competitions |
| competitions | idx_competitions_category | category_id | BTREE | Category filtering |
| participants | idx_participants_email | email | BTREE | Email lookup |
| participants | idx_participants_institution | institution | BTREE | Institution grouping |
| registrations | idx_registrations_participant | participant_id | BTREE | Lookup by participant |
| registrations | idx_registrations_competition | competition_id | BTREE | Lookup by competition |
| registrations | idx_registrations_status | status | BTREE | Status filtering |
| scores | idx_scores_registration | registration_id | BTREE | Score lookup |
| scores | idx_scores_judge | judge_id | BTREE | Judge's scores |

---

# Section 5: Entity Relationships

```
organizations 1──N organization_members N──1 auth.users (via profiles)
organizations 1──N festivals
festivals     1──N competitions
festivals     1──N festival_days
festivals     1──N festival_venues
competitions  1──N competition_categories (lookup)
competitions  1──N age_groups (lookup)
competitions  1──N registrations
participants  1──N registrations
registrations 1──N scores
scores        1──N score_items (criteria-level scores)
competitions  1──N competition_judge_assignments N──1 auth.users
festivals     1──N finance_transactions
```

---

# Section 6: RLS Policies

Every table has RLS enabled. Key policy patterns:

```sql
-- Organization-level access pattern (applied to festivals, competitions, etc.)
CREATE POLICY "org_member_access" ON festivals FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));

-- Self-access pattern (profiles)
CREATE POLICY "self_access" ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "self_update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin access pattern (platform roles)
CREATE POLICY "admin_full_access" ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('platform_owner', 'platform_admin')
    )
  );

-- Insert policy for registrations (any authenticated user)
CREATE POLICY "authenticated_insert" ON registrations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Judge-specific access (read scores for assigned competitions)
CREATE POLICY "judge_read_scores" ON scores FOR SELECT
  USING (
    judge_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('festival_director', 'organization_admin', 'organization_owner')
    )
  );
```

---

# Section 7: Best Practices

1. **Always use `select()` with specific columns** — avoid `select("*")` in production queries
2. **Use `React.cache()`** for data fetching in server components
3. **Paginate list queries** — default 20 items per page, max 100
4. **Use transactions for multi-table mutations** — `supabase.rpc()` for complex operations
5. **Never expose service role key** — server-side only
6. **Add indexes for query patterns** — monitor slow queries in Supabase dashboard
7. **Use `ON DELETE CASCADE` sparingly** — prefer soft deletes
8. **Run `ANALYZE` after bulk imports** — keeps query planner accurate
9. **Use generated columns** for computed values (e.g., full name)
10. **Test RLS policies** — `supabase-sql` testing or manual validation

---

*End of Database Schema Module Documentation (Module 21)*
