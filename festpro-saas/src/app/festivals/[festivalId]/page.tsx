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

    const cleanName = festivalId
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    setFestivalName(cleanName.includes("Fest") ? cleanName : `${cleanName} Festival`)

    getPublicFestivalInfo(festivalId)
      .then((fRes) => {
        if (fRes.data) {
          setFestival(fRes.data)
          if (fRes.data.name) setFestivalName(fRes.data.name)

          const fest = fRes.data
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
      })
      .catch(() => {})

    Promise.all([
      getPublicResults(festivalId),
      getPublicTeamPoints(festivalId),
      getPublicSchedules(festivalId),
      getPublicStats(festivalId),
    ])
      .then(([rRes, tRes, sRes, stRes]) => {
        setResults(rRes.data || [])
        setTeamPoints(tRes.data || [])
        setSchedules(sRes.data || [])
        if (stRes.data) setStats(stRes.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
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

  const customSettings = festival?.settings?.[0] || festival?.settings || {}
  const customFields = (customSettings?.custom_fields as any) || {}
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
