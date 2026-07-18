import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("admin") && !auth.permissions.includes("read")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const festivalId = searchParams.get("festival_id")
  const type = searchParams.get("type") || "transactions"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  let q = admin.from("transactions").select("*").eq("organization_id", auth.organization_id)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (searchParams.get("category")) q = q.eq("category", searchParams.get("category"))
  if (searchParams.get("start_date")) q = q.gte("transaction_date", searchParams.get("start_date"))
  if (searchParams.get("end_date")) q = q.lte("transaction_date", searchParams.get("end_date"))
  q = q.range((page - 1) * limit, page * limit - 1).order("transaction_date", { ascending: false })
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
  const { data, error } = await admin.from("transactions").insert({ ...body, organization_id: auth.organization_id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
