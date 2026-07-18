"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getJudgeAvailability, upsertJudgeAvailability } from "@/lib/actions/schedule/announcements"
import { Calendar, Clock, Loader2, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types"

export default function JudgeAvailabilityPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [availability, setAvailability] = useState<any[]>([])
  const [judges, setJudges] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState("")
  const [selJudge, setSelJudge] = useState("")
  const [selDate, setSelDate] = useState("")
  const [selStart, setSelStart] = useState("09:00")
  const [selEnd, setSelEnd] = useState("17:00")
  const [selStatus, setSelStatus] = useState("available")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [aRes, pRes] = await Promise.all([
        getJudgeAvailability(festivalId, dateFilter || undefined),
        supabase.from("profiles").select("*"),
      ])
      setAvailability(aRes.data as any[])
      setJudges(pRes.data as Profile[] || [])
      setLoading(false)
    }
    load()
  }, [festivalId, dateFilter])

  const handleUpsert = async () => {
    if (!selJudge || !selDate) { toast.error("Select judge and date"); return }
    const res = await upsertJudgeAvailability(festivalId, selJudge, selDate, selStart, selEnd, selStatus)
    if (res.error) toast.error(res.error); else {
      toast.success("Availability saved")
      const refreshed = await getJudgeAvailability(festivalId, dateFilter || undefined)
      setAvailability(refreshed.data as any[])
      setSelJudge(""); setSelDate(""); setSelStart("09:00"); setSelEnd("17:00")
    }
  }

  const judgeProfiles = judges.map(j => ({ value: j.id, label: `${j.first_name} ${j.last_name}` }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Judge Availability</h1>
        <p className="text-sm text-gray-500 mt-1">Manage judge schedules to prevent double booking.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Set Availability</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Judge</label>
              <Select options={judgeProfiles} placeholder="Select judge" value={selJudge} onChange={e => setSelJudge(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date</label>
              <Input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start</label>
              <Input type="time" value={selStart} onChange={e => setSelStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End</label>
              <Input type="time" value={selEnd} onChange={e => setSelEnd(e.target.value)} />
            </div>
            <Button size="sm" onClick={handleUpsert}>Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-auto" />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : availability.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No availability records</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {availability.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.profile?.first_name} {a.profile?.last_name}</p>
                    <p className="text-xs text-gray-500">{a.profile?.email}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />{a.date}
                  </div>
                  <div className="text-sm text-gray-600">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />{a.start_time} - {a.end_time}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "available" ? "bg-green-100 text-green-700" : a.status === "busy" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
