"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getMobileDashboard, getActivityLogs } from "@/lib/actions/mobile-platform"
import { Loader2, TrendingUp, Users, Bell, CloudSync, Activity } from "lucide-react"

export default function AnalyticsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [dash, setDash] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMobileDashboard(orgId), getActivityLogs(orgId)]).then(([d, a]) => {
      setDash(d.data); setActivity(a.data || []); setLoading(false)
    })
  }, [orgId])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Analytics</h1><p className="text-sm text-gray-500 mt-1">Mobile platform usage and performance</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-indigo-600">{dash?.active_devices || 0}</p><p className="text-xs text-gray-500">Active Devices</p></div><Users className="h-5 w-5 text-gray-300" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-emerald-600">{dash?.sync_success_rate || 0}%</p><p className="text-xs text-gray-500">Sync Success</p></div><CloudSync className="h-5 w-5 text-gray-300" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-rose-600">{dash?.push_delivered || 0}</p><p className="text-xs text-gray-500">Push Delivered</p></div><Bell className="h-5 w-5 text-gray-300" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-2xl font-bold text-amber-600">{dash?.today_activity || 0}</p><p className="text-xs text-gray-500">Today&apos;s Activity</p></div><Activity className="h-5 w-5 text-gray-300" /></div></CardContent></Card>
      </div>
      <Card><CardContent className="p-4"><h3 className="font-semibold text-sm mb-3">Activity Summary</h3>
        {activity.length === 0 ? <p className="text-sm text-gray-400">No activity data yet.</p> : (
          <div className="space-y-2">{activity.slice(0, 10).map((a: any) => (
            <div key={a.id} className="flex items-center justify-between text-sm"><span className="text-gray-600">{a.activity_type}</span><span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span></div>
          ))}</div>
        )}
      </CardContent></Card>
    </div>
  )
}
