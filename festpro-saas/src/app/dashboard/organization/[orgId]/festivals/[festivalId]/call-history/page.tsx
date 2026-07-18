"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { getCallHistory } from "@/lib/actions/schedule/live"
import { getFestivalStages } from "@/lib/actions/festival"
import { CALL_TYPES } from "@/config/schedule"
import type { CallHistory } from "@/types/schedule"
import type { FestivalStage } from "@/types/festival"
import { Phone, Loader2, User } from "lucide-react"

export default function CallHistoryPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [calls, setCalls] = useState<CallHistory[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState("")

  useEffect(() => {
    Promise.all([
      getCallHistory(festivalId, stageFilter || undefined),
      getFestivalStages(festivalId),
    ]).then(([cRes, sRes]) => {
      setCalls(cRes.data as CallHistory[])
      setStages(sRes as FestivalStage[])
      setLoading(false)
    })
  }, [festivalId, stageFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
        <p className="text-sm text-gray-500 mt-1">Audit log of all participant calls made during live stage operations.</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Select options={stages.map(s => ({ value: s.id, label: s.name }))} placeholder="All Stages" value={stageFilter} onChange={e => setStageFilter(e.target.value)} />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : calls.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No call history yet</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {calls.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {c.participant?.first_name} {c.participant?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{c.participant?.participant_id}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {CALL_TYPES.find(t => t.value === c.call_type)?.label || c.call_type}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{new Date(c.called_at).toLocaleTimeString()}</p>
                    <p>{new Date(c.called_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
