# AI_CONTEXT.md

This file orients AI coding tools (Copilot, Cursor, Claude, opencode, etc.) to the FestPro codebase so they extend it correctly instead of rebuilding it.

## What This Project Is

FestPro is a Next.js 14 (App Router) + TypeScript + Supabase enterprise SaaS for running festivals/competitions. It is **multi-tenant**: every row is scoped to an `organization_id`. All access is gated by Postgres Row-Level Security (RLS) keyed on the authenticated user's org membership.

## Golden Rules (must follow)

1. **Never bypass RLS.** Every table has `organization_id` and RLS policies. Do not write queries that assume global visibility.
2. **Multi-tenant by default.** New tables MUST include `organization_id UUID NOT NULL REFERENCES organizations(id)` and an RLS policy.
3. **Use Server Actions** in `src/lib/actions/*` for mutations, not raw client-side inserts.
4. **Supabase client types** live in `src/lib/supabase/`. Use the typed client; do not hand-roll SQL strings in components.
5. **Enum changes are dangerous.** PostgreSQL rejects `ALTER TYPE ... ADD VALUE` + using the new value in the same transaction. Split enum extensions into a separate migration file.
6. **Do not recreate existing types/tables.** Wrap `CREATE TYPE`/`CREATE TABLE` in `DO $$ ... EXCEPTION WHEN duplicate_object` or use `IF NOT EXISTS`.
7. **Storage policies** on `storage.objects` persist across `DROP SCHEMA public CASCADE` — they must be dropped explicitly with `DROP POLICY IF EXISTS`.

## Architecture at a Glance

- **Auth:** Supabase Auth → `auth.users`. App profile data in `profiles` (references `auth.users(id)`, NOT `profiles(id)`).
- **Orgs:** `organizations` + `organization_members` (role-based). Roles: `owner`, `admin`, `manager`, `staff`, `festival_director`, `media`, `reception`, `finance`, `judge`, `participant`.
- **RBAC:** `role_permissions` seed table + dynamic RLS helper functions `apply_festival_rls()`, `apply_competition_rls()` that detect the relevant FK column dynamically.
- **30 feature modules**, each its own migration `000NN_*`. See `FEATURES.md`.
- **Results engine:** `00008_result_engine_full.sql` (the canonical one — `00008_result_schema.sql` is an alternative, do NOT run both).

## Conventions

- File naming: migrations `NNNNN_snake_case.sql`; actions `src/lib/actions/<domain>.ts`.
- UI: Tailwind + shadcn/ui components under `src/components/ui`.
- Server/client boundary: `'use server'` actions, `'use client'` only for interactive widgets.
- Timestamps: every table has `created_at`, `updated_at` with `update_updated_at_column()` trigger.

## Common Pitfalls (learned the hard way)

- `competition_registrations` table was renamed to `registrations` — use `registrations`.
- `participants.user_id` does not exist; use `participants.created_by`.
- `ssl_cert ARRAY` must be `ssl_cert TEXT[]`.
- `profiles(id)` references must point to `auth.users(id)`.

## How to Add a New Module

1. Create `supabase/migrations/000NN_module.sql` with `organization_id` + RLS.
2. Add Server Actions in `src/lib/actions/`.
3. Add UI under `src/app/dashboard/<module>` or `src/components/<domain>`.
4. Document in `FEATURES.md` and update `CHANGELOG.md`.
