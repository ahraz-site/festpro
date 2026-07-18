"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getPendingApprovals, approveScore, rejectScore } from "@/lib/actions/judging/approval"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

export default function ApprovalsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [remarks, setRemarks] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await getPendingApprovals(festivalId)
    setApprovals(res.data || [])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    const res = await approveScore(id, remarks || undefined)
    if (res.error) toast.error(res.error); else toast.success("Score approved")
    setProcessingId(null); setRemarks(""); load()
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    const res = await rejectScore(id, remarks || undefined)
    if (res.error) toast.error(res.error); else toast.success("Score rejected")
    setProcessingId(null); setRemarks(""); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chief Judge Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve/reject submitted scores.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Remarks (optional)</CardTitle></CardHeader>
        <CardContent>
          <Textarea placeholder="Enter remarks or correction notes..." value={remarks} onChange={e => setRemarks(e.target.value)} className="mb-2" />
        </CardContent>
      </Card>

      {approvals.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No pending approvals</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {approvals.map(a => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{a.score?.participant?.first_name} {a.score?.participant?.last_name}</p>
                    <p className="text-sm text-gray-500">ID: {a.score?.participant?.participant_id}</p>
                    <p className="text-sm text-gray-500">Competition: {a.competition?.name}</p>
                    <p className="text-sm text-gray-500">Score: {a.score?.total_score?.toFixed(2) ?? "—"} | Weighted: {a.score?.weighted_score?.toFixed(2) ?? "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={() => handleApprove(a.id)} disabled={processingId === a.id}>
                      {processingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />} Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => handleReject(a.id)} disabled={processingId === a.id}>
                      {processingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />} Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
