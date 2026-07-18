"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBatches } from "@/lib/actions/certificate"
import type { CertificateBatch } from "@/types/result"
import { Loader2, Package, CheckCircle, XCircle, Clock, Download } from "lucide-react"

export default function BatchesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [batches, setBatches] = useState<CertificateBatch[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getBatches(festivalId)
    setBatches(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Batches</h1>
        <p className="text-sm text-gray-500 mt-1">Track bulk certificate generation history.</p>
      </div>

      {batches.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No batches yet. Generate certificates to create a batch.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {batches.map(b => (
            <Card key={b.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{b.batch_name}</p>
                      <p className="text-xs text-gray-400">Template: {(b as any).template?.template_name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p>Total: <strong>{b.total_count}</strong></p>
                      <p className="text-green-600">Success: {b.success_count}</p>
                      {b.failed_count > 0 && <p className="text-red-500">Failed: {b.failed_count}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === "completed" ? "bg-green-100 text-green-700" :
                      b.status === "processing" ? "bg-blue-100 text-blue-700" :
                      b.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>{b.status}</span>
                    {b.started_at && <span className="text-xs text-gray-400">{new Date(b.started_at).toLocaleDateString()}</span>}
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
