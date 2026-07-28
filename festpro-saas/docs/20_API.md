# FestPro API Reference — Complete Official Documentation

**Module:** 20 — API Reference  
**Version:** 2.0  
**Dependencies:** All modules  
**Applies To:** Developers, System Integrators, Technical Team

---

# Section 1: Introduction

FestPro exposes its functionality through three API layers: Next.js Server Actions (for client-to-server interactions within the app), Route Handlers (for webhooks and external integrations), and the Supabase Direct API (for authenticated clients and admin operations). This reference covers all available endpoints, authentication methods, request/response formats, and integration patterns.

## API Layers

| Layer | Purpose | Authentication | Scope |
|-------|---------|---------------|-------|
| Server Actions | Internal client-server mutations | Session cookie (JWT) | App-internal |
| Route Handlers | Webhooks, exports, public endpoints | Secret key / JWT | External services |
| Supabase Direct | Database-level operations | JWT / Service Role Key | Custom integrations |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Supabase Project | Access to the Supabase project (URL + anon key) |
| Service Role Key | For admin operations (server-side only) |
| API Keys | For external integrations (generated in Settings → API) |
| Webhook Secret | For verifying webhook payloads |

## Integration Options

| Use Case | Recommended Approach |
|----------|---------------------|
| Frontend mutations | Server Actions (import from `@/lib/actions/*`) |
| Payment webhooks | Route Handlers (`/api/webhooks/stripe`) |
| Data export | Route Handlers (`/api/export/*`) |
| Custom backend | Supabase Admin Client (service role key) |
| Third-party integration | Public API (API key authentication) |
| Real-time subscriptions | Supabase Realtime (WebSockets) |

---

# Section 3: Server Actions

Server Actions are callable from client components with `"use server"`. They run server-side with full access to Supabase and enforce authentication + authorization at the start of each action.

## 3.1 Authentication Actions

**Source:** `@/lib/actions/auth`

| Action | Input | Output | Description |
|--------|-------|--------|-------------|
| `signUp` | `{ first_name, last_name, email, password }` | `{ success, error }` | Create new account and profile |
| `signIn` | `{ email, password }` | `{ success, error }` | Authenticate and create session |
| `signInWithOAuth` | `{ provider: 'google' \| 'github' }` | `{ url }` | OAuth redirect |
| `signOut` | None | `{ success }` | End current session |
| `resetPassword` | `{ email }` | `{ success, error }` | Send password reset email |
| `updatePassword` | `{ password }` | `{ success, error }` | Update password (requires reset token) |
| `updateProfile` | `{ first_name?, last_name?, phone?, avatar_url? }` | `{ success, error }` | Update user profile |
| `enableMFA` | `{ factor_type: 'totp' \| 'phone' }` | `{ challenge }` | Enable multi-factor authentication |
| `disableMFA` | `{ factor_id }` | `{ success, error }` | Disable MFA |
| `verifyMFA` | `{ factor_id, code }` | `{ success, error }` | Verify MFA setup |

## 3.2 Organization Actions

**Source:** `@/lib/actions/organization`

| Action | Input | Output |
|--------|-------|--------|
| `createOrganization` | `{ name, slug, ...settings }` | `{ id, error }` |
| `updateOrganization` | `{ id, ...fields }` | `{ success, error }` |
| `deleteOrganization` | `{ id }` | `{ success, error }` |
| `getOrganization` | `{ id \| slug }` | `{ organization, error }` |
| `listOrganizations` | `{ page?, limit? }` | `{ organizations, count }` |
| `inviteMember` | `{ organization_id, email, role }` | `{ id, error }` |
| `removeMember` | `{ organization_id, user_id }` | `{ success, error }` |
| `updateMemberRole` | `{ organization_id, user_id, role }` | `{ success, error }` |
| `listMembers` | `{ organization_id }` | `{ members, error }` |

## 3.3 Festival Actions

**Source:** `@/lib/actions/festivals`

| Action | Input | Output |
|--------|-------|--------|
| `createFestival` | `{ name, description, startDate, endDate, venue, ... }` | `{ id, error }` |
| `updateFestival` | `{ id, ...fields }` | `{ success, error }` |
| `deleteFestival` | `{ id }` | `{ success, error }` |
| `publishFestival` | `{ id }` | `{ success, error }` |
| `archiveFestival` | `{ id }` | `{ success, error }` |
| `cancelFestival` | `{ id, reason }` | `{ success, error }` |
| `getFestival` | `{ id }` | `{ festival, error }` |
| `listFestivals` | `{ organization_id, status?, page?, limit? }` | `{ festivals, count }` |

## 3.4 Competition Actions

