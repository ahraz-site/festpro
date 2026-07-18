import { getBackupJobs, getRestoreJobs } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BACKUP_STATUSES, BACKUP_TYPES } from "@/config/observability"
import { Database, RefreshCw, Download } from "lucide-react"

const BACKUPS_PAGE_SIZE = 100

export default async function BackupsPage() {
  const [backupsRes, restoresRes] = await Promise.all([
    getBackupJobs({ limit: BACKUPS_PAGE_SIZE }),
    getRestoreJobs({ limit: BACKUPS_PAGE_SIZE }),
  ])
  if ("error" in backupsRes) return <div className="text-red-500">{backupsRes.error}</div>
  if ("error" in restoresRes) return <div className="text-red-500">{restoresRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backups & Restores</h1>
        <p className="text-sm text-gray-500">Manage backup jobs and restore operations</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Database className="h-4 w-4" /> Backup Jobs ({backupsRes.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {backupsRes.data.map((b) => {
              const stCfg = BACKUP_STATUSES.find((s) => s.value === b.status)
              const tpCfg = BACKUP_TYPES.find((t) => t.value === b.backup_type)
              return (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? b.status}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600`}>{tpCfg?.label ?? b.backup_type}</span>
                    <span className="text-gray-900 font-medium">{b.backup_name}</span>
                    {b.file_size_bytes && <span className="text-gray-400 text-xs">{(b.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "—"}</span>
                    {b.duration_seconds && <span>{(b.duration_seconds / 60).toFixed(0)}m</span>}
                    {b.is_encrypted && <span className="text-amber-600">Encrypted</span>}
                  </div>
                </div>
              )
            })}
            {backupsRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No backup jobs found</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Download className="h-4 w-4" /> Restore Jobs ({restoresRes.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {restoresRes.data.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    r.status === "completed" ? "bg-green-100 text-green-700" :
                    r.status === "failed" ? "bg-red-100 text-red-700" :
                    r.status === "running" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>{r.status}</span>
                  <span className="text-gray-900 font-medium">{r.restore_name}</span>
                  <span className="text-gray-400 text-xs">{r.restore_type.replace(/_/g, " ")}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {r.started_at ? new Date(r.started_at).toLocaleString() : "—"}
                </div>
              </div>
            ))}
            {restoresRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No restore jobs found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
