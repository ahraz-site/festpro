# AGENTS.md

Operating rules for AI agents and developers working on FestPro.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `supabase db push` — apply migrations (or psql in order)

## Before Editing

1. Read `AI_CONTEXT.md` and `PROJECT_STRUCTURE.md`.
2. Run `npm run lint` and `npm run typecheck` after changes.
3. Never commit secrets. `.env.local` is gitignored.

## Database Rules

- Every table: `organization_id`, `created_at`, `updated_at`.
- RLS enabled on every table; policies keyed on org membership.
- Enum extensions go in their OWN migration file (separate transaction).
- Use `CREATE ... IF NOT EXISTS` / `DO $$ ... EXCEPTION WHEN duplicate_object` for idempotent migrations.
- Storage policies on `storage.objects` need explicit `DROP POLICY IF EXISTS` before recreate.
- Do NOT run both `00008_result_schema.sql` and `00008_result_engine_full.sql`.

## Migration Order (apply in this sequence)

```
00001_auth_schema.sql
00002_organizations_rbac.sql
00001a_enum_values.sql
00001b_seed_roles.sql
00003_festival_schema.sql
00003b_pre_fix.sql
00004_competition_schema.sql
00005 ... 00030 (skip 00008_result_schema.sql, 00004b_fix_rls.sql, 00007b_fix_rls.sql)
```

## Code Style

- TypeScript strict. No `any` in new code.
- Server Actions for all DB writes.
- Tailwind classes; reuse `src/components/ui`.
- No comments unless requested.

## Commit Hygiene

- Stage only intended files. Never commit `.env.local`, `node_modules`, `.next`.
- Write concise commit messages describing the change.
- Do not force-push without explicit request.

## Definition of Done

- Lint + typecheck pass.
- New DB objects have RLS + `organization_id`.
- Docs updated (`FEATURES.md`, `CHANGELOG.md`) for new modules.
