"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getActivityLogs } from "@/lib/actions/mobile-platform"
import { MOBILE_ACTIVITY_TYPES } from "@/config/mobile-platform"
import { Loader2, Activity, Smartphone, Scan, CloudSync, FileText, Camera, LogIn } from "lucide-react"

const activityIcons: Record<string, any> = { login: LogIn, sync: CloudSync, scan: Scan, form_submit: FileText, media_upload: Camera, view: Activity }

export default function ActivityPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("")

  const load = useCallback(async () => {
    setLoading(true); const l = await getActivityLogs(orgId, typeFilter || undefined); setLogs(l.data || []); setLoading(false)
  }, [orgId, typeFilter])
  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1><p className="text-sm text-gray-500 mt-1">{logs.length} recent activities</p></div>
      <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm max-w-xs" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
        <option value="">All Types</option>{MOBILE_ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <div className="grid gap-3">
        {logs.map((l: any) => {
          const Icon = activityIcons[l.activity_type] || Activity
          return (
            <Card key={l.id}><CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-gray-600" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium">{MOBILE_ACTIVITY_TYPES.find(t => t.value === l.activity_type)?.label || l.activity_type}</p>
                <p className="text-xs text-gray-500">{l.description || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(l.created_at).toLocaleString()}{l.is_offline ? " · Offline" : ""}{l.mobile_devices?.device_name ? ` · ${l.mobile_devices.device_name}` : ""}</p></div>
            </CardContent></Card>
          )
        })}
      </div>
    </div>
  )
}
