"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getChampionship, calculateChampionship, publishChampionship } from "@/lib/actions/team-points"
import { MEDAL_EMOJIS } from "@/config/result"
import type { OverallChampionship } from "@/types/result"
import { Loader2, Trophy, Medal, Award, Crown, RefreshCw, Save } from "lucide-react"

export default function ChampionshipPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [data, setData] = useState<OverallChampionship[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState("overall")

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getChampionship(festivalId, type)
    setData(res.data || []); setLoading(false)
  }, [festivalId, type])

  useEffect(() => { load() }, [load])

  const handleCalculate = async () => {
    const res = await calculateChampionship(festivalId)
    if (res.error) toast.error(res.error); else { toast.success("Championship calculated"); load() }
  }

  const handlePublish = async () => {
    const res = await publishChampionship(festivalId)
    if (res.error) toast.error(res.error); else { toast.success("Published"); load() }
  }

  const types = [
    { value: "overall", label: "Overall", icon: Crown },
    { value: "unit", label: "Unit", icon: Trophy },
    { value: "sector", label: "Sector", icon: Medal },
    { value: "division", label: "Division", icon: Award },
  ]

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overall Championship</h1>
          <p className="text-sm text-gray-500 mt-1">Overall champion, runner-up, and category standings.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCalculate}><RefreshCw className="h-4 w-4 mr-1" /> Calculate</Button>
          <Button variant="outline" className="text-green-600" onClick={handlePublish}><Save className="h-4 w-4 mr-1" /> Publish</Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {types.map(t => (
          <Button key={t.value} variant={type === t.value ? "default" : "outline"} size="sm" onClick={() => setType(t.value)}>
            <t.icon className="h-4 w-4 mr-1" /> {t.label}
          </Button>
        ))}
      </div>

      {data.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No championship data. Click Calculate.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {data.map((c, i) => (
            <Card key={c.id} className={`${i === 0 ? "ring-2 ring-yellow-400" : i === 1 ? "ring-2 ring-gray-300" : ""}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center w-10">
                      {c.is_champion ? <Crown className="h-7 w-7 text-yellow-500" /> : c.is_runner_up ? <Medal className="h-6 w-6 text-gray-400" /> : i === 2 ? <Award className="h-6 w-6 text-orange-400" /> : <span className="text-lg font-mono text-gray-400">#{c.rank}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{c.entity_name || c.entity_id.slice(0, 16)}</p>
                      <p className="text-xs text-gray-400 capitalize">{c.championship_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{c.total_points}</p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span>{MEDAL_EMOJIS.gold} {c.medals_gold}</span>
                      <span>{MEDAL_EMOJIS.silver} {c.medals_silver}</span>
                      <span>{MEDAL_EMOJIS.bronze} {c.medals_bronze}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{c.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
