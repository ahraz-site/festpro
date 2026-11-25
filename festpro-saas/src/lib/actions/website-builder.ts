"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  getDefaultWebsiteConfig,
  type FestivalWebsiteConfig,
} from "@/types/website-studio"

export type { FestivalWebsiteConfig }

export async function getFestivalWebsiteConfigAction(festivalId: string) {
  const admin = createAdminClient()
  try {
    const [festRes, settingsRes] = await Promise.all([
      admin.from("festivals").select("*").eq("id", festivalId).maybeSingle(),
      admin.from("festival_settings").select("*").eq("festival_id", festivalId).maybeSingle(),
    ])

    const fest = festRes.data
    const settings = settingsRes.data
    const defaults = getDefaultWebsiteConfig(fest, settings)
    const customFields = (settings?.custom_fields as any) || {}
    const saved = (customFields.website_config as FestivalWebsiteConfig) || {}

    // Deep-merge saved config over defaults so newly added studio modules always have valid defaults
    const webConfig: FestivalWebsiteConfig = {
      ...defaults,
      ...saved,
      socialLinks: { ...defaults.socialLinks, ...(saved.socialLinks || {}) },
      navPages: { ...defaults.navPages, ...(saved.navPages || {}) },
      heroConfig: { ...defaults.heroConfig, ...(saved.heroConfig || {}) },
      headerConfig: { ...defaults.headerConfig, ...(saved.headerConfig || {}) },
      footerConfig: { ...defaults.footerConfig, ...(saved.footerConfig || {}) },
      globalDesign: {
        palette: {
          ...defaults.globalDesign!.palette,
          ...(saved.globalDesign?.palette || {}),
          ...(saved.accentColor && !saved.globalDesign?.palette?.primary
            ? { primary: saved.accentColor }
            : {}),
          ...(saved.themeMode && !saved.globalDesign?.palette?.themeMode
            ? { themeMode: saved.themeMode }
            : {}),
        },
        typography: {
          ...defaults.globalDesign!.typography,
          ...(saved.globalDesign?.typography || {}),
        },
        shape: {
          ...defaults.globalDesign!.shape,
          ...(saved.globalDesign?.shape || {}),
        },
        savedCustomPalettes: saved.globalDesign?.savedCustomPalettes || [],
      },
      motionStudio: { ...defaults.motionStudio!, ...(saved.motionStudio || {}) },
      stickers: saved.stickers || defaults.stickers,
      sections: saved.sections && saved.sections.length > 0 ? saved.sections : defaults.sections,
      galleryStudio: { ...defaults.galleryStudio!, ...(saved.galleryStudio || {}) },
      videoStudio: {
        layout: saved.videoStudio?.layout || defaults.videoStudio!.layout,
        videos:
          saved.videoStudio?.videos && saved.videoStudio.videos.length > 0
            ? saved.videoStudio.videos
            : saved.liveStreamUrl
            ? [
                {
                  id: "v-live",
                  title: "Main Stage Live Stream",
                  platform: "youtube",
                  url: saved.liveStreamUrl,
                  aspectRatio: "16:9",
                  category: "Live",
                  featured: true,
                },
              ]
            : defaults.videoStudio!.videos,
      },
      teamMembers: saved.teamMembers || defaults.teamMembers,
      popupBuilder: { ...defaults.popupBuilder!, ...(saved.popupBuilder || {}) },
      seoAndAdvanced: { ...defaults.seoAndAdvanced!, ...(saved.seoAndAdvanced || {}) },
      gallery: saved.gallery || defaults.gallery,
      news: saved.news || defaults.news,
    }

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
    // 1. Fetch current settings
    const { data: currentSettings } = await admin
      .from("festival_settings")
      .select("*")
      .eq("festival_id", festivalId)
      .maybeSingle()

    const customFields = (currentSettings?.custom_fields as any) || {}
    customFields.website_config = config

    const primaryColor = config.globalDesign?.palette?.primary || config.accentColor || "#4F46E5"
    const isDark = (config.globalDesign?.palette?.themeMode || config.themeMode || "dark") !== "light"

    // 2. Upsert settings
    await admin.from("festival_settings").upsert({
      festival_id: festivalId,
      theme_color: primaryColor,
      festival_color: primaryColor,
      dark_mode: isDark,
      custom_fields: customFields,
      updated_at: new Date().toISOString(),
    })

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
