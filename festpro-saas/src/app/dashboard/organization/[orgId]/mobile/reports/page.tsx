"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDeviceReport, getSyncReport, getPushReport, getActivityReport } from "@/lib/actions/mobile-platform"
import { SYNC_STATUSES, PUSH_STATUSES } from "@/config/mobile-platform"
import { Loader2, Download, Smartphone, CloudSync, Bell, Activity, FileText } from "lucide-react"

export default function ReportsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>({})
  const [activeReport, setActiveReport] = useState<string>("devices")

  const reports = [
    { key: "devices", label: "Device Report", icon: Smartphone },
    { key: "sync", label: "Sync Report", icon: CloudSync },
    { key: "push", label: "Push Report", icon: Bell },
    { key: "activity", label: "Activity Report", icon: Activity },
  ]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data: any = {}
      if (activeReport === "devices") data.result = await getDeviceReport(orgId)
      else if (activeReport === "sync") data.result = await getSyncReport(orgId)
      else if (activeReport === "push") data.result = await getPushReport(orgId)
      else if (activeReport === "activity") data.result = await getActivityReport(orgId)
      setReportData(data); setLoading(false)
    }
    load()
  }, [orgId, activeReport])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-sm text-gray-500 mt-1">Mobile platform reports and exports</p></div></div>
      <div className="flex gap-2 flex-wrap">
        {reports.map((r) => {
          const Icon = r.icon
          return (
            <button key={r.key} onClick={() => setActiveReport(r.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeReport === r.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Icon className="h-4 w-4" />{r.label}
            </button>
          )
        })}
      </div>
      {loading ? <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div> : (
        <Card><CardContent className="p-6">
          {activeReport === "devices" && reportData.result?.data && (
            <div className="space-y-3">
              <h3 className="font-semibold">Devices: {reportData.result.data.devices?.length || 0}</h3>
              <p className="text-sm text-gray-500">Registrations: {reportData.result.data.registrations?.length || 0}</p>
            </div>
          )}
          {activeReport === "sync" && reportData.result?.data && (
            <div className="space-y-3">
              <h3 className="font-semibold">Sync Logs: {reportData.result.data.logs?.length || 0}</h3>
              <p className="text-sm text-gray-500">Queue items: {reportData.result.data.queue?.length || 0}</p>
            </div>
          )}
          {activeReport === "push" && reportData.result?.data && (
            <div className="space-y-3">
              <h3 className="font-semibold">Push Logs: {reportData.result.data.length || 0}</h3>
            </div>
          )}
          {activeReport === "activity" && reportData.result?.data && (
            <div className="space-y-3">
              <h3 className="font-semibold">Activity Logs: {reportData.result.data.length || 0}</h3>
            </div>
          )}
        </CardContent></Card>
      )}
    </div>
  )
}
