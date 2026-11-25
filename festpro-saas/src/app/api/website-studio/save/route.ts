import { NextRequest, NextResponse } from "next/server"
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

    const admin = createAdminClient()

    // 1. Fetch current settings safely (handling potential multiple rows)
    const { data: settingsRows } = await admin
      .from("festival_settings")
      .select("*")
      .eq("festival_id", festivalId)
      .order("updated_at", { ascending: false })
      .limit(1)

    const currentSettings = settingsRows?.[0] || null
    const customFields = (currentSettings?.custom_fields as any) || {}
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
    customFields.website_config = stampedConfig

    const primaryColor = config.globalDesign?.palette?.primary || config.accentColor || "#4F46E5"
    const isDark = (config.globalDesign?.palette?.themeMode || config.themeMode || "dark") !== "light"

    const settingsPayload = {
      festival_id: festivalId,
      theme_color: primaryColor,
      festival_color: primaryColor,
      dark_mode: isDark,
      custom_fields: customFields,
      updated_at: new Date().toISOString(),
    }

    // 2. Update or Insert settings
    if (currentSettings?.id) {
      const { error } = await admin
        .from("festival_settings")
        .update(settingsPayload)
        .eq("id", currentSettings.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    } else {
      const { error } = await admin
        .from("festival_settings")
        .insert(settingsPayload)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 3. Update festival basics if provided
    const updatePayload: any = {}
    if (config.heroTitle?.trim()) updatePayload.name = config.heroTitle.trim()
    if (config.heroSubtitle) updatePayload.description = config.heroSubtitle
    if (config.logoUrl !== undefined) updatePayload.logo_url = config.logoUrl
    if (config.bannerUrl !== undefined) updatePayload.banner_url = config.bannerUrl

    if (Object.keys(updatePayload).length > 0) {
      try {
        await admin.from("festivals").update(updatePayload).eq("id", festivalId)
      } catch (fErr) {
        console.warn("Festivals table update exception:", fErr)
      }
    }

    return NextResponse.json({ success: true, message: "FesPro Studio design published to live site!" })
  } catch (err: any) {
    console.error("API website-studio/save error:", err)
    return NextResponse.json({ error: err.message || "Failed to save configuration" }, { status: 500 })
  }
}
