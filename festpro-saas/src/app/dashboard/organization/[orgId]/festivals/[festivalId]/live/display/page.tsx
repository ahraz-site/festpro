"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getLiveStageData } from "@/lib/actions/schedule/live"
import type { StageStatusRecord, LiveEvent } from "@/types/schedule"
import { Radio, User, Loader2, RefreshCw } from "lucide-react"

export default function LiveDisplayPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [data, setData] = useState<{
    stages: StageStatusRecord[]; queue: any[]; events: LiveEvent[]; announcements: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLiveStageData(festivalId).then(res => {
      setData(res as any)
      setLoading(false)
    })
    const interval = setInterval(async () => {
      const res = await getLiveStageData(festivalId)
      setData(res as any)
    }, 15000) // Auto-refresh every 15s
    return () => clearInterval(interval)
  }, [festivalId])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="h-10 w-10 animate-spin text-white" /></div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Radio className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-bold">Live Stage Display</h1>
        </div>
        <div className="text-2xl font-mono" id="live-clock">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {data?.stages?.map(stage => {
          const stageQueue = data.queue?.filter(q => q.stage_id === stage.stage_id) || []
          const current = stageQueue.find(q => q.status === "performing")
          const next = stageQueue.find(q => q.status === "calling" || q.status === "waiting")
          const waitingCount = stageQueue.filter(q => q.status === "waiting").length

          return (
            <Card key={stage.stage_id} className={`bg-gray-800 border-2 ${stage.is_live ? "border-green-500" : "border-gray-700"}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{stage.stage?.name || "Stage"}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${stage.is_live ? "bg-green-900 text-green-300 animate-pulse" : "bg-gray-700 text-gray-300"}`}>
                    {stage.current_status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Current Performance */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase mb-2">Now Performing</p>
                    {current ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-900 flex items-center justify-center text-2xl font-bold text-green-300">
                          {current.participant?.first_name?.[0]}{current.participant?.last_name?.[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{current.participant?.first_name} {current.participant?.last_name}</h3>
                          <p className="text-sm text-gray-400">{current.participant?.chest_number}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-lg">Waiting for next...</p>
                    )}
                  </div>

                  {/* Next Up */}
                  {next && next.status !== "performing" && (
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 uppercase mb-1">Next Up</p>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-amber-400" />
                        <span className="font-medium">{next.participant?.first_name} {next.participant?.last_name}</span>
                        <span className="text-sm text-gray-400">{next.participant?.chest_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Queue Length */}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Queue: {waitingCount} waiting</span>
                    <span>Completed: {stageQueue.filter(q => q.status === "completed").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Announcements Banner */}
      {data?.announcements && data.announcements.length > 0 && (
        <div className="mt-8 bg-amber-900/50 border border-amber-700 rounded-lg p-4">
          <div className="space-y-2">
            {data.announcements.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs ${a.is_emergency ? "bg-red-800 text-red-200" : "bg-amber-800 text-amber-200"}`}>
                  {a.announcement_type}
                </span>
                <p className={`font-medium ${a.is_scrolling ? "animate-marquee" : ""}`}>{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
