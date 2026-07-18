"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getReportTemplates, upsertReportTemplate, deleteReportTemplate } from "@/lib/actions/reports"
import { REPORT_TYPES, CHART_TYPES } from "@/config/finance"
import type { ReportTemplate } from "@/types/finance"
import { Loader2, Plus, Trash2, Edit3, Save, FileText, BarChart3 } from "lucide-react"

export default function ReportTemplatesPage() {
  const params = useParams()
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ template_name: "", description: "", report_type: "participants", chart_type: "bar", grouping: "" })

  const load = useCallback(async () => {
    const res = await getReportTemplates()
    setTemplates(res.data || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.template_name) { toast.error("Template name required"); return }
    const res = await upsertReportTemplate({
      id: editId || undefined, template_name: form.template_name, description: form.description || undefined,
      report_type: form.report_type, chart_type: form.chart_type, grouping: form.grouping || undefined,
      fields: [], filters: {}, sorting: [],
    })
    if (res.error) toast.error(res.error); else { toast.success(editId ? "Template updated" : "Template created"); setShowForm(false); setEditId(null); setForm({ template_name: "", description: "", report_type: "participants", chart_type: "bar", grouping: "" }); load() }
  }

  const handleEdit = (t: ReportTemplate) => {
    setEditId(t.id); setForm({ template_name: t.template_name, description: t.description || "", report_type: t.report_type, chart_type: t.chart_type || "bar", grouping: t.grouping || "" }); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage reusable report templates.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ template_name: "", description: "", report_type: "participants", chart_type: "bar", grouping: "" }) }}>
          <Plus className="h-4 w-4 mr-1" /> New Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input value={form.template_name} onChange={e => setForm(f => ({ ...f, template_name: e.target.value }))} placeholder="Template Name *" />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Select options={REPORT_TYPES.map(t => ({ value: t.value, label: t.label }))} value={form.report_type} onChange={e => setForm(f => ({ ...f, report_type: e.target.value }))} />
              <Select options={CHART_TYPES.map(c => ({ value: c.value, label: c.label }))} value={form.chart_type} onChange={e => setForm(f => ({ ...f, chart_type: e.target.value }))} />
            </div>
            <Input value={form.grouping} onChange={e => setForm(f => ({ ...f, grouping: e.target.value }))} placeholder="Group By (e.g. unit, division, category)" />
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save Template</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 ? (
          <Card className="sm:col-span-3"><CardContent className="py-12 text-center text-gray-400">No templates yet</CardContent></Card>
        ) : templates.map(t => (
          <Card key={t.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-50"><BarChart3 className="h-5 w-5 text-cyan-600" /></div>
                  <div>
                    <p className="font-semibold">{t.template_name}</p>
                    <p className="text-xs text-gray-400 capitalize">{t.report_type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Edit3 className="h-3 w-3" /></Button>
              </div>
              {t.description && <p className="text-sm text-gray-500 mt-2">{t.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {t.chart_type && <span>Chart: {t.chart_type}</span>}
                {t.grouping && <span>Group: {t.grouping}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
