"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getIncidents, createIncident, updateIncidentStatus, getMedicalCenters, getMedicalStaff } from "@/lib/actions/medical-emergency"
import { INCIDENT_STATUSES, INCIDENT_SEVERITIES, INCIDENT_CATEGORIES as INCIDENT_TYPES } from "@/config/medical-emergency"
import { Loader2, AlertTriangle, Plus, Search } from "lucide-react"

export default function IncidentsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [incidents, setIncidents] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ incident_type: "medical", title: "", description: "", location: "", severity: "low", center_id: "", reported_by: "", is_active: true })

  const load = useCallback(async () => {
    setLoading(true)
    const [i, c, st] = await Promise.all([getIncidents(festivalId, statusFilter || undefined), getMedicalCenters(festivalId), getMedicalStaff(festivalId)])
    setIncidents(i.data || []); setCenters(c.data || []); setStaff(st.data || []); setLoading(false)
  }, [festivalId, typeFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title || !form.description) return
    await createIncident({ ...form, festival_id: festivalId })
    setForm({ incident_type: "medical", title: "", description: "", location: "", severity: "low", center_id: "", reported_by: "", is_active: true })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => { await updateIncidentStatus(id, status); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Incidents</h1><p className="text-sm text-gray-500 mt-1">Track and manage medical and safety incidents.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Report Incident"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Report Incident</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Incident Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.incident_type} onChange={e => setForm({...form, incident_type: e.target.value})}>
              {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Severity</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
              {INCIDENT_SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Description *</label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Center</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.center_id} onChange={e => setForm({...form, center_id: e.target.value})}>
              <option value="">Select...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
            </select></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Report</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>{INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>{INCIDENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {incidents.filter(x => !search || x.title?.toLowerCase().includes(search.toLowerCase()) || x.description?.toLowerCase().includes(search.toLowerCase())).map((inc: any) => (
          <Card key={inc.id} className={inc.severity === "critical" ? "border-red-400" : inc.severity === "high" ? "border-orange-300" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${inc.is_active ? "bg-red-100" : "bg-gray-100"}`}><AlertTriangle className={`h-5 w-5 ${inc.is_active ? "text-red-600" : "text-gray-400"}`} /></div>
                  <div><p className="font-semibold">{inc.title}</p><p className="text-xs text-gray-500">{INCIDENT_TYPES.find(t => t.value === inc.incident_type)?.label || inc.incident_type} · {inc.location || "No location"} · {new Date(inc.reported_at).toLocaleString()}</p></div>
                </div>
                <div className="text-right"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INCIDENT_STATUSES.find(x => x.value === inc.status)?.color || "bg-gray-100"}`}>{INCIDENT_STATUSES.find(x => x.value === inc.status)?.label || inc.status}</span>
                  <p className={`text-xs mt-1 font-medium ${INCIDENT_SEVERITIES.find(x => x.value === inc.severity)?.color || ""}`}>{INCIDENT_SEVERITIES.find(x => x.value === inc.severity)?.label || inc.severity}</p></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{inc.description}</p>
              <div className="flex gap-1 mt-3">
                {inc.status === "reported" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(inc.id, "investigating")}>Investigate</Button>}
                {inc.status === "investigating" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(inc.id, "resolved")}>Resolve</Button>}
                {inc.is_active && <Button size="sm" variant="outline" className="text-xs text-red-600" onClick={() => handleStatus(inc.id, "closed")}>Close</Button>}
              </div>
            </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
