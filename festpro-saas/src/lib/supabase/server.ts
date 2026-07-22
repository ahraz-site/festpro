import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function cleanEnv(val: string | undefined): string {
  if (!val) return ""
  return val.replace(/[^\x00-\x7F]/g, "").trim().replace(/^['"]|['"]$/g, "")
}

export async function createClient() {
  const cookieStore = await cookies()
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dshjkprpijoatritpyzh.supabase.co"
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_dummy_fallback_for_build"

  const url = cleanEnv(rawUrl) || "https://dshjkprpijoatritpyzh.supabase.co"
  const key = cleanEnv(rawKey) || "sb_publishable_dummy_fallback_for_build"

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignored if called from Server Component / context
        }
      },
    },
  })
}
