"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  KeyRound, Plus, Copy, Trash2, ShieldCheck, Check,
  AlertCircle, ExternalLink, X, Eye, EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ApiKeyItem {
  id: string
  name: string
  key: string
  created_at: string
  last_used?: string
}

export default function FestivalApiKeysPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // State (Screenshot 1)
  const [apiAccessEnabled, setApiAccessEnabled] = useState(false)
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return

    const randomKey = `fp_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
    const newKey: ApiKeyItem = {
      id: Date.now().toString(),
      name: newKeyName,
      key: randomKey,
      created_at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }

    setKeys([...keys, newKey])
    setGeneratedKey(randomKey)
    setNewKeyName("")
    setApiAccessEnabled(true)
    toast.success("API key generated successfully!")
  }

  const handleCopy = (k: string) => {
    navigator.clipboard.writeText(k)
    setCopiedKey(true)
    toast.success("Copied API key to clipboard!")
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleRevoke = (id: string) => {
    setKeys(keys.filter(k => k.id !== id))
    toast.info("API key revoked.")
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      {/* ── HEADER (Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            API keys
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Give another service read access to this fest&apos;s published results and posters.
          </p>
        </div>

        <Button
          onClick={() => setShowNewKeyModal(true)}
          className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New key
        </Button>
      </div>

      {/* ── WARNING CALLOUT: API ACCESS STATUS (Screenshot 1) ── */}
      {!apiAccessEnabled && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <KeyRound className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-700">
            <span className="font-bold text-slate-900 block">API access is off</span>
            <p className="mt-0.5 text-slate-600">
              Turn on API access in{" "}
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/settings`}
                className="text-indigo-600 font-bold hover:underline"
              >
                fest settings
              </Link>{" "}
              before creating a key. Keys let another service read only this fest&apos;s published results and posters.
            </p>
          </div>
        </div>
      )}

      {/* ── MAIN CARD: NO API KEYS OR KEYS LIST (Screenshot 1) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        {keys.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Active API Keys</h2>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {keys.map((k) => (
                <div key={k.id} className="p-4 flex items-center justify-between text-xs bg-white hover:bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{k.name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {k.key.substring(0, 12)}••••••••••••••••
                    </span>
                    <span className="text-[10px] text-slate-400 block">Created: {k.created_at}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(k.key)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1"
                      title="Copy key"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 text-xs"
                      title="Revoke key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No API keys</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Create a key to let another service read published results and posters.
              </p>
            </div>
            <Button
              onClick={() => setShowNewKeyModal(true)}
              className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9 mt-1"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New key
            </Button>
          </div>
        )}
      </div>

      {/* ── CREATE NEW KEY MODAL ── */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Create API Key</h2>
              <button onClick={() => { setShowNewKeyModal(false); setGeneratedKey(null) }} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatedKey ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-emerald-900 space-y-1">
                  <span className="font-bold block">Key generated successfully!</span>
                  <p className="text-[11px] text-indigo-800">
                    Copy this key now. For security, you will not be able to view it again.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={generatedKey}
                    className="font-mono text-xs font-bold bg-slate-50 border-slate-200"
                  />
                  <Button
                    type="button"
                    onClick={() => handleCopy(generatedKey)}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={() => { setShowNewKeyModal(false); setGeneratedKey(null) }}
                  className="w-full rounded-xl text-xs font-bold bg-slate-900 text-white h-9 mt-2"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5">
                  <label className="block text-slate-600">Key Name</label>
                  <Input
                    required
                    placeholder="e.g. Website Live Widget, TV Sync"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800 block">Permissions:</span>
                  <p>• Read published results & scores</p>
                  <p>• Read generated result posters</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewKeyModal(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                    Generate Key
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
