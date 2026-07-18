"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getFeatureFlags, toggleFeatureFlag, updateFeatureFlag } from "@/lib/actions/security"
import type { FeatureFlag } from "@/types/security"
import { Loader2, Flag, Plus, ToggleLeft, ToggleRight, Beaker, Save, X } from "lucide-react"

export default function FeatureFlagsPage() {
  const orgId = useParams().orgId as string
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ flag_key: "", flag_name: "", description: "", is_beta: false })

  const load = useCallback(async () => {
    const res = await getFeatureFlags(orgId)
    setFlags(res.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleToggle = async (id: string, current: boolean) => {
    await toggleFeatureFlag(id, !current); toast.success("Toggled"); load()
  }

  const handleCreate = async () => {
    if (!form.flag_key || !form.flag_name) { toast.error("Key and name required"); return }
    await updateFeatureFlag({ organization_id: orgId, flag_key: form.flag_key, flag_name: form.flag_name, description: form.description, is_beta: form.is_beta, is_enabled: false })
    toast.success("Created"); setShowCreate(false); setForm({ flag_key: "", flag_name: "", description: "", is_beta: false }); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const enabledCount = flags.filter(f => f.is_enabled).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-1">{enabledCount}/{flags.length} enabled</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-1" /> New Flag</Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input value={form.flag_key} onChange={e => setForm(f => ({ ...f, flag_key: e.target.value }))} placeholder="Flag key (e.g. module_new_feature)" />
            <Input value={form.flag_name} onChange={e => setForm(f => ({ ...f, flag_name: e.target.value }))} placeholder="Display name" />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_beta} onChange={e => setForm(f => ({ ...f, is_beta: e.target.checked }))} />
              <Beaker className="h-3.5 w-3.5" /> Beta feature
            </label>
            <div className="flex gap-2">
              <Button onClick={handleCreate}><Save className="h-4 w-4 mr-1" /> Create</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flags.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3"><CardContent className="py-12 text-center text-gray-400">
            <Flag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No feature flags configured</p>
          </CardContent></Card>
        ) : flags.map(f => (
          <Card key={f.id} className={`${f.is_enabled ? "ring-1 ring-indigo-300" : ""}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{f.flag_name}</p>
                    {f.is_beta && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-1"><Beaker className="h-3 w-3" /> Beta</span>}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{f.flag_key}</p>
                  {f.description && <p className="text-xs text-gray-400 mt-1">{f.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.is_enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{f.is_enabled ? "Enabled" : "Disabled"}</span>
                    {f.percentage !== null && f.percentage !== undefined && <span className="text-xs text-gray-400">{f.percentage}% rollout</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleToggle(f.id, f.is_enabled)}>
                  {f.is_enabled ? <ToggleRight className="h-5 w-5 text-indigo-500" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
