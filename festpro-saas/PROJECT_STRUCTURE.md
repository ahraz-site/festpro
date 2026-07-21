# PROJECT_STRUCTURE.md

Directory map for FestPro.

```
festpro-saas/
├── README.md
├── AI_CONTEXT.md
├── AGENTS.md
├── PROJECT_STRUCTURE.md
├── DATABASE.md
├── FEATURES.md
├── DESIGN_SYSTEM.md
├── API.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .env.example
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   └── SRS_MASTER.md            # full software requirements spec
├── public/                      # static assets
├── src/
│   ├── app/
│   │   ├── (auth)/              # login, signup, password reset
│   │   ├── (public)/            # public-facing festival portal
│   │   ├── api/                 # route handlers (webhooks, exports)
│   │   ├── dashboard/           # org admin console (per-module pages)
│   │   ├── mobile/              # mobile / PWA views
│   │   └── profile/             # user profile
│   ├── components/
│   │   ├── auth/                # auth forms
│   │   ├── layout/              # app shell, sidebar, nav
│   │   ├── mobile/              # mobile-specific components
│   │   ├── organization/        # org/team management UI
│   │   ├── shared/              # cross-cutting components
│   │   └── ui/                  # shadcn/ui primitives
│   ├── config/                  # app config (feature flags, constants)
│   ├── lib/
│   │   ├── actions/             # Server Actions (DB mutations)
│   │   ├── ai/                  # AI / LLM integrations
│   │   ├── edms/                # document management helpers
│   │   ├── localization/        # i18n (ml/en)
│   │   └── supabase/            # typed client (browser/server/admin)
│   └── types/                   # shared TS types
└── supabase/
    └── migrations/              # 00001–00030 SQL schema files
```

## Key Entry Points

- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (server), `admin.ts` (service role).
- `src/lib/actions/` — domain Server Actions, e.g. `festivals.ts`, `competitions.ts`, `registrations.ts`.
- `src/app/dashboard/` — main authenticated surface.
- `supabase/migrations/` — source of truth for schema.
