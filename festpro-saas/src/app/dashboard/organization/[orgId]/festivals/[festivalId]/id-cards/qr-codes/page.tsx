"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getQrCodes, revokeQrCode } from "@/lib/actions/id-card"
import type { QrCode } from "@/types/id-card"
import { Loader2, QrCode as QrIcon, Shield, ShieldOff, CalendarDays, Eye, EyeOff } from "lucide-react"

export default function QrCodesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [qrCodes, setQrCodes] = useState<QrCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showTokens, setShowTokens] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const res = await getQrCodes(festivalId)
    setQrCodes(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const toggleToken = (id: string) => {
    setShowTokens(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-sm text-gray-500 mt-1">{qrCodes.length} QR codes generated.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qrCodes.map(q => (
          <Card key={q.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${q.is_revoked ? "bg-red-50" : "bg-indigo-50"} flex items-center justify-center`}>
                    <QrIcon className={`h-5 w-5 ${q.is_revoked ? "text-red-400" : "text-indigo-600"}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm capitalize">{q.entity_type.replace("_", " ")}</p>
                    <p className="text-xs text-gray-500">ID: {q.entity_id.slice(0, 8)}...</p>
                  </div>
                </div>
                {q.is_revoked ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Revoked</span>
                ) : q.expires_at && new Date(q.expires_at) < new Date() ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Expired</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                )}
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {showTokens.has(q.id) ? (
                    <><code className="text-xs bg-gray-100 px-1 rounded">{q.token.slice(0, 32)}...</code>
                    <button onClick={() => toggleToken(q.id)}><EyeOff className="h-3 w-3" /></button></>
                  ) : (
                    <><span className="text-gray-400">••••••••</span>
                    <button onClick={() => toggleToken(q.id)}><Eye className="h-3 w-3" /></button></>
                  )}
                </div>
                <div className="flex items-center gap-1"><QrIcon className="h-3 w-3" /> Scans: {q.scan_count}{q.max_scans > 0 ? ` / ${q.max_scans}` : ""}</div>
                {q.expires_at && <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Expires: {new Date(q.expires_at).toLocaleDateString()}</div>}
              </div>
              {!q.is_revoked && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await revokeQrCode(q.id); load() }}>
                    <ShieldOff className="h-3.5 w-3.5 mr-1" /> Revoke
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {qrCodes.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No QR codes generated.</p>}
      </div>
    </div>
  )
}
