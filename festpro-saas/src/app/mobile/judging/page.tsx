"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, Loader2 } from "lucide-react"

export default function MobileJudging() {
  const [loading] = useState(false)
  const [assignments] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleScore = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    setSubmitting(false); setSelected(null)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Judging</h1><Star className="h-5 w-5 text-amber-400" /></div>
      <p className="text-sm text-gray-500">Score participant performances</p>
      {assignments.length === 0 && (
        <Card><CardContent className="p-6 text-center"><Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No judging assignments available. Sync to load your assignments.</p>
        </CardContent></Card>
      )}
      {selected && (
        <Card><CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Scoring: {selected.participant_name}</h3>
          {(selected.criteria || []).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between"><span className="text-sm">{c.name}</span>
              <div className="flex gap-1">{[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => setScores({...scores, [c.id]: n})} className={`h-7 w-7 rounded text-xs font-medium ${scores[c.id] === n ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-600"}`}>{n}</button>
              ))}</div></div>
          ))}
          <Button onClick={handleScore} disabled={submitting} className="w-full">{submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Submit Scores</Button>
        </CardContent></Card>
      )}
    </div>
  )
}
