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
  const search = searchParams.get("search")
  const status = searchParams.get("status")
  const sort = searchParams.get("sort") || "created_at"
  const order = searchParams.get("order") || "desc"
  let q = admin.from("festivals").select("*", { count: "exact" }).eq("organization_id", auth.organization_id)
  if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  if (status) q = q.eq("status", status)
  q = q.order(sort, { ascending: order === "asc" }).range((page - 1) * limit, page * limit - 1)
  const { data, count, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("write") && !auth.permissions.includes("admin")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const body = await request.json()
  const { data, error } = await admin.from("festivals").insert({ ...body, organization_id: auth.organization_id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
