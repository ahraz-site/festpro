"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPerformanceBenchmarks, getHealthChecks, getEnterpriseDashboard } from "@/lib/actions/enterprise"
import type { PerformanceBenchmark, HealthCheck, Module30DashboardData } from "@/types/enterprise"
import { BENCHMARK_CATEGORIES, BENCHMARK_STATUSES } from "@/config/enterprise"
import { Loader2, Activity, Server, Database, Zap, Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft, BarChart3, Gauge } from "lucide-react"

export default function PerformancePage() {
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([])
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [dash, setDash] = useState<Module30DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [bRes, hRes, dRes] = await Promise.all([getPerformanceBenchmarks(), getHealthChecks(), getEnterpriseDashboard()])
    if (bRes.data) setBenchmarks(bRes.data)
    if (hRes.data) setHealthChecks(hRes.data)
    if (dRes.data) setDash(dRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/platform/security"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Optimization</h1>
          <p className="text-sm text-gray-500">Benchmarks, health checks, and optimization status</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4 text-center"><Gauge className="h-6 w-6 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{dash?.performance_score ?? 100}%</p><p className="text-xs text-gray-500">Performance Score</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Activity className="h-6 w-6 mx-auto text-blue-500" /><p className="text-2xl font-bold mt-1">{benchmarks.length}</p><p className="text-xs text-gray-500">Total Benchmarks</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="h-6 w-6 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{dash?.healthy_checks ?? 0}</p><p className="text-xs text-gray-500">Healthy Checks</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><XCircle className="h-6 w-6 mx-auto text-red-500" /><p className="text-2xl font-bold mt-1">{dash?.unhealthy_checks ?? 0}</p><p className="text-xs text-gray-500">Unhealthy Checks</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Performance Benchmarks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {benchmarks.map((b) => {
                const stCfg = BENCHMARK_STATUSES.find((s) => s.value === b.status)
                const catCfg = BENCHMARK_CATEGORIES.find((c) => c.value === b.category)
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{b.benchmark_name}</span>
                        <span className="text-xs text-gray-400">{catCfg?.label || b.category}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stCfg?.color || "bg-gray-100"}`}>{stCfg?.label || b.status}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>{b.metric_name}: {b.metric_value}{b.metric_unit}</span>
                        <span>Env: {b.environment}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {benchmarks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No benchmarks recorded</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Health Checks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {healthChecks.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {h.is_healthy ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium text-sm">{h.check_name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${h.is_healthy ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{h.is_healthy ? "Healthy" : "Unhealthy"}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{h.response_time_ms}ms</span>
                      <span>Expected: {h.expected_status}, Got: {h.actual_status}</span>
                      {h.consecutive_failures > 0 && <span className="text-red-500">{h.consecutive_failures} consecutive failures</span>}
                    </div>
                    {h.error_message && <p className="text-xs text-red-500 mt-1">{h.error_message}</p>}
                  </div>
                </div>
              ))}
              {healthChecks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No health checks configured</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
