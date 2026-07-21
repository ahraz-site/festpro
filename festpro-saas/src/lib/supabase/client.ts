import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dshjkprpijoatritpyzh.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_dummy_fallback_for_build"

  return createBrowserClient(url, key)
}
