"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Trophy, Medal, Loader2 } from "lucide-react"

export default function MobileResults() {
  const [loading] = useState(false)
  const [results] = useState<any[]>([])
  const [search, setSearch] = useState("")

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Results</h1><Trophy className="h-5 w-5 text-amber-400" /></div>
      <p className="text-sm text-gray-500">Live competition results</p>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search competitions..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      {results.length === 0 && (
        <Card><CardContent className="p-6 text-center"><Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No results published yet. Sync to see the latest results.</p>
        </CardContent></Card>
      )}
      {results.filter(r => !search || r.competition_name?.toLowerCase().includes(search.toLowerCase())).map((r: any) => (
        <Card key={r.id}><CardContent className="p-4"><div className="flex items-center gap-3">
          <Medal className={`h-6 w-6 ${r.rank === 1 ? "text-amber-400" : r.rank === 2 ? "text-gray-400" : r.rank === 3 ? "text-orange-400" : "text-gray-300"}`} />
          <div className="flex-1"><p className="font-semibold text-sm">{r.participant_name}</p><p className="text-xs text-gray-500">{r.competition_name} · Rank #{r.rank}</p></div>
          <span className="text-lg font-bold text-indigo-600">{r.score}</span></div>
        </CardContent></Card>
      ))}
    </div>
  )
}
