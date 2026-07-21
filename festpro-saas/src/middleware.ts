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
  "/mobile/login",
  "/mobile/attendance",
  "/mobile/schedule",
  "/mobile/qr",
  "/mobile/judging",
  "/mobile/results",
  "/mobile/tasks",
  "/mobile/settings",
  "/mobile/help-desk",
  "/mobile/stages",
  "/mobile/meal-verification",
  "/mobile/visitor-checkin",
  "/mobile/medical",
  "/mobile/inventory",
  "/mobile/announcements",
  "/mobile/finance",
  "/sw.js",
  "/manifest.json",
]

const authRoutes = ["/login", "/signup", "/forgot-password", "/verify"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return await updateSession(request)
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
