"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSyncQueue, processSyncQueue, getSyncLogs, resolveSyncConflict } from "@/lib/actions/mobile-platform"
import { SYNC_STATUSES, SYNC_PRIORITIES, SYNC_OPERATIONS } from "@/config/mobile-platform"
import { Loader2, CloudSync, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function SyncPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [queue, setQueue] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"queue" | "logs">("queue")
  const [processing, setProcessing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); const [q, l] = await Promise.all([getSyncQueue(orgId), getSyncLogs(orgId)]); setQueue(q.data || []); setLogs(l.data || []); setLoading(false)
  }, [orgId])
  useEffect(() => { load() }, [load])

  const handleProcess = async () => {
    setProcessing(true)
    const { data: devices } = await import("@/lib/actions/mobile-platform").then(m => m.getMobileDevices(orgId, "active"))
    for (const d of (devices || [])) await processSyncQueue(d.id)
    setProcessing(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Sync Management</h1><p className="text-sm text-gray-500 mt-1">{queue.length} pending items</p></div>
        <Button onClick={handleProcess} disabled={processing}><CloudSync className="h-4 w-4 mr-1" />{processing ? "Processing..." : "Process Queue"}</Button></div>
      <div className="flex gap-2 border-b"><button onClick={() => setTab("queue")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "queue" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Queue ({queue.length})</button>
        <button onClick={() => setTab("logs")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "logs" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>Sync Logs ({logs.length})</button></div>
      {tab === "queue" && (
        <div className="grid gap-3">
          {queue.map((item: any) => (
            <Card key={item.id}><CardContent className="p-4 flex items-start justify-between">
              <div className="flex items-center gap-3"><div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.status === "failed" ? "bg-red-100" : item.status === "conflict" ? "bg-amber-100" : "bg-gray-100"}`}>
                {item.status === "failed" ? <XCircle className="h-4 w-4 text-red-600" /> : item.status === "conflict" ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <CloudSync className="h-4 w-4 text-gray-600" />}</div>
                <div><p className="text-sm font-medium">{item.table_name} · {SYNC_OPERATIONS.find(o => o.value === item.sync_operation)?.label || item.sync_operation}</p>
                  <p className="text-xs text-gray-500">Priority: {SYNC_PRIORITIES.find(p => p.value === item.priority)?.label || item.priority} · Retry: {item.retry_count}/{item.max_retries}</p>
                  {item.error_message && <p className="text-xs text-red-500 mt-0.5">{item.error_message}</p>}</div></div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SYNC_STATUSES.find(s => s.value === item.status)?.color || "bg-gray-100"}`}>
                {SYNC_STATUSES.find(s => s.value === item.status)?.label || item.status}</span>
            </CardContent></Card>
          ))}
        </div>
      )}
      {tab === "logs" && (
        <div className="grid gap-3">
          {logs.map((log: any) => (
            <Card key={log.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-sm font-medium">{log.sync_type} sync</p><p className="text-xs text-gray-500">{log.records_synced} synced · {log.records_failed} failed · {log.conflicts_resolved} conflicts resolved</p>
                <p className="text-xs text-gray-400">{log.created_at ? new Date(log.created_at).toLocaleString() : "—"}</p></div>
              <div className="text-right"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SYNC_STATUSES.find(s => s.value === log.status)?.color || "bg-gray-100"}`}>{SYNC_STATUSES.find(s => s.value === log.status)?.label || log.status}</span></div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  )
}