**Source:** `@/lib/actions/competitions`

| Action | Input | Output |
|--------|-------|--------|
| `createCompetition` | `{ festivalId, name, categoryId, ageGroupId, ... }` | `{ id, error }` |
| `updateCompetition` | `{ id, ...fields }` | `{ success, error }` |
| `deleteCompetition` | `{ id }` | `{ success, error }` |
| `assignJudge` | `{ competition_id, judge_id }` | `{ success, error }` |
| `createCategory` | `{ name, festivalId }` | `{ id, error }` |
| `createAgeGroup` | `{ name, minAge, maxAge, festivalId }` | `{ id, error }` |

## 3.5 Registration Actions

**Source:** `@/lib/actions/registrations`

| Action | Input | Output |
|--------|-------|--------|
| `registerParticipant` | `{ festivalId, competitionIds, participantData, ... }` | `{ id, error }` |
| `registerExistingParticipant` | `{ participantId, competitionIds }` | `{ id, error }` |
| `approveRegistration` | `{ id }` | `{ success, error }` |
| `rejectRegistration` | `{ id, reason }` | `{ success, error }` |
| `cancelRegistration` | `{ id, reason }` | `{ success, error }` |
| `checkInParticipant` | `{ id, method: 'qr' \| 'manual' }` | `{ success, error }` |
| `importBulkRegistrations` | `{ festivalId, csvFile }` | `{ results, errors }` |

## 3.6 Judging Actions

**Source:** `@/lib/actions/judging`

| Action | Input | Output |
|--------|-------|--------|
| `submitScore` | `{ registration_id, criteria_scores, comments? }` | `{ success, error }` |
| `lockScore` | `{ registration_id }` | `{ success, error }` |
| `approveScore` | `{ registration_id }` | `{ success, error }` |
| `getScores` | `{ competition_id }` | `{ scores, error }` |
| `getJudgeAssignments` | `{ judge_id, festival_id }` | `{ competitions, error }` |

## 3.7 Finance Actions

**Source:** `@/lib/actions/finance`

| Action | Input | Output |
|--------|-------|--------|
| `recordPayment` | `{ registration_id, amount, method, ... }` | `{ id, error }` |
| `processRefund` | `{ transaction_id, amount, reason }` | `{ id, error }` |
| `generateInvoice` | `{ registration_id }` | `{ invoice_url, error }` |
| `recordExpense` | `{ festival_id, category, amount, ... }` | `{ id, error }` |
| `syncGateway` | `{ gateway: 'razorpay' \| 'stripe' }` | `{ synced, errors }` |

## 3.8 Communication Actions

**Source:** `@/lib/actions/communication`

| Action | Input | Output |
|--------|-------|--------|
| `sendBroadcast` | `{ channel, recipientGroup, templateId, schedule? }` | `{ id, error }` |
| `createTemplate` | `{ name, channel, subject?, body, ... }` | `{ id, error }` |
| `updateTemplate` | `{ id, ...fields }` | `{ success, error }` |
| `createTrigger` | `{ event, channel, templateId, delay? }` | `{ id, error }` |

## 3.9 Result Actions

**Source:** `@/lib/actions/results`

| Action | Input | Output |
|--------|-------|--------|
| `calculateResults` | `{ competition_id }` | `{ results, error }` |
| `publishResults` | `{ competition_id }` | `{ success, error }` |
| `generateCertificates` | `{ competition_id, template_id }` | `{ batch_id, error }` |
| `verifyCertificate` | `{ code }` | `{ valid, data }` |

---

# Section 4: Route Handlers

## 4.1 Webhooks

| Endpoint | Method | Purpose | Verification |
|----------|--------|---------|:------------:|
| `/api/webhooks/stripe` | POST | Stripe payment events (payment_intent.succeeded, charge.refunded) | Stripe signature |
| `/api/webhooks/razorpay` | POST | Razorpay payment events (payment.captured, refund.created) | Webhook secret |
| `/api/webhooks/sendgrid` | POST | Email delivery events (delivered, bounced, opened) | SendGrid signature |
| `/api/webhooks/twilio` | POST | SMS delivery status (sent, delivered, failed) | Twilio signature |

## 4.2 Data Export

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|:----:|
| `/api/export/participants` | GET | Download participant CSV with filters | JWT (Manager+) |
| `/api/export/registrations` | GET | Download registration CSV | JWT (Manager+) |
| `/api/export/results` | GET | Download competition results CSV | JWT (Manager+) |
| `/api/export/finance` | GET | Download financial report CSV | JWT (Finance+) |
| `/api/export/attendance` | GET | Download attendance log CSV | JWT (Manager+) |

