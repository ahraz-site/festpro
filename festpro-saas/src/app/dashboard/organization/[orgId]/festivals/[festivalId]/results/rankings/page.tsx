"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getRankings, calculateTeamRankings } from "@/lib/actions/result"
import { getCompetitions } from "@/lib/actions/competition"
import { RANKING_ENTITY_TYPES } from "@/config/result"
import type { ResultRanking } from "@/types/result"
import type { Competition } from "@/types/competition"
import { Loader2, Trophy, Medal, Award, RefreshCw, Users, Building2, User } from "lucide-react"

export default function RankingsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [rankings, setRankings] = useState<ResultRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [selComp, setSelComp] = useState("")
  const [entityFilter, setEntityFilter] = useState("")

  const loadComps = useCallback(async () => {
    const res = await getCompetitions(festivalId)
    setCompetitions(res || [])
  }, [festivalId])

  const loadRankings = useCallback(async () => {
    setLoading(true)
    const res = await getRankings(festivalId, entityFilter || undefined)
    setRankings(res.data || [])
    setLoading(false)
  }, [festivalId, entityFilter])

  useEffect(() => { loadComps() }, [loadComps])
  useEffect(() => { loadRankings() }, [loadRankings])

  const handleCalculate = async () => {
    if (!selComp) { toast.error("Select a competition"); return }
    const res = await calculateTeamRankings(selComp)
    if (res.error) toast.error(res.error); else { toast.success(`Ranked ${res.processed} teams`); loadRankings() }
  }

  const entityIcon = (type: string) => {
    switch (type) {
      case "team": return <Users className="h-4 w-4" />
      case "institution": return <Building2 className="h-4 w-4" />
      case "group": return <Users className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rankings</h1>
        <p className="text-sm text-gray-500 mt-1">Team, institution, and group rankings calculated from results.</p>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <Select
            options={competitions.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select competition"
            value={selComp}
            onChange={e => setSelComp(e.target.value)}
            className="flex-1"
          />
          <Select
            options={[{ value: "", label: "All Types" }, ...RANKING_ENTITY_TYPES.map(e => ({ value: e.value, label: e.label }))]}
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
          />
          <Button onClick={handleCalculate} disabled={!selComp}>
            <RefreshCw className="h-4 w-4 mr-1" /> Calculate
          </Button>
        </CardContent>
      </Card>

      {rankings.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No rankings yet. Select a competition and calculate rankings.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Standings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rankings.map((r, i) => (
              <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg ${i < 3 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {r.rank === 1 ? <Trophy className="h-5 w-5 text-yellow-500 mx-auto" /> :
                     r.rank === 2 ? <Medal className="h-5 w-5 text-gray-400 mx-auto" /> :
                     r.rank === 3 ? <Award className="h-5 w-5 text-orange-400 mx-auto" /> :
                     <span className="font-mono text-gray-400">{r.rank}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {entityIcon(r.entity_type)}
                    <span className="font-medium">{r.entity_name || r.entity_id.slice(0, 8)}</span>
                    <span className="text-xs text-gray-400 capitalize">({r.entity_type})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold">{r.total_points} pts</span>
                  <span className="text-yellow-600">🥇 {r.medals_gold}</span>
                  <span className="text-gray-400">🥈 {r.medals_silver}</span>
                  <span className="text-orange-400">🥉 {r.medals_bronze}</span>
                  <span className="text-gray-400">{r.participation_count} entries</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === "published" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
