"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getReferrals, createReferral, updateReferralStatus, getMedicalCases, getMedicalCenters, getPatients } from "@/lib/actions/medical-emergency"
import { REFERRAL_STATUSES, REFERRAL_PRIORITIES } from "@/config/medical-emergency"
import { Loader2, ArrowRight, Plus, Search } from "lucide-react"

export default function ReferralsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [referrals, setReferrals] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ case_id: "", referred_to: "", referral_reason: "", priority: "normal", referral_note: "", referred_by: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [r, c, ct, p] = await Promise.all([getReferrals(festivalId, statusFilter || undefined), getMedicalCases(festivalId), getMedicalCenters(festivalId), getPatients(festivalId)])
    setReferrals(r.data || []); setCases(c.data || []); setCenters(ct.data || []); setPatients(p.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.case_id || !form.referred_to || !form.referral_reason) return
    await createReferral({ ...form, festival_id: festivalId })
    setForm({ case_id: "", referred_to: "", referral_reason: "", priority: "normal", referral_note: "", referred_by: "" })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => { await updateReferralStatus(id, status); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Referrals</h1><p className="text-sm text-gray-500 mt-1">Track patient referrals between centers and external facilities.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Referral"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Create Referral</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Case *</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}>
              <option value="">Select...</option>{cases.filter((c: any) => c.status !== "closed").map((c: any) => (
                <option key={c.id} value={c.id}>{c.case_number} — {c.patients?.full_name}</option>
              ))}
            </select></div>
          <div><label className="text-sm font-medium">Refer To *</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.referred_to} onChange={e => setForm({...form, referred_to: e.target.value})}>
              <option value="">Select...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
            </select></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Reason *</label><Input value={form.referral_reason} onChange={e => setForm({...form, referral_reason: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Priority</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
              {REFERRAL_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Referred By</label><Input value={form.referred_by} onChange={e => setForm({...form, referred_by: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Note</label><Input value={form.referral_note} onChange={e => setForm({...form, referral_note: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Create Referral</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>{REFERRAL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {referrals.filter(r => !search || r.referral_reason?.toLowerCase().includes(search.toLowerCase()) || r.medical_cases?.case_number?.toLowerCase().includes(search.toLowerCase())).map((r: any) => (
          <Card key={r.id}><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center"><ArrowRight className="h-5 w-5 text-amber-600" /></div>
                <div><p className="font-semibold">Case {r.medical_cases?.case_number || "—"}</p><p className="text-xs text-gray-500">{r.medical_cases?.patients?.full_name || "Unknown patient"}</p></div>
              </div>
              <div className="text-right"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${REFERRAL_STATUSES.find(x => x.value === r.status)?.color || "bg-gray-100"}`}>{REFERRAL_STATUSES.find(x => x.value === r.status)?.label || r.status}</span>
                <p className={`text-xs mt-1 ${REFERRAL_PRIORITIES.find(x => x.value === r.priority)?.color || ""}`}>{REFERRAL_PRIORITIES.find(x => x.value === r.priority)?.label || r.priority}</p></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{r.referral_reason}</p>
            <p className="text-xs text-gray-400 mt-1">To: {r.referred_center?.center_name || "External facility"}</p>
            <div className="flex gap-1 mt-2">
              {r.status === "pending" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(r.id, "accepted")}>Accept</Button>}
              {r.status === "pending" && <Button size="sm" variant="outline" className="text-xs text-red-600" onClick={() => handleStatus(r.id, "declined")}>Decline</Button>}
              {r.status === "accepted" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(r.id, "completed")}>Complete</Button>}
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
