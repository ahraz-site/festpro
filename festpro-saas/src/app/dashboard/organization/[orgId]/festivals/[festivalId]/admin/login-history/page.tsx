"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { getLoginHistory, getFailedLogins } from "@/lib/actions/security"
import { AUDIT_STATUSES } from "@/config/security"
import { Loader2, History, LogIn, LogOut, Smartphone, Monitor, Globe, Lock, AlertTriangle, Clock } from "lucide-react"

export default function LoginHistoryPage() {
  const festivalId = useParams().festivalId as string
  const [logins, setLogins] = useState<any[]>([])
  const [failed, setFailed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"logins" | "failed">("logins")
  const [days, setDays] = useState("7")

  const load = useCallback(async () => {
    const [lRes, fRes] = await Promise.all([
      getLoginHistory(festivalId, { days: parseInt(days) }),
      getFailedLogins(festivalId, { days: parseInt(days) }),
    ])
    setLogins(lRes.data || []); setFailed(fRes.data || []); setLoading(false)
  }, [festivalId, days])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Login History</h1>
        <p className="text-sm text-gray-500 mt-1">{logins.length} logins · {failed.length} failed attempts</p>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex gap-2">
          <button onClick={() => setTab("logins")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "logins" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}>Logins</button>
          <button onClick={() => setTab("failed")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "failed" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}>Failed Attempts</button>
        </div>
        <Select options={[{ value: "1", label: "Last 24h" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} value={days} onChange={e => setDays(e.target.value)} className="w-36 ml-auto" />
      </div>

      {tab === "logins" && (
        <Card>
          <CardContent className="p-0">
            {logins.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No login history</p>
            ) : (
              <div className="divide-y">
                {logins.map(l => (
                  <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                    <div className={`p-2 rounded-full ${l.status === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                      {l.status === "success" ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{l.email || l.user_id?.substring(0, 8)}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${AUDIT_STATUSES.find(s => s.value === l.status)?.color || ""}`}>{l.status}</span>
                        <span className="text-xs text-gray-400">{l.auth_method}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Monitor className="h-3 w-3" /> {l.browser || "Unknown"}</span>
                        {l.os && <span>{l.os}</span>}
                        {l.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {l.country}{l.city ? `, ${l.city}` : ""}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(l.login_at).toLocaleString()}</span>
                      </div>
                      {l.session_duration && (
                        <p className="text-xs text-gray-400 mt-0.5">Duration: {Math.round(l.session_duration / 60)} min</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{l.ip_address}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "failed" && (
        <Card>
          <CardContent className="p-0">
            {failed.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No failed attempts</p>
            ) : (
              <div className="divide-y">
                {failed.map(f => (
                  <div key={f.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                    <div className="p-2 rounded-full bg-red-50 text-red-600">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{f.email || f.user_id?.substring(0, 8) || "Unknown"}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>IP: {f.ip_address}</span>
                        <span>Attempts: {f.attempt_count}</span>
                        {f.browser && <span>{f.browser}</span>}
                        <span>{new Date(f.last_attempt_at).toLocaleString()}</span>
                      </div>
                      {f.blocked_until && new Date(f.blocked_until) > new Date() && (
                        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Blocked until {new Date(f.blocked_until).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{f.country || "Unknown location"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
