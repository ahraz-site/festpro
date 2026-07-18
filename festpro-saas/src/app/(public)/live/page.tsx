import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Trophy, Radio, Clock, Users, ArrowRight, AlertTriangle } from "lucide-react"

export default async function LivePortalPage() {
  const supabase = createAdminClient()
  const { data: liveStages } = await supabase
    .from("live_stage_status")
    .select("*, stage:stages(name), current_competition:competitions(name), current_session:sessions(name)")
    .eq("is_live", true)
    .limit(10)

  const { data: recentResults } = await supabase
    .from("live_results_cache")
    .select("*, competition:competitions(name)")
    .order("generated_at", { ascending: false })
    .limit(10)

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Live Portal</h1>
          <p className="text-white/80">Real-time festival updates, results, and schedules.</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4">
        {/* Live Stages */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Radio className="h-6 w-6 text-red-500 animate-pulse" /> Live Now
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {liveStages && liveStages.length > 0 ? liveStages.map(s => (
            <div key={s.id} className="p-6 rounded-xl border-2 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold text-red-700">LIVE</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{s.stage?.name || "Stage"}</h3>
              {s.current_competition && <p className="text-sm text-gray-600 mt-1">Current: {s.current_competition.name}</p>}
              {s.current_session && <p className="text-sm text-gray-500">Session: {s.current_session.name}</p>}
              {s.queue_count > 0 && <p className="text-sm text-gray-500 mt-2">Queue: {s.queue_count} participants</p>}
              {s.stream_url && (
                <a href={s.stream_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-indigo-600 font-medium hover:underline">
                  Watch Live <ArrowRight className="h-3 w-3" />
                </a>
              )}
            </div>
          )) : (
            <div className="col-span-full p-8 rounded-xl bg-gray-50 text-center text-gray-400">
              <Radio className="h-8 w-8 mx-auto mb-2" />
              <p>No live stages at the moment</p>
            </div>
          )}
        </div>

        {/* Live Results */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" /> Latest Results
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {recentResults && recentResults.length > 0 ? recentResults.map(r => (
            <div key={r.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">{r.competition?.name || "Competition"}</p>
              <p className="text-sm text-gray-500 mt-1">Generated: {new Date(r.generated_at).toLocaleTimeString()}</p>
              {r.cache_data?.results && (
                <div className="mt-2 space-y-1">
                  {(r.cache_data.results as any[]).slice(0, 3).map((res: any, i: number) => (
                    <p key={i} className="text-xs text-gray-600">{i + 1}. {res.participant_name || `Entry #${res.rank}`}</p>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-full p-8 rounded-xl bg-gray-50 text-center text-gray-400">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <p>No results published yet</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/live/schedule" className="p-6 rounded-xl bg-indigo-50 border border-indigo-100 hover:shadow-md transition-all group">
            <Clock className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">Full Schedule</h3>
            <p className="text-sm text-gray-500 mt-1">View complete competition schedule.</p>
          </Link>
          <Link href="/live/results" className="p-6 rounded-xl bg-green-50 border border-green-100 hover:shadow-md transition-all group">
            <Trophy className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600">All Results</h3>
            <p className="text-sm text-gray-500 mt-1">Browse all competition results.</p>
          </Link>
          <Link href="/live/leaderboard" className="p-6 rounded-xl bg-amber-50 border border-amber-100 hover:shadow-md transition-all group">
            <Users className="h-8 w-8 text-amber-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">Leaderboard</h3>
            <p className="text-sm text-gray-500 mt-1">Overall championship standings.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
