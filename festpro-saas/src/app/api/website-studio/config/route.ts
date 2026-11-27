import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  normalizeWebsiteConfig,
  type FestivalWebsiteConfig,
} from "@/types/website-studio"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const festivalId = searchParams.get("festivalId") || ""

    if (!festivalId) {
      return NextResponse.json({
        success: true,
        data: {
          config: normalizeWebsiteConfig(null, null, null),
          festival: null,
        },
      })
    }

    let serverClient: any = null
    try {
      serverClient = await createServerClient()
    } catch {}
    let adminClient: any = null
    try {
      adminClient = createAdminClient()
    } catch {}

    const clients = [serverClient, adminClient].filter(Boolean)

    // 1. Fetch festival basic details
    let fest: any = null
    for (const c of clients) {
      try {
        const { data } = await c.from("festivals").select("*").eq("id", festivalId).limit(1)
        if (data?.[0]) {
          fest = data[0]
          break
        }
      } catch {}
    }

    // 2. Fetch festival settings with website_config
    let settings: any = null
    for (const c of clients) {
      try {
        const { data } = await c
          .from("festival_settings")
          .select("*")
          .eq("festival_id", festivalId)
          .order("updated_at", { ascending: false })
          .limit(1)
        if (data?.[0]) {
          settings = data[0]
          break
        }
      } catch {}
    }

    let rawFields = settings?.custom_fields
    if (typeof rawFields === "string") {
      try { rawFields = JSON.parse(rawFields) } catch {}
    }
    const customFields: Record<string, any> =
      rawFields && typeof rawFields === "object" && !Array.isArray(rawFields)
        ? rawFields
        : {}
    let saved = customFields.website_config || null
    if (typeof saved === "string") {
      try { saved = JSON.parse(saved) } catch {}
    }

    // 3. Fallback: check public_homepage_settings
    if (!saved) {
      for (const c of clients) {
        try {
          const { data } = await c.from("public_homepage_settings").select("*").eq("festival_id", festivalId).limit(1)
          const row = data?.[0]
          let hpConfig = row?.seo_meta?.website_config || row?.featured_sections?.[0] || null
          if (typeof hpConfig === "string") {
            try { hpConfig = JSON.parse(hpConfig) } catch {}
          }
          if (hpConfig) {
            saved = hpConfig
            break
          }
        } catch {}
      }
    }

    const webConfig: FestivalWebsiteConfig = normalizeWebsiteConfig(saved, fest, settings)

    return NextResponse.json({
      success: true,
      data: {
        config: webConfig,
        festival: fest,
      },
    })
  } catch (err: any) {
    console.warn("GET /api/website-studio/config safe fallback:", err)
    return NextResponse.json({
      success: true,
      data: {
        config: normalizeWebsiteConfig(null, null, null),
        festival: null,
      },
    })
  }
}
