"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { importParticipantsFromCsv, exportParticipantsCsv, exportRegistrationReport } from "@/lib/actions/participant/import-export"
import { Upload, Download, Loader2, FileSpreadsheet, FileText } from "lucide-react"

export default function ImportExportPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [csvText, setCsvText] = useState("")
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleImport = async () => {
    if (!csvText.trim()) { toast.error("Paste CSV data first"); return }
    setImporting(true)
    const res = await importParticipantsFromCsv(festivalId, csvText)
    setImporting(false)
    if (res.results) setResults(res.results)
    if (res.error) toast.error(res.error); else toast.success(`Imported ${res.imported} participants`)
  }

  const handleExportCsv = async () => {
    const res = await exportParticipantsCsv(festivalId)
    if (res.error) { toast.error(res.error); return }
    const blob = new Blob([res.csv!], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = res.filename!; a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  const handleExportRegReport = async () => {
    const res = await exportRegistrationReport(festivalId)
    if (res.error) { toast.error(res.error); return }
    const blob = new Blob([res.csv!], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = res.filename!; a.click()
    URL.revokeObjectURL(url)
    toast.success("Registration report exported")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-sm text-gray-500 mt-1">Bulk import participants via CSV or export participant data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Upload className="h-4 w-4" />Import Participants (CSV)</CardTitle>
          <CardDescription>Paste CSV data with columns: first_name, last_name, date_of_birth, gender, email, phone, unit, division, sector, institution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={8}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder={`first_name,last_name,date_of_birth,gender,email,phone,unit,division,sector,institution
John,Doe,2000-01-15,male,john@example.com,1234567890,A,Junior,Education,Springfield School`}
          />
          <Button onClick={handleImport} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            Import CSV
          </Button>

          {results.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Import Results</h4>
              <div className="max-h-40 overflow-y-auto text-xs">
                {results.map((r, i) => (
                  <div key={i} className={`px-2 py-1 ${r.error ? "text-red-600" : "text-green-600"}`}>
                    Row {r.row}: {r.status} {r.error ? `- ${r.error}` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Export Participants</CardTitle>
            <CardDescription>Download all participants as CSV file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Registration Report</CardTitle>
            <CardDescription>Download registration report as CSV file.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExportRegReport}><Download className="h-4 w-4 mr-2" />Export Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
