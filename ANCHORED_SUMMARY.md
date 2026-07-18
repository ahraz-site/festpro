# festpro-saas — Anchored Summary

## Session Context

We are building `festpro-saas`, an all-in-one festival management SaaS, as a single Next.js 14 + Supabase (PostgreSQL) monolith inside the `festpro-saas/` subdirectory. Each module follows a strict 5-layer pattern: `supabase/migrations/*.sql`, `src/types/*.ts`, `src/config/*.ts`, `src/lib/actions/*/index.ts`, and `src/app/.../*/page.tsx` (client components with `"use client"`, `useParams`, `useCallback/useEffect`). Shared Supabase helpers: `@/lib/supabase/server` (auth) and `@/lib/supabase/admin` (service-role queries). Sidebar entries live in `src/app/dashboard/layout.tsx`.

## What We Have Built (All 29 Modules)

| Module | Status | Description |
|---|---|---|
| 1. Festivals | Complete | Core festival CRUD, calendar, lifecycle, settings |
| 2. Venues | Complete | Venue management, layout, capacity, availability |
| 3. Stages | Complete | Stage management, tech specs, schedule |
| 4. Committees | Complete | Committee structure, roles, members |
| 5. Sponsors | Complete | Sponsor management, tiers, benefits, payments |
| 6. Registration | Complete | Participant registration, tickets, payments |
| 7. Participants | Complete | Participant profiles, categories, eligibility |
| 8. Competition | Complete | Competition management, categories, entries |
| 9. Finance | Complete | Accounting, transactions, budgets, payroll |
| 10. Sessions | Complete | Session scheduling, tracks, rooms, speakers |
| 11. Schedules | Complete | Schedule builder, conflicts, publishing |
| 12. Live Ops | Complete | Live now, countdown, announcements, streaming |
| 13. Judging | Complete | Judges, rubrics, scores, rankings, certification |
| 14. Results | Complete | Results publication, certificates, records |
| 15. Communication | Complete | Email, SMS, push, templates, campaigns |
| 16. Administration | Complete | Admin settings, roles, audit logs |
| 17. Volunteer & Staff | Complete | Volunteer registration, shifts, tasks, clock-in |
| 18. ID Cards & Passes | Complete | ID cards, badges, passes, QR codes, printing |
| 19. Sponsor/Fund CRM | Complete | CRM pipeline, funds, grants, donor management |
| 20. Help Desk | Complete | Tickets, knowledge base, live chat, satisfaction |
| 21. Inventory & Assets | Complete | Inventory items, assets, purchases, audits, maintenance |
| 22. Food & Catering | Complete | Menus, suppliers, kitchens, distribution, coupons |
| 23. SaaS & Subscription | Complete | Plans, billing, usage metering, tenant provisioning |
| 24. Observability | Complete | Logs, metrics, traces, dashboards, alerts, uptime, APM |
| 25. AI Platform | Complete | AI agents, workflows, models, RAG, vector store, tokens |
| 26. Analytics/BI | Complete | Dashboards, reports, data sources, exports, forecasting |
| 27. Localization | Complete | Locales, translations, i18n, regional settings |
| 28. EDMS | Complete | Documents, folders, categories, approvals, knowledge, retention |
| 29. DevOps Platform | Complete | Pipelines, deployments, releases, clusters, containers, security scans |

## Key Architecture Decisions

- **Single monorepo**: `festpro-saas/` contains everything (Next.js app, Supabase migrations, config).
- **Supabase RLS**: Every table has row-level security; admin actions use `createAdminClient()` (service role).
- **No TS enums**: String literal unions + `as const` config arrays with `{ value, label, color? }`.
- **No server components**: All pages are `"use client"`; data fetching via `useCallback/useEffect`.
- **Server actions**: All mutations in `src/lib/actions/*/index.ts` with `"use server"`, returning `{ data } | { error }`.
- **Sidebar**: Platform-level items under `/dashboard/platform/*`; org-level under `/dashboard/organization/[orgId]/*`; festival-level under `/dashboard/organization/[orgId]/festivals/[festivalId]/*`.
- **API-first**: Every module exposes CRUD + dashboard server actions, making integration straightforward.
