# FesPro Enterprise – Cache Strategy & Invalidation Architecture

**Design Pattern**: Multi-Tier Distributed Stale-While-Revalidate (SWR)  
**Target SLAs**: 
- Page Navigation First Paint: `< 5ms`
- Live State Accuracy: `< 15s` (or 0s upon manual sync / mutation)
- Cache Isolation: Strict tenant-level isolation

---

## 1. Multi-Tier Cache Topology

```
┌────────────────────────────────────────────────────────┐
│ Tier 1: Client Memory & SessionStorage Cache (SWR)    │
│ - Instant 0ms render on tab switch / back navigation   │
│ - Background silent revalidation                       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Tier 2: Edge & Cookie Cache                            │
│ - festpro_user_role cookie for instant middleware      │
│ - Bypass DB profile lookups during route changes       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Tier 3: Server Process In-Memory Cache (Node.js/Next)   │
│ - 15-second TTL per festivalId                         │
│ - Sub-millisecond response for concurrent requests     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Tier 4: PostgreSQL Database with Composite Indexes     │
│ - Execution time: 100ms - 200ms for fresh parallel fetch│
└────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Tier Specifications

### Tier 1: Client-Side Session Storage (SWR)
- **Keys**: 
  - `festpro_dashboard_cache_${festivalId}`: Stores latest `FestivalDashboardData`
  - `festpro_user_display_name`: Stores user first name or identifier
  - `festpro_active_fest_${orgId}`: Stores current active festival workspace identity
- **Lifetime**: Persists for the duration of the browser tab session.
- **Hydration**: Components lazily initialize state from `sessionStorage`. If present, `loading` defaults to `false`.
- **Revalidation**: An asynchronous background fetch triggers on mount. Fresh results are reconciled and written back into `sessionStorage`.

### Tier 2: Edge & Cookie Cache
- **Key**: `festpro_user_role`
- **Scope**: `Path=/; SameSite=Lax; Max-Age=86400`
- **Purpose**: Eliminates the database roundtrip from Next.js Edge Middleware on internal route transitions.

### Tier 3: Server In-Memory Cache
- **Storage**: `dashboardMemoryCache = new Map<string, DashboardCacheEntry>()`
- **TTL**: 15 seconds.
- **Granular Invalidation**: `invalidateFestivalDashboardCache(festivalId)` deletes the cache entry when scoring, programs, or stage schedules are modified.
- **Bypass**: Passing `forceFresh = true` to `getFestivalDashboardData` ignores the cache and forces a fresh database read.

### Tier 4: Service Worker Cache Control
- **Scope**: `public/sw.js` (Version `festpro-v5`)
- **Rule**: Direct network bypass for all HTML navigations on festival subdomains (`*.ahraz.site`) and `/festivals/*` to prevent users from seeing outdated versions of published websites or live results.

---

## 3. Cache Invalidation Matrix

| User Action | Cache Layer Affected | Invalidation Trigger |
|---|---|---|
| User clicks "Sync Live Data" | Tier 1 & Tier 3 | `loadData(true)` forces fresh DB fetch & updates session storage |
| Result published by Judge / Admin | Tier 3 | `invalidateFestivalDashboardCache(festivalId)` called on score commit |
| User navigates to different tab | Tier 1 | Instant render from session storage, background revalidate |
| User signs out | Tier 1 & Tier 2 | Cookies cleared and `sessionStorage.clear()` executed on auth exit |
