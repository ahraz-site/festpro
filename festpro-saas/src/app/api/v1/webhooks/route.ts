import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  const admin = createAdminClient()
  const { data } = await admin.from("webhook_endpoints").select("*").eq("organization_id", auth.organization_id)
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  if (!auth.permissions.includes("admin") && !auth.permissions.includes("manage")) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  const admin = createAdminClient()
  const body = await request.json()
  const secret = crypto.randomBytes(32).toString("hex")
  const { data, error } = await admin.from("webhook_endpoints").insert({ ...body, organization_id: auth.organization_id, secret }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data, secret }, { status: 201 })
}
