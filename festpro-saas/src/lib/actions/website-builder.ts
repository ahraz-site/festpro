"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export interface FestivalWebsiteConfig {
  heroTitle?: string
  heroSubtitle?: string
  bannerUrl?: string
  logoUrl?: string
  accentColor?: string
  themeMode?: "dark" | "light"
  liveStreamUrl?: string
  venueCampus?: string
  helpdeskPhone?: string
  helpdeskEmail?: string
  socialLinks?: {
    instagram?: string
    youtube?: string
    facebook?: string
    whatsapp?: string
    twitter?: string
  }
  navPages?: {
    showOverview?: boolean
    showResults?: boolean
    showSchedule?: boolean
    showLeaderboard?: boolean
    showGallery?: boolean
    showVideos?: boolean
    showNews?: boolean
  }
  gallery?: Array<{ id: string; title: string; url: string; category?: string }>
  news?: Array<{ id: string; title: string; date: string; content: string; badge?: string }>
}

export async function getFestivalWebsiteConfigAction(festivalId: string) {
  const admin = createAdminClient()
  try {
    const [festRes, settingsRes] = await Promise.all([
      admin.from("festivals").select("*").eq("id", festivalId).maybeSingle(),
      admin.from("festival_settings").select("*").eq("festival_id", festivalId).maybeSingle(),
    ])

    const fest = festRes.data
    const settings = settingsRes.data
    const customFields = (settings?.custom_fields as any) || {}
    const webConfig: FestivalWebsiteConfig = customFields.website_config || {
      heroTitle: fest?.name || "Official Festival Site",
      heroSubtitle: fest?.description || "Live festival competitions, stage schedules & instant results.",
      bannerUrl: fest?.banner_url || "",
      logoUrl: fest?.logo_url || "",
      accentColor: settings?.theme_color || "#4F46E5",
      themeMode: settings?.dark_mode ? "dark" : "dark",
      venueCampus: "Main Auditorium Campus",
      helpdeskPhone: "+91 98765 43210",
      helpdeskEmail: "contact@festportal.com",
      socialLinks: {
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
        facebook: "https://facebook.com",
        whatsapp: "https://wa.me/919876543210",
        twitter: "https://x.com",
      },
      navPages: {
        showOverview: true,
        showResults: true,
        showSchedule: true,
        showLeaderboard: true,
        showGallery: true,
        showVideos: true,
        showNews: true,
      },
      gallery: [
        { id: "g1", title: "Inauguration Ceremony", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", category: "Ceremony" },
        { id: "g2", title: "Classical Dance Stage", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80", category: "Stage" },
        { id: "g3", title: "Light Music Band", url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80", category: "Music" },
        { id: "g4", title: "Auditorium Crowd", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", category: "Crowd" },
      ],
      news: [
        { id: "n1", title: "Grand Inauguration Ceremony Begins at Main Stage", date: "Today, 09:00 AM", content: "The cultural fest has been officially inaugurated by the dignitaries. Stage 1 programs are now live.", badge: "Live" },
        { id: "n2", title: "Stage 2 Schedule Updated for Afternoon Competitions", date: "Today, 11:30 AM", content: "Classical solo performances will commence at 02:00 PM on Stage 2. All participants are requested to report 30 minutes prior.", badge: "Schedule" },
      ],
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

    // 2. Upsert settings
    await admin.from("festival_settings").upsert({
      festival_id: festivalId,
      theme_color: config.accentColor || "#4F46E5",
      festival_color: config.accentColor || "#4F46E5",
      dark_mode: config.themeMode !== "light",
      custom_fields: customFields,
      updated_at: new Date().toISOString(),
    })

    // 3. Update festival basics if provided
    const updatePayload: any = {}
    if (config.heroTitle) updatePayload.name = config.heroTitle
    if (config.heroSubtitle) updatePayload.description = config.heroSubtitle
    if (config.logoUrl) updatePayload.logo_url = config.logoUrl
    if (config.bannerUrl) updatePayload.banner_url = config.bannerUrl

    if (Object.keys(updatePayload).length > 0) {
      await admin.from("festivals").update(updatePayload).eq("id", festivalId)
    }

    revalidatePath(`/festivals/${festivalId}`)
    return { success: true, message: "Website layout and details updated successfully!" }
  } catch (err: any) {
    return { error: err.message || "Failed to save website configuration" }
  }
}
