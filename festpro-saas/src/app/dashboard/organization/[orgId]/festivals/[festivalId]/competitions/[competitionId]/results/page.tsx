"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getResults, processResults } from "@/lib/actions/judging/approval"
import type { ResultProcessing } from "@/types/judging"
import { Loader2, RefreshCw, Trophy, Medal, Award } from "lucide-react"

export default function CompetitionResultsPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const [results, setResults] = useState<ResultProcessing[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getResults(competitionId)
    setResults(res.data || [])
    setLoading(false)
  }, [competitionId])

  useEffect(() => { load() }, [load])

  const handleProcess = async () => {
    setProcessing(true)
    const res = await processResults(competitionId)
    if (res.error) toast.error(res.error); else { toast.success(`Processed ${res.processed} results`); load() }
    setProcessing(false)
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />
    return null
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="text-sm text-gray-500 mt-1">Final standings for this competition.</p>
        </div>
        <Button onClick={handleProcess} disabled={processing}>
          {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          Process
        </Button>
      </div>

      {results.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No results yet. Process results to generate rankings.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Rankings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
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
                  {r.is_winner && <span className="text-xs text-green-600 block">Winner</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
