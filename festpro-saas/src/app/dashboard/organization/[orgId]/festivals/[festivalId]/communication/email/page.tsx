"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getEmailLogs, sendEmail, getEmailTemplates } from "@/lib/actions/communication"
import { NOTIFICATION_STATUSES } from "@/config/communication"
import type { EmailLog, EmailTemplate } from "@/types/communication"
import { Loader2, Mail, Send, Eye, CheckCircle, XCircle, Clock, FileText } from "lucide-react"

export default function EmailPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [logs, setLogs] = useState<any[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState({ to_address: "", subject: "", body_html: "", template_id: "" })

  const load = useCallback(async () => {
    const [lRes, tRes] = await Promise.all([getEmailLogs(festivalId, { status: statusFilter || undefined }), getEmailTemplates()])
    setLogs(lRes.data || []); setTemplates(tRes.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleSend = async () => {
    if (!form.to_address || !form.subject) { toast.error("To and subject required"); return }
    const res = await sendEmail({ festival_id: festivalId, to_address: form.to_address, subject: form.subject, body_html: form.body_html || "<p>Email body</p>", template_id: form.template_id || undefined })
    if (res.error) toast.error(res.error); else { toast.success("Email sent"); setShowCompose(false); setForm({ to_address: "", subject: "", body_html: "", template_id: "" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email</h1>
          <p className="text-sm text-gray-500 mt-1">Send emails and view delivery logs.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/email/templates`}>
            <Button variant="outline"><FileText className="h-4 w-4 mr-1" /> Templates</Button>
          </Link>
          <Button onClick={() => setShowCompose(!showCompose)}><Send className="h-4 w-4 mr-1" /> Compose</Button>
        </div>
      </div>

      {showCompose && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Select options={templates.map(t => ({ value: t.id, label: t.template_name }))} value={form.template_id} onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))} placeholder="Use template..." />
            <Input value={form.to_address} onChange={e => setForm(f => ({ ...f, to_address: e.target.value }))} placeholder="To (email address)" />
            <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" />
            <textarea value={form.body_html} onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))} placeholder="HTML body..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px]" />
            <div className="flex gap-2">
              <Button onClick={handleSend}><Send className="h-4 w-4 mr-1" /> Send</Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <Select options={[{ value: "", label: "All Status" }, ...NOTIFICATION_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No emails sent yet</p>
          ) : (
            <div className="divide-y">
              {logs.map(l => (
                <div key={l.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 p-1.5 rounded-lg bg-blue-50 text-blue-500" />
                    <div>
                      <p className="font-medium">{l.subject}</p>
                      <p className="text-xs text-gray-400">To: {l.to_address} · {l.template?.template_name || "Custom"}</p>
                      <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${NOTIFICATION_STATUSES.find(s => s.value === l.status)?.color || ""}`}>{l.status}</span>
                    {l.opened_at && <span className="text-xs text-green-600 flex items-center"><Eye className="h-3 w-3 mr-1" /> Opened</span>}
                    {l.attempt_count > 1 && <span className="text-xs text-amber-600">Attempts: {l.attempt_count}</span>}
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
