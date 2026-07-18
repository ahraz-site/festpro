"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getEnterpriseDashboard, getSecurityScanSummary, getComplianceSummary } from "@/lib/actions/enterprise"
import type { Module30DashboardData } from "@/types/enterprise"
import { Loader2, FileText, Shield, BarChart3, TrendingUp, Download, CheckCircle, XCircle, AlertTriangle, Gauge, Activity } from "lucide-react"

export default function ReportsPage() {
  const [dash, setDash] = useState<Module30DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getEnterpriseDashboard()
    if (res.data) setDash(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const reports = [
    {
      title: "Security Report",
      icon: Shield,
      color: "text-red-600 bg-red-50",
      score: dash?.security_score ?? 100,
      items: [
        { label: "Critical Findings", value: dash?.critical_findings ?? 0, color: "text-red-600" },
        { label: "High Findings", value: dash?.high_findings ?? 0, color: "text-orange-600" },
        { label: "Total Scans", value: dash?.total_scan_results ?? 0, color: "text-gray-600" },
      ],
    },
    {
      title: "Compliance Report",
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-50",
      score: dash?.compliance_score ?? 100,
      items: [
        { label: "Compliant Controls", value: dash?.compliant_controls ?? 0, color: "text-green-600" },
        { label: "Total Controls", value: dash?.total_compliance_controls ?? 0, color: "text-gray-600" },
        { label: "Frameworks Tracked", value: dash?.by_framework.length ?? 0, color: "text-blue-600" },
      ],
    },
    {
      title: "Performance Report",
      icon: Activity,
      color: "text-purple-600 bg-purple-50",
      score: dash?.performance_score ?? 100,
      items: [
        { label: "Total Benchmarks", value: dash?.total_benchmarks ?? 0, color: "text-gray-600" },
        { label: "Failed", value: dash?.failed_benchmarks ?? 0, color: "text-red-600" },
        { label: "Pass Rate", value: dash?.total_benchmarks ? `${Math.round(((dash.total_benchmarks - (dash.failed_benchmarks ?? 0)) / dash.total_benchmarks) * 100)}%` : "N/A", color: "text-green-600" },
      ],
    },
    {
      title: "Availability Report",
      icon: Gauge,
      color: "text-cyan-600 bg-cyan-50",
      score: dash?.availability_score ?? 100,
      items: [
        { label: "Healthy Checks", value: dash?.healthy_checks ?? 0, color: "text-green-600" },
        { label: "Unhealthy Checks", value: dash?.unhealthy_checks ?? 0, color: "text-red-600" },
        { label: "Uptime", value: `${dash?.availability_score ?? 100}%`, color: "text-cyan-600" },
      ],
    },
    {
      title: "Risk Assessment",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50",
      score: Math.max(0, 100 - ((dash?.critical_risks ?? 0) * 10)),
      items: [
        { label: "Total Risks", value: dash?.total_risks ?? 0, color: "text-gray-600" },
        { label: "Critical Risks", value: dash?.critical_risks ?? 0, color: "text-red-600" },
        { label: "Open Incidents", value: dash?.open_incidents ?? 0, color: "text-amber-600" },
      ],
    },
    {
      title: "Release Readiness Report",
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
      score: dash?.total_releases ? Math.min(100, (dash.total_releases * 10)) : 0,
      items: [
        { label: "Total Releases", value: dash?.total_releases ?? 0, color: "text-gray-600" },
        { label: "Active LTS", value: dash?.active_lts_versions ?? 0, color: "text-green-600" },
        { label: "Upcoming Maintenance", value: dash?.upcoming_maintenance ?? 0, color: "text-amber-600" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Security, compliance, performance, and release readiness reports</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export All</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${report.color}`}><report.icon className="h-4 w-4" /></div>
                {report.title}
              </CardTitle>
              <span className={`text-lg font-bold ${report.score >= 80 ? "text-green-600" : report.score >= 60 ? "text-amber-600" : "text-red-600"}`}>{report.score}%</span>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div className={`h-2 rounded-full ${report.score >= 80 ? "bg-green-500" : report.score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${report.score}%` }} />
              </div>
              <div className="space-y-1">
                {report.items.map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.label}</span>
                    <span className={`font-medium ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
