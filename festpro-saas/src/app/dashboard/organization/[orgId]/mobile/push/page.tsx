"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPushSubscriptions, getPushDeliveryLogs, subscribePush, sendPushNotification } from "@/lib/actions/mobile-platform"
import { PUSH_STATUSES, NOTIFICATION_TYPES, MOBILE_ROLES } from "@/config/mobile-platform"
import { Loader2, Bell, Send, Plus, Search } from "lucide-react"

export default function PushPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [subs, setSubs] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"subscriptions" | "logs" | "send">("logs")
  const [logFilter, setLogFilter] = useState("")
  const [sendForm, setSendForm] = useState({ title: "", body: "", notification_type: "announcement", priority: "medium", role: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [s, l] = await Promise.all([getPushSubscriptions(orgId), getPushDeliveryLogs(orgId, logFilter || undefined)])
    setSubs(s.data || []); setLogs(l.data || []); setLoading(false)
  }, [orgId, logFilter])
  useEffect(() => { load() }, [load])

  const handleSend = async () => {
    if (!sendForm.title) return
    await sendPushNotification({ ...sendForm, priority: sendForm.priority as any, role: sendForm.role as any || undefined })
    setSendForm({ title: "", body: "", notification_type: "announcement", priority: "medium", role: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1><p className="text-sm text-gray-500 mt-1">{subs.length} active subscriptions · {logs.length} delivery logs</p></div>
      <div className="flex gap-2 border-b">
        <button onClick={() => setTab("send")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "send" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Send</button>
        <button onClick={() => setTab("logs")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "logs" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Delivery Logs</button>
        <button onClick={() => setTab("subscriptions")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "subscriptions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Subscriptions</button>
      </div>
      {tab === "send" && (
        <Card><CardHeader><CardTitle>Send Push Notification</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={sendForm.title} onChange={e => setSendForm({...sendForm, title: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Body</label><Input value={sendForm.body} onChange={e => setSendForm({...sendForm, body: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={sendForm.notification_type} onChange={e => setSendForm({...sendForm, notification_type: e.target.value})}>
              {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Target Role</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={sendForm.role} onChange={e => setSendForm({...sendForm, role: e.target.value})}>
              <option value="">All Users</option>{MOBILE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select></div>
          <div className="md:col-span-2"><Button onClick={handleSend}><Send className="h-4 w-4 mr-1" />Send Notification</Button></div>
        </CardContent></Card>
      )}
      {tab === "logs" && (
        <div className="space-y-3">
          <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm max-w-xs" value={logFilter} onChange={e => setLogFilter(e.target.value)}>
            <option value="">All Statuses</option>{PUSH_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="grid gap-3">
            {logs.map((l: any) => (
              <Card key={l.id}><CardContent className="p-4 flex items-start justify-between">
                <div><p className="text-sm font-medium">{l.title}</p><p className="text-xs text-gray-500">{l.body || "—"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(l.created_at).toLocaleString()} · {l.notification_type || "general"}</p></div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PUSH_STATUSES.find(s => s.value === l.status)?.color || "bg-gray-100"}`}>{PUSH_STATUSES.find(s => s.value === l.status)?.label || l.status}</span>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
      {tab === "subscriptions" && (
        <div className="grid gap-3">
          {subs.map((s: any) => (
            <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center"><Bell className="h-4 w-4 text-indigo-600" /></div>
                <div><p className="text-sm font-medium">{s.mobile_devices?.device_name || "—"}</p><p className="text-xs text-gray-500">{s.provider} · Created: {new Date(s.created_at).toLocaleDateString()}</p></div></div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  )
}
