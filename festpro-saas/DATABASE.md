# DATABASE.md

FestPro uses PostgreSQL on Supabase with strict multi-tenant Row-Level Security.

## Connection

- URL: `https://dshjkprpijoatritpyzh.supabase.co`
- DB host: `db.dshjkprpijoatritpyzh.supabase.co:5432`
- Pooler (transactions): `aws-0-ap-south-1.pooler.supabase.com:6543`

## Core Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Tenant root. Every row in the system belongs to one. |
| `organization_members` | User ↔ org membership + role. |
| `profiles` | App profile, references `auth.users(id)`. |
| `role_permissions` | Seed RBAC matrix (role → permission). |
| `festivals` | Festival events owned by an org. |
| `competitions` | Competitions within a festival. |
| `registrations` | Participant registrations (was `competition_registrations`). |
| `participants` | People; `created_by` (not `user_id`). |
| `results` / `result_items` | Judging results engine. |
| `certificates` | Generated certificates. |
| `finance_*` | Invoices, payments, reports. |
| `volunteers`, `accommodation`, `medical_records` | Ops modules. |

## Enums

- `user_role`: `owner`, `admin`, `manager`, `staff`, `festival_director`, `media`, `reception`, `finance`, `judge`, `participant`.
- `activity_action`: audit log action types (extended in `00003b_pre_fix.sql`).
- Plus per-module enums (status, gender, payment method, etc.).

## RLS Model

- Every table has `organization_id` and `ENABLE ROW LEVEL SECURITY`.
- Helper functions:
  - `apply_festival_rls()` — dynamic; detects `festival_id` / `competition_id` FK and joins to member's festivals.
  - `apply_competition_rls()` — dynamic; detects `festival_id` / `category_id` / `competition_id`.
  - `update_updated_at_column()` — `BEFORE UPDATE` trigger helper.
- Org membership checked via `organization_members` for the current `auth.uid()`.

## Storage

- Buckets: `festival-files`, `participant-files`, etc.
- Policies on `storage.objects` must be dropped explicitly (`DROP POLICY IF EXISTS`) — they survive `DROP SCHEMA public CASCADE`.

## Migration Notes

- `00008_result_engine_full.sql` is canonical; `00008_result_schema.sql` is an alternative (do not run both).
- Enum `ADD VALUE` must be in its own file/transaction.
- `ssl_cert` is `TEXT[]` (not `ARRAY`).
- `registrations` replaces `competition_registrations`.
- `participants.created_by` replaces `participants.user_id`.
- `profiles(id)` references must be `auth.users(id)`.

## Applying Migrations

```bash
# via psql (fresh DB)
$conn = "postgresql://postgres:PASSWORD@db.dshjkprpijoatritpyzh.supabase.co:5432/postgres"
Get-ChildItem supabase/migrations/*.sql | Sort-Object Name | ForEach-Object { psql $conn -v ON_ERROR_STOP=1 -f $_.FullName }
```
