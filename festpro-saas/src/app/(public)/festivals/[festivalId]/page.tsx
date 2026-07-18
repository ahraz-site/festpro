"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicResults, getPublicTeamPoints, getPublicChampionship } from "@/lib/actions/certificate"
import { Trophy, Medal, Award, Loader2, Search } from "lucide-react"

export default function PublicResultsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [results, setResults] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [championship, setChampionship] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("results")
  const [search, setSearch] = useState("")

  useEffect(() => {
    Promise.all([
      getPublicResults(festivalId),
      getPublicTeamPoints(festivalId),
      getPublicChampionship(festivalId),
    ]).then(([rRes, tRes, cRes]) => {
      setResults(rRes.data || []); setTeamPoints(tRes.data || []); setChampionship(cRes.data || []); setLoading(false)
    })
  }, [festivalId])

  const filtered = results.filter(r =>
    !search || r.participant?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.participant?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.participant?.participant_id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>

  const tabs = [
    { key: "results", label: "Results", count: results.length },
    { key: "teams", label: "Team Standings", count: teamPoints.length },
    { key: "championship", label: "Championship", count: championship.length },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Live Results</h1>
          <p className="text-gray-500 mt-1">Real-time competition results and standings</p>
        </div>

        <div className="flex gap-2 justify-center">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
            >{t.label} ({t.count})</button>
          ))}
        </div>

        {tab === "results" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm" />
            </div>
            {filtered.map((r, i) => (
              <Card key={r.id} className={`${i < 3 ? "border-l-4 border-yellow-400" : ""}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 text-center">
                        {r.rank === 1 ? <Trophy className="h-6 w-6 text-yellow-500 mx-auto" /> :
                         r.rank === 2 ? <Medal className="h-6 w-6 text-gray-400 mx-auto" /> :
                         r.rank === 3 ? <Award className="h-6 w-6 text-orange-400 mx-auto" /> :
                         <span className="text-lg font-mono text-gray-400">#{r.rank}</span>}
                      </div>
                      <div>
                        <p className="font-semibold">{r.participant?.first_name} {r.participant?.last_name}</p>
                        <p className="text-xs text-gray-400">{r.participant?.participant_id} | {r.participant?.unit || "—"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{r.final_score?.toFixed(2)}</p>
                      {r.grade && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{r.grade}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "teams" && (
          <div className="space-y-3">
            {teamPoints.map((t, i) => (
              <Card key={t.id} className={`${i < 3 ? "border-l-4 border-yellow-400" : ""}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold w-8 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${t.rank}`}</span>
                      <div>
                        <p className="font-semibold">{t.entity_name || t.entity_id.slice(0, 12)}</p>
                        <p className="text-xs text-gray-400 capitalize">{t.entity_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-lg">{t.total_points} pts</span>
                      <span>🥇 {t.medals_gold}</span>
                      <span>🥈 {t.medals_silver}</span>
                      <span>🥉 {t.medals_bronze}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "championship" && (
          <div className="space-y-3">
            {championship.map((c, i) => (
              <Card key={c.id} className={`${i === 0 ? "ring-2 ring-yellow-400" : ""}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${c.rank}`}</div>
                      <div>
                        <p className="font-semibold text-lg">{c.entity_name || c.entity_id.slice(0, 16)}</p>
                        <p className="text-xs text-gray-400 capitalize">{c.championship_type} champion</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{c.total_points}</p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
