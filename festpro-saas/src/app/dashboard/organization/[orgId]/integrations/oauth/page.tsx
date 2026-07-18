"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getOAuthClients, createOAuthClient } from "@/lib/actions/integration-hub"
import { Loader2, Shield, Plus, Copy, Check } from "lucide-react"

export default function OAuthPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newClient, setNewClient] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ client_name: "", client_description: "", redirect_uris: "", is_confidential: true })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await getOAuthClients(orgId)
    setClients(r.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.client_name) return
    const r = await createOAuthClient({
      client_name: form.client_name,
      client_description: form.client_description || undefined,
      redirect_uris: form.redirect_uris ? form.redirect_uris.split("\n").filter(Boolean).map(s => s.trim()) : [],
      is_confidential: form.is_confidential,
    })
    if (r.data) setNewClient(r.data)
    setShowCreate(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">OAuth Applications</h1><p className="text-sm text-gray-500">{clients.length} clients</p></div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm"><Plus className="h-4 w-4 mr-1" /> Register App</Button>
      </div>

      {newClient && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">Client Created - Save these credentials!</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                <span className="text-gray-500">Client ID:</span>
                <code className="font-mono text-xs">{newClient.client_id}</code>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(newClient.client_id); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                <span className="text-gray-500">Client Secret:</span>
                <code className="font-mono text-xs">{newClient.client_secret}</code>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(newClient.client_secret); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setNewClient(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Register OAuth Application</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Application Name</label>
              <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="e.g. My Integration App" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.client_description} onChange={e => setForm({ ...form, client_description: e.target.value })} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Redirect URIs (one per line)</label>
              <textarea className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" value={form.redirect_uris} onChange={e => setForm({ ...form, redirect_uris: e.target.value })} placeholder="https://myapp.com/oauth/callback" rows={3} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_confidential} onChange={e => setForm({ ...form, is_confidential: e.target.checked })} />
              Confidential Client (requires client secret)
            </label>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Register</Button>
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
                <th className="text-left px-4 py-3 font-medium text-gray-500">Client ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Grants</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Active</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.client_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.client_id}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.is_confidential ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{c.is_confidential ? "Confidential" : "Public"}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.allowed_grant_types?.join(", ")}</td>
                  <td className="px-4 py-3">{c.is_active ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-red-600">No</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
