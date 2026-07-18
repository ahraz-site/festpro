"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReleases, upsertRelease } from "@/lib/actions/devops"
import type { ReleaseVersion } from "@/types/devops"
import { RELEASE_STATUSES } from "@/config/devops"
import { Loader2, Package, Plus, CheckCircle, ArrowLeft, GitCommit, Tag } from "lucide-react"
import Link from "next/link"

export default function ReleasesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [releases, setReleases] = useState<ReleaseVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ version: "", release_name: "", changelog: "", branch: "main", commit_sha: "" })

  const load = useCallback(async () => {
    const res = await getReleases()
    if (res.data) setReleases(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    await upsertRelease({ ...form, status: "draft", project_name: "festpro-saas" })
    setShowForm(false)
    setForm({ version: "", release_name: "", changelog: "", branch: "main", commit_sha: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Release Manager</h1>
            <p className="text-sm text-gray-500">Versioning, changelogs, and release orchestration</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />New Release</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Version (e.g., 1.2.3)" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input placeholder="Release name" value={form.release_name} onChange={(e) => setForm({ ...form, release_name: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input placeholder="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input placeholder="Commit SHA" value={form.commit_sha} onChange={(e) => setForm({ ...form, commit_sha: e.target.value })} className="border rounded px-3 py-2 text-sm font-mono" />
              <div className="sm:col-span-2">
                <textarea placeholder="Changelog" value={form.changelog} onChange={(e) => setForm({ ...form, changelog: e.target.value })} className="border rounded px-3 py-2 text-sm w-full" rows={3} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={handleCreate}>Create Release</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Release Versions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {releases.map((r) => {
              const cfg = RELEASE_STATUSES.find((s) => s.value === r.status)
              return (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-sm">{r.version}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color}`}>{cfg?.label || r.status}</span>
                      {r.is_critical && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Critical</span>}
                      {r.is_security_release && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Security</span>}
                    </div>
                    {r.release_name && <p className="text-xs text-gray-500 mt-1">{r.release_name}</p>}
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      {r.branch && <span><GitCommit className="h-3 w-3 inline mr-1" />{r.branch}</span>}
                      {r.commit_sha && <span className="font-mono">{r.commit_sha.substring(0, 8)}</span>}
                      {r.released_at && <span>Released: {new Date(r.released_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {r.status === "draft" && <Button variant="outline" size="sm" onClick={async () => { await upsertRelease({ id: r.id, status: "prerelease" }); load() }}>Pre-release</Button>}
                    {r.status === "prerelease" && <Button variant="outline" size="sm" onClick={async () => { await upsertRelease({ id: r.id, status: "released", released_at: new Date().toISOString() }); load() }}>Release</Button>}
                  </div>
                </div>
              )
            })}
            {releases.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No releases yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
