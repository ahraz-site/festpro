"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { generateReport, upsertReportTemplate, exportReport } from "@/lib/actions/reports"
import { REPORT_TYPES, CHART_TYPES } from "@/config/finance"
import { Loader2, FileText, Download, Save, Plus, X } from "lucide-react"

export default function ReportBuilderPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [reportType, setReportType] = useState("participants")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState("")
  const [chartType, setChartType] = useState("bar")
  const [templateName, setTemplateName] = useState("")
  const [sortField, setSortField] = useState("")
  const [sortDir, setSortDir] = useState("asc")

  const handleGenerate = async () => {
    setLoading(true)
    const res = await generateReport(reportType, festivalId)
    if (res.error) { toast.error(res.error); setLoading(false); return }
    setReportData(res)
    if (res.headers) setSelectedFields(res.headers.slice(0, 5))
    setLoading(false)
  }

  const handleExport = async () => {
    const res = await exportReport(reportType, "csv", festivalId)
    if (res.error) { toast.error(res.error); return }
    if (res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url; a.download = res.filename || "report.csv"; a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName) { toast.error("Template name required"); return }
    const res = await upsertReportTemplate({
      template_name: templateName, report_type: reportType,
      fields: selectedFields, sorting: sortField ? [{ field: sortField, dir: sortDir }] : [],
      grouping: groupBy || undefined, chart_type: chartType,
    })
    if (res.error) toast.error(res.error); else toast.success("Template saved")
  }

  const toggleField = (field: string) => {
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Custom Report Builder</h1>
        <p className="text-sm text-gray-500 mt-1">Build custom reports with field selection, filters, and grouping.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select options={REPORT_TYPES.map(t => ({ value: t.value, label: t.label }))} value={reportType} onChange={e => setReportType(e.target.value)} />
            <Button onClick={handleGenerate} disabled={loading} className="w-full"><FileText className="h-4 w-4 mr-1" /> {loading ? "Loading..." : "Load Data"}</Button>

            {reportData && (
              <>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Fields ({selectedFields.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {reportData.headers?.map((h: string) => (
                      <label key={h} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={selectedFields.includes(h)} onChange={() => toggleField(h)} />
                        {h}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <Select options={[{ value: "", label: "No Grouping" }, ...reportData.headers?.map((h: string) => ({ value: h, label: h })) || []]} value={groupBy} onChange={e => setGroupBy(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <Select options={reportData.headers?.map((h: string) => ({ value: h, label: h })) || []} value={sortField} onChange={e => setSortField(e.target.value)} />
                    <Select options={[{ value: "asc", label: "Asc" }, { value: "desc", label: "Desc" }]} value={sortDir} onChange={e => setSortDir(e.target.value)} />
                  </div>
                  <Select options={CHART_TYPES.map(c => ({ value: c.value, label: c.label }))} value={chartType} onChange={e => setChartType(e.target.value)} />
                </div>

                <div className="pt-2 border-t space-y-2">
                  <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Save as template..." />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveTemplate}><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-3 w-3 mr-1" /> CSV</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
          <CardContent>
            {!reportData ? (
              <p className="text-center text-gray-400 py-12">Select report type and click "Load Data"</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {selectedFields.map(h => <th key={h} className="text-left px-3 py-2 font-medium text-gray-500">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.data || []).slice(0, 30).map((row: any, i: number) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                        {selectedFields.map(h => {
                          const key = h.toLowerCase().replace(/[\s#]/g, "_")
                          return <td key={h} className="px-3 py-2">{row[key] !== undefined ? String(row[key]) : "—"}</td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-2">Showing {Math.min(30, reportData.count)} of {reportData.count} records</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
