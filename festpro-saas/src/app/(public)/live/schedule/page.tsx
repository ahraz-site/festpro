import { createAdminClient } from "@/lib/supabase/admin"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export default async function LiveSchedulePage() {
  const supabase = createAdminClient()
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, stage:stages(name), competition:competitions(name, category)")
    .order("start_time")
    .limit(100)

  const groupedByDate = (sessions || []).reduce((acc: Record<string, any[]>, s) => {
    const date = new Date(s.start_time).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(s)
    return acc
  }, {})

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Full Schedule</h1>
          <p className="text-white/80">Complete competition schedule.</p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p>No schedule published yet</p>
          </div>
        ) : Object.entries(groupedByDate).map(([date, dateSessions]) => (
          <div key={date} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" /> {date}
            </h2>
            <div className="space-y-3">
              {dateSessions.map(s => (
                <div key={s.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold text-indigo-600">{new Date(s.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    {s.end_time && <p className="text-xs text-gray-400">{new Date(s.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{s.competition?.name || s.name || "Session"}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {s.stage?.name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.stage.name}</span>}
                      {s.competition?.category && <span>{s.competition.category}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
