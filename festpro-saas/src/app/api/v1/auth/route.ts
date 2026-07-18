import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateApiRequest } from "../middleware"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const auth = await validateApiRequest(request)
  if (!auth.valid) return auth.response
  return NextResponse.json({ organization_id: auth.organization_id, permissions: auth.permissions, status: "authenticated" })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { grant_type, client_id, client_secret, code, refresh_token } = body
  const admin = createAdminClient()
  if (grant_type === "authorization_code" && code) {
    const { data: authCode } = await admin.from("oauth_authorization_codes").select("*, oauth_clients(*)").eq("code", code).single()
    if (!authCode || authCode.used_at) return NextResponse.json({ error: "Invalid authorization code" }, { status: 400 })
    if (authCode.expires_at && new Date(authCode.expires_at) < new Date()) return NextResponse.json({ error: "Authorization code expired" }, { status: 400 })
    await admin.from("oauth_authorization_codes").update({ used_at: new Date().toISOString() }).eq("id", authCode.id)
    const token = crypto.randomBytes(48).toString("hex")
    const refreshToken = crypto.randomBytes(48).toString("hex")
    const { data: accessToken } = await admin.from("oauth_access_tokens").insert({
      oauth_client_id: authCode.oauth_client_id, user_id: authCode.user_id,
      token, scopes: authCode.scopes, expires_at: new Date(Date.now() + 3600000).toISOString(),
    }).select().single()
    await admin.from("oauth_refresh_tokens").insert({
      access_token_id: accessToken.id, oauth_client_id: authCode.oauth_client_id,
      user_id: authCode.user_id, token: refreshToken, expires_at: new Date(Date.now() + 2592000000).toISOString(),
    })
    return NextResponse.json({ access_token: token, token_type: "Bearer", expires_in: 3600, refresh_token: refreshToken })
  }
  if (grant_type === "client_credentials" && client_id && client_secret) {
    const { data: client } = await admin.from("oauth_clients").select("*").eq("client_id", client_id).eq("client_secret", client_secret).eq("is_active", true).single()
    if (!client) return NextResponse.json({ error: "Invalid client credentials" }, { status: 401 })
    const token = crypto.randomBytes(48).toString("hex")
    await admin.from("oauth_access_tokens").insert({
      oauth_client_id: client.id, token, scopes: client.allowed_scopes,
      expires_at: new Date(Date.now() + client.access_token_lifetime * 1000).toISOString(),
    })
    return NextResponse.json({ access_token: token, token_type: "Bearer", expires_in: client.access_token_lifetime })
  }
  if (grant_type === "refresh_token" && refresh_token) {
    const { data: rt } = await admin.from("oauth_refresh_tokens").select("*, oauth_access_tokens(*)").eq("token", refresh_token).eq("status", "active").single()
    if (!rt || (rt.expires_at && new Date(rt.expires_at) < new Date())) return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 })
    await admin.from("oauth_refresh_tokens").update({ status: "used" }).eq("id", rt.id)
    const newToken = crypto.randomBytes(48).toString("hex")
    const newRefreshToken = crypto.randomBytes(48).toString("hex")
    const { data: accessToken } = await admin.from("oauth_access_tokens").insert({
      oauth_client_id: rt.oauth_client_id, user_id: rt.user_id,
      token: newToken, scopes: rt.oauth_access_tokens?.scopes,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    }).select().single()
    await admin.from("oauth_refresh_tokens").insert({
      access_token_id: accessToken.id, oauth_client_id: rt.oauth_client_id,
      user_id: rt.user_id, token: newRefreshToken, expires_at: new Date(Date.now() + 2592000000).toISOString(),
    })
    return NextResponse.json({ access_token: newToken, token_type: "Bearer", expires_in: 3600, refresh_token: newRefreshToken })
  }
  return NextResponse.json({ error: "Unsupported grant type" }, { status: 400 })
}
