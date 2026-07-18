"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getIncidents, getHealthChecks, getRiskRegister } from "@/lib/actions/enterprise"
import type { IncidentRecord, RiskRegister, HealthCheck } from "@/types/enterprise"
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES, RISK_LEVELS } from "@/config/enterprise"
import { Loader2, AlertTriangle, CheckCircle, XCircle, Clock, BookOpen, Shield, Activity, ArrowLeft, FileText, Server } from "lucide-react"

export default function OperationsPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([])
  const [risks, setRisks] = useState<RiskRegister[]>([])
  const [health, setHealth] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [iRes, rRes, hRes] = await Promise.all([getIncidents(), getRiskRegister(), getHealthChecks()])
    if (iRes.data) setIncidents(iRes.data)
    if (rRes.data) setRisks(rRes.data)
    if (hRes.data) setHealth(hRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const openIncidents = incidents.filter((i) => !["resolved", "post_mortem"].includes(i.status))
  const criticalRisks = risks.filter((r) => r.risk_level === "critical")
  const unhealthyChecks = health.filter((h) => !h.is_healthy)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/platform/security"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Runbook</h1>
          <p className="text-sm text-gray-500">Incident response, risk monitoring, and system health</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 mx-auto text-red-500" /><p className="text-2xl font-bold mt-1">{openIncidents.length}</p><p className="text-xs text-gray-500">Open Incidents</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="h-6 w-6 mx-auto text-orange-500" /><p className="text-2xl font-bold mt-1">{criticalRisks.length}</p><p className="text-xs text-gray-500">Critical Risks</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><XCircle className="h-6 w-6 mx-auto text-red-500" /><p className="text-2xl font-bold mt-1">{unhealthyChecks.length}</p><p className="text-xs text-gray-500">Unhealthy Checks</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="h-6 w-6 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{health.filter((h) => h.is_healthy).length}</p><p className="text-xs text-gray-500">Healthy Checks</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Incident Records</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incidents.map((inc) => {
                const sevCfg = INCIDENT_SEVERITIES.find((s) => s.value === inc.severity)
                const stCfg = INCIDENT_STATUSES.find((s) => s.value === inc.status)
                return (
                  <div key={inc.id} className="p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {inc.status === "resolved" ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> :
                         <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                        <span className="font-medium text-sm truncate">{inc.incident_title}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sevCfg?.color}`}>{sevCfg?.label || inc.severity}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stCfg?.color}`}>{stCfg?.label || inc.status}</span>
                      </div>
                    </div>
                    {inc.incident_description && <p className="text-xs text-gray-500 mt-1">{inc.incident_description}</p>}
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>Detected: {new Date(inc.detected_at).toLocaleString()}</span>
                      {inc.duration_minutes > 0 && <span>Duration: {inc.duration_minutes}m</span>}
                    </div>
                    {inc.root_cause && <p className="text-xs text-gray-500 mt-1">Root cause: {inc.root_cause}</p>}
                    {inc.resolution && <p className="text-xs text-green-600 mt-1">Resolution: {inc.resolution}</p>}
                  </div>
                )
              })}
              {incidents.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No incidents recorded</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Risk Register</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {risks.map((r) => {
                const lvlCfg = RISK_LEVELS.find((l) => l.value === r.risk_level)
                const stCfg = [{ value: "identified", label: "Identified", color: "bg-gray-100 text-gray-700" },
                  { value: "assessed", label: "Assessed", color: "bg-blue-100 text-blue-700" },
                  { value: "mitigated", label: "Mitigated", color: "bg-green-100 text-green-700" },
                  { value: "accepted", label: "Accepted", color: "bg-amber-100 text-amber-700" },
                  { value: "monitoring", label: "Monitoring", color: "bg-purple-100 text-purple-700" },
                ].find((s) => s.value === r.status)
                return (
                  <div key={r.id} className="p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-medium text-sm truncate">{r.risk_title}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${lvlCfg?.color}`}>{lvlCfg?.label || r.risk_level}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stCfg?.color}`}>{stCfg?.label || r.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>Score: {r.risk_score}</span>
                      <span>Category: {r.category}</span>
                      {r.target_resolution_date && <span>Target: {new Date(r.target_resolution_date).toLocaleDateString()}</span>}
                    </div>
                    {r.mitigation_strategy && <p className="text-xs text-green-600 mt-1">Mitigation: {r.mitigation_strategy}</p>}
                  </div>
                )
              })}
              {risks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No risks registered</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
