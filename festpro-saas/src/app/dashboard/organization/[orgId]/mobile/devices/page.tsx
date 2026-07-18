"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMobileDevices, updateMobileDeviceStatus } from "@/lib/actions/mobile-platform"
import { MOBILE_DEVICE_STATUSES, MOBILE_DEVICE_PLATFORMS } from "@/config/mobile-platform"
import { Loader2, Smartphone, Monitor, Apple, Globe, Search } from "lucide-react"

const platformIcons: Record<string, any> = { ios: Apple, android: Smartphone, web: Globe, desktop: Monitor }

export default function MobileDevicesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const d = await getMobileDevices(orgId, filter || undefined)
    setDevices(d.data || []); setLoading(false)
  }, [orgId, filter])

  useEffect(() => { load() }, [load])

  const handleStatus = async (id: string, status: string) => { await updateMobileDeviceStatus(id, status); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Mobile Devices</h1><p className="text-sm text-gray-500 mt-1">All registered devices ({devices.length})</p></div>
      </div>
      <div className="flex gap-2">
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>{MOBILE_DEVICE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {devices.map((d: any) => {
          const Icon = platformIcons[d.device_platform] || Smartphone
          return (
            <Card key={d.id}><CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center"><Icon className="h-5 w-5 text-gray-600" /></div>
                  <div><p className="font-semibold">{d.device_name}</p>
                    <p className="text-xs text-gray-500">{d.device_model || "—"} · {d.os_version || "—"}</p>
                    <p className="text-xs text-gray-400 font-mono">{d.device_id}</p></div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MOBILE_DEVICE_STATUSES.find(s => s.value === d.status)?.color || "bg-gray-100"}`}>
                  {MOBILE_DEVICE_STATUSES.find(s => s.value === d.status)?.label || d.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>App v{d.app_version || "—"} · Last active: {d.last_active_at ? new Date(d.last_active_at).toLocaleString() : "—"}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {d.status === "active" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(d.id, "suspended")}>Suspend</Button>}
                {d.status === "suspended" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(d.id, "active")}>Reactivate</Button>}
                {d.status !== "revoked" && <Button size="sm" variant="outline" className="text-xs text-red-600" onClick={() => handleStatus(d.id, "revoked")}>Revoke</Button>}
              </div>
            </CardContent></Card>
          )
        })}
      </div>
    </div>
  )
}
