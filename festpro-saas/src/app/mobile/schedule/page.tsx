"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react"

export default function MobileSchedule() {
  const [loading] = useState(false)
  const [schedules] = useState<any[]>([])

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Schedule</h1><Calendar className="h-5 w-5 text-gray-400" /></div>
      <p className="text-sm text-gray-500">Today&apos;s festival schedule</p>
      {schedules.length === 0 && (
        <Card><CardContent className="p-6 text-center"><Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No schedules loaded yet. Sync your schedule data to view it here.</p>
        </CardContent></Card>
      )}
      {schedules.map((s: any) => (
        <Card key={s.id}><CardContent className="p-4"><div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><Calendar className="h-5 w-5 text-indigo-600" /></div>
          <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{s.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.start_time}</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location || "—"}</span></div></div>
        </div></CardContent></Card>
      ))}
    </div>
  )
}
