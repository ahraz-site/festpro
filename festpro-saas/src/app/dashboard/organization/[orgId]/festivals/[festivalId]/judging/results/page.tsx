"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getCompetitions } from "@/lib/actions/competition"
import { getResults, processResults } from "@/lib/actions/judging/approval"
import type { ResultProcessing } from "@/types/judging"
import type { Competition } from "@/types/competition"
import { Loader2, Medal, Trophy, RefreshCw, Award } from "lucide-react"

export default function ResultsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [results, setResults] = useState<ResultProcessing[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selComp, setSelComp] = useState("")

  const loadComps = useCallback(async () => {
    const res = await getCompetitions(festivalId)
    setCompetitions(res || [])
  }, [festivalId])

  const loadResults = useCallback(async (compId: string) => {
    setLoading(true)
    const res = await getResults(compId)
    setResults(res.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadComps() }, [loadComps])

  useEffect(() => {
    if (selComp) loadResults(selComp)
    else { setResults([]); setLoading(false) }
  }, [selComp, loadResults])

  const handleProcess = async () => {
    if (!selComp) return
    setProcessing(true)
    const res = await processResults(selComp)
    if (res.error) toast.error(res.error); else { toast.success(`Processed ${res.processed} results`); loadResults(selComp) }
    setProcessing(false)
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="text-sm text-gray-500 mt-1">Process and review competition results.</p>
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
          <Button onClick={handleProcess} disabled={!selComp || processing}>
            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Process Results
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : results.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No results yet. Select a competition and process results.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg ${i < 3 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center">{r.rank ? rankIcon(r.rank) : <span className="text-gray-400 font-mono">{r.rank}</span>}</div>
                    <div>
                      <p className="font-medium">{r.participant?.first_name} {r.participant?.last_name}</p>
                      <p className="text-xs text-gray-400">ID: {r.participant?.participant_id} | Chest: {r.participant?.chest_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{r.final_score?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Weighted: {r.weighted_score?.toFixed(2)}</p>
                    {r.is_tie_broken && <span className="text-xs text-orange-500">Tie broken</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
