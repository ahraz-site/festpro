"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getApiTokens, createApiToken, revokeApiToken } from "@/lib/actions/security"
import { TOKEN_PERMISSIONS } from "@/config/security"
import type { ApiToken } from "@/types/security"
import { Loader2, Key, Plus, Copy, XCircle, Eye, EyeOff, Clock, CheckCircle } from "lucide-react"

export default function ApiTokensPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [form, setForm] = useState({ token_name: "", permissions: "read", rate_limit: "1000" })

  const load = useCallback(async () => {
    const res = await getApiTokens(orgId)
    setTokens(res.data || []); setLoading(false)
  }, [orgId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.token_name) { toast.error("Name required"); return }
    const res = await createApiToken({ organization_id: orgId, token_name: form.token_name, permissions: form.permissions, rate_limit: parseInt(form.rate_limit) })
    if (res.error) toast.error(res.error)
    else {
      setNewToken(res.token || null)
      toast.success("Token created - copy it now, it won't be shown again")
      load()
    }
  }

  const handleRevoke = async (id: string) => {
    await revokeApiToken(id); toast.success("Token revoked"); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const activeTokens = tokens.filter(t => !t.is_revoked)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Tokens</h1>
          <p className="text-sm text-gray-500 mt-1">{activeTokens.length} active tokens</p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setNewToken(null) }}>
          <Plus className="h-4 w-4 mr-1" /> New Token
        </Button>
      </div>

      {newToken && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="pt-4">
            <p className="font-semibold text-green-800">Token Generated</p>
            <p className="text-xs text-green-700 mb-2">Copy this token now. You will not be able to see it again.</p>
            <div className="flex gap-2">
              <code className="flex-1 p-2 rounded bg-white border border-green-200 text-sm font-mono break-all">{newToken}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(newToken); toast.success("Copied") }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreate && !newToken && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input value={form.token_name} onChange={e => setForm(f => ({ ...f, token_name: e.target.value }))} placeholder="Token name" />
            <div className="grid grid-cols-2 gap-3">
              <Select options={TOKEN_PERMISSIONS.map(p => ({ value: p.value, label: p.label }))} value={form.permissions} onChange={e => setForm(f => ({ ...f, permissions: e.target.value }))} />
              <Input type="number" value={form.rate_limit} onChange={e => setForm(f => ({ ...f, rate_limit: e.target.value }))} placeholder="Rate limit (requests/hour)" />
            </div>
            <Button onClick={handleCreate}>Generate Token</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {tokens.length === 0 ? (
          <Card className="sm:col-span-2"><CardContent className="py-12 text-center text-gray-400">
            <Key className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No API tokens</p>
          </CardContent></Card>
        ) : tokens.map(t => (
          <Card key={t.id} className={t.is_revoked ? "opacity-60" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Key className={`h-4 w-4 ${t.is_revoked ? "text-red-400" : "text-indigo-500"}`} />
                    <p className="font-semibold">{t.token_name}</p>
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-1">{t.token_prefix}...</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{t.permissions}</span>
                    <span>{t.rate_limit}/hr</span>
                    {t.last_used_at ? <span>Last used: {new Date(t.last_used_at).toLocaleString()}</span> : <span>Never used</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {t.is_revoked ? (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="h-3 w-3" /> Revoked</span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                    )}
                    {t.expires_at && new Date(t.expires_at) < new Date() && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Expired</span>
                    )}
                  </div>
                </div>
                {!t.is_revoked && (
                  <Button size="sm" variant="ghost" onClick={() => handleRevoke(t.id)}>
                    <XCircle className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
