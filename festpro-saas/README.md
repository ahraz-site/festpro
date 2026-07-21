# FestPro — Enterprise Festival Management SaaS Platform

FestPro is a multi-tenant, enterprise-grade SaaS platform for managing arts, cultural, and competitive festivals end-to-end: registration, competitions, judging, scheduling, results, certificates, finance, volunteers, accommodation, medical, AI, and more.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Backend:** Supabase (Postgres + RLS + Edge Functions)
- **State/Data:** Server Actions + Supabase client
- **Deployment:** Vercel (frontend), Supabase (backend)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev
```

Open http://localhost:3000

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Database Migrations

All schema migrations live in `supabase/migrations/` numbered `00001`–`00030` (one per module) plus helper files `00001a_enum_values.sql`, `00001b_seed_roles.sql`, `00003b_pre_fix.sql`.

Apply via Supabase CLI:
```bash
supabase db push
```
Or via psql in order (skip `00008_result_schema.sql`, `00004b_fix_rls.sql`, `00007b_fix_rls.sql` — those are superseded).

## Project Layout

- `src/app/(auth)` — login / signup
- `src/app/(public)` — public portal
- `src/app/dashboard` — organization admin console
- `src/app/mobile` — mobile/PWA views
- `src/app/api` — route handlers
- `src/lib/actions` — Server Actions
- `src/lib/supabase` — client/server DB helpers
- `src/components` — shared UI
- `supabase/migrations` — SQL schema

## Documentation

- `AI_CONTEXT.md` — orientation for AI coding tools
- `AGENTS.md` — agent/developer operating rules
- `PROJECT_STRUCTURE.md` — directory map
- `DATABASE.md` — schema & RLS overview
- `FEATURES.md` — the 30 modules
- `DESIGN_SYSTEM.md` — UI conventions
- `API.md` — Server Actions & routes
- `CHANGELOG.md` — history

## License

Proprietary — all rights reserved.
