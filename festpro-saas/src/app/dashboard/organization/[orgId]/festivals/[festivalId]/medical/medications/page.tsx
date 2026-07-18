"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMedications, createMedication } from "@/lib/actions/medical-emergency"
import { MEDICINE_CATEGORIES } from "@/config/medical-emergency"
import { Loader2, Pill, Plus, Search } from "lucide-react"

export default function MedicationsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [meds, setMeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ medication_name: "", generic_name: "", category: "tablet", dosage_form: "", strength: "", manufacturer: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true); const m = await getMedications(festivalId); setMeds(m.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.medication_name) return
    await createMedication({ ...form, festival_id: festivalId })
    setForm({ medication_name: "", generic_name: "", category: "tablet", dosage_form: "", strength: "", manufacturer: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medications</h1><p className="text-sm text-gray-500 mt-1">Master list of medications used across medical centers.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Medication"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Add Medication</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Medication Name *</label><Input value={form.medication_name} onChange={e => setForm({...form, medication_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Generic Name</label><Input value={form.generic_name} onChange={e => setForm({...form, generic_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Category</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {MEDICINE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Dosage Form</label><Input value={form.dosage_form} onChange={e => setForm({...form, dosage_form: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Strength</label><Input value={form.strength} onChange={e => setForm({...form, strength: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Manufacturer</label><Input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Medication</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search medications..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Name</th><th className="px-4 py-3">Generic</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Strength</th><th className="px-4 py-3">Manufacturer</th><th className="px-4 py-3">Status</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {meds.filter(m => !search || m.medication_name.toLowerCase().includes(search.toLowerCase())).map((m: any) => (
          <tr key={m.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium">{m.medication_name}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{m.generic_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{MEDICINE_CATEGORIES.find(c => c.value === m.category)?.label || m.category}</td>
            <td className="px-4 py-3 text-sm">{m.strength || "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{m.manufacturer || "—"}</td>
            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{m.is_active ? "Active" : "Inactive"}</span></td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
