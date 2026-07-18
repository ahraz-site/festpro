import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const { data, count } = await admin.from("organizations").select("*", { count: "exact" }).eq("id", auth.organization_id).range((page - 1) * limit, page * limit - 1).order("created_at", { ascending: false })
  return NextResponse.json({ data, total: count, page, limit })
}

export async function PUT(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("write") && !auth.permissions.includes("admin")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const body = await request.json()
  const { data, error } = await admin.from("organizations").update(body).eq("id", auth.organization_id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
