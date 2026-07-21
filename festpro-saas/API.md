# API.md

FestPro exposes data through **Server Actions** (primary) and **Route Handlers** (webhooks/exports).

## Server Actions

Located in `src/lib/actions/<domain>.ts`. All mutations go through these. They run server-side with the Supabase server client and respect RLS.

Example domains:
- `festivals.ts` — create/update/list festivals
- `competitions.ts` — manage competitions & categories
- `registrations.ts` — register participants (`registrations` table)
- `results.ts` — compute & publish results
- `finance.ts` — invoices, payments
- `organization.ts` — members, roles

Usage in a client component:
```ts
import { createFestival } from '@/lib/actions/festivals';
const id = await createFestival(formData);
```

## Route Handlers

Under `src/app/api/`:
- `POST /api/webhooks/<provider>` — payment/webhook ingestion
- `GET /api/export/<entity>` — CSV/PDF exports
- `POST /api/upload` — signed storage uploads

## Supabase Client Helpers

- `src/lib/supabase/client.ts` — browser client (anon key)
- `src/lib/supabase/server.ts` — server client (cookie-based session)
- `src/lib/supabase/admin.ts` — service-role client (privileged, server-only)

## Data Access Pattern

1. Server Action authenticates `auth.uid()`.
2. Reads/writes via typed Supabase client.
3. RLS enforces `organization_id` scoping automatically.
4. Returns typed result or throws a safe error.

## Types

Shared TS types in `src/types/`. Regenerate from DB with `supabase gen types typescript`.
