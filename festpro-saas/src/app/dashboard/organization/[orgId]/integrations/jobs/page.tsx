"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getScheduledJobs, createScheduledJob, deleteScheduledJob, getJobExecutions, getDeadLetterQueue, retryDeadLetterJob } from "@/lib/actions/integration-hub"
import { JOB_STATUSES } from "@/config/integration-hub"
import { Loader2, Clock, Plus, Trash2, RotateCw, Play } from "lucide-react"

export default function JobsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [jobs, setJobs] = useState<any[]>([])
  const [deadLetters, setDeadLetters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"scheduled" | "dead">("scheduled")
  const [showCreate, setShowCreate] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [executions, setExecutions] = useState<any[]>([])
  const [form, setForm] = useState({ job_name: "", job_type: "", cron_expression: "", is_recurring: false, priority: "normal" })

  const load = useCallback(async () => {
    setLoading(true)
    const [j, d] = await Promise.all([getScheduledJobs(orgId), getDeadLetterQueue(orgId)])
    setJobs(j.data || []); setDeadLetters(d.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.job_name || !form.job_type) return
    await createScheduledJob({ ...form, is_recurring: form.is_recurring, priority: form.priority as any, job_config: {} })
    setForm({ job_name: "", job_type: "", cron_expression: "", is_recurring: false, priority: "normal" })
    setShowCreate(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return
    await deleteScheduledJob(id); load()
  }

  const viewExecutions = async (job: any) => {
    setSelectedJob(job)
    const r = await getJobExecutions(job.id)
    setExecutions(r.data || [])
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Jobs & Scheduler</h1><p className="text-sm text-gray-500">{jobs.length} scheduled · {deadLetters.length} dead letter</p></div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm"><Plus className="h-4 w-4 mr-1" /> Create Job</Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("scheduled")} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "scheduled" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>Scheduled Jobs</button>
        <button onClick={() => setTab("dead")} className={`px-4 py-2 text-sm font-medium rounded-lg ${tab === "dead" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>Dead Letter Queue</button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>New Scheduled Job</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Job Name</label>
                <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.job_name} onChange={e => setForm({ ...form, job_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Job Type</label>
                <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })} placeholder="sync, export, import, cleanup" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Cron Expression</label>
                <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.cron_expression} onChange={e => setForm({ ...form, cron_expression: e.target.value })} placeholder="0 */6 * * *" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_recurring} onChange={e => setForm({ ...form, is_recurring: e.target.checked })} />
              Recurring Job
            </label>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Job</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "scheduled" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Schedule</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Runs</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Next Run</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((j: any) => (
                  <tr key={j.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewExecutions(j)}>
                    <td className="px-4 py-3 font-medium">{j.job_name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{j.job_type}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{j.cron_expression || "Manual"}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${JOB_STATUSES.find(s => s.value === j.status)?.color || ""}`}>{j.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{j.total_runs} ({j.failed_runs} failed)</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{j.next_run_at ? new Date(j.next_run_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleDelete(j.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "dead" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Error</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Attempts</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deadLetters.map((dl: any) => (
                  <tr key={dl.id}>
                    <td className="px-4 py-3 text-xs font-mono">{dl.job_type}</td>
                    <td className="px-4 py-3 text-gray-500">{dl.source}</td>
                    <td className="px-4 py-3 text-xs text-red-600 max-w-xs truncate">{dl.error_message}</td>
                    <td className="px-4 py-3 text-gray-500">{dl.failed_attempts}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700">{dl.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => retryDeadLetterJob(dl.id)} className="text-gray-400 hover:text-indigo-600" title="Retry"><RotateCw className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {selectedJob && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-500">Executions - {selectedJob.job_name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>Close</Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Trigger</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Started</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {executions.map((ex: any) => (
                  <tr key={ex.id}>
                    <td className="px-4 py-3 text-gray-500">#{ex.execution_number}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STATUSES.find(s => s.value === ex.status)?.color || ""}`}>{ex.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{ex.duration_ms ? `${(ex.duration_ms / 1000).toFixed(1)}s` : "-"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{ex.trigger_type}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{ex.started_at ? new Date(ex.started_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 text-xs text-red-500 max-w-xs truncate">{ex.error_message || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
