import { createBrowserClient } from "@supabase/ssr"

function cleanEnv(val: string | undefined): string {
  if (!val) return ""
  return val.replace(/[^\x00-\x7F]/g, "").trim().replace(/^['"]|['"]$/g, "")
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dshjkprpijoatritpyzh.supabase.co"
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_dummy_fallback_for_build"

  const url = cleanEnv(rawUrl) || "https://dshjkprpijoatritpyzh.supabase.co"
  const key = cleanEnv(rawKey) || "sb_publishable_dummy_fallback_for_build"

  return createBrowserClient(url, key)
}
