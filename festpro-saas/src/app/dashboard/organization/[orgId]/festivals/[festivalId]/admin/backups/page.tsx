"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getBackups, createBackup } from "@/lib/actions/security"
import { BACKUP_STATUSES } from "@/config/security"
import type { SystemBackup } from "@/types/security"
import { Loader2, Database, Plus, Download, CheckCircle, XCircle, Clock, Server, HardDrive, Upload } from "lucide-react"

export default function BackupsPage() {
  const orgId = useParams().orgId as string
  const [backups, setBackups] = useState<SystemBackup[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await getBackups(orgId)
    setBackups(res.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    setCreating(true)
    const name = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}`
    const res = await createBackup({ organization_id: orgId, backup_name: name })
    setCreating(false)
    if (res.error) toast.error(res.error); else { toast.success("Backup started"); load() }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "N/A"
    const mb = bytes / (1024 * 1024)
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`
    return `${mb.toFixed(2)} MB`
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const completed = backups.filter(b => b.status === "completed" || b.status === "verified").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backups</h1>
          <p className="text-sm text-gray-500 mt-1">{completed} completed · {backups.length} total</p>
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          Create Backup
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Database className="h-8 w-8 p-1.5 rounded-lg bg-blue-50 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{backups.length}</p>
              <p className="text-xs text-gray-500">Total Backups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 p-1.5 rounded-lg bg-green-50 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <HardDrive className="h-8 w-8 p-1.5 rounded-lg bg-indigo-50 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold">{formatSize(backups.reduce((sum, b) => sum + (b.file_size || 0), 0))}</p>
              <p className="text-xs text-gray-500">Total Size</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {backups.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Database className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No backups yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {backups.map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      b.status === "completed" || b.status === "verified" ? "bg-green-50 text-green-600" :
                      b.status === "failed" ? "bg-red-50 text-red-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {b.status === "completed" || b.status === "verified" ? <CheckCircle className="h-4 w-4" /> :
                       b.status === "failed" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{b.backup_name}</p>
                      <p className="text-xs text-gray-400">
                        {b.backup_type} · {formatSize(b.file_size)} · Created {new Date(b.created_at).toLocaleString()}
                      </p>
                      {b.error_message && <p className="text-xs text-red-500 mt-0.5">{b.error_message}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${BACKUP_STATUSES.find(s => s.value === b.status)?.color || ""}`}>{b.status}</span>
                    {b.verified_at && <span className="text-xs text-green-600 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
