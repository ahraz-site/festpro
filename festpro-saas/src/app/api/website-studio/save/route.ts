import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { type FestivalWebsiteConfig } from "@/types/website-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { festivalId, config } = body as {
      festivalId: string
      config: FestivalWebsiteConfig
    }

    if (!festivalId) {
      return NextResponse.json({ error: "Missing festivalId" }, { status: 400 })
    }

    let serverClient: any = null
    try {
      serverClient = await createServerClient()
    } catch {}
    const adminClient = createAdminClient()
    const clients = [serverClient, adminClient].filter(Boolean)

    const stampedConfig: FestivalWebsiteConfig = {
      ...config,
      headerConfig: {
        ...(config.headerConfig || {
          style: "glass",
          sticky: true,
          showLiveBadge: false,
          showConsoleLogin: false,
        }),
        brandingVersion: 2,
      },
    }

    const primaryColor = config.globalDesign?.palette?.primary || config.accentColor || "#4F46E5"
    const isDark = (config.globalDesign?.palette?.themeMode || config.themeMode || "dark") !== "light"

    const settingsPayload = {
      festival_id: festivalId,
      theme_color: primaryColor,
      festival_color: primaryColor,
      dark_mode: isDark,
      custom_fields: { website_config: stampedConfig },
      updated_at: new Date().toISOString(),
    }

    // 1. Dual-write to festival_settings
    let savedSettings = false
    for (const c of clients) {
      try {
        const { data: updatedRows, error: upErr } = await c
          .from("festival_settings")
          .update(settingsPayload)
          .eq("festival_id", festivalId)
          .select("id")

        if (!upErr && updatedRows && updatedRows.length > 0) {
          savedSettings = true
          break
        }
        const { error: insErr } = await c.from("festival_settings").insert(settingsPayload)
        if (!insErr) {
          savedSettings = true
          break
        }
      } catch (e) {
        console.warn("Client festival_settings save error:", e)
      }
    }

    // 2. Dual-write to public_homepage_settings (publicly accessible for all visitors)
    const homepagePayload = {
      festival_id: festivalId,
      hero_title: config.heroTitle || "Festival",
      hero_subtitle: config.heroSubtitle || "",
      hero_image_url: config.bannerUrl || "",
      featured_sections: [stampedConfig],
      seo_meta: { website_config: stampedConfig },
      is_published: true,
      updated_at: new Date().toISOString(),
    }
    for (const c of clients) {
      try {
        await c.from("public_homepage_settings").upsert(homepagePayload, { onConflict: "festival_id" })
      } catch (e) {
        console.warn("Client public_homepage_settings save error:", e)
      }
    }

    // 3. Update festival basics in festivals table
    const updatePayload: any = {}
    if (config.heroTitle?.trim()) updatePayload.name = config.heroTitle.trim()
    if (config.heroSubtitle) updatePayload.description = config.heroSubtitle
    if (config.logoUrl !== undefined) updatePayload.logo_url = config.logoUrl
    if (config.bannerUrl !== undefined) updatePayload.banner_url = config.bannerUrl

    if (Object.keys(updatePayload).length > 0) {
      for (const c of clients) {
        try {
          await c.from("festivals").update(updatePayload).eq("id", festivalId)
        } catch (fErr) {
          console.warn("Festivals table update exception:", fErr)
        }
      }
    }

    return NextResponse.json({ success: true, message: "FesPro Studio design published to live site!" })
  } catch (err: any) {
    console.error("API website-studio/save error:", err)
    return NextResponse.json({ error: err.message || "Failed to save configuration" }, { status: 500 })
  }
}
