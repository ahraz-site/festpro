import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const festivalId = searchParams.get("festival_id")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const search = searchParams.get("search")
  const status = searchParams.get("status")
  if (!festivalId) return NextResponse.json({ error: "festival_id is required" }, { status: 400 })
  let q = admin.from("participants").select("*", { count: "exact" }).eq("festival_id", festivalId).eq("organization_id", auth.organization_id)
  if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  if (status) q = q.eq("status", status)
  q = q.range((page - 1) * limit, page * limit - 1).order("created_at", { ascending: false })
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
  const { data, error } = await admin.from("participants").insert({ ...body, organization_id: auth.organization_id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
