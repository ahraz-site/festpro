"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getTicket, getTicketComments, addTicketComment, getTicketHistory, updateTicketStatus, assignTicket, escalateTicket } from "@/lib/actions/help-desk"
import { TICKET_STATUSES, TICKET_PRIORITIES } from "@/config/help-desk"
import { Loader2, Clock, UserCheck, CheckCircle, ArrowUpCircle, AlertTriangle, MessageSquare, History, Send } from "lucide-react"

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const festivalId = params.festivalId as string
  const orgId = params.orgId as string
  const [ticket, setTicket] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"comments" | "history">("comments")
  const [newComment, setNewComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)

  const load = useCallback(async () => {
    const [tRes, cRes, hRes] = await Promise.all([getTicket(ticketId), getTicketComments(ticketId), getTicketHistory(ticketId)])
    if (tRes.data) setTicket(tRes.data)
    if (cRes.data) setComments(cRes.data)
    if (hRes.data) setHistory(hRes.data)
    setLoading(false)
  }, [ticketId])

  useEffect(() => { load() }, [load])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    const res = await addTicketComment(ticketId, "Agent", newComment, isInternal)
    if (res.data) { setNewComment(""); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!ticket) return <p className="text-center py-12 text-gray-500">Ticket not found</p>

  const s = TICKET_STATUSES.find(x => x.value === ticket.status)
  const p = TICKET_PRIORITIES.find(x => x.value === ticket.priority)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">#{ticket.ticket_number}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s?.color || ""}`}>{s?.label || ticket.status}</span>
            {p && <span className={`text-xs px-2 py-0.5 rounded-full ${p.color}`}>{p.label}</span>}
          </div>
          <p className="text-lg text-gray-700 mt-1">{ticket.subject}</p>
        </div>
        <div className="flex gap-2">
          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <Button size="sm" variant="outline" onClick={async () => { await updateTicketStatus(ticketId, "resolved"); load() }}><CheckCircle className="h-4 w-4 mr-1" /> Resolve</Button>
          )}
          {(ticket.status === "resolved" || ticket.status === "closed") && (
            <Button size="sm" variant="outline" onClick={async () => { await updateTicketStatus(ticketId, "reopened"); load() }}><ArrowUpCircle className="h-4 w-4 mr-1" /> Reopen</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description || "No description provided"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Activity</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant={tab === "comments" ? "default" : "outline"} onClick={() => setTab("comments")}><MessageSquare className="h-4 w-4 mr-1" /> Comments ({comments.length})</Button>
                <Button size="sm" variant={tab === "history" ? "default" : "outline"} onClick={() => setTab("history")}><History className="h-4 w-4 mr-1" /> History</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tab === "comments" ? (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comments.map(c => (
                      <div key={c.id} className={`p-3 rounded-lg ${c.is_internal ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{c.sender_name} <span className="text-xs text-gray-400">{c.sender_role}</span></span>
                          <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{c.comment}</p>
                        {c.is_internal && <span className="text-xs text-amber-600 font-medium">Internal Note</span>}
                      </div>
                    ))}
                    {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet</p>}
                  </div>
                  <div className="flex gap-2">
                    <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1" rows={2} />
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={handleAddComment}><Send className="h-4 w-4" /></Button>
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} /> Internal</label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map(h => (
                    <div key={h.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <div>
                        <p><span className="font-medium capitalize">{h.action.replace(/_/g, " ")}</span> {h.field_name && <>— <span className="text-gray-500">{h.field_name}</span></>}</p>
                        <div className="flex gap-2 text-xs text-gray-400">
                          {h.old_value && <span>From: {h.old_value}</span>}
                          {h.new_value && <span>To: {h.new_value}</span>}
                          <span>{new Date(h.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-sm text-gray-400">No history recorded</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs px-2 py-0.5 rounded-full ${s?.color || ""}`}>{s?.label || ticket.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Priority</span><span>{p?.label || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{ticket.support_categories?.name || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Source</span><span className="capitalize">{ticket.source}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span>{new Date(ticket.created_at).toLocaleDateString()}</span></div>
              {ticket.resolved_at && <div className="flex justify-between"><span className="text-gray-500">Resolved</span><span>{new Date(ticket.resolved_at).toLocaleDateString()}</span></div>}
              {ticket.assigned_to && <div className="flex justify-between"><span className="text-gray-500">Assigned To</span><span className="text-xs font-mono">{ticket.assigned_to.slice(0, 8)}...</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Submitter</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {ticket.submitter_name && <p><span className="text-gray-500">Name:</span> {ticket.submitter_name}</p>}
              {ticket.submitter_email && <p><span className="text-gray-500">Email:</span> {ticket.submitter_email}</p>}
              {ticket.submitter_phone && <p><span className="text-gray-500">Phone:</span> {ticket.submitter_phone}</p>}
              {!ticket.submitter_name && <p className="text-gray-400">No submitter info</p>}
            </CardContent>
          </Card>

          {ticket.resolution_notes && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Resolution</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-700">{ticket.resolution_notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
