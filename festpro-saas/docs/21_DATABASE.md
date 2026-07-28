# FestPro Database Schema — Complete Official Documentation

**Module:** Database Schema  
**Version:** 1.0  
**Dependencies:** Supabase PostgreSQL  
**Applies To:** Developers, Database Administrators

---

# Section 1: Introduction

FestPro uses PostgreSQL 16 on Supabase as its database. The schema follows a multi-tenant design where every table carries an `organization_id` foreign key, and Row-Level Security (RLS) enforces data isolation between organizations.

---

# Section 5: Core Tables

## 5.1 `organizations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Organization name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly identifier |
| logo_url | TEXT | NULLABLE | Logo image |
| contact_email | VARCHAR(255) | NULLABLE | Public contact email |
| contact_phone | VARCHAR(50) | NULLABLE | Contact phone |
| address | TEXT | NULLABLE | Physical address |
| website | TEXT | NULLABLE | Organization website |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Kolkata' | Default timezone |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## 5.2 `profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | User identifier |
| email | VARCHAR(255) | NOT NULL | Email address |
| first_name | VARCHAR(100) | NOT NULL | Given name |
| last_name | VARCHAR(100) | NOT NULL | Family name |
| avatar_url | TEXT | NULLABLE | Profile picture |
| phone | VARCHAR(50) | NULLABLE | Phone number |
| role | user_role | NOT NULL, DEFAULT 'participant' | Platform role |
| organization_id | UUID | FK → organizations(id) ON DELETE SET NULL | Current org |
| is_active | BOOLEAN | DEFAULT true | Account status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

## 5.3 `organization_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations(id), NOT NULL | Organization |
| user_id | UUID | FK → auth.users(id), NOT NULL | User |
| role | user_role | NOT NULL | Member's role |
| invited_by | UUID | FK → auth.users(id) | Who invited |
| joined_at | TIMESTAMPTZ | DEFAULT NOW() | When joined |

## 5.4 `festivals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations(id), NOT NULL | Parent org |
| name | VARCHAR(200) | NOT NULL | Festival name |
| description | TEXT | NOT NULL | Description |
| start_date | DATE | NOT NULL | Start date |
| end_date | DATE | NOT NULL | End date |
| status | festival_status | NOT NULL, DEFAULT 'draft' | Current status |
| registration_fee | DECIMAL(10,2) | DEFAULT 0 | Fee amount |
| max_participants | INTEGER | NULLABLE | Capacity |
| venue | TEXT | NOT NULL | Main venue |

## 5.5 `competitions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| festival_id | UUID | FK → festivals(id), NOT NULL | Parent festival |
| name | VARCHAR(200) | NOT NULL | Competition name |
| category_id | UUID | FK → competition_categories(id) | Category |
| age_group_id | UUID | FK → age_groups(id) | Age group |
| max_participants | INTEGER | NULLABLE | Entry limit |
| duration_minutes | INTEGER | DEFAULT 10 | Duration |
| judging_method | VARCHAR(50) | NOT NULL | Scoring method |

## 5.6 `registrations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| festival_id | UUID | FK → festivals(id), NOT NULL | Festival |
| participant_id | UUID | FK → participants(id), NOT NULL | Participant |
| competition_id | UUID | FK → competitions(id), NOT NULL | Competition |
| status | registration_status | NOT NULL, DEFAULT 'pending' | Status |
| fee | DECIMAL(10,2) | DEFAULT 0 | Fee amount |
| payment_status | payment_status | NOT NULL, DEFAULT 'unpaid' | Payment status |

## 5.7 `participants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| date_of_birth | DATE | NOT NULL | DOB |
| gender | VARCHAR(20) | NOT NULL | Gender |
| email | VARCHAR(255) | NOT NULL | Email |
| phone | VARCHAR(50) | NOT NULL | Phone |
| institution | VARCHAR(200) | NULLABLE | School/college |
| created_by | UUID | FK → auth.users(id) | Who registered |

## 5.8 `results`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| competition_id | UUID | FK → competitions(id), NOT NULL | Competition |
| participant_id | UUID | FK → participants(id), NOT NULL | Participant |
| total_score | DECIMAL(10,2) | NULLABLE | Final score |
| rank | INTEGER | NULLABLE | Final rank |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'pending' | Published status |
| published_at | TIMESTAMPTZ | NULLABLE | When published |

## 5.9 `finance_transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| organization_id | UUID | FK → organizations(id), NOT NULL | Org |
| registration_id | UUID | FK → registrations(id) | Related registration |
| type | VARCHAR(50) | NOT NULL | Fee, Refund, Expense |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| method | VARCHAR(50) | NULLABLE | UPI, Card, Cash |
| status | VARCHAR(50) | NOT NULL | Completed, Pending, Failed |

---

# Section 6: Enums

| Enum Name | Values |
|-----------|--------|
| user_role | owner, admin, manager, staff, festival_director, media, reception, finance, judge, participant |
| festival_status | draft, published, registration_open, registration_closed, active, completed, archived, cancelled |
| competition_status | draft, published, open, closed, judging, results_pending, results_published, completed |
| registration_status | pending, confirmed, checked_in, attended, withdrawn, cancelled |
| payment_status | unpaid, paid, refunded, partial |

---

# Section 7: Indexes

| Table | Index | Column(s) | Purpose |
|-------|-------|-----------|---------|
| profiles | idx_profiles_email | email | Fast login lookup |
| profiles | idx_profiles_role | role | Role-based filtering |
| profiles | idx_profiles_organization | organization_id | Org-based queries |
| festivals | idx_festivals_org | organization_id | Org festival listing |
| festivals | idx_festivals_status | status | Status-based filtering |
| competitions | idx_competitions_festival | festival_id | Festival comps |
| registrations | idx_registrations_participant | participant_id | Lookup by participant |
| registrations | idx_registrations_competition | competition_id | Lookup by competition |

---

# Section 8: RLS Policies

Every table has RLS enabled. Key policy patterns:

```sql
-- Organization-level access pattern
CREATE POLICY "org_access" ON festivals FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Self-access pattern
CREATE POLICY "self_access" ON profiles FOR SELECT
  USING (auth.uid() = id);
```

---

*End of Database Schema Module Documentation*
