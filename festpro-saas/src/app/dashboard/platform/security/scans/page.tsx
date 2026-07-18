"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSecurityScanResults, getSecurityScanSummary } from "@/lib/actions/enterprise"
import type { SecurityScanResult } from "@/types/enterprise"
import { RISK_LEVELS, SCAN_RESULTS, SCAN_CATEGORIES } from "@/config/enterprise"
import { Loader2, Shield, AlertTriangle, ArrowLeft, Filter } from "lucide-react"

export default function SecurityScansPage() {
  const [scans, setScans] = useState<SecurityScanResult[]>([])
  const [summary, setSummary] = useState<{ total: number; critical: number; high: number; medium: number; low: number; by_type: Record<string, number> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  const load = useCallback(async () => {
    const [sRes, sumRes] = await Promise.all([getSecurityScanResults(), getSecurityScanSummary()])
    if (sRes.data) setScans(sRes.data)
    if (sumRes.data) setSummary(sumRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter ? scans.filter((s) => s.scan_type === filter) : scans

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/platform/security"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Scans</h1>
          <p className="text-sm text-gray-500">SAST, DAST, dependency, container, and infrastructure scan results</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{summary?.total ?? 0}</p><p className="text-xs text-gray-500">Total Scans</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{summary?.critical ?? 0}</p><p className="text-xs text-gray-500">Critical</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-orange-600">{summary?.high ?? 0}</p><p className="text-xs text-gray-500">High</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{summary?.medium ?? 0}</p><p className="text-xs text-gray-500">Medium</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-gray-600">{summary?.low ?? 0}</p><p className="text-xs text-gray-500">Low</p></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => setFilter("")}>All</Button>
        {SCAN_CATEGORIES.map((cat) => (
          <Button key={cat.value} variant={filter === cat.value ? "default" : "outline"} size="sm" onClick={() => setFilter(filter === cat.value ? "" : cat.value)}>{cat.label}</Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Scan Findings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((s) => {
              const sevCfg = RISK_LEVELS.find((l) => l.value === s.severity)
              const resCfg = SCAN_RESULTS.find((r) => r.value === s.scan_result)
              return (
                <div key={s.id} className="p-3 rounded-lg border hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sevCfg?.color}`}>{sevCfg?.label || s.severity}</span>
                      <span className="font-medium text-sm truncate">{s.finding_title}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${resCfg?.color}`}>{resCfg?.label || s.scan_result}</span>
                  </div>
                  {s.finding_description && <p className="text-xs text-gray-500 mt-1">{s.finding_description}</p>}
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Type: {s.scan_type}</span>
                    {s.cve_id && <span className="font-mono">{s.cve_id}</span>}
                    {s.cvss_score > 0 && <span>CVSS: {s.cvss_score}</span>}
                    {s.module_name && <span>Module: {s.module_name}</span>}
                    <span>Scanned: {new Date(s.scanned_at).toLocaleDateString()}</span>
                  </div>
                  {s.remediation && <p className="text-xs text-green-600 mt-1">Remediation: {s.remediation}</p>}
                </div>
              )
            })}
            {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No scan results found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
