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
  if (!festivalId) return NextResponse.json({ error: "festival_id is required" }, { status: 400 })
  let q = admin.from("judges").select("*, users(*), judge_specializations(*)").eq("festival_id", festivalId)
  if (searchParams.get("status")) q = q.eq("status", searchParams.get("status"))
  q = q.range((page - 1) * limit, page * limit - 1).order("last_name", { ascending: true })
  const { data, count, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, total: count, page, limit })
}
