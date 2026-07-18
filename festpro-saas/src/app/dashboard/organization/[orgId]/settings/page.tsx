"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getOrganization, getOrganizationSettings, updateOrganization, updateOrganizationSettings } from "@/lib/actions/organization"
import type { ExtendedOrganization, OrganizationSettings } from "@/types/organization"
import { Loader2, Save } from "lucide-react"
import { ROLES, ROLE_LABELS } from "@/config/roles"

export default function OrganizationSettingsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [org, setOrg] = useState<ExtendedOrganization | null>(null)
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: "", code: "", address: "", country: "", state: "", district: "",
    website: "", org_email: "", org_phone: "", timezone: "UTC", language: "en",
    brand_color: "#4F46E5",
  })

  const [settingsForm, setSettingsForm] = useState({
    allow_public_registration: false,
    require_email_verification: true,
    default_user_role: "participant",
    primary_color: "#4F46E5",
    secondary_color: "#7C3AED",
    accent_color: "#F59E0B",
    font_family: "Inter",
    notification_settings: { email: true, push: true, sms: false },
  })

  useEffect(() => {
    async function load() {
      const [orgData, settingsData] = await Promise.all([
        getOrganization(orgId),
        getOrganizationSettings(orgId),
      ])
      if (orgData) {
        setOrg(orgData)
        setForm({
          name: orgData.name, code: orgData.code || "", address: orgData.address || "",
          country: orgData.country || "", state: orgData.state || "", district: orgData.district || "",
          website: orgData.website || "", org_email: orgData.org_email || "", org_phone: orgData.org_phone || "",
          timezone: orgData.timezone || "UTC", language: orgData.language || "en",
          brand_color: orgData.brand_color || "#4F46E5",
        })
      }
      if (settingsData) {
        setSettings(settingsData)
        setSettingsForm({
          allow_public_registration: settingsData.allow_public_registration,
          require_email_verification: settingsData.require_email_verification,
          default_user_role: settingsData.default_user_role,
          primary_color: settingsData.primary_color,
          secondary_color: settingsData.secondary_color,
          accent_color: settingsData.accent_color,
          font_family: settingsData.font_family,
          notification_settings: settingsData.notification_settings as { email: boolean; push: boolean; sms: boolean },
        })
      }
      setLoading(false)
    }
    load()
  }, [orgId])

  async function handleSaveOrg() {
    setSaving(true)
    const result = await updateOrganization(orgId, form)
    if (result.error) { toast.error(result.error) } else { toast.success("Organization updated") }
    setSaving(false)
  }

  async function handleSaveSettings() {
    setSaving(true)
    const result = await updateOrganizationSettings(orgId, settingsForm as any)
    if (result.error) { toast.error(result.error) } else { toast.success("Settings updated") }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!org) return <div className="text-center py-12 text-gray-500">Organization not found.</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization profile and preferences.</p>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information about your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Code</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ORG-001" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State</label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">District</label>
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Website</label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={form.org_email} onChange={(e) => setForm({ ...form, org_email: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input value={form.org_phone} onChange={(e) => setForm({ ...form, org_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timezone</label>
              <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "pt", label: "Portuguese" },
                  { value: "hi", label: "Hindi" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand Color</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={form.brand_color}
                  onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input value={form.brand_color} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveOrg} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Settings</CardTitle>
          <CardDescription>Configure how your organization behaves.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Public Registration</p>
                <p className="text-xs text-gray-500">Allow anyone to register</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.allow_public_registration}
                  onChange={(e) => setSettingsForm({ ...settingsForm, allow_public_registration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Email Verification</p>
                <p className="text-xs text-gray-500">Require email verification</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.require_email_verification}
                  onChange={(e) => setSettingsForm({ ...settingsForm, require_email_verification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Default User Role</label>
              <Select
                value={settingsForm.default_user_role}
                onChange={(e) => setSettingsForm({ ...settingsForm, default_user_role: e.target.value })}
                options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Font Family</label>
              <Input value={settingsForm.font_family} onChange={(e) => setSettingsForm({ ...settingsForm, font_family: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={settingsForm.primary_color} onChange={(e) => setSettingsForm({ ...settingsForm, primary_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={settingsForm.primary_color} onChange={(e) => setSettingsForm({ ...settingsForm, primary_color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={settingsForm.secondary_color} onChange={(e) => setSettingsForm({ ...settingsForm, secondary_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={settingsForm.secondary_color} onChange={(e) => setSettingsForm({ ...settingsForm, secondary_color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Accent Color</label>
              <div className="flex gap-2 items-center">
                <Input type="color" value={settingsForm.accent_color} onChange={(e) => setSettingsForm({ ...settingsForm, accent_color: e.target.value })} className="w-12 h-10 p-1" />
                <Input value={settingsForm.accent_color} onChange={(e) => setSettingsForm({ ...settingsForm, accent_color: e.target.value })} />
              </div>
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
