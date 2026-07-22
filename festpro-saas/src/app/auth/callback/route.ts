import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

function cleanEnv(val: string | undefined): string {
  if (!val) return ""
  return val.replace(/[^\x00-\x7F]/g, "").trim().replace(/^['"]|['"]$/g, "")
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/reset-password"

  if (code) {
    const cookieStore = await cookies()
    const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || "https://dshjkprpijoatritpyzh.supabase.co"
    const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || "sb_publishable_dummy_fallback_for_build"

    const supabase = createServerClient(url, key, {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If code was exchanged successfully, redirect to reset-password or requested page
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login with error message if exchange failed
  return NextResponse.redirect(`${origin}/login?error=Invalid+or+expired+reset+link`)
}
