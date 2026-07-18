"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createParticipant, getInstitutions, createInstitution } from "@/lib/actions/participant"
import { GENDER_OPTIONS, UNITS, DIVISIONS, SECTORS } from "@/config/participant"
import type { Institution, ParticipantFormData } from "@/types/participant"
import { Loader2, UserPlus } from "lucide-react"

const defaultForm: ParticipantFormData = {
  first_name: "", last_name: "", date_of_birth: "", gender: "male",
  email: "", phone: "", address: "", city: "", district: "", state: "",
  unit: "", division: "", sector: "", institution_id: "", institution_name: "", notes: "",
}

export default function CreateParticipantPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [saving, setSaving] = useState(false)
  const [newInstName, setNewInstName] = useState("")
  const [form, setForm] = useState<ParticipantFormData>(defaultForm)

  useEffect(() => {
    getInstitutions(orgId).then(({ data }) => setInstitutions(data as Institution[]))
  }, [orgId])

  const setField = (field: keyof ParticipantFormData, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

  const handleAddInstitution = async () => {
    if (!newInstName.trim()) return
    const res = await createInstitution(orgId, newInstName.trim())
    if (res.error) toast.error(res.error); else {
      setInstitutions(prev => [...prev, res.data as Institution])
      setField("institution_id", res.data!.id)
      setNewInstName("")
      toast.success("Institution added")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await createParticipant(festivalId, form)
    setSaving(false)
    if (res.error) toast.error(res.error); else {
      toast.success("Participant created")
      router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${res.data!.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Participant</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new participant for this festival.</p>
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
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input value={form.address} onChange={e => setField("address", e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input value={form.city} onChange={e => setField("city", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <Input value={form.district} onChange={e => setField("district", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Input value={form.state} onChange={e => setField("state", e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <Select options={UNITS.map(u => ({ value: u, label: u }))} placeholder="Select Unit" value={form.unit} onChange={e => setField("unit", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <Select options={DIVISIONS.map(d => ({ value: d, label: d }))} placeholder="Select Division" value={form.division} onChange={e => setField("division", e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <Select options={SECTORS.map(s => ({ value: s, label: s }))} placeholder="Select Sector" value={form.sector} onChange={e => setField("sector", e.target.value)} /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <div className="flex gap-2">
                <Select options={[...institutions.map(i => ({ value: i.id, label: i.name })), { value: "__new__", label: "+ Add New Institution" }]} placeholder="Select Institution" value={form.institution_id} onChange={e => setField("institution_id", e.target.value)} className="flex-1" />
              </div>
              {form.institution_id === "__new__" && (
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Institution name" value={newInstName} onChange={e => setNewInstName(e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddInstitution}>Add</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={3} value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Optional notes about this participant..." />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Create Participant
          </Button>
        </div>
      </form>
    </div>
  )
}
