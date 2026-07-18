"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getActiveSessions, terminateSession } from "@/lib/actions/mobile-platform"
import { MOBILE_SESSION_STATUSES } from "@/config/mobile-platform"
import { Loader2, LogIn, XCircle } from "lucide-react"

export default function MobileSessionsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true); const s = await getActiveSessions(orgId); setSessions(s.data || []); setLoading(false)
  }, [orgId])
  useEffect(() => { load() }, [load])

  const handleTerminate = async (id: string) => { await terminateSession(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1><p className="text-sm text-gray-500 mt-1">{sessions.length} active sessions</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {sessions.map((s: any) => (
          <Card key={s.id}><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><LogIn className="h-5 w-5 text-green-600" /></div>
                <div><p className="font-semibold text-sm">{s.device_registrations?.mobile_devices?.device_name || "Unknown device"}</p>
                  <p className="text-xs text-gray-500">IP: {s.ip_address || "—"} · Started: {new Date(s.started_at).toLocaleString()}</p></div></div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs mt-2 text-red-600" onClick={() => handleTerminate(s.id)}>
              <XCircle className="h-3 w-3 mr-1" />Terminate
            </Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
