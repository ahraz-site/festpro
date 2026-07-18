"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { createOrganization } from "@/lib/actions/organization"
import { Loader2, Building2 } from "lucide-react"

export default function CreateOrganizationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    country: "",
    state: "",
    district: "",
    website: "",
    org_email: "",
    org_phone: "",
    timezone: "UTC",
    language: "en",
    brand_color: "#4F46E5",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error("Organization name is required"); return }

    setSaving(true)
    const result = await createOrganization(form)
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.orgId) {
      toast.success("Organization created!")
      router.push(`/dashboard/organization/${result.orgId}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>Set up a new organization on FestPro.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Organization Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Springfield University"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SPR-UNI" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Timezone</label>
                <Select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  options={[
                    { value: "UTC", label: "UTC" },
                    { value: "America/New_York", label: "Eastern (ET)" },
                    { value: "America/Chicago", label: "Central (CT)" },
                    { value: "America/Denver", label: "Mountain (MT)" },
                    { value: "America/Los_Angeles", label: "Pacific (PT)" },
                    { value: "Europe/London", label: "London (GMT)" },
                    { value: "Europe/Paris", label: "Paris (CET)" },
                    { value: "Asia/Kolkata", label: "India (IST)" },
                    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
                    { value: "Australia/Sydney", label: "Sydney (AEST)" },
                  ]}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="United States" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">State</label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="California" />
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
                <label className="text-sm font-medium text-gray-700">Organization Email</label>
                <Input type="email" value={form.org_email} onChange={(e) => setForm({ ...form, org_email: e.target.value })} placeholder="admin@org.com" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input value={form.org_phone} onChange={(e) => setForm({ ...form, org_phone: e.target.value })} placeholder="+1 555-0123" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brand Color</label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={form.brand_color} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} className="w-12 h-10 p-1" />
                  <Input value={form.brand_color} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Building2 className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
