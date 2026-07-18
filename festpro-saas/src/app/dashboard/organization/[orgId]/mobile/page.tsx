"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMobileDashboard } from "@/lib/actions/mobile-platform"
import { Smartphone, CloudSync, Bell, Activity, SmartphoneIcon, BarChart3, Settings, FileText, Loader2, ChevronRight } from "lucide-react"

export default function MobilePlatformDashboard() {
  const params = useParams()
  const orgId = params.orgId as string
  const [dash, setDash] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMobileDashboard(orgId).then(r => { setDash(r.data); setLoading(false) })
  }, [orgId])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const sections = [
    { title: "Devices", href: `/dashboard/organization/${orgId}/mobile/devices`, icon: Smartphone, count: dash?.active_devices, total: dash?.registered_devices, color: "bg-indigo-500" },
    { title: "Sync Queue", href: `/dashboard/organization/${orgId}/mobile/sync`, icon: CloudSync, count: dash?.pending_syncs, total: dash?.failed_syncs, color: "bg-emerald-500" },
    { title: "Push Notifications", href: `/dashboard/organization/${orgId}/mobile/push`, icon: Bell, count: dash?.push_delivered, total: dash?.push_sent, color: "bg-rose-500" },
    { title: "Activity Logs", href: `/dashboard/organization/${orgId}/mobile/activity`, icon: Activity, count: dash?.today_activity, color: "bg-amber-500" },
    { title: "Sessions", href: `/dashboard/organization/${orgId}/mobile/sessions`, icon: SmartphoneIcon, count: dash?.active_sessions, color: "bg-cyan-500" },
    { title: "Offline Forms", href: `/dashboard/organization/${orgId}/mobile/forms`, icon: FileText, count: dash?.offline_forms, color: "bg-purple-500" },
    { title: "Reports", href: `/dashboard/organization/${orgId}/mobile/reports`, icon: BarChart3, color: "bg-gray-600" },
    { title: "Analytics", href: `/dashboard/organization/${orgId}/mobile/analytics`, icon: BarChart3, color: "bg-slate-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Mobile Platform</h1><p className="text-sm text-gray-500 mt-1">Manage devices, sync, push notifications and monitor usage.</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-indigo-600">{dash?.active_devices || 0}</p><p className="text-xs text-gray-500">Active Devices</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-emerald-600">{dash?.sync_success_rate || 0}%</p><p className="text-xs text-gray-500">Sync Success Rate</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-rose-600">{dash?.push_delivered || 0}</p><p className="text-xs text-gray-500">Push Delivered</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-amber-600">{dash?.today_activity || 0}</p><p className="text-xs text-gray-500">Today&apos;s Activity</p></CardContent></Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center`}><Icon className="h-5 w-5 text-white" /></div>
                  <div><p className="font-semibold text-sm">{s.title}</p>
                    {s.count !== undefined && <p className="text-xs text-gray-500">{s.count}{s.total !== undefined ? ` / ${s.total}` : ""}</p>}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </CardContent></Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
