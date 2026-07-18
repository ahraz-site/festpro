"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiUsageStats } from "@/lib/actions/integration-hub"
import { Loader2, BarChart3, Activity, Clock, TrendingUp, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [stats, setStats] = useState<any>(null)
  const [period, setPeriod] = useState<"today" | "week" | "month">("today")
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await getApiUsageStats(orgId, period)
    setStats(r.data); setLoading(false)
  }, [orgId, period])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!stats) return <div className="text-red-500">Failed to load analytics</div>

  const cards = [
    { label: "Total Requests", value: stats.total_requests, icon: BarChart3, color: "text-indigo-600" },
    { label: "Successful", value: stats.successful_requests, icon: Activity, color: "text-green-600" },
    { label: "Failed", value: stats.failed_requests, icon: TrendingUp, color: "text-red-600" },
    { label: "Avg Response", value: `${stats.avg_response_time_ms}ms`, icon: Clock, color: "text-amber-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">API Analytics</h1><p className="text-sm text-gray-500">Monitor API usage and performance</p></div>
        <div className="flex gap-1">
          {(["today", "week", "month"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${period === p ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{c.value}</div></CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Requests by Endpoint</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.requests_by_endpoint || {}).sort(([, a]: any, [, b]: any) => b - a).slice(0, 10).map(([path, count]: any) => (
              <div key={path} className="flex items-center justify-between text-sm">
                <span className="text-xs font-mono text-gray-600 truncate max-w-xs">{path}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(stats.requests_by_endpoint || {}).length === 0 && <p className="text-sm text-gray-400">No data</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Requests by Method</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.requests_by_method || {}).sort(([, a]: any, [, b]: any) => b - a).map(([method, count]: any) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs font-medium px-2 py-0.5 bg-gray-100 rounded">{method}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {Object.keys(stats.requests_by_method || {}).length === 0 && <p className="text-sm text-gray-400">No data</p>}
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Hourly Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 24 }, (_, i) => {
                const count = stats.requests_by_hour?.[i.toString()] || 0
                const max = Math.max(...Object.values(stats.requests_by_hour || {}) as number[], 1)
                const height = (count / max) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }} title={`${i}:00 - ${count} requests`} />
                    <span className="text-[10px] text-gray-400">{i}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
