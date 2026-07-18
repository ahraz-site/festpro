import { createAdminClient } from "@/lib/supabase/admin"
import { Trophy, Medal, Award, User } from "lucide-react"

export default async function LiveResultsPage() {
  const supabase = createAdminClient()
  const { data: results } = await supabase
    .from("results")
    .select("*, participant:participants(first_name, last_name, institution_name), competition:competitions(name, category)")
    .order("created_at", { ascending: false })
    .limit(100) as any

  const groupedByCompetition = (results || []).reduce((acc: Record<string, any[]>, r: any) => {
    const key = r.competition?.name || "Unknown"
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {} as Record<string, any[]>)

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />
    return <span className="text-xs text-gray-400">#{rank}</span>
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">All Results</h1>
          <p className="text-white/80">Browse all competition results.</p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4">
        {Object.keys(groupedByCompetition).length === 0 ? (
          <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <p>No results published yet</p>
          </div>
        ) : Object.entries(groupedByCompetition).map(([compName, compResults]: [string, any]) => (
          <div key={compName} className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{compName}</h2>
            <div className="space-y-2">
              {(compResults as any[])
                .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                .map((r: any) => {
                  const p = Array.isArray(r.participant) ? r.participant[0] : r.participant
                  return (
                    <div key={r.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <div className="w-8 text-center">{rankIcon(r.rank)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{p?.first_name} {p?.last_name}</p>
                        {p?.institution_name && <p className="text-xs text-gray-500">{p.institution_name}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-indigo-600">{r.score || r.grade || "-"}</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
