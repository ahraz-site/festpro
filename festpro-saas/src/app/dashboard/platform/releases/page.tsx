"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReleaseReadiness, getLtsVersions, getMaintenanceCalendar, upsertReleaseReadiness } from "@/lib/actions/enterprise"
import type { ReleaseReadiness, LtsVersion, MaintenanceCalendar } from "@/types/enterprise"
import { RELEASE_READINESS_STATUSES, RELEASE_CHANNELS, MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from "@/config/enterprise"
import { Loader2, Package, Tag, Calendar, CheckCircle, XCircle, Clock, ArrowLeft, Plus, GitBranch } from "lucide-react"

export default function ReleasesPage() {
  const [releases, setReleases] = useState<ReleaseReadiness[]>([])
  const [ltsVersions, setLtsVersions] = useState<LtsVersion[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceCalendar[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ release_version: "", release_channel: "stable" as const, release_notes: "", changelog: "" })

  const load = useCallback(async () => {
    const [rRes, lRes, mRes] = await Promise.all([getReleaseReadiness(), getLtsVersions(), getMaintenanceCalendar()])
    if (rRes.data) setReleases(rRes.data)
    if (lRes.data) setLtsVersions(lRes.data)
    if (mRes.data) setMaintenance(mRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreateRelease = async () => {
    await upsertReleaseReadiness(form)
    setShowForm(false)
    setForm({ release_version: "", release_channel: "stable", release_notes: "", changelog: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const activeLts = ltsVersions.filter((l) => l.support_level === "active").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/platform/security"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Release Management & LTS</h1>
            <p className="text-sm text-gray-500">Release readiness, LTS versions, and maintenance scheduling</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />New Release</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center"><Package className="h-6 w-6 mx-auto text-indigo-500" /><p className="text-2xl font-bold mt-1">{releases.length}</p><p className="text-xs text-gray-500">Total Releases</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Tag className="h-6 w-6 mx-auto text-green-500" /><p className="text-2xl font-bold mt-1">{activeLts}</p><p className="text-xs text-gray-500">Active LTS Versions</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="h-6 w-6 mx-auto text-amber-500" /><p className="text-2xl font-bold mt-1">{maintenance.filter((m) => m.status === "scheduled").length}</p><p className="text-xs text-gray-500">Upcoming Maintenance</p></CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Version (e.g., 2.1.0)" value={form.release_version} onChange={(e) => setForm({ ...form, release_version: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <select value={form.release_channel} onChange={(e) => setForm({ ...form, release_channel: e.target.value as any })} className="border rounded px-3 py-2 text-sm">
                {RELEASE_CHANNELS.map((ch) => <option key={ch.value} value={ch.value}>{ch.label}</option>)}
              </select>
              <div className="sm:col-span-2">
                <textarea placeholder="Release notes" value={form.release_notes} onChange={(e) => setForm({ ...form, release_notes: e.target.value })} className="border rounded px-3 py-2 text-sm w-full" rows={3} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={handleCreateRelease}>Create Release</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-medium">Release Readiness</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {releases.map((r) => {
                const stCfg = RELEASE_READINESS_STATUSES.find((s) => s.value === r.status)
                const chCfg = RELEASE_CHANNELS.find((c) => c.value === r.release_channel)
                const checksPassed = [r.security_scan_pass, r.performance_benchmark_pass, r.compliance_check_pass, r.integration_test_pass, r.load_test_pass, r.accessibility_check_pass, r.localization_check_pass].filter(Boolean).length
                return (
                  <div key={r.id} className="p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-sm">{r.release_version}</span>
                        <span className="text-xs text-gray-400">{chCfg?.label || r.release_channel}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stCfg?.color || "bg-gray-100"}`}>{stCfg?.label || r.status}</span>
                        {r.is_critical && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Critical</span>}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span className={r.security_scan_pass ? "text-green-600" : "text-red-600"}>{r.security_scan_pass ? "✓" : "✗"} Security</span>
                      <span className={r.performance_benchmark_pass ? "text-green-600" : "text-red-600"}>{r.performance_benchmark_pass ? "✓" : "✗"} Performance</span>
                      <span className={r.compliance_check_pass ? "text-green-600" : "text-red-600"}>{r.compliance_check_pass ? "✓" : "✗"} Compliance</span>
                      <span className={r.integration_test_pass ? "text-green-600" : "text-red-600"}>{r.integration_test_pass ? "✓" : "✗"} Integration</span>
                      <span className={r.load_test_pass ? "text-green-600" : "text-red-600"}>{r.load_test_pass ? "✓" : "✗"} Load</span>
                    </div>
                    {r.status === "draft" && <div className="flex gap-2 mt-2"><Button variant="outline" size="sm" onClick={async () => { await upsertReleaseReadiness({ id: r.id, status: "in_review" }); load() }}>Submit for Review</Button></div>}
                    {r.status === "in_review" && <div className="flex gap-2 mt-2"><Button variant="outline" size="sm" onClick={async () => { await upsertReleaseReadiness({ id: r.id, status: "approved" }); load() }}>Approve</Button><Button variant="outline" size="sm" className="text-red-500" onClick={async () => { await upsertReleaseReadiness({ id: r.id, status: "rejected" }); load() }}>Reject</Button></div>}
                    {r.status === "approved" && <div className="flex gap-2 mt-2"><Button variant="outline" size="sm" onClick={async () => { await upsertReleaseReadiness({ id: r.id, status: "deployed", deployed_at: new Date().toISOString() }); load() }}>Deploy</Button></div>}
                  </div>
                )
              })}
              {releases.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No releases created</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">LTS Versions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ltsVersions.map((l) => (
                <div key={l.id} className="p-3 rounded-lg border hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-sm">{l.version}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${l.support_level === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{l.support_level}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    <span>Start: {new Date(l.lts_start_date).toLocaleDateString()}</span>
                    <br />
                    <span>End: {new Date(l.lts_end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {ltsVersions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No LTS versions</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Maintenance Calendar</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {maintenance.map((m) => {
              const tCfg = MAINTENANCE_TYPES.find((t) => t.value === m.maintenance_type)
              const sCfg = MAINTENANCE_STATUSES.find((st) => st.value === m.status)
              return (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">{m.title}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tCfg?.color}`}>{tCfg?.label || m.maintenance_type}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sCfg?.color}`}>{sCfg?.label || m.status}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>Start: {new Date(m.scheduled_start).toLocaleString()}</span>
                      <span>End: {new Date(m.scheduled_end).toLocaleString()}</span>
                      {m.is_emergency && <span className="text-red-500 font-medium">Emergency</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {maintenance.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No maintenance scheduled</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
