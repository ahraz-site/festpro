"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { generateReport, generateFinancialReport, getFinancialReports, exportReport } from "@/lib/actions/reports"
import { REPORT_TYPES, REPORT_FORMATS } from "@/config/finance"
import type { FinancialReport } from "@/types/finance"
import { Loader2, FileText, Download, Plus, BarChart3, Table, FileSpreadsheet, Calendar, DollarSign } from "lucide-react"

export default function ReportsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [reportType, setReportType] = useState("participants")
  const [format, setFormat] = useState("csv")
  const [reportData, setReportData] = useState<any>(null)

  const load = useCallback(async () => {
    const res = await getFinancialReports(festivalId)
    setReports(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await generateReport(reportType, festivalId)
    if (res.error) { toast.error(res.error); setGenerating(false); return }
    setReportData(res)
    setGenerating(false)
  }

  const handleExport = async () => {
    const res = await exportReport(reportType, format, festivalId)
    if (res.error) { toast.error(res.error); return }
    if (res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url; a.download = res.filename || "report.csv"; a.click()
      URL.revokeObjectURL(url)
    }
    toast.success("Report exported")
  }

  const handleFinancialReport = async () => {
    setGenerating(true)
    const res = await generateFinancialReport(festivalId)
    if (res.error) toast.error(res.error); else { toast.success("Financial report generated"); load() }
    setGenerating(false)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and export festival reports.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/finance/reports/builder`}>
            <Button variant="outline"><BarChart3 className="h-4 w-4 mr-1" /> Custom Report</Button>
          </Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/finance/reports/saved`}>
            <Button variant="outline"><FileText className="h-4 w-4 mr-1" /> Saved Reports</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Generate Report</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select options={REPORT_TYPES.map(t => ({ value: t.value, label: t.label }))} value={reportType} onChange={e => setReportType(e.target.value)} className="flex-1" />
            <Select options={REPORT_FORMATS.map(f => ({ value: f.value, label: f.label }))} value={format} onChange={e => setFormat(e.target.value)} className="w-32" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={generating}><FileText className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "Generate"}</Button>
            {reportData && <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>}
            <Button variant="outline" onClick={handleFinancialReport} disabled={generating}><DollarSign className="h-4 w-4 mr-1" /> Financial Report</Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader><CardTitle className="text-lg">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report ({reportData.count} records)</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {reportData.headers?.map((h: string) => <th key={h} className="text-left px-3 py-2 font-medium text-gray-500">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(reportData.data || []).slice(0, 50).map((row: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {reportData.headers?.map((h: string) => {
                      const key = h.toLowerCase().replace(/[\s#]/g, "_")
                      return <td key={h} className="px-3 py-2">{row[key] !== undefined ? String(row[key]) : "—"}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {(reportData.data || []).length > 50 && <p className="text-sm text-gray-400 mt-2">Showing 50 of {reportData.count} records. Export for full data.</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Generated Financial Reports</CardTitle></CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No financial reports generated yet</p>
          ) : (
            <div className="divide-y">
              {reports.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{r.report_name}</p>
                    <p className="text-xs text-gray-400">{new Date(r.generated_at).toLocaleString()} · Income: ₹{r.total_income.toLocaleString()} · Expense: ₹{r.total_expense.toLocaleString()} · Net: ₹{r.net_balance.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-semibold ${r.net_balance >= 0 ? "text-green-600" : "text-red-600"}`}>{r.net_balance >= 0 ? "+" : ""}₹{r.net_balance.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
