"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getAppeal, updateAppealStatus, uploadAppealDocument } from "@/lib/actions/appeal"
import { APPEAL_STATUSES } from "@/config/result"
import type { Appeal } from "@/types/result"
import { Loader2, CheckCircle, XCircle, Clock, User, FileText, Upload } from "lucide-react"

export default function AppealDetailPage() {
  const params = useParams()
  const appealId = params.appealId as string
  const [appeal, setAppeal] = useState<Appeal | null>(null)
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState("")
  const [notes, setNotes] = useState("")

  const load = useCallback(async () => {
    const res = await getAppeal(appealId)
    setAppeal(res.data || null); setLoading(false)
  }, [appealId])

  useEffect(() => { load() }, [load])

  const handleStatus = async (status: string) => {
    const res = await updateAppealStatus(appealId, status as any, decision, notes)
    if (res.error) toast.error(res.error); else { toast.success(`Appeal ${status}`); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!appeal) return <Card><CardContent className="py-12 text-center text-gray-400">Appeal not found</CardContent></Card>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{appeal.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Appeal #{appeal.id.slice(0, 8)}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${APPEAL_STATUSES.find(s => s.value === appeal.status)?.color || ""}`}>{appeal.status}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-gray-400">Type:</span> {appeal.appeal_type.replace("_", " ")}</p>
            <p><span className="text-gray-400">Priority:</span> {appeal.priority}</p>
            <p><span className="text-gray-400">Submitted:</span> {new Date(appeal.submitted_at).toLocaleString()}</p>
            <p><span className="text-gray-400">Participant:</span> {appeal.participant?.first_name} {appeal.participant?.last_name}</p>
            <p><span className="text-gray-400">Competition:</span> {appeal.competition?.name}</p>
            {appeal.assigned_to && <p><span className="text-gray-400">Assigned to:</span> {appeal.assigned_to}</p>}
          </CardContent>
        </Card>

        {appeal.status === "submitted" && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Decision notes..." value={decision} onChange={e => setDecision(e.target.value)} />
              <Textarea placeholder="Committee notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              <div className="flex gap-2">
                <Button className="flex-1 text-green-600 border-green-300" variant="outline" onClick={() => handleStatus("approved")}><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                <Button className="flex-1 text-red-600 border-red-300" variant="outline" onClick={() => handleStatus("rejected")}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
        <CardContent><p className="text-sm whitespace-pre-wrap">{appeal.description}</p></CardContent>
      </Card>

      {appeal.documents && appeal.documents.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Documents</CardTitle></CardHeader>
          <CardContent>
            {appeal.documents.map(d => (
              <div key={d.id} className="flex items-center gap-2 text-sm py-1">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>{d.file_name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {appeal.history && appeal.history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {appeal.history.map(h => (
              <div key={h.id} className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="capitalize">{h.from_status || "—"}</span>
                <span>→</span>
                <span className="capitalize">{h.to_status}</span>
                {h.change_notes && <span className="text-gray-400">— {h.change_notes}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
