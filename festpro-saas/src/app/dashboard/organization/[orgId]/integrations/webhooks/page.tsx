"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getWebhookEndpoints, createWebhookEndpoint, deleteWebhookEndpoint, getWebhookEvents, replayWebhookEvent } from "@/lib/actions/integration-hub"
import { WEBHOOK_EVENT_NAMES, EVENT_CATEGORIES } from "@/config/integration-hub"
import { Loader2, Webhook, Plus, Trash2, RotateCw, Copy, Check } from "lucide-react"

export default function WebhooksPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [endpoints, setEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[] })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await getWebhookEndpoints(orgId)
    setEndpoints(r.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name || !form.url) return
    const r = await createWebhookEndpoint({ ...form, events: form.events as any })
    if (r.secret) setShowSecret(r.secret)
    setShowCreate(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this webhook endpoint?")) return
    await deleteWebhookEndpoint(id); load()
  }

  const viewEvents = async (ep: any) => {
    setSelectedEndpoint(ep)
    const r = await getWebhookEvents(ep.id)
    setEvents(r.data || [])
  }

  const toggleEvent = (evt: string) => {
    setForm(f => ({ ...f, events: f.events.includes(evt) ? f.events.filter(e => e !== evt) : [...f.events, evt] }))
  }

  const groupEvents = () => {
    const groups: Record<string, typeof WEBHOOK_EVENT_NAMES[number][]> = {}
    WEBHOOK_EVENT_NAMES.forEach(e => {
      const cat = e.category
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(e)
    })
    return groups
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Webhooks</h1><p className="text-sm text-gray-500">{endpoints.length} endpoints</p></div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Endpoint</Button>
      </div>

      {showSecret && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-800 mb-2">Webhook Secret - Save this securely!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-white border border-green-200 rounded text-sm font-mono">{showSecret}</code>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(showSecret); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowSecret(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>New Webhook Endpoint</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Slack Notifications" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">URL</label>
                <input type="url" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://hooks.example.com/webhook" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Events</label>
              <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(groupEvents()).map(([cat, evts]) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{cat}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {evts.map(e => (
                        <button key={e.value} onClick={() => toggleEvent(e.value)} className={`px-2 py-1 text-xs rounded-full ${form.events.includes(e.value) ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{e.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Endpoint</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {endpoints.map((ep: any) => (
          <Card key={ep.id} className={selectedEndpoint?.id === ep.id ? "ring-2 ring-indigo-200" : ""}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{ep.name}</CardTitle>
                <p className="text-xs text-gray-500 font-mono mt-1 truncate max-w-sm">{ep.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${ep.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                <button onClick={() => handleDelete(ep.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 flex-wrap mb-3">
                {ep.events?.slice(0, 5).map((evt: string) => (
                  <span key={evt} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{evt.split(".").pop()}</span>
                ))}
                {ep.events?.length > 5 && <span className="text-xs text-gray-400">+{ep.events.length - 5} more</span>}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Retries: {ep.max_retries} | Interval: {ep.retry_interval_seconds}s</span>
                <Button variant="ghost" size="sm" onClick={() => viewEvents(ep)}>View Events</Button>
              </div>
              {ep.last_success_at && <p className="text-xs text-green-600 mt-1">Last success: {new Date(ep.last_success_at).toLocaleString()}</p>}
              {ep.last_failure_at && <p className="text-xs text-red-600 mt-1">Last failure: {new Date(ep.last_failure_at).toLocaleString()}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedEndpoint && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Events - {selectedEndpoint.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEndpoint(null)}>Close</Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Attempts</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((evt: any) => (
                  <tr key={evt.id}>
                    <td className="px-4 py-3 text-xs font-mono">{evt.event_name}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${evt.status === "delivered" ? "bg-green-100 text-green-700" : evt.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{evt.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{evt.attempt_count}/{evt.max_attempts}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(evt.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => replayWebhookEvent(evt.id)} className="text-gray-400 hover:text-indigo-600" title="Replay"><RotateCw className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