## 4.3 Utility Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|:----:|
| `/api/upload` | POST | Generate signed URL for file upload | JWT |
| `/api/health` | GET | System health check | None |
| `/api/public/festivals` | GET | Public festival listing | None |
| `/api/public/schedule/[festivalId]` | GET | Public schedule | None |
| `/api/public/verify/[code]` | GET | Certificate verification | None |

## 4.4 Webhook Payload Format

```typescript
// Standard webhook response
{
  "success": true,
  "event": "payment_intent.succeeded",
  "data": {
    "id": "pi_12345",
    "amount": 50000,  // in cents
    "currency": "inr",
    "status": "succeeded",
    "metadata": {
      "registration_id": "reg_abc123"
    }
  }
}
```

---

# Section 5: Supabase Direct API

FestPro uses Supabase PostgreSQL under the hood. For custom integrations, the Supabase REST API and client libraries are available.

## 5.1 Client Initialization

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

## 5.2 Common Query Patterns

```typescript
// Fetch festivals for current organization (server client)
const { data: festivals } = await supabase
  .from("festivals")
  .select("id, name, start_date, end_date, status")
  .eq("organization_id", orgId)
  .order("start_date", { ascending: false })
  .range(0, 19)

// Fetch registrations with participant and competition details
const { data: registrations } = await supabase
  .from("registrations")
  .select(`
    id,
    status,
    fee,
    participants!inner(first_name, last_name, email),
    competitions!inner(name)
  `)
  .eq("festival_id", festivalId)

// Insert with admin client (bypasses RLS)
const { data } = await admin
  .from("competitions")
  .insert({
    festival_id: festivalId,
    name: "Kathakali",
    category_id: categoryId,
    age_group_id: ageGroupId,
    judging_method: "points"
  })
  .select()
  .single()

// Real-time subscription
const channel = supabase
  .channel("scores")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "scores" },
    (payload) => console.log("New score:", payload.new)
  )
  .subscribe()
```

## 5.3 Storage API

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from("festival-media")
  .upload(`${orgId}/${fileName}`, file, {
    cacheControl: "3600",
    upsert: false
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from("festival-media")
  .getPublicUrl(`${orgId}/${fileName}`)

// Generate signed URL for temporary access
const { data } = await supabase.storage
  .from("festival-media")
  .createSignedUrl(`${orgId}/${fileName}`, 3600) // 1 hour expiry
```

---

# Section 6: Error Handling

## Standard Error Response Format

```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Human-readable error message", "code": "VALIDATION_ERROR" }

// Paginated
{ "success": true, "data": [...], "count": 100, "page": 1, "limit": 20 }
```

## Error Codes

| Code | HTTP Status | Description |
|------|:-----------:|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Invalid email/password |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `GATEWAY_ERROR` | 502 | Payment gateway error |
| `CONFLICT` | 409 | Duplicate or state conflict |

---

# Section 7: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| API-001 | All API requests require authentication (JWT or service role key) | Middleware |
| API-002 | Service role key is server-only; never expose to client | Build Check |
| API-003 | Anon key is subject to RLS policies | Supabase Config |
| API-004 | Rate limiting: 100 requests per minute per IP | Edge Middleware |
| API-005 | Webhook payloads are verified using webhook secrets | Route Handler |
| API-006 | API returns standard error format: `{ error: string }` | Response Format |
| API-007 | CORS is restricted to allowed origins (configurable) | Edge Middleware |
| API-008 | Server Actions revalidate the path after mutations | `revalidatePath()` |
| API-009 | Pagination default: 20 items, max 100 | Query Validation |
| API-010 | File upload signed URL expires in 1 hour | Storage Policy |

---

# Section 8: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Can I use the API from a mobile app?** | Yes, use the Supabase client SDK with anon key. All RLS policies apply. |
| 2 | **How do I generate an API key?** | Navigate to Settings → API → Generate Key. Keys are hashed before storage. |
| 3 | **What is the rate limit for API requests?** | 100 requests per minute per IP for public endpoints. Higher limits available on Pro plan. |
| 4 | **How do I verify webhook signatures?** | Each webhook endpoint verifies using the provider's standard signature verification. |
| 5 | **Can I export data via API?** | Yes. Use the `/api/export/*` endpoints with JWT authentication. |
| 6 | **Is there an API SDK?** | Currently, use Supabase JS client library. A dedicated FestPro SDK is in development. |
| 7 | **How do I handle webhook failures?** | Webhooks have automatic retry with exponential backoff (3 retries). |
| 8 | **Can I subscribe to real-time events?** | Yes. Use Supabase Realtime for database changes. |

---

*End of API Reference Module Documentation (Module 20)*
