"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  normalizeWebsiteConfig,
  type FestivalWebsiteConfig,
} from "@/types/website-studio"

export type { FestivalWebsiteConfig }

export async function getFestivalWebsiteConfigAction(festivalId: string) {
  if (!festivalId) {
    return {
      success: true,
      data: {
        festival: null,
        settings: null,
        config: normalizeWebsiteConfig(null, null, null),
      },
    }
  }

  let serverClient: any = null
  try {
    serverClient = await createServerClient()
  } catch {}
  let adminClient: any = null
  try {
    adminClient = createAdminClient()
  } catch {}

  try {
    // 1. Fetch festival data (try authenticated client first, then admin fallback)
    let fest: any = null
    if (serverClient) {
      try {
        const { data } = await serverClient.from("festivals").select("*").eq("id", festivalId).limit(1)
        fest = data?.[0] || null
      } catch {}
    }
    if (!fest && adminClient) {
      try {
        const { data } = await adminClient.from("festivals").select("*").eq("id", festivalId).limit(1)
        fest = data?.[0] || null
      } catch {}
    }

    // 2. Fetch festival_settings (authenticated client first, then admin fallback)
    let settings: any = null
    if (serverClient) {
      try {
        const { data } = await serverClient
          .from("festival_settings")
          .select("*")
          .eq("festival_id", festivalId)
          .order("updated_at", { ascending: false })
          .limit(1)
        settings = data?.[0] || null
      } catch {}
    }
    if (!settings && adminClient) {
      try {
        const { data } = await adminClient
          .from("festival_settings")
          .select("*")
          .eq("festival_id", festivalId)
          .order("updated_at", { ascending: false })
          .limit(1)
        settings = data?.[0] || null
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

    // 3. Fallback: Check public_homepage_settings if festival_settings did not have website_config
    if (!saved) {
      const checkHp = async (client: any) => {
        if (!client) return null
        try {
          const { data } = await client.from("public_homepage_settings").select("*").eq("festival_id", festivalId).limit(1)
          const row = data?.[0]
          let hpConfig = row?.seo_meta?.website_config || row?.featured_sections?.[0] || null
          if (typeof hpConfig === "string") {
            try { hpConfig = JSON.parse(hpConfig) } catch {}
          }
          return hpConfig
        } catch {
          return null
        }
      }
      saved = (await checkHp(serverClient)) || (await checkHp(adminClient)) || null
    }

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
    console.error("getFestivalWebsiteConfigAction safe fallback notice:", err)
    return {
      success: true,
      data: {
        festival: null,
        settings: null,
        config: normalizeWebsiteConfig(null, null, null),
      },
    }
  }
}

export async function saveFestivalWebsiteConfigAction(festivalId: string, config: FestivalWebsiteConfig) {
  let serverClient: any = null
  try {
    serverClient = await createServerClient()
  } catch {}
  const adminClient = createAdminClient()
  const clients = [serverClient, adminClient].filter(Boolean)

  try {
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

    // 2. Dual-write to public_homepage_settings (publicly accessible for all site visitors)
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

    // 3. Update festival basic details in festivals table
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
          console.warn("Festivals table update error:", fErr)
        }
      }
    }

    return { success: true, message: "FesPro Studio design published to live site!" }
  } catch (err: any) {
    console.error("saveFestivalWebsiteConfigAction error:", err)
    return { error: err.message || "Failed to save website configuration" }
  }
}
