"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSecurityScanResults, getSecurityScanSummary, getComplianceSummary, getRiskRegister, getEnterpriseDashboard } from "@/lib/actions/enterprise"
import type { Module30DashboardData } from "@/types/enterprise"
import { RISK_LEVELS, SCAN_RESULTS, COMPLIANCE_FRAMEWORKS } from "@/config/enterprise"
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle, FileText, Activity, BarChart3, ArrowRight, Lock, Eye, Server, Bug } from "lucide-react"

export default function SecurityPage() {
  const [dash, setDash] = useState<Module30DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getEnterpriseDashboard()
    if (res.data) setDash(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Security Score", value: `${dash?.security_score ?? 100}%`, icon: Shield, color: "text-green-600 bg-green-50", detail: `${dash?.critical_findings ?? 0} critical` },
    { label: "Compliance", value: `${dash?.compliance_score ?? 100}%`, icon: CheckCircle, color: "text-blue-600 bg-blue-50", detail: `${dash?.compliant_controls ?? 0}/${dash?.total_compliance_controls ?? 0} controls` },
    { label: "Open Incidents", value: dash?.open_incidents ?? 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", detail: `${dash?.total_risks ?? 0} risks tracked` },
    { label: "Performance", value: `${dash?.performance_score ?? 100}%`, icon: Activity, color: "text-purple-600 bg-purple-50", detail: `${dash?.failed_benchmarks ?? 0} failed benchmarks` },
    { label: "Availability", value: `${dash?.availability_score ?? 100}%`, icon: BarChart3, color: "text-cyan-600 bg-cyan-50", detail: `${dash?.unhealthy_checks ?? 0} unhealthy checks` },
    { label: "Scans Run", value: dash?.total_scan_results ?? 0, icon: Bug, color: "text-amber-600 bg-amber-50", detail: `${dash?.critical_findings ?? 0} critical findings` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Security</h1>
          <p className="text-sm text-gray-500 mt-1">Security hardening, compliance, and risk management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/platform/security/compliance"><Button variant="outline"><FileText className="h-4 w-4 mr-2" />Compliance</Button></Link>
          <Link href="/dashboard/platform/security/scans"><Button variant="outline"><Bug className="h-4 w-4 mr-2" />Scans</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{s.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link href="/dashboard/platform/security/compliance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50"><FileText className="h-5 w-5 text-blue-600" /></div>
              <div><p className="font-semibold text-gray-900">Compliance Readiness</p><p className="text-xs text-gray-500">SOC 2, ISO 27001, GDPR</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/platform/security/scans">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50"><Bug className="h-5 w-5 text-amber-600" /></div>
              <div><p className="font-semibold text-gray-900">Security Scans</p><p className="text-xs text-gray-500">SAST, DAST, dependency, container</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/platform/operations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
              <div><p className="font-semibold text-gray-900">Incidents & Operations</p><p className="text-xs text-gray-500">Incident response, runbook, health</p></div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Vulnerability Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {RISK_LEVELS.filter((l) => dash?.by_severity.find((s) => s.severity === l.value)).map((lvl) => {
                const count = dash?.by_severity.find((s) => s.severity === lvl.value)?.count ?? 0
                return (
                  <div key={lvl.value} className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${lvl.color}`}>{lvl.label}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                )
              })}
              {(!dash?.by_severity || dash.by_severity.length === 0) && <p className="text-sm text-gray-400">No scan data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Compliance by Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {COMPLIANCE_FRAMEWORKS.filter((f) => dash?.by_framework.find((bf) => bf.framework === f.value)).map((fw) => {
                const count = dash?.by_framework.find((bf) => bf.framework === fw.value)?.count ?? 0
                return (
                  <div key={fw.value} className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${fw.color}`}>{fw.label}</span>
                    <span className="text-sm font-medium text-gray-900">{count} controls</span>
                  </div>
                )
              })}
              {(!dash?.by_framework || dash.by_framework.length === 0) && <p className="text-sm text-gray-400">No compliance data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
          <Link href="/dashboard/platform/operations"><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dash?.recent_incidents && dash.recent_incidents.length > 0 ? dash.recent_incidents.map((inc) => {
              const sevCfg = RISK_LEVELS.find((l) => l.value === inc.severity.replace("sev1_", "critical").replace("sev2_", "high").replace("sev3_", "medium").replace("sev4_", "low"))
              return (
                <div key={inc.id} className="flex items-center justify-between p-2 rounded-lg border text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {inc.status === "resolved" ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> :
                     <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                    <span className="truncate font-medium">{inc.incident_title}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sevCfg?.color || "bg-gray-100"} shrink-0`}>{sevCfg?.label || inc.severity}</span>
                </div>
              )
            }) : <p className="text-sm text-gray-400">No recent incidents</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
