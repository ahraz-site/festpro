"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getHelpDeskDashboard, getTicketAnalytics, getVisitorAnalytics } from "@/lib/actions/help-desk"
import { Loader2, Download, BarChart3, PieChart, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [visitorAnalytics, setVisitorAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [dRes, aRes, vRes] = await Promise.all([getHelpDeskDashboard(festivalId), getTicketAnalytics(festivalId), getVisitorAnalytics(festivalId)])
    if (dRes.data) setDash(dRes.data)
    if (aRes) setAnalytics(aRes)
    if (vRes) setVisitorAnalytics(vRes)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const statusDist = analytics?.statusDistribution || []
  const statusCounts: Record<string, number> = {}
  statusDist.forEach((t: any) => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <Button variant="outline"><Download className="h-4 w-4 mr-1" /> Export Data</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-gray-400" /> Ticket Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {statusDist.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const total = statusDist.length
                  const pct = total ? Math.round((count as number / total) * 100) : 0
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{status.replace(/_/g, " ")}</span>
                        <span className="font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            ) : <p className="text-gray-400 text-sm">No ticket data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChart className="h-5 w-5 text-gray-400" /> Visitor Category Breakdown</CardTitle></CardHeader>
          <CardContent>
            {visitorAnalytics?.categoryDistribution?.length > 0 ? (
              <div className="space-y-3">
                {(Object.entries(
                  (visitorAnalytics.categoryDistribution as any[]).reduce((acc: Record<string, number>, v: any) => {
                    acc[v.visitor_category] = (acc[v.visitor_category] || 0) + 1; return acc
                  }, {} as Record<string, number>)
                ) as [string, number][]).map(([cat, count]) => {
                  const total = visitorAnalytics.categoryDistribution.length
                  const pct = total ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{cat.replace(/_/g, " ")}</span>
                        <span className="font-semibold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-teal-500" style={{ width: `${pct}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            ) : <p className="text-gray-400 text-sm">No visitor data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-gray-400" /> Key Metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Tickets", value: dash?.total_tickets || 0 },
                { label: "Open Tickets", value: dash?.open_tickets || 0 },
                { label: "Resolved", value: dash?.resolved_tickets || 0 },
                { label: "Escalations", value: dash?.escalated_tickets || 0 },
                { label: "Total Visitors", value: dash?.total_visitors || 0 },
                { label: "Checked In Today", value: dash?.checked_in_today || 0 },
                { label: "Lost Items", value: dash?.total_lost_items || 0 },
                { label: "Found Items", value: dash?.total_found_items || 0 },
              ].map(m => (
                <div key={m.label} className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Resolution Performance</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Resolution Rate</span><span className="font-semibold">{dash?.total_tickets ? Math.round((dash.resolved_tickets / dash.total_tickets) * 100) : 0}%</span></div>
            <div className="w-full bg-gray-200 rounded-full h-3"><div className="h-3 rounded-full bg-green-500" style={{ width: `${dash?.total_tickets ? Math.round((dash.resolved_tickets / dash.total_tickets) * 100) : 0}%` }} /></div>
            <div className="flex justify-between text-sm mt-4"><span className="text-gray-500">Open vs Resolved</span></div>
            <div className="flex gap-2">
              <div className="flex-1 text-center p-3 rounded-lg bg-blue-50">
                <p className="text-lg font-bold text-blue-700">{dash?.open_tickets || 0}</p>
                <p className="text-xs text-blue-500">Open</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-green-50">
                <p className="text-lg font-bold text-green-700">{dash?.resolved_tickets || 0}</p>
                <p className="text-xs text-green-500">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
