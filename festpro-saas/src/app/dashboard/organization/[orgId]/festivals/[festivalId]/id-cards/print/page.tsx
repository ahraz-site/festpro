"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getPrintJobs, createPrintJob, updatePrintJobStatus, getPrintHistory } from "@/lib/actions/id-card"
import { PRINT_STATUSES } from "@/config/id-card"
import type { PrintJob, PrintHistory as PrintHistoryType } from "@/types/id-card"
import { Loader2, Plus, X, Printer, Clock, CheckCircle, XCircle, Download, History, FileText } from "lucide-react"

export default function PrintPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [jobs, setJobs] = useState<PrintJob[]>([])
  const [history, setHistory] = useState<PrintHistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ job_name: "", entity_type: "id_card", entity_ids: "", print_type: "single" })

  const load = useCallback(async () => {
    const [jRes, hRes] = await Promise.all([getPrintJobs(festivalId), getPrintHistory(festivalId)])
    setJobs(jRes.data || []); setHistory(hRes.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ids = form.entity_ids.split(",").map(s => s.trim()).filter(Boolean)
    await createPrintJob({ festival_id: festivalId, ...form, entity_ids: ids })
    setShowForm(false); setForm({ job_name: "", entity_type: "id_card", entity_ids: "", print_type: "single" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Print Queue</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} jobs, {jobs.filter(j => j.status === "queued" || j.status === "processing").length} pending.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> New Print Job</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Print Job</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="text-sm font-medium">Job Name *</label><Input value={form.job_name} onChange={e => setForm(f => ({ ...f, job_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Entity Type</label>
                <Select value={form.entity_type} onChange={e => setForm(f => ({ ...f, entity_type: e.target.value }))} options={[
                  { value: "id_card", label: "ID Cards" },
                  { value: "badge", label: "Badges" },
                  { value: "pass", label: "Passes" },
                  { value: "vehicle_pass", label: "Vehicle Passes" },
                  { value: "guest_pass", label: "Guest Passes" },
                  { value: "vip_pass", label: "VIP Passes" },
                  { value: "media_pass", label: "Media Passes" },
                ]} />
              </div>
              <div><label className="text-sm font-medium">Print Type</label>
                <Select value={form.print_type} onChange={e => setForm(f => ({ ...f, print_type: e.target.value }))} options={[
                  { value: "single", label: "Single" },
                  { value: "bulk", label: "Bulk" },
                  { value: "batch", label: "Batch" },
                ]} />
              </div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Entity IDs (comma separated)</label><Input value={form.entity_ids} onChange={e => setForm(f => ({ ...f, entity_ids: e.target.value }))} placeholder="id1, id2, id3" /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create Job</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {jobs.map(j => (
          <Card key={j.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    j.status === "completed" ? "bg-green-50" : j.status === "failed" ? "bg-red-50" : j.status === "processing" ? "bg-blue-50" : "bg-gray-50"
                  }`}>
                    {j.status === "completed" ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                     j.status === "failed" ? <XCircle className="h-5 w-5 text-red-600" /> :
                     j.status === "processing" ? <Clock className="h-5 w-5 text-blue-600" /> :
                     <Printer className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-semibold">{j.job_name}</p>
                    <p className="text-xs text-gray-500">{j.entity_type} | {j.total_items} items | {j.print_type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PRINT_STATUSES.find(ps => ps.value === j.status)?.color || "bg-gray-100"}`}>
                  {PRINT_STATUSES.find(ps => ps.value === j.status)?.label || j.status}
                </span>
              </div>
              {j.status === "processing" && j.total_items > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(j.completed_items / j.total_items) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{j.completed_items} / {j.total_items} completed</p>
                </div>
              )}
              {j.status === "queued" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { await updatePrintJobStatus(j.id, "processing"); load() }}>Start Printing</Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await updatePrintJobStatus(j.id, "cancelled"); load() }}>Cancel</Button>
                </div>
              )}
              {j.status === "processing" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { await updatePrintJobStatus(j.id, "completed"); load() }}>Complete</Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await updatePrintJobStatus(j.id, "failed"); load() }}>Fail</Button>
                </div>
              )}
              {j.pdf_url && (
                <div className="mt-2">
                  <a href={j.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && <p className="text-gray-500 text-center py-8">No print jobs created.</p>}
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Print History <History className="h-4 w-4 inline" /></CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 20).map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm p-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    <span>{h.entity_type} - {h.entity_id.slice(0, 8)}...</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(h.printed_at).toLocaleString()} | {h.copies} copy(ies)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
