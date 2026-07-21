# CONTRIBUTING.md

How to contribute to FestPro.

## Prerequisites

- Node.js 18+
- A Supabase project (or local Supabase CLI)
- npm

## Setup

```bash
git clone https://github.com/ahraz-site/festpro.git
cd festpro-saas
npm install
cp .env.example .env.local
npm run dev
```

## Workflow

1. Create a branch: `git checkout -b feature/<module>`.
2. Read `AI_CONTEXT.md`, `AGENTS.md`, `PROJECT_STRUCTURE.md`.
3. Make changes; add a migration if schema changes.
4. Run `npm run lint` and `npm run typecheck`.
5. Update `FEATURES.md` / `CHANGELOG.md` for new modules.
6. Open a PR with a clear description.

## Schema Changes

- New tables: include `organization_id`, `created_at`, `updated_at`, RLS.
- Enum additions: separate migration file (own transaction).
- Idempotent: `IF NOT EXISTS` / `DO $$ ... EXCEPTION`.
- Do NOT run both `00008_result_schema.sql` and `00008_result_engine_full.sql`.

## Code Style

- TypeScript strict; no `any`.
- Server Actions for DB writes.
- Tailwind + shadcn/ui; reuse `src/components/ui`.
- No comments unless requested.

## Do Not

- Commit `.env.local`, secrets, `node_modules`, `.next`.
- Bypass RLS or assume global data visibility.
- Force-push to main without explicit approval.
