"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getParticipantById, updateParticipant, getInstitutions } from "@/lib/actions/participant"
import { GENDER_OPTIONS, UNITS, DIVISIONS, SECTORS } from "@/config/participant"
import type { Institution, ParticipantFormData, Participant } from "@/types/participant"
import { Loader2, Save } from "lucide-react"

export default function EditParticipantPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const participantId = params.participantId as string
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ParticipantFormData>({
    first_name: "", last_name: "", date_of_birth: "", gender: "male",
    email: "", phone: "", address: "", city: "", district: "", state: "",
    unit: "", division: "", sector: "", institution_id: "", institution_name: "", notes: "",
  })

  useEffect(() => {
    Promise.all([getParticipantById(participantId), getInstitutions(orgId)]).then(([pRes, instRes]) => {
      if (pRes.error) { toast.error(pRes.error); return }
      const p = pRes.data as Participant
      setForm({
        first_name: p.first_name, last_name: p.last_name,
        date_of_birth: p.date_of_birth?.split("T")[0] || "",
        gender: p.gender, email: p.email || "", phone: p.phone || "",
        address: p.address || "", city: p.city || "", district: p.district || "", state: p.state || "",
        unit: p.unit || "", division: p.division || "", sector: p.sector || "",
        institution_id: p.institution_id || "", institution_name: p.institution_name || "", notes: p.notes || "",
      })
      setInstitutions(instRes.data as Institution[])
      setLoading(false)
    })
  }, [participantId, orgId])

  const setField = (field: keyof ParticipantFormData, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await updateParticipant(participantId, form)
    setSaving(false)
    if (res.error) toast.error(res.error); else {
      toast.success("Updated")
      router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${participantId}`)
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Participant</h1>
        <p className="text-sm text-gray-500 mt-1">Update participant information.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <Input required value={form.first_name} onChange={e => setField("first_name", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <Input required value={form.last_name} onChange={e => setField("last_name", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <Input type="date" value={form.date_of_birth} onChange={e => setField("date_of_birth", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <Select options={GENDER_OPTIONS.map(g => ({ value: g.value, label: g.label }))} value={form.gender} onChange={e => setField("gender", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input value={form.phone} onChange={e => setField("phone", e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <Select options={UNITS.map(u => ({ value: u, label: u }))} placeholder="Select" value={form.unit} onChange={e => setField("unit", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <Select options={DIVISIONS.map(d => ({ value: d, label: d }))} placeholder="Select" value={form.division} onChange={e => setField("division", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <Select options={SECTORS.map(s => ({ value: s, label: s }))} placeholder="Select" value={form.sector} onChange={e => setField("sector", e.target.value)} /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <Select options={institutions.map(i => ({ value: i.id, label: i.name }))} placeholder="Select" value={form.institution_id} onChange={e => setField("institution_id", e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={3} value={form.notes} onChange={e => setField("notes", e.target.value)} />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
