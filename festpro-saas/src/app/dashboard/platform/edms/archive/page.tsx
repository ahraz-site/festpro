import { getArchiveJobs, getArchivePolicies } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ARCHIVE_STATUSES } from "@/config/edms"
import { Archive, HardDrive } from "lucide-react"

export default async function ArchivePage() {
  const [jobsRes, policiesRes] = await Promise.all([getArchiveJobs(), getArchivePolicies()])
  if ("error" in jobsRes) return <div className="text-red-500">{jobsRes.error}</div>
  if ("error" in policiesRes) return <div className="text-red-500">{policiesRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Archive Center</h1>
        <p className="text-sm text-gray-500">Archive policies, jobs and history</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><HardDrive className="h-4 w-4" /> Archive Policies ({policiesRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {policiesRes.data.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{p.policy_name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Frequency: {p.archive_frequency}</p>
                  <p>Retention: {p.retention_after_archive_days} days</p>
                  <p>Compress: {p.compress_archives ? "Yes" : "No"} | Encrypt: {p.encrypt_archives ? "Yes" : "No"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Archive className="h-4 w-4" /> Archive Jobs ({jobsRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {jobsRes.data.map((j) => {
              const stCfg = ARCHIVE_STATUSES.find((s) => s.value === j.status)
              const policy = j as any
              return (
                <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <Archive className="h-4 w-4 text-gray-400" />
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? j.status}</span>
                    <span className="font-medium text-gray-900">{j.archive_name}</span>
                    {policy.archive_policies?.policy_name && <span className="text-xs text-gray-400">{policy.archive_policies.policy_name}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{j.archived_documents}/{j.total_documents} docs</span>
                    {j.total_size_bytes > 0 && <span>{(j.total_size_bytes / 1048576).toFixed(1)} MB</span>}
                    {j.completed_at && <span>{new Date(j.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              )
            })}
            {jobsRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No archive jobs found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
