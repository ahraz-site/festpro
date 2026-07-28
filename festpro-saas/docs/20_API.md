# FestPro API Reference — Complete Official Documentation

**Module:** API Reference  
**Version:** 1.0  
**Dependencies:** All modules  
**Applies To:** Developers, Integrators

---

# Section 1: Introduction

FestPro exposes its functionality through two API layers: Next.js Server Actions (for client-to-server interactions within the app) and Route Handlers (for webhooks and external integrations). The underlying Supabase API is also directly accessible for authenticated clients.

---

# Section 5: Server Actions

Server Actions are callable from client components. They run server-side with full access to Supabase service role privileges.

## 5.1 Authentication Actions

| Action | Import | Input | Output |
|--------|--------|-------|--------|
| `signUp` | `@/lib/actions/auth` | `{ first_name, last_name, email, password }` | `{ success, error }` |
| `signIn` | `@/lib/actions/auth` | `{ email, password }` | `{ success, error }` |
| `signOut` | `@/lib/actions/auth` | None | `{ success }` |
| `resetPassword` | `@/lib/actions/auth` | `{ email }` | `{ success, error }` |
| `updatePassword` | `@/lib/actions/auth` | `{ password }` | `{ success, error }` |

## 5.2 Festival Actions

| Action | Import | Input | Output |
|--------|--------|-------|--------|
| `createFestival` | `@/lib/actions/festivals` | `{ name, description, startDate, endDate, ... }` | `{ id, error }` |
| `updateFestival` | `@/lib/actions/festivals` | `{ id, ...fields }` | `{ success, error }` |
| `deleteFestival` | `@/lib/actions/festivals` | `{ id }` | `{ success, error }` |
| `publishFestival` | `@/lib/actions/festivals` | `{ id }` | `{ success, error }` |

## 5.3 Competition Actions

| Action | Import | Input | Output |
|--------|--------|-------|--------|
| `createCompetition` | `@/lib/actions/competitions` | `{ festivalId, name, categoryId, ... }` | `{ id, error }` |
| `updateCompetition` | `@/lib/actions/competitions` | `{ id, ...fields }` | `{ success, error }` |
| `deleteCompetition` | `@/lib/actions/competitions` | `{ id }` | `{ success, error }` |

## 5.4 Registration Actions

| Action | Import | Input | Output |
|--------|--------|-------|--------|
| `registerParticipant` | `@/lib/actions/registrations` | `{ festivalId, competitionIds, ... }` | `{ id, error }` |
| `checkInParticipant` | `@/lib/actions/registrations` | `{ id }` | `{ success, error }` |

---

# Section 6: Route Handlers

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/stripe` | POST | Stripe payment events |
| `/api/webhooks/razorpay` | POST | Razorpay payment events |
| `/api/export/participants` | GET | Download participant CSV |
| `/api/export/results` | GET | Download results CSV |
| `/api/upload` | POST | Signed URL file upload |

---

# Section 7: Supabase Direct API

FestPro uses Supabase under the hood. For custom integrations, the Supabase REST API is available:

## 7.1 Client Initialization

```typescript
// Browser client (anon key, RLS enforced)
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

// Server client (cookie-based session)
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()

// Admin client (service role, bypasses RLS — server only)
import { createAdminClient } from "@/lib/supabase/admin"
const admin = createAdminClient()
```

## 7.2 Common Queries

```typescript
// Fetch festivals for current organization
const { data: festivals } = await supabase
  .from("festivals")
  .select("*")
  .eq("organization_id", orgId)

// Fetch registrations with participant details
const { data: registrations } = await supabase
  .from("registrations")
  .select("*, participants(*)")
  .eq("festival_id", festivalId)

// Insert a competition (admin client for RLS bypass)
const { data } = await admin
  .from("competitions")
  .insert({ festival_id, name, ... })
  .select()
```

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| API-001 | All API requests require authentication (JWT or service role key) |
| API-002 | Service role key is server-only; never expose to client |
| API-003 | Anon key is subject to RLS policies |
| API-004 | Rate limiting: 100 requests per minute per IP (adjustable) |
| API-005 | Webhook payloads are verified using webhook secrets |
| API-006 | API returns standard error format: `{ error: string }` |

---

*End of API Reference Module Documentation*
