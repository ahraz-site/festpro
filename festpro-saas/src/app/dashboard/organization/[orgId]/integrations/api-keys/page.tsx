"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getApiKeys, createApiKey, revokeApiKey, rotateApiKey } from "@/lib/actions/integration-hub"
import { API_KEY_STATUSES, API_KEY_PERMISSIONS } from "@/config/integration-hub"
import { Loader2, Key, Plus, RotateCw, XCircle, Copy, Check } from "lucide-react"

export default function ApiKeysPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newKey, setNewKey] = useState<{ raw_key: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ key_name: "", permissions: ["read"] as string[], rate_limit_per_hour: 1000, expires_at: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await getApiKeys(orgId)
    setKeys(r.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.key_name) return
    const r = await createApiKey({ ...form, permissions: form.permissions as any, rate_limit_per_hour: form.rate_limit_per_hour, expires_at: form.expires_at || undefined })
    if (r.raw_key) { setNewKey({ raw_key: r.raw_key }); setShowCreate(false); load() }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return
    await revokeApiKey(id); load()
  }

  const handleRotate = async (id: string) => {
    const r = await rotateApiKey(id)
    if (r.raw_key) setNewKey({ raw_key: r.raw_key })
  }

  const togglePermission = (p: string) => {
    setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p] }))
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">API Keys</h1><p className="text-sm text-gray-500">{keys.length} keys</p></div>
        <Button onClick={() => { setShowCreate(!showCreate); setNewKey(null) }} size="sm"><Plus className="h-4 w-4 mr-1" /> Create Key</Button>
      </div>

      {newKey && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">API Key Created - Copy it now. You won&apos;t see it again!</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-white border border-amber-200 rounded text-sm font-mono">{newKey.raw_key}</code>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(newKey.raw_key); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setNewKey(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>New API Key</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Key Name</label>
              <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.key_name} onChange={e => setForm({ ...form, key_name: e.target.value })} placeholder="e.g. Production API Key" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Permissions</label>
              <div className="mt-1 flex gap-2 flex-wrap">
                {API_KEY_PERMISSIONS.map(p => (
                  <button key={p.value} onClick={() => togglePermission(p.value)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${form.permissions.includes(p.value) ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Rate Limit (req/hr)</label>
                <input type="number" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.rate_limit_per_hour} onChange={e => setForm({ ...form, rate_limit_per_hour: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Expires At (optional)</label>
                <input type="date" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Generate Key</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Prefix</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Permissions</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Last Used</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((k: any) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{k.key_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{k.key_prefix}...{k.key_last_five}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">{k.permissions?.map((p: string) => <span key={p} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${API_KEY_STATUSES.find(s => s.value === k.status)?.color || ""}`}>{k.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}</td>
                  <td className="px-4 py-3 text-right">
                    {k.status === "active" && <><button onClick={() => handleRotate(k.id)} className="text-gray-400 hover:text-amber-600 mr-2" title="Rotate"><RotateCw className="h-4 w-4 inline" /></button><button onClick={() => handleRevoke(k.id)} className="text-gray-400 hover:text-red-600" title="Revoke"><XCircle className="h-4 w-4 inline" /></button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
