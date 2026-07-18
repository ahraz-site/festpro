"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import {
  getStageQueue, callNextParticipant, markAsPerforming, markAsCompleted,
  skipParticipant, markAbsent, recallParticipant, buildQueueForSchedule, clearQueue,
} from "@/lib/actions/schedule/queue"
import {
  getStageStatuses, initStageStatus, updateStageStatus, getLiveStageData,
} from "@/lib/actions/schedule/live"
import { getFestivalStages, getFestivalDays } from "@/lib/actions/festival"
import { QUEUE_STATUSES, STAGE_STATUSES } from "@/config/schedule"
import type { StageQueue, StageStatusRecord, ScheduleDashboardData } from "@/types/schedule"
import type { FestivalStage } from "@/types/festival"
import {
  Play, SkipForward, CheckCircle, XCircle, RotateCcw, Users, RefreshCw,
  Loader2, ChevronRight, Clock, User, Radio,
} from "lucide-react"

export default function LiveStagePage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [statuses, setStatuses] = useState<StageStatusRecord[]>([])
  const [selectedStage, setSelectedStage] = useState<string>("")
  const [queue, setQueue] = useState<StageQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [building, setBuilding] = useState(false)

  const loadData = useCallback(async () => {
    const [stagesData, statusData, queueData] = await Promise.all([
      getFestivalStages(festivalId),
      getStageStatuses(festivalId),
      selectedStage ? getStageQueue(selectedStage, festivalId) : Promise.resolve({ data: [] }),
    ])
    setStages(stagesData as FestivalStage[])
    setStatuses(statusData.data as StageStatusRecord[])
    setQueue(queueData.data as StageQueue[])
    setLoading(false)
  }, [festivalId, selectedStage])

  useEffect(() => { loadData() }, [loadData])

  // Init status for all stages
  useEffect(() => {
    if (stages.length > 0) {
      stages.forEach(s => initStageStatus(s.id, festivalId))
    }
  }, [stages, festivalId])

  const handleBuildQueue = async () => {
    const schedEl = document.getElementById("schedule-select") as HTMLSelectElement
    const scheduleId = schedEl?.value
    if (!scheduleId) { toast.error("Select a schedule first"); return }
    setBuilding(true)
    const res = await buildQueueForSchedule(scheduleId)
    setBuilding(false)
    if (res.error) toast.error(res.error); else { toast.success(`Queue built: ${res.count} participants`); loadData() }
  }

  const handleClearQueue = async () => {
    if (!confirm("Clear entire queue?")) return
    const res = await clearQueue(selectedStage, festivalId)
    if (res.error) toast.error(res.error); else { toast.success("Queue cleared"); loadData() }
  }

  const currentItem = queue.find(q => q.status === "performing")
  const callingItem = queue.find(q => q.status === "calling")
  const waitingItems = queue.filter(q => q.status === "waiting")

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Stage Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage stage queue and live calling in real time.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/live/display`}>
            <Button variant="outline" size="sm"><Radio className="h-4 w-4 mr-1" />Display Screen</Button>
          </Link>
        </div>
      </div>

      {/* Stage selector + status cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <Select
            options={stages.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select a stage"
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
          />
        </div>
        {selectedStage && statuses.filter(s => s.stage_id === selectedStage).map(st => (
          <div key={st.id} className="lg:col-span-3 grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${st.is_live ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{st.current_status}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-gray-500">Queue</p>
                  <p className="font-semibold">{waitingItems.length} waiting</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-gray-500">Stage Controls</p>
                  <div className="flex gap-1 mt-1">
                    {["idle", "running", "break", "completed"].map(s => (
                      <button key={s} onClick={() => updateStageStatus(selectedStage, festivalId, s)}
                        className={`text-xs px-2 py-0.5 rounded ${st.current_status === s ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {!selectedStage ? (
        <Card><CardContent className="py-12 text-center text-gray-400">Select a stage to manage its queue</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Current + Calling */}
          <div className="lg:col-span-2 space-y-6">
            {/* Currently Performing */}
            <Card className="border-green-300 bg-green-50">
              <CardHeader><CardTitle className="text-sm text-green-800 flex items-center gap-2"><Radio className="h-4 w-4" />Currently Performing</CardTitle></CardHeader>
              <CardContent>
                {currentItem ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-lg">
                        {currentItem.participant?.first_name?.[0]}{currentItem.participant?.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{currentItem.participant?.first_name} {currentItem.participant?.last_name}</h3>
                        <p className="text-xs text-gray-500">{currentItem.participant?.participant_id} | Chest: {currentItem.participant?.chest_number || "N/A"}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                      await markAsCompleted(currentItem.id, festivalId)
                      loadData()
                    }}>
                      <CheckCircle className="h-4 w-4 mr-1" />Complete
                    </Button>
                  </div>
                ) : callingItem ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-lg animate-pulse">
                        {callingItem.participant?.first_name?.[0]}{callingItem.participant?.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{callingItem.participant?.first_name} {callingItem.participant?.last_name}</h3>
                        <p className="text-xs text-gray-500">Called {callingItem.call_count}x | Chest: {callingItem.participant?.chest_number || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600" onClick={async () => { await markAsPerforming(callingItem.id, festivalId); loadData() }}>
                        <Play className="h-4 w-4 mr-1" />Start
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await skipParticipant(callingItem.id, festivalId); loadData() }}>
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">No active performance</div>
                )}
              </CardContent>
            </Card>

            {/* Queue Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Queue Actions</span>
                  <div className="flex gap-2">
                    <select id="schedule-select" className="text-xs border rounded px-2 py-1">
                      <option value="">Select schedule...</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={handleBuildQueue} disabled={building}>
                      {building ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearQueue}><XCircle className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={async () => { const res = await callNextParticipant(selectedStage, festivalId); if (res.error) toast.error(res.error); loadData() }}>
                    <Users className="h-4 w-4 mr-1" />Call Next
                  </Button>
                  {callingItem && (
                    <Button size="sm" variant="outline" onClick={async () => { await recallParticipant(callingItem.id, festivalId); loadData() }}>
                      <RotateCcw className="h-4 w-4 mr-1" />Recall
                    </Button>
                  )}
                  {callingItem && (
                    <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await markAbsent(callingItem.id, festivalId); loadData() }}>
                      <XCircle className="h-4 w-4 mr-1" />Absent
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Waiting Queue */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Waiting Queue ({waitingItems.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-80 overflow-y-auto">
                  {waitingItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No participants in queue</div>
                  ) : waitingItems.map((q, i) => (
                    <div key={q.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-400 w-6">{q.queue_order}</span>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {q.participant?.first_name?.[0]}{q.participant?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{q.participant?.first_name} {q.participant?.last_name}</p>
                          <p className="text-xs text-gray-400">{q.participant?.chest_number || "No chest"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={async () => { await skipParticipant(q.id, festivalId); loadData() }}>
                          <SkipForward className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={async () => { await markAbsent(q.id, festivalId); loadData() }}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Completed + Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
              <CardContent className="p-0 max-h-60 overflow-y-auto">
                <div className="divide-y">
                  {queue.filter(q => q.status === "completed").length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">None yet</div>
                  ) : queue.filter(q => q.status === "completed").map(q => (
                    <div key={q.id} className="px-4 py-2 text-sm flex items-center justify-between">
                      <span>{q.participant?.first_name} {q.participant?.last_name}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Queue Stats</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-medium">{queue.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Waiting</span><span className="font-medium">{waitingItems.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Calling</span><span className="font-medium">{callingItem ? 1 : 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Performing</span><span className="font-medium">{currentItem ? 1 : 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Skipped</span><span className="font-medium">{queue.filter(q => q.status === "skipped").length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Absent</span><span className="font-medium">{queue.filter(q => q.status === "absent").length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-medium">{queue.filter(q => q.status === "completed").length}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
