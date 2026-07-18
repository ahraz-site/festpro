"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createFestival } from "@/lib/actions/festival"
import { FESTIVAL_STATUSES, VISIBILITY_OPTIONS, TIMEZONE_OPTIONS } from "@/config/festival"
import type { FestivalFormData } from "@/types/festival"
import { Loader2, CalendarDays } from "lucide-react"

const defaultForm: FestivalFormData = {
  name: "", short_name: "", code: "", description: "", theme: "default",
  start_date: "", end_date: "", registration_start_date: "", registration_end_date: "",
  result_publish_date: "", venue_name: "", address: "", district: "", state: "", country: "",
  latitude: "", longitude: "", timezone: "UTC", status: "draft", visibility: "public",
  max_participants: "", max_competitions: "",
}

export default function CreateFestivalPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FestivalFormData>(defaultForm)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error("Festival name is required"); return }
    setSaving(true)
    const result = await createFestival(orgId, form)
    setSaving(false)
    if (result.error) { toast.error(result.error) }
    else if (result.festivalId) {
      toast.success("Festival created!")
      router.push(`/dashboard/organization/${orgId}/festivals/${result.festivalId}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create Festival</CardTitle>
              <CardDescription>Set up a new festival for your organization.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Festival Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Spring Fest 2025" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Short Name</label>
                  <Input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} placeholder="e.g. SpringFest" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Code</label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="FEST-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Theme</label>
                  <Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="default" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your festival..." rows={3} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Dates & Times</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Registration Start</label>
                  <Input type="datetime-local" value={form.registration_start_date} onChange={(e) => setForm({ ...form, registration_start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Registration End</label>
                  <Input type="datetime-local" value={form.registration_end_date} onChange={(e) => setForm({ ...form, registration_end_date: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Result Publish Date</label>
                  <Input type="datetime-local" value={form.result_publish_date} onChange={(e) => setForm({ ...form, result_publish_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Timezone</label>
                  <Select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} options={TIMEZONE_OPTIONS} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Location</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Venue Name</label>
                <Input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} placeholder="Main Auditorium" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">District</label>
                  <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Country</label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Latitude</label>
                  <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Longitude</label>
                  <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Configuration</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} options={FESTIVAL_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Visibility</label>
                  <Select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as any })} options={VISIBILITY_OPTIONS} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Max Participants</label>
                  <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Max Competitions</label>
                  <Input type="number" value={form.max_competitions} onChange={(e) => setForm({ ...form, max_competitions: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CalendarDays className="h-4 w-4 mr-2" />
                Create Festival
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
