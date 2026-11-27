"use client"

/**
 * Strictly tenant-isolated client SWR workspace cache.
 * Keys every entry by `${festivalId}:${scope}` so data never leaks across festivals,
 * renders cached workspace slices in 0ms on tab switches, and revalidates in background.
 */

const PREFIX = "fp_ws:"
const memoryStore = new Map<string, { data: any; ts: number }>()
const inflightRequests = new Map<string, Promise<any>>()

function makeKey(festivalId: string, scope: string) {
  return `${PREFIX}${festivalId}:${scope}`
}

function readStoredKey<T = any>(key: string, maxAgeMs: number): T | null {
  const mem = memoryStore.get(key)
  if (mem && Date.now() - mem.ts < maxAgeMs) {
    return mem.data as T
  }

  try {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.data && typeof parsed.ts === "number" && Date.now() - parsed.ts < maxAgeMs) {
        memoryStore.set(key, parsed)
        return parsed.data as T
      }
    }
  } catch {}

  return null
}

export function getCachedWorkspace<T = any>(festivalId: string, scope: string, maxAgeMs = 120_000): T | null {
  if (!festivalId || typeof window === "undefined") return null
  return (
    readStoredKey<T>(makeKey(festivalId, scope), maxAgeMs) ||
    (scope !== "all" ? readStoredKey<T>(makeKey(festivalId, "all"), maxAgeMs) : null)
  )
}

export function prefetchFestivalWorkspace(festivalId: string) {
  if (!festivalId || typeof window === "undefined") return
  if (getCachedWorkspace(festivalId, "all", 60_000)) return
  void fetchWorkspaceWithSWR(festivalId, "all", () => {})
}

export function setCachedWorkspace(festivalId: string, scope: string, data: any) {
  if (!festivalId || typeof window === "undefined") return
  const key = makeKey(festivalId, scope)
  const record = { data, ts: Date.now() }
  memoryStore.set(key, record)
  try {
    sessionStorage.setItem(key, JSON.stringify(record))
  } catch {}
}

export function invalidateFestivalWorkspace(festivalId?: string) {
  if (typeof window === "undefined") return
  const targetPrefix = festivalId ? `${PREFIX}${festivalId}:` : PREFIX

  for (const key of Array.from(memoryStore.keys())) {
    if (key.startsWith(targetPrefix)) memoryStore.delete(key)
  }

  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (!k) continue
      if (k.startsWith(targetPrefix) || (festivalId && k === `festpro_dashboard_cache_${festivalId}`)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch {}
}

export function clearAllClientSessionCaches() {
  memoryStore.clear()
  inflightRequests.clear()
  if (typeof window === "undefined") return
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (!k) continue
      if (k.startsWith(PREFIX) || k.startsWith("festpro_")) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  } catch {}
}

export async function fetchWorkspaceWithSWR<T = any>(
  festivalId: string,
  scope: string,
  onData: (data: T) => void
): Promise<T | null> {
  if (!festivalId) return null

  const key = makeKey(festivalId, scope)
  let req = inflightRequests.get(key)

  if (!req) {
    req = fetch(`/api/festival/${festivalId}/workspace?scope=${encodeURIComponent(scope)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) return null
        const json = await res.json()
        if (json) {
          setCachedWorkspace(festivalId, scope, json)
        }
        return json
      })
      .catch(() => null)
      .finally(() => {
        inflightRequests.delete(key)
      })
    inflightRequests.set(key, req)
  }

  const data = await req
  if (data) {
    onData(data as T)
  }
  return data as T | null
}
