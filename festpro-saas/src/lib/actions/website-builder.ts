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
    const customFields = (settings?.custom_fields as any) || {}
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
      if (error) return { error: error.message }
    } else {
      const { error } = await admin
        .from("festival_settings")
        .insert(settingsPayload)
      if (error) return { error: error.message }
    }

    // 3. Update festival basics if provided
    const updatePayload: any = {}
    if (config.heroTitle) updatePayload.name = config.heroTitle
    if (config.heroSubtitle) updatePayload.description = config.heroSubtitle
    if (config.logoUrl !== undefined) updatePayload.logo_url = config.logoUrl
    if (config.bannerUrl !== undefined) updatePayload.banner_url = config.bannerUrl

    if (Object.keys(updatePayload).length > 0) {
      await admin.from("festivals").update(updatePayload).eq("id", festivalId)
    }

    revalidatePath(`/festivals/${festivalId}`)
    revalidatePath(`/dashboard/organization`)
    return { success: true, message: "FesPro Studio design published to live site!" }
  } catch (err: any) {
    return { error: err.message || "Failed to save website configuration" }
  }
}
