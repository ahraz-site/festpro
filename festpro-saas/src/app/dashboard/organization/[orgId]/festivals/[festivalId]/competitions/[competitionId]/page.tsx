"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCompetition } from "@/lib/actions/competition"
import { COMPETITION_STATUSES } from "@/config/competition"
import type { Competition } from "@/types/competition"
import {
  Trophy, Edit, ArrowLeft, Users, LayoutGrid, BookOpen,
  Package, MapPin, Shield, Calendar, ClipboardList, Loader2
} from "lucide-react"

export default function CompetitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const competitionId = params.competitionId as string
  const [comp, setComp] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getCompetition(competitionId)
      setComp(data as Competition)
      setLoading(false)
    }
    load()
  }, [competitionId])

  if (loading) return <div className="text-center py-12 text-gray-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
  if (!comp) return <div className="text-center py-12 text-gray-500">Competition not found.</div>

  const statusInfo = COMPETITION_STATUSES.find((s) => s.value === comp.status)
  const basePath = `/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${competitionId}`

  const tabs = [
    { label: "Rounds", href: `${basePath}/rounds`, icon: LayoutGrid, count: (comp as any).rounds?.length },
    { label: "Rules", href: `${basePath}/rules`, icon: BookOpen },
    { label: "Materials", href: `${basePath}/materials`, icon: Package },
    { label: "Stage Assignment", href: `${basePath}/stages`, icon: MapPin, count: (comp as any).stage_assignments?.length },
    { label: "Judges", href: `${basePath}/judges`, icon: Shield, count: (comp as any).judge_assignments?.length },
    { label: "Schedule", href: `${basePath}/schedule`, icon: Calendar },
    { label: "Eligibility", href: `${basePath}/eligibility`, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold" style={{ backgroundColor: (comp as any).category?.color || "#4F46E5" }}>
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{comp.name}</h1>
              {statusInfo && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {(comp as any).category?.name && <span>{(comp as any).category.name}</span>}
              {comp.code && <span>#{comp.code}</span>}
              <span className="capitalize">{comp.competition_type}</span>
            </div>
          </div>
        </div>
        <Link href={`${basePath}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900">{comp.duration_minutes}min</p><p className="text-xs text-gray-500">Duration</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900">{comp.max_participants}</p><p className="text-xs text-gray-500">Max Participants</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900">{comp.judge_count}</p><p className="text-xs text-gray-500">Judges</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900">{comp.round_count}</p><p className="text-xs text-gray-500">Rounds</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900 capitalize">{comp.age_group.replace("_", " ")}</p><p className="text-xs text-gray-500">Age Group</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-gray-900 capitalize">{comp.gender_restriction}</p><p className="text-xs text-gray-500">Gender</p></CardContent></Card>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Link key={tab.label} href={tab.href} className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">{tab.label}</span>
              {tab.count !== undefined && <span className="text-xs text-gray-400 ml-auto">{tab.count}</span>}
            </Link>
          )
        })}
      </div>

      {comp.description && (
        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-gray-600">{comp.description}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{comp.competition_type}</span></div>
          <div><span className="text-gray-500">Language:</span> <span className="font-medium capitalize">{comp.language}</span></div>
          <div><span className="text-gray-500">Scoring:</span> <span className="font-medium capitalize">{comp.scoring_method}</span></div>
          <div><span className="text-gray-500">Max Score:</span> <span className="font-medium">{comp.max_score}</span></div>
          <div><span className="text-gray-500">Team Event:</span> <span className="font-medium">{comp.is_team_event ? "Yes" : "No"}</span></div>
          <div><span className="text-gray-500">Stage Required:</span> <span className="font-medium">{comp.stage_required ? "Yes" : "No"}</span></div>
        </CardContent>
      </Card>
    </div>
  )
}
