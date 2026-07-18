"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getSchedules, getScheduleDashboard, deleteSchedule, publishSchedule, autoGenerateSchedule } from "@/lib/actions/schedule"
import { getFestivalStages } from "@/lib/actions/festival"
import { getCompetitions } from "@/lib/actions/competition"
import { getFestivalDays } from "@/lib/actions/festival"
import { SCHEDULE_STATUSES, CONFLICT_TYPES } from "@/config/schedule"
import type { StageSchedule } from "@/types/schedule"
import type { FestivalStage, FestivalDay } from "@/types/festival"
import type { Competition } from "@/types/competition"
import { Calendar, Clock, Plus, WandSparkles, Eye, Trash2, Send, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

export default function SchedulesPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [schedules, setSchedules] = useState<StageSchedule[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [days, setDays] = useState<FestivalDay[]>([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState("")
  const [compFilter, setCompFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [generating, setGenerating] = useState(false)
  const limit = 50

  useEffect(() => {
    async function load() {
      const [sRes, stagesData, compsData, daysData] = await Promise.all([
        getSchedules(festivalId, { stage_id: stageFilter, competition_id: compFilter, status: statusFilter, scheduled_date: dateFilter, page, limit }),
        getFestivalStages(festivalId),
        getCompetitions(festivalId),
        getFestivalDays(festivalId),
      ])
      setSchedules(sRes.data as StageSchedule[])
      setTotalCount(sRes.count || 0)
      setStages(stagesData as FestivalStage[])
      setCompetitions(compsData as Competition[])
      setDays(daysData as FestivalDay[])
      setLoading(false)
    }
    load()
  }, [festivalId, stageFilter, compFilter, statusFilter, dateFilter, page])

  const handleAutoGenerate = async () => {
    const selectedDay = days.find(d => d.date === dateFilter)
    if (!selectedDay) { toast.error("Select a specific date/day first"); return }
    setGenerating(true)
    const res = await autoGenerateSchedule(festivalId, selectedDay.id)
    setGenerating(false)
    if (res.error) toast.error(res.error); else {
      toast.success(`Generated ${res.generated} schedules`)
      const sRes = await getSchedules(festivalId, { page, limit })
      setSchedules(sRes.data as StageSchedule[])
      setTotalCount(sRes.count || 0)
    }
  }

  const handlePublish = async (id: string) => {
    const res = await publishSchedule(id)
    if (res.error) toast.error(res.error); else { toast.success("Published"); setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: "published" } : s)) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return
    await deleteSchedule(id)
    setSchedules(prev => prev.filter(s => s.id !== id))
    toast.success("Deleted")
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stage Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Create, auto-generate and manage performance schedules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoGenerate} disabled={generating}>
            <WandSparkles className="h-4 w-4 mr-1" />{generating ? "Generating..." : "Auto Schedule"}
          </Button>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/schedules/create`}>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Manual</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }} className="w-auto" />
            <Select options={stages.map(s => ({ value: s.id, label: s.name }))} placeholder="All Stages" value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPage(1) }} />
            <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="All Competitions" value={compFilter} onChange={e => { setCompFilter(e.target.value); setPage(1) }} />
            <Select options={SCHEDULE_STATUSES.map(s => ({ value: s.value, label: s.label }))} placeholder="All Statuses" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Competition</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                ) : schedules.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No schedules found</td></tr>
                ) : schedules.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{s.scheduled_date}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.start_time} - {s.end_time}</td>
                    <td className="px-4 py-3 font-medium">{s.stage?.name || "N/A"}</td>
                    <td className="px-4 py-3">{s.competition?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.estimated_duration_minutes}min</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SCHEDULE_STATUSES.find(st => st.value === s.status)?.color || ""}`}>
                        {SCHEDULE_STATUSES.find(st => st.value === s.status)?.label || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {s.status === "draft" && (
                          <Button variant="ghost" size="sm" className="text-green-600 h-7 text-xs" onClick={() => handlePublish(s.id)}>
                            <Send className="h-3.5 w-3.5 mr-1" />Publish
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/schedules/create?edit=${s.id}`)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalCount} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm self-center">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
