"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMedicalCertificates, createMedicalCertificate, getMedicalCases, getPatients } from "@/lib/actions/medical-emergency"
import { MEDICAL_CERTIFICATE_TYPES } from "@/config/medical-emergency"
import { Loader2, FileText, Plus, Search } from "lucide-react"

export default function CertificatesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [certs, setCerts] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ case_id: "", certificate_type: "fitness", issued_by: "", remarks: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [c, cs, p] = await Promise.all([getMedicalCertificates(festivalId), getMedicalCases(festivalId), getPatients(festivalId)])
    setCerts(c.data || []); setCases(cs.data || []); setPatients(p.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.case_id || !form.issued_by) return
    await createMedicalCertificate({ ...form, festival_id: festivalId })
    setForm({ case_id: "", certificate_type: "fitness", issued_by: "", remarks: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medical Certificates</h1><p className="text-sm text-gray-500 mt-1">Issue and manage medical certificates and clearances.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Issue Certificate"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Issue Certificate</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Case *</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}>
              <option value="">Select...</option>{cases.filter((c: any) => c.status === "closed" || c.status === "discharged").map((c: any) => (
                <option key={c.id} value={c.id}>{c.case_number} — {c.patients?.full_name}</option>
              ))}
            </select></div>
          <div><label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.certificate_type} onChange={e => setForm({...form, certificate_type: e.target.value})}>
              {MEDICAL_CERTIFICATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Issued By *</label><Input value={form.issued_by} onChange={e => setForm({...form, issued_by: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Remarks</label><Input value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Issue Certificate</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search certificates..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Certificate #</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Case</th><th className="px-4 py-3">Issued By</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {certs.filter(c => !search || c.certificate_number?.toLowerCase().includes(search.toLowerCase())).map((c: any) => (
          <tr key={c.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono font-medium">{c.certificate_number}</td>
            <td className="px-4 py-3 text-sm">{MEDICAL_CERTIFICATE_TYPES.find(t => t.value === c.certificate_type)?.label || c.certificate_type}</td>
            <td className="px-4 py-3 text-sm">{c.medical_cases?.patients?.full_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{c.medical_cases?.case_number || "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{c.issued_by}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.issued_at).toLocaleDateString()}</td>
            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.is_valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.is_valid ? "Valid" : "Revoked"}</span></td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
