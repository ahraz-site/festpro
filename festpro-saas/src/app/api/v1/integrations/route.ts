import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("admin") && !auth.permissions.includes("manage")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "connections"
  if (type === "providers") {
    const { data } = await admin.from("integration_providers").select("*").eq("is_active", true)
    return NextResponse.json({ data })
  }
  const { data } = await admin.from("integration_connections").select("*, integration_providers(*)").eq("organization_id", auth.organization_id)
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("admin") && !auth.permissions.includes("manage")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const body = await request.json()
  const { data, error } = await admin.from("integration_connections").insert({ ...body, organization_id: auth.organization_id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
