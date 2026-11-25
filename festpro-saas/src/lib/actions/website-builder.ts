"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  normalizeWebsiteConfig,
  type FestivalWebsiteConfig,
} from "@/types/website-studio"

export type { FestivalWebsiteConfig }

export async function getFestivalWebsiteConfigAction(festivalId: string) {
  const admin = createAdminClient()
  try {
    const [festRes, settingsRes] = await Promise.all([
      admin.from("festivals").select("*").eq("id", festivalId).limit(1),
      admin.from("festival_settings").select("*").eq("festival_id", festivalId).order("updated_at", { ascending: false }).limit(1),
    ])

    const fest = festRes.data?.[0] || null
    const settings = settingsRes.data?.[0] || null
    const rawFields = settings?.custom_fields
    const customFields: Record<string, any> =
      rawFields && typeof rawFields === "object" && !Array.isArray(rawFields)
        ? rawFields
        : {}
    const saved = (customFields.website_config as FestivalWebsiteConfig) || null
    const webConfig = normalizeWebsiteConfig(saved, fest, settings)

    return {
      success: true,
      data: {
        festival: fest,
        settings,
        config: webConfig,
      },
    }
  } catch (err: any) {
    return { error: err.message || "Failed to fetch website builder configuration" }
  }
}

export async function saveFestivalWebsiteConfigAction(festivalId: string, config: FestivalWebsiteConfig) {
  const admin = createAdminClient()
  try {
    // 1. Fetch current settings safely (handling potential multiple rows)
    const { data: settingsRows } = await admin
      .from("festival_settings")
      .select("*")
      .eq("festival_id", festivalId)
      .order("updated_at", { ascending: false })
      .limit(1)

    const currentSettings = settingsRows?.[0] || null
    const rawFields = currentSettings?.custom_fields
    const customFields: Record<string, any> =
      rawFields && typeof rawFields === "object" && !Array.isArray(rawFields)
        ? { ...rawFields }
        : {}

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

    // 2. Update all festival_settings rows for this festival_id
    const { data: updatedRows, error: updateErr } = await admin
      .from("festival_settings")
      .update(settingsPayload)
      .eq("festival_id", festivalId)
      .select("id")

    if (updateErr) return { error: updateErr.message }

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertErr } = await admin
        .from("festival_settings")
        .insert(settingsPayload)
      if (insertErr) return { error: insertErr.message }
    }

    // 3. Update festival basics if provided (safely caught)
    const updatePayload: any = {}
    if (config.heroTitle?.trim()) updatePayload.name = config.heroTitle.trim()
    if (config.heroSubtitle) updatePayload.description = config.heroSubtitle
    if (config.logoUrl !== undefined) updatePayload.logo_url = config.logoUrl
    if (config.bannerUrl !== undefined) updatePayload.banner_url = config.bannerUrl

    if (Object.keys(updatePayload).length > 0) {
      try {
        const { error: festErr } = await admin.from("festivals").update(updatePayload).eq("id", festivalId)
        if (festErr) console.warn("Festivals table update warning:", festErr.message)
      } catch (fErr) {
        console.warn("Festivals table update exception:", fErr)
      }
    }

    return { success: true, message: "FesPro Studio design published to live site!" }
  } catch (err: any) {
    console.error("saveFestivalWebsiteConfigAction error:", err)
    return { error: err.message || "Failed to save website configuration" }
  }
}
