"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPatients, createPatient } from "@/lib/actions/medical-emergency"
import { PATIENT_TYPES, BLOOD_GROUPS } from "@/config/medical-emergency"
import { Loader2, UserPlus, Plus, Search, Stethoscope } from "lucide-react"

export default function PatientsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: "", patient_type: "participant", phone: "", email: "", date_of_birth: "", gender: "", blood_group: "", emergency_contact_name: "", emergency_contact_phone: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true); const p = await getPatients(festivalId); setPatients(p.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.full_name) return
    await createPatient({ ...form, festival_id: festivalId })
    setForm({ full_name: "", patient_type: "participant", phone: "", email: "", date_of_birth: "", gender: "", blood_group: "", emergency_contact_name: "", emergency_contact_phone: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Patients</h1><p className="text-sm text-gray-500 mt-1">Register and manage patient records.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Register Patient"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Register Patient</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Full Name *</label><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.patient_type} onChange={e => setForm({...form, patient_type: e.target.value})}>
              {PATIENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="text-sm font-medium">DOB</label><Input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Gender</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
              <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select></div>
          <div><label className="text-sm font-medium">Blood Group</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})}>
              <option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Emergency Contact</label><Input value={form.emergency_contact_name} onChange={e => setForm({...form, emergency_contact_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Emergency Phone</label><Input value={form.emergency_contact_phone} onChange={e => setForm({...form, emergency_contact_phone: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2 pt-2"><Button onClick={handleCreate}><UserPlus className="h-4 w-4 mr-1" /> Register</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Patient Code</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Blood</th><th className="px-4 py-3">Emergency Contact</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {patients.filter(p => !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.patient_code.toLowerCase().includes(search.toLowerCase())).map((p: any) => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono">{p.patient_code}</td>
            <td className="px-4 py-3 text-sm font-medium">{p.full_name}</td>
            <td className="px-4 py-3 text-sm">{PATIENT_TYPES.find(t => t.value === p.patient_type)?.label || p.patient_type}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{p.phone || "—"}</td>
            <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{p.blood_group || "—"}</span></td>
            <td className="px-4 py-3 text-sm text-gray-500">{p.emergency_contact_name ? `${p.emergency_contact_name} (${p.emergency_contact_phone})` : "—"}</td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
