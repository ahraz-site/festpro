"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMedicalStaff, createMedicalStaff, getMedicalCenters } from "@/lib/actions/medical-emergency"
import { MEDICAL_STAFF_ROLES } from "@/config/medical-emergency"
import { Loader2, Users, Plus, Search } from "lucide-react"

export default function StaffPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [staff, setStaff] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ center_id: "", full_name: "", role: "nurse", phone: "", email: "", specializations: "", license_number: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [s, c] = await Promise.all([getMedicalStaff(festivalId), getMedicalCenters(festivalId)])
    setStaff(s.data || []); setCenters(c.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.full_name || !form.phone) return
    await createMedicalStaff({ ...form, festival_id: festivalId })
    setForm({ center_id: "", full_name: "", role: "nurse", phone: "", email: "", specializations: "", license_number: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medical Staff</h1><p className="text-sm text-gray-500 mt-1">Manage doctors, nurses, paramedics and medical volunteers.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Staff"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Add Staff</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Full Name *</label><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Role</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              {MEDICAL_STAFF_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Phone *</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Center</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.center_id} onChange={e => setForm({...form, center_id: e.target.value})}>
              <option value="">Select...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">License #</label><Input value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Specializations</label><Input value={form.specializations} onChange={e => setForm({...form, specializations: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Staff</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.filter(s => !search || s.full_name.toLowerCase().includes(search.toLowerCase())).map((s: any) => (
          <Card key={s.id} className="hover:shadow-md transition-shadow"><CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><Users className="h-5 w-5 text-green-600" /></div>
              <div><p className="font-semibold">{s.full_name}</p>
                <p className="text-xs text-gray-500">{MEDICAL_STAFF_ROLES.find(r => r.value === s.role)?.label || s.role} · {s.medical_centers?.center_name || "—"}</p></div>
            </div>
            <div className="mt-2 text-sm text-gray-500"><p>{s.phone} · {s.email || "—"}</p></div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
