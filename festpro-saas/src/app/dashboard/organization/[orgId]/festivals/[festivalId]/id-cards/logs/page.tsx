"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getVerificationLogs } from "@/lib/actions/id-card"
import type { VerificationLog } from "@/types/id-card"
import { Loader2, Scan, Search, QrCode, Server, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

const methodIcons: Record<string, any> = { qr_scan: QrCode, barcode_scan: Search, manual_search: Search, api: Server }
const resultColors: Record<string, string> = {
  valid: "bg-green-100 text-green-700",
  invalid: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-700",
  revoked: "bg-red-100 text-red-700",
  not_found: "bg-gray-100 text-gray-600",
}

export default function LogsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [logs, setLogs] = useState<VerificationLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getVerificationLogs(festivalId)
    setLogs(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Logs</h1>
          <p className="text-sm text-gray-500 mt-1">{logs.length} verification records.</p>
        </div>
      </div>

      <div className="space-y-3">
        {logs.map(l => {
          const MethodIcon = methodIcons[l.verification_method] || Scan
          return (
            <Card key={l.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      l.result === "valid" ? "bg-green-50" : l.result === "invalid" || l.result === "revoked" ? "bg-red-50" : "bg-amber-50"
                    }`}>
                      {l.result === "valid" ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                       l.result === "invalid" || l.result === "revoked" ? <XCircle className="h-4 w-4 text-red-600" /> :
                       <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{l.entity_type.replace("_", " ")}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MethodIcon className="h-3 w-3" />
                        <span>{l.verification_method.replace("_", " ")}</span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{new Date(l.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${resultColors[l.result] || "bg-gray-100"}`}>
                    {l.result.replace("_", " ")}
                  </span>
                </div>
                {l.scanner_location && <p className="text-xs text-gray-400 mt-1">Location: {l.scanner_location}</p>}
              </CardContent>
            </Card>
          )
        })}
        {logs.length === 0 && <p className="text-gray-500 text-center py-8">No verification logs yet.</p>}
      </div>
    </div>
  )
}
