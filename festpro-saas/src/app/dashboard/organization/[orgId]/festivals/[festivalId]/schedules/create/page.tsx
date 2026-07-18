"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createSchedule, updateSchedule, getSchedules } from "@/lib/actions/schedule"
import { getFestivalStages, getFestivalDays } from "@/lib/actions/festival"
import { getCompetitions, getCompetitionRounds } from "@/lib/actions/competition"
import { getSessions } from "@/lib/actions/schedule"
import type { FestivalStage, FestivalDay } from "@/types/festival"
import type { Competition, CompetitionRound } from "@/types/competition"
import type { ScheduleSession, ScheduleFormData } from "@/types/schedule"
import { Calendar, Clock, Loader2, Save } from "lucide-react"

export default function CreateSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const editId = searchParams.get("edit")
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [rounds, setRounds] = useState<CompetitionRound[]>([])
  const [sessions, setSessions] = useState<ScheduleSession[]>([])
  const [days, setDays] = useState<FestivalDay[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ScheduleFormData>({
    stage_id: "", competition_id: "", round_id: "", session_id: "",
    scheduled_date: "", start_time: "09:00", end_time: "10:00",
    estimated_duration_minutes: "30", max_participants: "50", notes: "",
  })

  useEffect(() => {
    async function load() {
      const [stagesData, compsData, sessData, daysData] = await Promise.all([
        getFestivalStages(festivalId),
        getCompetitions(festivalId),
        getSessions(festivalId),
        getFestivalDays(festivalId),
      ])
      setStages(stagesData as FestivalStage[])
      setCompetitions(compsData as Competition[])
      setSessions(sessData.data as ScheduleSession[])
      setDays(daysData as FestivalDay[])

      if (editId) {
        const { data } = await getSchedules(festivalId, { page: 1, limit: 1 })
        const sched = (data as any[])?.find(s => s.id === editId)
        if (sched) {
          setForm({
            stage_id: sched.stage_id, competition_id: sched.competition_id,
            round_id: sched.round_id || "", session_id: sched.session_id || "",
            scheduled_date: sched.scheduled_date,
            start_time: sched.start_time, end_time: sched.end_time,
            estimated_duration_minutes: String(sched.estimated_duration_minutes),
            max_participants: String(sched.max_participants), notes: sched.notes || "",
          })
        }
      }
    }
    load()
  }, [festivalId, editId])

  const loadRounds = async (competitionId: string) => {
    if (!competitionId) { setRounds([]); return }
    const data = await getCompetitionRounds(competitionId)
    setRounds(data as CompetitionRound[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (editId) {
      const res = await updateSchedule(editId, form)
      if (res.error) toast.error(res.error); else { toast.success("Updated"); router.back() }
    } else {
      const res = await createSchedule(festivalId, form)
      if (res.error) toast.error(res.error); else { toast.success("Created"); router.back() }
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{editId ? "Edit" : "Create"} Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">Schedule a competition on a stage at a specific time.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Schedule Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <Input type="date" required value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
                <Select options={stages.map(s => ({ value: s.id, label: s.name }))} placeholder="Select stage" value={form.stage_id} onChange={e => setForm(f => ({ ...f, stage_id: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competition *</label>
              <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="Select competition" value={form.competition_id} onChange={e => { setForm(f => ({ ...f, competition_id: e.target.value, round_id: "" })); loadRounds(e.target.value) }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                <Select options={rounds.map(r => ({ value: r.id, label: `${r.name} (Round ${r.round_number})` }))} placeholder="Select round (optional)" value={form.round_id} onChange={e => setForm(f => ({ ...f, round_id: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <Select options={sessions.filter(s => !s.is_break).map(s => ({ value: s.id, label: `${s.name} (${s.start_time}-${s.end_time})` }))} placeholder="Select session" value={form.session_id} onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <Input type="time" required value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <Input type="time" required value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <Input type="number" value={form.estimated_duration_minutes} onChange={e => setForm(f => ({ ...f, estimated_duration_minutes: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <Input type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {editId ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  )
}
