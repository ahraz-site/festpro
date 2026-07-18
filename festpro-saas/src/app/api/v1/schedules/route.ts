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
  const limit = parseInt(searchParams.get("limit") || "100")
  if (!festivalId) return NextResponse.json({ error: "festival_id is required" }, { status: 400 })
  let q = admin.from("schedules").select("*, stages(*), competitions(*)").eq("festival_id", festivalId).eq("organization_id", auth.organization_id)
  if (searchParams.get("date")) q = q.eq("scheduled_date", searchParams.get("date"))
  if (searchParams.get("stage_id")) q = q.eq("stage_id", searchParams.get("stage_id"))
  q = q.range((page - 1) * limit, page * limit - 1).order("scheduled_time", { ascending: true })
  const { data, count, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, total: count, page, limit })
}
