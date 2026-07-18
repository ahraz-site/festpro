import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

export async function validateApiRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, response: NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 }) }
  }
  const rawKey = authHeader.replace("Bearer ", "").trim()
  if (!rawKey.startsWith("fp_")) {
    return { valid: false, response: NextResponse.json({ error: "Invalid API key format" }, { status: 401 }) }
  }
  const admin = createAdminClient()
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")
  const { data: key, error } = await admin.from("api_keys").select("*, organizations!inner(*)").eq("key_hash", keyHash).eq("status", "active").single()
  if (error || !key) {
    return { valid: false, response: NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 }) }
  }
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return { valid: false, response: NextResponse.json({ error: "API key has expired" }, { status: 401 }) }
  }
  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id)
  const path = request.nextUrl.pathname.replace("/api/v1", "")
  await admin.from("api_key_usage_logs").insert({
    api_key_id: key.id, organization_id: key.organization_id,
    request_path: path, request_method: request.method,
    status_code: 0, response_time_ms: 0, ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    user_agent: request.headers.get("user-agent") || "unknown",
  })
  return { valid: true, organization_id: key.organization_id, permissions: key.permissions, key }
}
