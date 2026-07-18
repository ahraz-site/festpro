"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { createAppeal } from "@/lib/actions/appeal"
import { getCompetitions } from "@/lib/actions/competition"
import { getRegistrations } from "@/lib/actions/participant/registrations"
import { APPEAL_TYPES } from "@/config/result"
import type { Competition } from "@/types/competition"
import { Loader2, Send } from "lucide-react"

export default function CreateAppealPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ competition_id: "", participant_id: "", appeal_type: "score_review", title: "", description: "", priority: "normal" })

  useEffect(() => {
    Promise.all([getCompetitions(festivalId), getRegistrations(festivalId)]).then(([cRes, pRes]) => {
      setCompetitions(cRes || []); setParticipants((pRes.data || []).map((r: any) => r.participant).filter(Boolean)); setLoading(false)
    })
  }, [festivalId])

  const handleSubmit = async () => {
    if (!form.competition_id || !form.participant_id || !form.title || !form.description) { toast.error("Fill all required fields"); return }
    setSubmitting(true)
    const res = await createAppeal(festivalId, form)
    if (res.error) toast.error(res.error); else { toast.success("Appeal submitted"); router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/results/appeals`) }
    setSubmitting(false)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Appeal</h1>
        <p className="text-sm text-gray-500 mt-1">File an appeal for score review or rank dispute.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="Select competition" value={form.competition_id} onChange={e => setForm(f => ({ ...f, competition_id: e.target.value }))} />
          <Select options={participants.map((p: any) => ({ value: p.id, label: `${p.first_name} ${p.last_name} (${p.participant_id})` }))} placeholder="Select participant" value={form.participant_id} onChange={e => setForm(f => ({ ...f, participant_id: e.target.value }))} />
          <div className="flex gap-2">
            <select value={form.appeal_type} onChange={e => setForm(f => ({ ...f, appeal_type: e.target.value }))} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {APPEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <Input placeholder="Appeal title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea placeholder="Describe your appeal in detail..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />} Submit Appeal
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
