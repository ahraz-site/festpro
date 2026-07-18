"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getSavedReports, saveReport, toggleFavoriteReport, deleteSavedReport } from "@/lib/actions/reports"
import { REPORT_TYPES, REPORT_SCHEDULES } from "@/config/finance"
import { Loader2, Star, Trash2, Clock, Share2, FileText, Heart, Calendar } from "lucide-react"

export default function SavedReportsPage() {
  const params = useParams()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSave, setShowSave] = useState(false)
  const [form, setForm] = useState({ report_name: "", description: "", template_id: "", schedule: "none" })

  const load = useCallback(async () => {
    const res = await getSavedReports()
    setReports(res.data || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.report_name) { toast.error("Report name required"); return }
    const res = await saveReport({
      report_name: form.report_name, description: form.description || undefined,
      schedule: form.schedule as any,
    })
    if (res.error) toast.error(res.error); else { toast.success("Report saved"); setShowSave(false); setForm({ report_name: "", description: "", template_id: "", schedule: "none" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Your saved, favorited, and scheduled reports.</p>
        </div>
        <Button onClick={() => setShowSave(!showSave)}><FileText className="h-4 w-4 mr-1" /> Save Current</Button>
      </div>

      {showSave && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input value={form.report_name} onChange={e => setForm(f => ({ ...f, report_name: e.target.value }))} placeholder="Report Name *" />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <Select options={REPORT_SCHEDULES.map(s => ({ value: s.value, label: s.label }))} value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setShowSave(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No saved reports yet</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map(r => (
            <Card key={r.id} className={r.is_favorite ? "ring-1 ring-amber-300" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="font-semibold">{r.report_name}</p>
                      <p className="text-xs text-gray-400">{r.template?.template_name || "Custom"} · {new Date(r.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={async () => { await toggleFavoriteReport(r.id, !r.is_favorite); load() }}>
                      <Heart className={`h-3 w-3 ${r.is_favorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={async () => { await deleteSavedReport(r.id); load() }}>
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </div>
                {r.description && <p className="text-sm text-gray-500 mt-1">{r.description}</p>}
                {r.schedule !== "none" && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                    <Calendar className="h-3 w-3" /> Scheduled: {r.schedule}
                  </div>
                )}
                {r.last_run_at && <p className="text-xs text-gray-400 mt-1">Last run: {new Date(r.last_run_at).toLocaleString()}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
