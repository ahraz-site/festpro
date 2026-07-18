"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getEligibility, upsertEligibility } from "@/lib/actions/competition"
import { GENDER_OPTIONS } from "@/config/competition"
import type { CompetitionEligibility } from "@/types/competition"
import { Loader2, Save, Users } from "lucide-react"

export default function EligibilityPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const [elig, setElig] = useState<CompetitionEligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ allowed_units: "", allowed_divisions: "", allowed_sectors: "", min_age: "", max_age: "", gender_restriction: "all", requires_qualification: false, qualification_details: "" })

  useEffect(() => {
    async function load() {
      const data = await getEligibility(competitionId)
      if (data) {
        setElig(data as CompetitionEligibility)
        setForm({
          allowed_units: (data as any).allowed_units?.join(", ") || "",
          allowed_divisions: (data as any).allowed_divisions?.join(", ") || "",
          allowed_sectors: (data as any).allowed_sectors?.join(", ") || "",
          min_age: (data as any).min_age?.toString() || "",
          max_age: (data as any).max_age?.toString() || "",
          gender_restriction: (data as any).gender_restriction || "all",
          requires_qualification: (data as any).requires_qualification || false,
          qualification_details: (data as any).qualification_details || "",
        })
      }
      setLoading(false)
    }
    load()
  }, [competitionId])

  async function handleSave() {
    setSaving(true)
    const payload = {
      allowed_units: form.allowed_units ? form.allowed_units.split(",").map((s: string) => s.trim()) : [],
      allowed_divisions: form.allowed_divisions ? form.allowed_divisions.split(",").map((s: string) => s.trim()) : [],
      allowed_sectors: form.allowed_sectors ? form.allowed_sectors.split(",").map((s: string) => s.trim()) : [],
      min_age: form.min_age ? parseInt(form.min_age) : null,
      max_age: form.max_age ? parseInt(form.max_age) : null,
      gender_restriction: form.gender_restriction,
      requires_qualification: form.requires_qualification,
      qualification_details: form.qualification_details || null,
    }
    const result = await upsertEligibility(competitionId, payload as any)
    if (result.error) toast.error(result.error)
    else toast.success("Eligibility rules saved!")
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eligibility</h1>
        <p className="text-sm text-gray-500 mt-1">Define who can participate in this competition.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility Rules</CardTitle>
          <CardDescription>Set age, gender, unit, and qualification requirements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Min Age</label>
              <Input type="number" value={form.min_age} onChange={(e) => setForm({ ...form, min_age: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Age</label>
              <Input type="number" value={form.max_age} onChange={(e) => setForm({ ...form, max_age: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Gender Restriction</label>
            <Select value={form.gender_restriction} onChange={(e) => setForm({ ...form, gender_restriction: e.target.value })} options={GENDER_OPTIONS} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Allowed Units (comma separated)</label>
            <Input value={form.allowed_units} onChange={(e) => setForm({ ...form, allowed_units: e.target.value })} placeholder="Unit A, Unit B" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Allowed Divisions</label>
              <Input value={form.allowed_divisions} onChange={(e) => setForm({ ...form, allowed_divisions: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Allowed Sectors</label>
              <Input value={form.allowed_sectors} onChange={(e) => setForm({ ...form, allowed_sectors: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Requires Qualification</p>
              <p className="text-xs text-gray-500">Participant must qualify before registering</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.requires_qualification} onChange={(e) => setForm({ ...form, requires_qualification: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>
          {form.requires_qualification && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Qualification Details</label>
              <Input value={form.qualification_details} onChange={(e) => setForm({ ...form, qualification_details: e.target.value })} />
            </div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" /> Save Eligibility
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
