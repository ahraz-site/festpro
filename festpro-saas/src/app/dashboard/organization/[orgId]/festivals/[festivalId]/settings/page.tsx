"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getFestival, updateFestival, getFestivalSettings, updateFestivalSettings, uploadFile } from "@/lib/actions/festival"
import { FESTIVAL_STATUSES, VISIBILITY_OPTIONS, TIMEZONE_OPTIONS } from "@/config/festival"
import type { Festival, FestivalSettings, FestivalFormData } from "@/types/festival"
import { Loader2, Save, Upload } from "lucide-react"

export default function FestivalSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [festival, setFestival] = useState<Festival | null>(null)
  const [settings, setSettings] = useState<FestivalSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const [form, setForm] = useState({
    name: "", short_name: "", code: "", description: "", theme: "default",
    start_date: "", end_date: "", venue_name: "", address: "", district: "", state: "", country: "",
    latitude: "", longitude: "", timezone: "UTC", status: "draft", visibility: "public",
    max_participants: "", max_competitions: "",
  })

  const [settingsForm, setSettingsForm] = useState({
    festival_color: "#4F46E5", theme_color: "#7C3AED", dark_mode: false, language: "en",
    chest_number_format: "CHEST-{year}-{number}", registration_prefix: "REG",
    judge_settings: { blind_scoring: false, min_judges_per_competition: 2 },
    notification_settings: { email: true, push: true, sms: false },
  })

  useEffect(() => {
    async function load() {
      const [f, s] = await Promise.all([getFestival(festivalId), getFestivalSettings(festivalId)])
      if (f) {
        setFestival(f as Festival)
        setForm({
          name: f.name, short_name: f.short_name || "", code: f.code || "", description: f.description || "",
          theme: f.theme || "default", start_date: f.start_date?.split("T")[0] || "", end_date: f.end_date?.split("T")[0] || "",
          venue_name: f.venue_name || "", address: f.address || "", district: f.district || "",
          state: f.state || "", country: f.country || "", latitude: f.latitude?.toString() || "",
          longitude: f.longitude?.toString() || "", timezone: f.timezone || "UTC",
          status: f.status, visibility: f.visibility, max_participants: f.max_participants?.toString() || "",
          max_competitions: f.max_competitions?.toString() || "",
        })
      }
      if (s) {
        setSettings(s as FestivalSettings)
        setSettingsForm({
          festival_color: s.festival_color, theme_color: s.theme_color, dark_mode: s.dark_mode,
          language: s.language, chest_number_format: s.chest_number_format,
          registration_prefix: s.registration_prefix,
          judge_settings: s.judge_settings as any,
          notification_settings: s.notification_settings as any,
        })
      }
      setLoading(false)
    }
    load()
  }, [festivalId])

  async function handleSaveFestival() {
    setSaving(true)
    const result = await updateFestival(festivalId, form as any)
    if (result.error) toast.error(result.error)
    else toast.success("Festival updated")
    setSaving(false)
  }

  async function handleSaveSettings() {
    setSaving(true)
    const result = await updateFestivalSettings(festivalId, settingsForm as any)
    if (result.error) toast.error(result.error)
    else toast.success("Settings saved")
    setSaving(false)
  }

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const result = await uploadFile(festivalId, "festival-logos", file, "logo")
    if (result.error) { toast.error(result.error) }
    else if (result.url) {
      await updateFestival(festivalId, { logo_url: result.url } as any)
      toast.success("Logo uploaded")
    }
    setUploadingLogo(false)
  }

  async function handleUploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    const result = await uploadFile(festivalId, "festival-banners", file, "banner")
    if (result.error) { toast.error(result.error) }
    else if (result.url) {
      await updateFestival(festivalId, { banner_url: result.url } as any)
      toast.success("Banner uploaded")
    }
    setUploadingBanner(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!festival) return <div className="text-center py-12 text-gray-500">Festival not found.</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Festival Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage festival information and configuration.</p>
      </div>

      {/* Logo & Banner */}
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>Upload festival logo and banner images.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Festival Logo</label>
              {festival.logo_url && (
                <div className="mb-2">
                  <img src={festival.logo_url} alt="Logo" className="h-20 w-20 object-contain rounded-lg border" />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:text-indigo-700">
                <Upload className="h-4 w-4" />
                {uploadingLogo ? "Uploading..." : "Upload Logo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} disabled={uploadingLogo} />
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Festival Banner</label>
              {festival.banner_url && (
                <div className="mb-2">
                  <img src={festival.banner_url} alt="Banner" className="h-20 w-full object-cover rounded-lg border" />
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer hover:text-indigo-700">
                <Upload className="h-4 w-4" />
                {uploadingBanner ? "Uploading..." : "Upload Banner"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadBanner} disabled={uploadingBanner} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Short Name</label>
              <Input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
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
          <div className="pt-2">
            <Button onClick={handleSaveFestival} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Festival
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Festival Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Festival Configuration</CardTitle>
          <CardDescription>Configure scoring, notifications, and display options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Festival Color</label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={settingsForm.festival_color} onChange={(e) => setSettingsForm({ ...settingsForm, festival_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={settingsForm.festival_color} onChange={(e) => setSettingsForm({ ...settingsForm, festival_color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Theme Color</label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={settingsForm.theme_color} onChange={(e) => setSettingsForm({ ...settingsForm, theme_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={settingsForm.theme_color} onChange={(e) => setSettingsForm({ ...settingsForm, theme_color: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Dark Mode</p>
              <p className="text-xs text-gray-500">Enable dark theme for this festival</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settingsForm.dark_mode} onChange={(e) => setSettingsForm({ ...settingsForm, dark_mode: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Select value={settingsForm.language} onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value })} options={[{ value: "en", label: "English" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }, { value: "hi", label: "Hindi" }]} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chest Number Format</label>
              <Input value={settingsForm.chest_number_format} onChange={(e) => setSettingsForm({ ...settingsForm, chest_number_format: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Registration Prefix</label>
              <Input value={settingsForm.registration_prefix} onChange={(e) => setSettingsForm({ ...settingsForm, registration_prefix: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timezone</label>
              <Select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} options={TIMEZONE_OPTIONS} />
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
