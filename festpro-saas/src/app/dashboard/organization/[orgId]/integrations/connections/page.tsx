"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getIntegrationConnections, getIntegrationProviders, createIntegrationConnection, testIntegrationConnection } from "@/lib/actions/integration-hub"
import { INTEGRATION_PROVIDERS } from "@/config/integration-hub"
import { Loader2, Link, Plus, CheckCircle, XCircle, Zap } from "lucide-react"

export default function ConnectionsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [connections, setConnections] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [form, setForm] = useState({ provider_id: "", connection_name: "", credentials: "{}" })

  const load = useCallback(async () => {
    setLoading(true)
    const [c, p] = await Promise.all([getIntegrationConnections(orgId), getIntegrationProviders()])
    setConnections(c.data || []); setProviders(p.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleConnect = async () => {
    if (!form.provider_id || !form.connection_name) return
    let creds: any = {}
    try { creds = JSON.parse(form.credentials) } catch {}
    await createIntegrationConnection({ provider_id: form.provider_id, connection_name: form.connection_name, credentials: creds })
    setForm({ provider_id: "", connection_name: "", credentials: "{}" })
    setShowConnect(false); load()
  }

  const handleTest = async (id: string) => {
    await testIntegrationConnection(id); load()
  }

  const categories = [...new Set(INTEGRATION_PROVIDERS.map(p => p.category))]
  const filteredProviders = providers.filter(p => !selectedCategory || p.category === selectedCategory)

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Integrations</h1><p className="text-sm text-gray-500">{connections.length} connections</p></div>
        <Button onClick={() => setShowConnect(!showConnect)} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Connection</Button>
      </div>

      {showConnect && (
        <Card>
          <CardHeader><CardTitle>New Integration Connection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)} className={`px-3 py-1.5 text-xs font-medium rounded-full ${selectedCategory === cat ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{cat}</button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Provider</label>
              <select className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.provider_id} onChange={e => { const p = providers.find(x => x.id === e.target.value); setForm({ ...form, provider_id: e.target.value, connection_name: p?.provider_name || "" }) }}>
                <option value="">Select provider...</option>
                {filteredProviders.map(p => <option key={p.id} value={p.id}>{p.provider_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Connection Name</label>
              <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={form.connection_name} onChange={e => setForm({ ...form, connection_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Credentials (JSON)</label>
              <textarea className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono h-24" value={form.credentials} onChange={e => setForm({ ...form, credentials: e.target.value })} placeholder='{"api_key": "..."}' />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConnect}>Connect</Button>
              <Button variant="outline" onClick={() => setShowConnect(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn: any) => (
          <Card key={conn.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{conn.integration_providers?.provider_name?.[0] || "?"}</div>
                <div>
                  <CardTitle className="text-sm">{conn.connection_name}</CardTitle>
                  <p className="text-xs text-gray-500">{conn.integration_providers?.provider_name}</p>
                </div>
              </div>
              {conn.status === "active" ? <CheckCircle className="h-5 w-5 text-green-500" /> : conn.status === "error" ? <XCircle className="h-5 w-5 text-red-500" /> : <Link className="h-5 w-5 text-gray-400" />}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{conn.status}</span>
                <Button variant="ghost" size="sm" onClick={() => handleTest(conn.id)}><Zap className="h-3 w-3 mr-1" /> Test</Button>
              </div>
              {conn.last_test_at && <p className="text-xs text-gray-400 mt-1">Last test: {new Date(conn.last_test_at).toLocaleString()} {conn.last_test_result ? "(OK)" : "(Failed)"}</p>}
              {conn.error_message && <p className="text-xs text-red-500 mt-1">{conn.error_message}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
