import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@supabase/ssr"
import { canAccessRoute } from "@/config/roles"
import type { UserRole } from "@/types"

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify",
  "/auth/callback",
  "/accept-invite",
  "/api",
  "/mobile",
  "/sw.js",
  "/manifest.json",
]

const authRoutes = ["/login", "/signup", "/forgot-password", "/verify"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect password reset / magic link with code to callback handler
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const callbackUrl = new URL("/auth/callback", request.url)
    callbackUrl.search = request.nextUrl.search
    return NextResponse.redirect(callbackUrl)
  }

  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  )

  if (isPublicRoute) {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return await updateSession(request)
      }
    } catch (e) {
      console.error("Middleware session update error:", e)
    }
    return NextResponse.next({ request })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.next({ request })
    }

    let response = NextResponse.next({ request })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
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
      }
    )

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

    const role = (profile?.role as UserRole) || "participant"

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
