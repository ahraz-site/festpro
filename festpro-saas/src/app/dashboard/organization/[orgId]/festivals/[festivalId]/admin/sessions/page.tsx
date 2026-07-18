"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getActiveSessions, forceLogoutSession, forceLogoutAll } from "@/lib/actions/security"
import type { ActiveSession } from "@/types/security"
import { Loader2, Users, LogOut, Smartphone, Monitor, Globe, XCircle, AlertTriangle, Clock } from "lucide-react"

export default function SessionsPage() {
  const params = useParams()
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getActiveSessions()
    setSessions(res.data || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleForceLogout = async (id: string) => {
    await forceLogoutSession(id); toast.success("Session terminated"); load()
  }

  const handleForceLogoutAll = async (userId: string) => {
    await forceLogoutAll(userId); toast.success("All sessions terminated"); load()
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const groupedSessions = sessions.reduce((acc: Record<string, ActiveSession[]>, s) => {
    const key = s.profiles?.email || s.user_id
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">{sessions.length} active sessions</p>
      </div>

      {Object.entries(groupedSessions).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">
          <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No active sessions</p>
        </CardContent></Card>
      ) : Object.entries(groupedSessions).map(([email, userSessions]) => (
        <Card key={email}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{userSessions[0].profiles?.first_name} {userSessions[0].profiles?.last_name}</CardTitle>
              <p className="text-sm text-gray-500">{email} · {userSessions.length} sessions</p>
            </div>
            {userSessions.length > 1 && (
              <Button variant="danger" size="sm" onClick={() => handleForceLogoutAll(userSessions[0].user_id)}>
                <LogOut className="h-4 w-4 mr-1" /> Logout All
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {userSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${s.is_mobile ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500"}`}>
                    {s.is_mobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.browser || "Unknown browser"}</p>
                      {s.is_current && <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Current</span>}
                      {isExpired(s.expires_at) && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">Expired</span>}
                    </div>
                    <p className="text-xs text-gray-400">
                      {s.os && `${s.os} · `}{s.device && `${s.device} · `}{s.country && `${s.country}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      IP: {s.ip_address} · Last active: {new Date(s.last_active_at).toLocaleString()} · Expires: {new Date(s.expires_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleForceLogout(s.id)}>
                  <XCircle className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
