"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getAuditLogs } from "@/lib/actions/security"
import { AUDIT_ACTIONS, AUDIT_STATUSES } from "@/config/security"
import type { AuditLog } from "@/types/security"
import { Loader2, FileText, Search, Filter, ChevronDown, ChevronUp, Eye, Shield, User, Globe } from "lucide-react"

export default function AuditLogsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filters, setFilters] = useState({ action: "", status: "", days: "7" })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getAuditLogs(festivalId, {
      action: filters.action || undefined, status: filters.status || undefined,
      days: filters.days ? parseInt(filters.days) : undefined,
    })
    setLogs(res.data || []); setLoading(false)
  }, [festivalId, filters])

  useEffect(() => { load() }, [load])

  const actionIcon = (action: string) => {
    const found = AUDIT_ACTIONS.find(a => a.value === action)
    return found?.icon || "FileText"
  }

  if (loading && logs.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">{logs.length} entries</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Select options={[{ value: "", label: "All Actions" }, ...AUDIT_ACTIONS.map(a => ({ value: a.value, label: a.label }))]} value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))} className="w-44" />
            <Select options={[{ value: "", label: "All Status" }, ...AUDIT_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="w-36" />
            <Select options={[{ value: "1", label: "Last 24h" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }, { value: "90", label: "Last 90 days" }]} value={filters.days} onChange={e => setFilters(f => ({ ...f, days: e.target.value }))} className="w-36" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No audit logs found</p>
          </CardContent></Card>
        ) : logs.map(log => (
          <Card key={log.id} className={`hover:shadow-sm transition-shadow ${log.status === "failure" ? "border-l-4 border-red-400" : log.status === "blocked" ? "border-l-4 border-amber-400" : ""}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full mt-0.5 ${
                    log.status === "success" ? "bg-green-50 text-green-600" :
                    log.status === "failure" ? "bg-red-50 text-red-600" :
                    "bg-gray-50 text-gray-600"
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{AUDIT_ACTIONS.find(a => a.value === log.action)?.label || log.action}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${AUDIT_STATUSES.find(s => s.value === log.status)?.color || ""}`}>{log.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{log.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : log.user_id?.substring(0, 8) || "System"}</span>
                      {log.entity_type && <span>{log.entity_type}:{log.entity_id?.substring(0, 8)}</span>}
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      {log.ip_address && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {log.ip_address}</span>}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">{expanded === log.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
              </div>
              {expanded === log.id && log.changes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Changes</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto max-h-40">{JSON.stringify(log.changes, null, 2)}</pre>
                </div>
              )}
              {expanded === log.id && log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Metadata</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto max-h-32">{JSON.stringify(log.metadata, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
