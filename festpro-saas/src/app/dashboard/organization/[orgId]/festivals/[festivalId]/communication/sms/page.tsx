"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getSmsLogs, sendSms } from "@/lib/actions/communication"
import { Loader2, MessageSquare, Send, CheckCircle } from "lucide-react"

export default function SmsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState({ to_phone: "", body: "" })

  const load = useCallback(async () => {
    const res = await getSmsLogs(festivalId)
    setLogs(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSend = async () => {
    if (!form.to_phone || !form.body) { toast.error("Phone and body required"); return }
    const res = await sendSms({ festival_id: festivalId, to_phone: form.to_phone, body: form.body })
    if (res.error) toast.error(res.error); else { toast.success("SMS sent"); setShowCompose(false); setForm({ to_phone: "", body: "" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Logs</h1>
          <p className="text-sm text-gray-500 mt-1">{logs.length} messages sent</p>
        </div>
        <Button onClick={() => setShowCompose(!showCompose)}><Send className="h-4 w-4 mr-1" /> Send SMS</Button>
      </div>

      {showCompose && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input value={form.to_phone} onChange={e => setForm(f => ({ ...f, to_phone: e.target.value }))} placeholder="Phone number (e.g. +1234567890)" />
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Message body *"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px]" />
            <div className="flex gap-2">
              <Button onClick={handleSend}><Send className="h-4 w-4 mr-1" /> Send</Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No SMS sent yet</p>
          ) : (
            <div className="divide-y">
              {logs.map(l => (
                <div key={l.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 p-1.5 rounded-lg bg-green-50 text-green-500" />
                    <div>
                      <p className="text-sm">{l.body}</p>
                      <p className="text-xs text-gray-400">To: {l.to_phone} · {new Date(l.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === "delivered" ? "bg-green-100 text-green-700" : l.status === "failed" ? "bg-red-100 text-red-700" : l.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span>
                    {l.delivered_at && <span className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</span>}
                    {l.error_message && <span className="text-xs text-red-500" title={l.error_message}>Error</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
