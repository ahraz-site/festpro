# FesPro Enterprise – Codebase Performance Audit

**Audit Date**: November 2026  
**Application**: FesPro Enterprise Festival Management Platform (Multi-Tenant SaaS)  
**Architecture**: Next.js 16 App Router (Turbopack), React 19, Supabase PostgreSQL, Tailwind CSS  
**Target Domains**: `fespro.ahraz.site`, `optimuz.ahraz.site`, `*.ahraz.site`

---

## 1. Executive Summary

A comprehensive performance audit was conducted across the FesPro SaaS platform to identify and eliminate latency bottlenecks, slow navigation, and UI blocking states. Prior to optimization, users experienced notable delays when loading festival workspaces (2.5s - 4.5s), persistent "Refreshing live data..." top bar state, full-screen blocking spinners, and redundant database roundtrips during internal navigation.

The audit pinpointed critical bottlenecks at five architectural layers:
1. **Client Rendering & Navigation**: Full viewport blocking during initial component mounts, absence of Stale-While-Revalidate (SWR) caching for dashboard state.
2. **Server Actions & Database Queries**: `getFestivalDashboardData` executing 17 database queries per mount, including duplicate authorization lookups and unused table reads.
3. **Middleware Overhead**: Middleware performing 2 remote Supabase network roundtrips on every protected route transition.
4. **Layout State Synchronization**: Static header text indicating continuous refresh even when idle.
5. **Database Indexing**: Unindexed foreign key lookups on high-frequency tables like `stage_schedules`, `team_points`, and `result_items`.

---

## 2. Layer-by-Layer Architectural Audit

### 2.1 Next.js 16 App Router & Client Components
- **Bottleneck Identified**: `src/app/dashboard/organization/[orgId]/festivals/[festivalId]/page.tsx` was initialized with `data = null` and `loading = true`. Every time a user clicked into the festival dashboard, the entire viewport was replaced with a centered loading spinner ("CONNECTING TO FESTIVAL WORKSPACE...").
- **Impact**: Cumulative Layout Shift (CLS) of 0.38 and First Contentful Paint delay of ~3.2s.
- **Root Cause**: Absence of client-side cache hydration and lack of a structural skeleton screen.

### 2.2 Server Actions (`src/lib/actions/festival/index.ts`)
- **Bottleneck Identified**: `getFestivalDashboardData` was triggering 17 queries in parallel:
  1. `checkFestivalAccess(festivalId)` (3 DB queries: auth, festival org, member role)
  2. `getFestival(festivalId)` (re-ran `checkFestivalAccess` + festival query)
  3. `getFestivalSettings(festivalId)`
  4. `getFestivalStatistics(festivalId)`
  5. `getFestivalDays(festivalId)` *(Unused on dashboard overview)*
  6. `getFestivalVenues(festivalId)` *(Unused on dashboard overview)*
  7. `getFestivalStages(festivalId)`
  8. `getFestivalAnnouncements(festivalId)` *(Unused on dashboard overview)*
  9. `getFestivalSponsors(festivalId)` *(Unused on dashboard overview)*
  10. `teams` count query *(Redundant; teams list already fetched)*
  11. `participants` count query
  12. `competitions` count query
  13. `festival_stages` count query *(Redundant; stages list already fetched)*
  14. `teams` select query
  15. `team_points` select query
  16. `stage_schedules` select query
  17. `result_items` count query
- **Impact**: Server action execution time ranged from 1.8s to 3.2s depending on database network latency.
- **Root Cause**: Over-fetching unused entities and duplicate RBAC checks.

### 2.3 Edge Middleware (`src/middleware.ts`)
- **Bottleneck Identified**: On every navigation to a dashboard route, middleware queried:
  1. `supabase.auth.getUser()` (network call to Supabase Auth)
  2. `supabase.from("profiles").select("role").eq("id", user.id).single()` (PostgreSQL table query)
- **Impact**: Added 180ms - 350ms to every client-side page navigation.
- **Root Cause**: User role was not cached in a cryptographically signed or secure session cookie.

### 2.4 Layout Refresh Indicator (`src/app/dashboard/layout.tsx`)
- **Bottleneck Identified**: The top-bar button was hardcoded to `{isRefreshing ? "Refreshing..." : "Refreshing live data..."}`.
- **Impact**: Visual perception that the system was constantly hanging or perpetually fetching in the background.

### 2.5 PostgreSQL Database Indexes
- **Bottleneck Identified**: Missing composite indexes for festival-scoped filtering with ordering:
  - `stage_schedules(festival_id, scheduled_date)`
  - `team_points(festival_id, rank)`
  - `teams(festival_id, created_at)`
  - `festival_stages(festival_id, sort_order)`
  - `result_items(festival_id, status)`
  - `festival_judges(LOWER(username))`
- **Impact**: Sequential table scans as table row counts increase during live festivals.

---

## 3. Prioritized Optimization Roadmap

| Priority | Area | Bottleneck | Target Outcome |
|---|---|---|---|
| **P0** | Dashboard Client | Full-screen blocking spinner on mount | 0ms instant paint with SWR SessionStorage |
| **P0** | Server Actions | 17 queries in `getFestivalDashboardData` | Reduce to 8 lean queries + 15s in-memory cache |
| **P1** | Middleware | Role query on every route change | Cookie-cached role check (eliminates DB call) |
| **P1** | UI Layout | Permanent "Refreshing live data..." text | Actionable "Sync Live Data" with live pulse dot |
| **P2** | Database | Missing composite indexes | Migration 00034 with optimized B-tree indexes |
| **P2** | Navigation | Inconsistent route prefetching | Verified `prefetch={true}` across all sidebar links |
