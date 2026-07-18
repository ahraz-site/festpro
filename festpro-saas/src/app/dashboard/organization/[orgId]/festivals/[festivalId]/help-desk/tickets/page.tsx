"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getTickets, createTicket, updateTicketStatus, assignTicket, escalateTicket, deleteTicket, getSupportCategories, getSupportPriorities } from "@/lib/actions/help-desk"
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_SOURCES, SUPPORT_CATEGORIES } from "@/config/help-desk"
import { Loader2, Plus, Trash2, CheckCircle, UserCheck, ChevronDown, ArrowUpCircle, Clock, AlertTriangle } from "lucide-react"

export default function TicketsPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: "", description: "", category: "", priority: "", source: "desk", submitter_name: "", submitter_email: "", submitter_phone: "" })
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [assignTo, setAssignTo] = useState("")
  const [escalateModal, setEscalateModal] = useState<string | null>(null)
  const [escalateLevel, setEscalateLevel] = useState("level1")

  const load = useCallback(async () => {
    const res = await getTickets(festivalId, filter || undefined)
    if (res.data) setTickets(res.data); setLoading(false)
  }, [festivalId, filter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.subject) return
    setLoading(true)
    await createTicket({ ...form, festival_id: festivalId })
    setForm({ subject: "", description: "", category: "", priority: "", source: "desk", submitter_name: "", submitter_email: "", submitter_phone: "" })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => {
    await updateTicketStatus(id, status); load()
  }

  const handleAssign = async (id: string) => {
    if (!assignTo) return
    await assignTicket(id, assignTo); setAssignModal(null); setAssignTo(""); load()
  }

  const handleEscalate = async (id: string) => {
    await escalateTicket(id, escalateLevel); setEscalateModal(null); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ticket and all associated data?")) return
    await deleteTicket(id); load()
  }

  const statusColor = (s: string) => TICKET_STATUSES.find(x => x.value === s)?.color || "bg-gray-100 text-gray-600"
  const statusLabel = (s: string) => TICKET_STATUSES.find(x => x.value === s)?.label || s

  if (loading && tickets.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> New Ticket</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Support Ticket</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Source</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>{TICKET_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div><Label>Category</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">Select...</option>{SUPPORT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><Label>Priority</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="">Select...</option>{TICKET_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
              <div><Label>Submitter Name</Label><Input value={form.submitter_name} onChange={e => setForm({ ...form, submitter_name: e.target.value })} /></div>
              <div><Label>Submitter Email</Label><Input value={form.submitter_email} onChange={e => setForm({ ...form, submitter_email: e.target.value })} /></div>
              <div><Label>Submitter Phone</Label><Input value={form.submitter_phone} onChange={e => setForm({ ...form, submitter_phone: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <Button onClick={handleCreate}>Create Ticket</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => { setFilter(""); setLoading(true) }}>All</Button>
        {["new", "open", "assigned", "in_progress", "resolved", "closed", "on_hold"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => { setFilter(s); setLoading(true) }}>{statusLabel(s)}</Button>
        ))}
      </div>

      <div className="space-y-3">
        {tickets.map((t: any) => {
          const sColor = statusColor(t.status)
          const catName = t.support_categories?.name || "General"
          return (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/help-desk/tickets/${t.id}`)}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{t.ticket_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sColor}`}>{statusLabel(t.status)}</span>
                      {t.support_priorities && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: t.support_priorities.color + "20", color: t.support_priorities.color }}>{t.support_priorities.name}</span>}
                      <span className="text-xs text-gray-400">{catName}</span>
                      {t.source !== "desk" && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.source}</span>}
                    </div>
                    <p className="text-sm font-semibold mt-1 truncate">{t.subject}</p>
                    {t.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{t.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {t.submitter_name && <span>From: {t.submitter_name}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(t.created_at).toLocaleDateString()}</span>
                      {t.assigned_to && <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />Assigned</span>}
                      {t.due_at && new Date(t.due_at) < new Date() && t.status !== "resolved" && t.status !== "closed" && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="h-3 w-3" />Overdue</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4 shrink-0" onClick={e => e.stopPropagation()}>
                    {(t.status === "new" || t.status === "open" || t.status === "reopened") && (
                      <Button size="sm" variant="ghost" onClick={() => { setAssignModal(t.id); setAssignTo("") }} title="Assign"><UserCheck className="h-4 w-4 text-blue-500" /></Button>
                    )}
                    {t.status !== "resolved" && t.status !== "closed" && (
                      <Button size="sm" variant="ghost" onClick={() => handleStatus(t.id, "resolved")} title="Resolve"><CheckCircle className="h-4 w-4 text-green-500" /></Button>
                    )}
                    {(t.status === "resolved" || t.status === "closed") && (
                      <Button size="sm" variant="ghost" onClick={() => handleStatus(t.id, "reopened")} title="Reopen"><ArrowUpCircle className="h-4 w-4 text-purple-500" /></Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setEscalateModal(t.id); setEscalateLevel("level1") }} title="Escalate"><AlertTriangle className="h-4 w-4 text-orange-500" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {tickets.length === 0 && <p className="text-center text-gray-400 py-8">No tickets found</p>}
      </div>

      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAssignModal(null)}>
          <Card className="w-96" onClick={e => e.stopPropagation()}>
            <CardHeader><CardTitle>Assign Ticket</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>User ID</Label><Input value={assignTo} onChange={e => setAssignTo(e.target.value)} placeholder="Enter user UUID" /></div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
                <Button onClick={() => handleAssign(assignModal)}>Assign</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {escalateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEscalateModal(null)}>
          <Card className="w-96" onClick={e => e.stopPropagation()}>
            <CardHeader><CardTitle>Escalate Ticket</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Escalation Level</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={escalateLevel} onChange={e => setEscalateLevel(e.target.value)}><option value="level1">Level 1</option><option value="level2">Level 2</option><option value="level3">Level 3</option><option value="level4">Level 4</option></select></div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEscalateModal(null)}>Cancel</Button>
                <Button onClick={() => handleEscalate(escalateModal)}>Escalate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
