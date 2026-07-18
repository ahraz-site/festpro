"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getPublishQueue, schedulePublish, cancelScheduledPublish } from "@/lib/actions/result"
import { getCompetitions } from "@/lib/actions/competition"
import type { Competition } from "@/types/competition"
import { Loader2, Calendar, Clock, Trash2, CheckCircle } from "lucide-react"

export default function PublishQueuePage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [queue, setQueue] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selComp, setSelComp] = useState("")
  const [schedDate, setSchedDate] = useState("")

  const load = useCallback(async () => {
    const [qRes, cRes] = await Promise.all([
      getPublishQueue(festivalId),
      getCompetitions(festivalId),
    ])
    setQueue(qRes.data || [])
    setCompetitions(cRes || [])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSchedule = async () => {
    if (!selComp || !schedDate) { toast.error("Select competition and date"); return }
    const res = await schedulePublish(selComp, festivalId, schedDate)
    if (res.error) toast.error(res.error); else { toast.success("Publish scheduled"); load(); setSelComp(""); setSchedDate("") }
  }

  const handleCancel = async (id: string) => {
    const res = await cancelScheduledPublish(id)
    if (res.error) toast.error(res.error); else { toast.success("Scheduled publish cancelled"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publish Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Schedule and manage result publication.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Schedule Publish</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select
            options={competitions.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select competition"
            value={selComp}
            onChange={e => setSelComp(e.target.value)}
          />
          <div className="flex gap-2">
            <Input type="datetime-local" value={schedDate} onChange={e => setSchedDate(e.target.value)} className="flex-1" />
            <Button onClick={handleSchedule} disabled={!selComp || !schedDate}>
              <Calendar className="h-4 w-4 mr-1" /> Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Scheduled Publications</CardTitle></CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No scheduled publications</p>
          ) : (
            <div className="space-y-2">
              {queue.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{q.competition?.name}</p>
                      <p className="text-xs text-gray-400">
                        Scheduled: {q.scheduled_at ? new Date(q.scheduled_at).toLocaleString() : "Immediate"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {q.published_at && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Published {new Date(q.published_at).toLocaleString()}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      q.status === "published" ? "bg-green-100 text-green-700" :
                      q.status === "processing" ? "bg-blue-100 text-blue-700" :
                      q.status === "failed" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{q.status}</span>
                    {q.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(q.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
