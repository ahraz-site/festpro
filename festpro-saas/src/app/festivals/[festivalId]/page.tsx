"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import FestivalSiteRenderer from "@/components/studio/FestivalSiteRenderer"
import {
  getPublicResults,
  getPublicTeamPoints,
  getPublicSchedules,
  getPublicStats,
  getPublicFestivalInfo,
} from "@/lib/actions/certificate"

export default function PublicFestivalPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [festival, setFestival] = useState<any>(null)
  const [festivalName, setFestivalName] = useState<string>("Festival Portal")
  const [results, setResults] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [stats, setStats] = useState({ competitionsCount: 0, participantsCount: 0, stagesCount: 0 })

  useEffect(() => {
    if (!festivalId) {
      setLoading(false)
      return
    }

    let active = true
    const cleanName = festivalId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    setFestivalName(cleanName.includes("Fest") ? cleanName : `${cleanName} Festival`)

    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false)
    }, 4500)

    Promise.allSettled([
      getPublicFestivalInfo(festivalId),
      getPublicResults(festivalId),
      getPublicTeamPoints(festivalId),
      getPublicSchedules(festivalId),
      getPublicStats(festivalId),
    ])
      .then(([fRes, rRes, tRes, sRes, stRes]) => {
        if (!active) return
        if (fRes.status === "fulfilled" && fRes.value?.data) {
          const fest = fRes.value.data
          setFestival(fest)
          if (fest.name) setFestivalName(fest.name)
          const slug =
            fest.short_name?.toLowerCase() ||
            fest.code?.toLowerCase() ||
            (fest.name ? fest.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "")
          if (slug && typeof window !== "undefined") {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(festivalId)
            const host = window.location.hostname
            if (host.includes("ahraz.site") && isUuid) {
              window.location.replace(`https://${slug}.ahraz.site`)
            }
          }
        }
        if (rRes.status === "fulfilled" && rRes.value?.data) setResults(rRes.value.data)
        if (tRes.status === "fulfilled" && tRes.value?.data) setTeamPoints(tRes.value.data)
        if (sRes.status === "fulfilled" && sRes.value?.data) setSchedules(sRes.value.data)
        if (stRes.status === "fulfilled" && stRes.value?.data) setStats(stRes.value.data)
      })
      .finally(() => {
        clearTimeout(safetyTimer)
        if (active) setLoading(false)
      })

    return () => {
      active = false
      clearTimeout(safetyTimer)
    }
  }, [festivalId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="font-bold text-sm text-slate-300">Loading festival portal...</span>
        </div>
      </div>
    )
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
