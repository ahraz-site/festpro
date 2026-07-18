import { createAdminClient } from "@/lib/supabase/admin"
import { Trophy, Medal, Award, Crown, Building2 } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = createAdminClient()
  const { data: results } = await supabase
    .from("results")
    .select("rank, participant:participants(first_name, last_name, institution_name)")
    .not("rank", "is", null)
    .limit(500) as any

  const pointsMap: Record<string, { name: string; points: number; gold: number; silver: number; bronze: number }> = {}

  ;(results || []).forEach((r: any) => {
    const p = Array.isArray(r.participant) ? r.participant[0] : r.participant
    const inst = p?.institution_name || "Independent"
    if (!pointsMap[inst]) pointsMap[inst] = { name: inst, points: 0, gold: 0, silver: 0, bronze: 0 }
    if (r.rank === 1) { pointsMap[inst].points += 10; pointsMap[inst].gold++ }
    else if (r.rank === 2) { pointsMap[inst].points += 7; pointsMap[inst].silver++ }
    else if (r.rank === 3) { pointsMap[inst].points += 5; pointsMap[inst].bronze++ }
    else pointsMap[inst].points += Math.max(0, 10 - r.rank)
  })

  const sorted = Object.values(pointsMap).sort((a, b) => b.points - a.points).slice(0, 20)

  const rankBadge = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-yellow-500" />
    if (i === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (i === 2) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-gray-400 w-5 text-center">{i + 1}</span>
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Overall Leaderboard</h1>
          <p className="text-white/80">Championship standings across all competitions.</p>
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4">
        {sorted.length === 0 ? (
          <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <p>No leaderboard data available yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((entry, i) => (
              <div key={entry.name} className={`flex items-center gap-4 p-4 rounded-xl ${i < 3 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200" : "bg-white border border-gray-200"}`}>
                <div className="w-10 text-center">{rankBadge(i)}</div>
                <Building2 className={`h-5 w-5 ${i < 3 ? "text-amber-500" : "text-gray-400"}`} />
                <div className="flex-1">
                  <p className={`font-semibold ${i < 3 ? "text-gray-900" : "text-gray-700"}`}>{entry.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="text-yellow-600">Gold: {entry.gold}</span>
                    <span className="text-gray-400">Silver: {entry.silver}</span>
                    <span className="text-amber-600">Bronze: {entry.bronze}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${i < 3 ? "text-amber-600" : "text-gray-700"}`}>{entry.points}</p>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
