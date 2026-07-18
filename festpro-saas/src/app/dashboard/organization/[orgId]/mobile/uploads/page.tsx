"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getPendingUploads } from "@/lib/actions/mobile-platform"
import { SYNC_STATUSES } from "@/config/mobile-platform"
import { Loader2, Camera, Image } from "lucide-react"

export default function MediaUploadsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [uploads, setUploads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true); const u = await getPendingUploads(orgId); setUploads(u.data || []); setLoading(false)
  }, [orgId])
  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Media Uploads</h1><p className="text-sm text-gray-500 mt-1">{uploads.length} pending media uploads</p></div>
      <div className="grid gap-3">
        {uploads.map((u: any) => (
          <Card key={u.id}><CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center"><Image className="h-4 w-4 text-teal-600" /></div>
              <div><p className="text-sm font-medium">{u.file_name}</p><p className="text-xs text-gray-500">{u.mime_type || "—"} · {u.file_size ? `${(u.file_size / 1024).toFixed(1)} KB` : "—"}</p></div></div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SYNC_STATUSES.find(s => s.value === u.status)?.color || "bg-gray-100"}`}>{SYNC_STATUSES.find(s => s.value === u.status)?.label || u.status}</span>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
