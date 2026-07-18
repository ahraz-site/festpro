"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { publicSearch } from "@/lib/actions/public"
import { Loader2, Search, User, Trophy, Award, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query) return
    setLoading(true)
    const res = await publicSearch("", query, type || undefined)
    setResults(res.data); setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Search</h1>
      <p className="text-gray-500 text-center mb-8">Search participants, competitions, and results.</p>

      <div className="flex gap-2 mb-8">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="flex-1"
          onKeyDown={e => e.key === "Enter" && handleSearch()} />
        <Select options={[{ value: "", label: "All" }, { value: "participants", label: "Participants" }, { value: "competitions", label: "Competitions" }, { value: "results", label: "Results" }]}
          value={type} onChange={e => setType(e.target.value)} className="w-36" />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          {results.participants?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><User className="h-5 w-5 text-indigo-500" /> Participants</h2>
              <div className="space-y-2">
                {results.participants.map((p: any) => (
                  <Card key={p.id}>
                    <CardContent className="pt-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-gray-500">{p.institution_name} · {p.participant_code}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.competitions?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Trophy className="h-5 w-5 text-indigo-500" /> Competitions</h2>
              <div className="space-y-2">
                {results.competitions.map((c: any) => (
                  <Card key={c.id}>
                    <CardContent className="pt-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.category} · {c.code}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.results?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-indigo-500" /> Results</h2>
              <div className="space-y-2">
                {results.results.map((r: any) => (
                  <Card key={r.id}>
                    <CardContent className="pt-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{r.participant?.first_name} {r.participant?.last_name}</p>
                        <p className="text-xs text-gray-500">{r.competition?.name} · Rank: {r.rank} · Score: {r.score}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!results.participants?.length && !results.competitions?.length && !results.results?.length && (
            <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
