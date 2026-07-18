"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getErrorLogs, resolveErrorLog } from "@/lib/actions/security"
import type { ErrorLog } from "@/types/security"
import { Loader2, Bug, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, Server, Database, Shield, XCircle } from "lucide-react"

export default function ErrorLogsPage() {
  const festivalId = useParams().festivalId as string
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filters, setFilters] = useState({ resolved: "", days: "7" })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getErrorLogs(festivalId, {
      resolved: filters.resolved === "no" ? false : filters.resolved === "yes" ? true : undefined,
      days: parseInt(filters.days),
    })
    setErrors(res.data || []); setLoading(false)
  }, [festivalId, filters])

  useEffect(() => { load() }, [load])

  const handleResolve = async (id: string) => {
    await resolveErrorLog(id); toast.success("Marked resolved"); load()
  }

  const errorIcon = (type: string) => {
    if (type.includes("db") || type.includes("database") || type.includes("sql")) return <Database className="h-4 w-4" />
    if (type.includes("auth") || type.includes("security")) return <Shield className="h-4 w-4" />
    if (type.includes("valid")) return <AlertTriangle className="h-4 w-4" />
    if (type.includes("server") || type.includes("internal")) return <Server className="h-4 w-4" />
    return <Bug className="h-4 w-4" />
  }

  if (loading && errors.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
        <p className="text-sm text-gray-500 mt-1">{errors.filter(e => !e.is_resolved).length} unresolved · {errors.length} total</p>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <Select options={[{ value: "", label: "All Status" }, { value: "no", label: "Unresolved" }, { value: "yes", label: "Resolved" }]} value={filters.resolved} onChange={e => setFilters(f => ({ ...f, resolved: e.target.value }))} className="w-36" />
          <Select options={[{ value: "1", label: "Last 24h" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} value={filters.days} onChange={e => setFilters(f => ({ ...f, days: e.target.value }))} className="w-36" />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {errors.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">
            <Bug className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No errors logged</p>
          </CardContent></Card>
        ) : errors.map(e => (
          <Card key={e.id} className={`${!e.is_resolved ? "border-l-4 border-red-400" : ""}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full mt-0.5 ${!e.is_resolved ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {errorIcon(e.error_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{e.error_type}</p>
                      {e.status_code && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{e.status_code}</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${e.is_resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{e.is_resolved ? "Resolved" : "Open"}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{e.error_message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {e.route && <span>{e.method} {e.route}</span>}
                      <span>{new Date(e.created_at).toLocaleString()}</span>
                      {e.ip_address && <span>IP: {e.ip_address}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!e.is_resolved && (
                    <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); handleResolve(e.id) }}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  {expanded === e.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
              {expanded === e.id && e.stack_trace && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Stack Trace</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto max-h-48 whitespace-pre-wrap font-mono">{e.stack_trace}</pre>
                </div>
              )}
              {expanded === e.id && e.request_body && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Request Body</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto max-h-32">{JSON.stringify(e.request_body, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
