import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@supabase/ssr"
import { canAccessRoute } from "@/config/roles"
import type { UserRole } from "@/types"

function cleanEnv(val: string | undefined): string {
  if (!val) return ""
  return val.replace(/[^\x00-\x7F]/g, "").trim().replace(/^['"]|['"]$/g, "")
}

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/auth/callback",
  "/accept-invite",
  "/api",
  "/mobile",
  "/sw.js",
  "/manifest.json",
]

const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")
  const errorCode = request.nextUrl.searchParams.get("error_code")

  if ((error || errorCode === "otp_expired") && !pathname.startsWith("/forgot-password")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/forgot-password"
    redirectUrl.searchParams.set("error", "expired")
    return NextResponse.redirect(redirectUrl)
  }

  if (code && !pathname.startsWith("/auth/callback")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/auth/callback"
    return NextResponse.redirect(redirectUrl)
  }

  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  )

  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (isPublicRoute) {
    try {
      if (url && key) {
        return await updateSession(request)
      }
    } catch (e) {
      console.error("Middleware session update error:", e)
    }
    return NextResponse.next({ request })
  }

  try {
    if (!url || !key) {
      return NextResponse.next({ request })
    }

    let response = NextResponse.next({ request })
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = (profile?.role as UserRole) || "organization_owner"

    if (!canAccessRoute(role, pathname)) {
      const dashboardUrl = new URL("/dashboard", request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    if (authRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  } catch (err) {
    console.error("Middleware error:", err)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
