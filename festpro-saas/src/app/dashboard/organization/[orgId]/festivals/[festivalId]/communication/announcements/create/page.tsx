"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { createAnnouncement } from "@/lib/actions/communication"
import { ANNOUNCEMENT_TARGETS, NOTIFICATION_PRIORITIES } from "@/config/communication"
import { Loader2, Send, Calendar, AlertTriangle, Pin } from "lucide-react"

export default function CreateAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "", body: "", target: "festival", priority: "normal",
    is_pinned: false, is_emergency: false, scheduled: false, scheduled_at: "",
  })

  const handleSubmit = async () => {
    if (!form.title || !form.body) { toast.error("Title and body required"); return }
    setLoading(true)
    const res = await createAnnouncement({
      festival_id: festivalId, title: form.title, body: form.body,
      target: form.target, priority: form.priority,
      is_pinned: form.is_pinned, is_emergency: form.is_emergency,
      scheduled_at: form.scheduled ? form.scheduled_at : undefined,
    })
    setLoading(false)
    if (res.error) toast.error(res.error)
    else { toast.success(form.scheduled ? "Announcement scheduled" : "Announcement published"); router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/announcements`) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Announcement</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new festival announcement.</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement Title *" />

          <div>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Announcement body text..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[120px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select options={ANNOUNCEMENT_TARGETS.map(t => ({ value: t.value, label: t.label }))} value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            <Select options={NOTIFICATION_PRIORITIES.map(p => ({ value: p.value, label: p.label }))} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} />
              <Pin className="h-3.5 w-3.5" /> Pin announcement
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_emergency} onChange={e => setForm(f => ({ ...f, is_emergency: e.target.checked }))} />
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Emergency
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.scheduled} onChange={e => setForm(f => ({ ...f, scheduled: e.target.checked }))} />
              <Calendar className="h-3.5 w-3.5" /> Schedule
            </label>
          </div>

          {form.scheduled && (
            <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              {form.scheduled ? "Schedule" : "Publish"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
