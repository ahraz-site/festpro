"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getQrCards, generateQrCard, generateBulkQrCards, markQrAsPrinted } from "@/lib/actions/participant/qr"
import { getParticipants } from "@/lib/actions/participant"
import type { QrCard, Participant } from "@/types/participant"
import { QrCode, Download, Printer, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function QrCardsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [qrCards, setQrCards] = useState<QrCard[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [selParticipant, setSelParticipant] = useState("")
  const [printFilter, setPrintFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const [qRes, pRes] = await Promise.all([
      getQrCards(festivalId, { is_printed: printFilter === "printed" ? true : printFilter === "unprinted" ? false : undefined, page, limit }),
      getParticipants(festivalId, { limit: 500 }),
    ])
    setQrCards(qRes.data as QrCard[])
    setTotalCount(qRes.count || 0)
    setParticipants(pRes.data as Participant[])
    setLoading(false)
  }, [festivalId, printFilter, page])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => {
    if (!selParticipant) { toast.error("Select a participant"); return }
    const res = await generateQrCard(selParticipant, festivalId)
    if (res.error) toast.error(res.error); else { toast.success("QR generated!"); setSelParticipant(""); load() }
  }

  const handleGenerateAll = async () => {
    const ungenerated = participants.filter(p => !qrCards.some(q => q.participant_id === p.id))
    if (ungenerated.length === 0) { toast.info("All participants have QR codes"); return }
    const ids = ungenerated.map(p => p.id)
    const res = await generateBulkQrCards(ids, festivalId)
    if (res.error) toast.error(res.error); else { toast.success(`Generated ${ids.length} QR codes`); load() }
  }

  const handleMarkPrinted = async (participantId: string) => {
    const res = await markQrAsPrinted(participantId, festivalId)
    if (res.error) toast.error(res.error); else { toast.success("Marked as printed"); load() }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR ID Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and manage participant QR identification cards.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleGenerateAll}>
          <QrCode className="h-4 w-4 mr-1" />Generate All
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">Generate QR for participant</label>
              <div className="flex gap-2">
                <Select options={participants.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name} (${p.participant_id})` }))} placeholder="Select participant" value={selParticipant} onChange={e => setSelParticipant(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={handleGenerate}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <Select options={[{ value: "printed", label: "Printed" }, { value: "unprinted", label: "Not Printed" }]} placeholder="All Cards" value={printFilter} onChange={e => { setPrintFilter(e.target.value); setPage(1) }} />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : qrCards.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No QR cards generated yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {qrCards.map((q: any) => (
            <Card key={q.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 text-center">
                {q.qr_image_url ? (
                  <img src={q.qr_image_url} alt="QR" className="w-32 h-32 mx-auto" />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mt-2">{q.participant?.first_name} {q.participant?.last_name}</h3>
                <p className="text-xs text-gray-500">{q.participant?.participant_id}</p>
                {q.participant?.chest_number && (
                  <p className="text-xs font-mono text-gray-600">Chest: {q.participant.chest_number}</p>
                )}
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.is_printed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {q.is_printed ? "Printed" : "Not Printed"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(q.qr_image_url, "_blank")}>
                    <Download className="h-3.5 w-3.5 mr-1" />Download
                  </Button>
                  {!q.is_printed && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleMarkPrinted(q.participant_id)}>
                      <Printer className="h-3.5 w-3.5 mr-1" />Printed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalCount} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
