import { createClient } from "@supabase/supabase-js"

function cleanEnv(val: string | undefined): string {
  if (!val) return ""
  return val.replace(/[^\x00-\x7F]/g, "").trim().replace(/^['"]|['"]$/g, "")
}

export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dshjkprpijoatritpyzh.supabase.co"
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_secret_dummy_fallback_for_build"

  const url = cleanEnv(rawUrl) || "https://dshjkprpijoatritpyzh.supabase.co"
  const key = cleanEnv(rawKey) || "sb_secret_dummy_fallback_for_build"

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
