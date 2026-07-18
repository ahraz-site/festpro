"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createAnnouncement } from "@/lib/actions/schedule/announcements"
import { getFestivalStages } from "@/lib/actions/festival"
import { ANNOUNCEMENT_TYPES } from "@/config/schedule"
import type { FestivalStage } from "@/types/festival"
import { Loader2, MessageSquare } from "lucide-react"

export default function CreateAnnouncementPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    stage_id: "", title: "", message: "", announcement_type: "general",
    display_on_screen: true, is_scrolling: false, is_emergency: false,
    priority: 0, expires_at: "",
  })

  useEffect(() => {
    getFestivalStages(festivalId).then(data => setStages(data as FestivalStage[]))
  }, [festivalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) { toast.error("Title and message are required"); return }
    setSaving(true)
    const res = await createAnnouncement(festivalId, {
      ...form, stage_id: form.stage_id || undefined,
      expires_at: form.expires_at || undefined,
    })
    setSaving(false)
    if (res.error) toast.error(res.error); else {
      toast.success("Announcement created")
      router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/announcements`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Announcement</h1>
        <p className="text-sm text-gray-500 mt-1">Send announcements to stage display screens.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Announcement Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage (optional)</label>
              <Select options={stages.map(s => ({ value: s.id, label: s.name }))} placeholder="All Stages (broadcast)" value={form.stage_id} onChange={e => setForm(f => ({ ...f, stage_id: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Type</label>
              <Select options={ANNOUNCEMENT_TYPES} value={form.announcement_type} onChange={e => setForm(f => ({ ...f, announcement_type: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <Textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority (higher = more urgent)</label>
                <Input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.display_on_screen} onChange={e => setForm(f => ({ ...f, display_on_screen: e.target.checked }))} className="rounded" /> Display on screen</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_scrolling} onChange={e => setForm(f => ({ ...f, is_scrolling: e.target.checked }))} className="rounded" /> Scrolling text</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_emergency} onChange={e => setForm(f => ({ ...f, is_emergency: e.target.checked }))} className="rounded" /> Emergency</label>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
            Create Announcement
          </Button>
        </div>
      </form>
    </div>
  )
}
