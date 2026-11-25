import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import FestivalSiteRenderer from "@/components/studio/FestivalSiteRenderer"
import {
  getPublicResults,
  getPublicTeamPoints,
  getPublicSchedules,
  getPublicStats,
  getPublicFestivalInfo,
} from "@/lib/actions/certificate"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ festivalId: string }>
}): Promise<Metadata> {
  const { festivalId } = await params
  const res = await getPublicFestivalInfo(festivalId)
  const fest = res?.data
  const title = fest?.name ? `${fest.name} - Official Live Festival Portal` : "Festival Portal"
  const description = fest?.description || "Live scoring, stage events, and real-time announcements."
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: fest?.banner_url ? [fest.banner_url] : [],
    },
  }
}

export default async function PublicFestivalPage({
  params,
}: {
  params: Promise<{ festivalId: string }>
}) {
  const { festivalId } = await params

  if (!festivalId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold">Festival Portal Not Found</h1>
      </div>
    )
  }

  // Fetch all public festival data in parallel directly on the server
  const [fRes, rRes, tRes, sRes, stRes] = await Promise.all([
    getPublicFestivalInfo(festivalId),
    getPublicResults(festivalId),
    getPublicTeamPoints(festivalId),
    getPublicSchedules(festivalId),
    getPublicStats(festivalId),
  ])

  const festival = fRes?.data || null
  const results = rRes?.data || []
  const teamPoints = tRes?.data || []
  const schedules = sRes?.data || []
  const stats = stRes?.data || { competitionsCount: 0, participantsCount: 0, stagesCount: 0 }

  // Redirect UUID links to custom subdomain if applicable
  if (festival) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(festivalId)
    const slug =
      festival.short_name?.toLowerCase() ||
      festival.code?.toLowerCase() ||
      (festival.name ? festival.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "")

    if (isUuid && slug) {
      const headerList = await headers()
      const host = headerList.get("host") || ""
      if (host.includes("ahraz.site") && !host.startsWith(`${slug}.`)) {
        redirect(`https://${slug}.ahraz.site`)
      }
    }
  }

  let customSettings: any = null
  if (Array.isArray(festival?.settings) && festival.settings.length > 0) {
    customSettings =
      festival.settings.find((s: any) => {
        const cf = s?.custom_fields
        return cf && typeof cf === "object" && !Array.isArray(cf) && cf.website_config
      }) || festival.settings[0]
  } else if (festival?.settings && typeof festival.settings === "object") {
    customSettings = festival.settings
  }

  const rawFields = customSettings?.custom_fields
  const customFields: Record<string, any> =
    rawFields && typeof rawFields === "object" && !Array.isArray(rawFields)
      ? rawFields
      : {}
  const webConfig = customFields.website_config || undefined

  const festivalName = festival?.name || (
    festivalId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  )

  if (webConfig && (!webConfig.heroTitle || !webConfig.heroTitle.trim() || webConfig.heroTitle === "Festival Portal")) {
    webConfig.heroTitle = festivalName
  }

  return (
    <FestivalSiteRenderer
      festivalName={festivalName}
      festival={festival}
      config={webConfig}
      results={results}
      teamPoints={teamPoints}
      schedules={schedules}
      stats={stats}
      isEditorMode={false}
    />
  )
}
