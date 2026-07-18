import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("admin") && !auth.permissions.includes("read")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "summary"
  const festivalId = searchParams.get("festival_id")
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")
  let report: any = { organization_id: auth.organization_id, type, generated_at: new Date().toISOString() }
  if (type === "summary") {
    const [{ count: festivals }, { count: participants }, { count: competitions }, { count: judges }] = await Promise.all([
      admin.from("festivals").select("*", { count: "exact", head: true }).eq("organization_id", auth.organization_id),
      admin.from("participants").select("*", { count: "exact", head: true }).eq("organization_id", auth.organization_id),
      admin.from("competitions").select("*", { count: "exact", head: true }).eq("organization_id", auth.organization_id),
      admin.from("judges").select("*", { count: "exact", head: true }).eq("organization_id", auth.organization_id).eq("organization_id", auth.organization_id),
    ])
    report = { ...report, total_festivals: festivals, total_participants: participants, total_competitions: competitions, total_judges: judges }
  }
  return NextResponse.json({ data: report })
}
