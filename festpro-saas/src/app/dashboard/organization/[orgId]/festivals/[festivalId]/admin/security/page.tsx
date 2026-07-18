"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getSecurityEvents, resolveSecurityEvent, getIpWhitelist, getIpBlacklist, upsertIpWhitelist, deleteIpWhitelist, upsertIpBlacklist, unblockIp } from "@/lib/actions/security"
import { SECURITY_EVENT_TYPES, SEVERITY_COLORS, AUDIT_STATUSES } from "@/config/security"
import { Loader2, AlertTriangle, Shield, ShieldOff, CheckCircle, Ban, Plus, Trash2, Globe, Lock, Unlock } from "lucide-react"

export default function SecurityPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const orgId = params.orgId as string
  const [events, setEvents] = useState<any[]>([])
  const [whitelist, setWhitelist] = useState<any[]>([])
  const [blacklist, setBlacklist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"events" | "ip">("events")
  const [filters, setFilters] = useState({ severity: "", resolved: "" })
  const [newWhitelistIp, setNewWhitelistIp] = useState("")
  const [newBlacklistIp, setNewBlacklistIp] = useState("")

  const load = useCallback(async () => {
    const [eRes, wRes, bRes] = await Promise.all([
      getSecurityEvents(festivalId, { severity: filters.severity || undefined, resolved: filters.resolved === "no" ? false : filters.resolved === "yes" ? true : undefined }),
      getIpWhitelist(orgId), getIpBlacklist(orgId),
    ])
    setEvents(eRes.data || []); setWhitelist(wRes.data || []); setBlacklist(bRes.data || []); setLoading(false)
  }, [festivalId, orgId, filters])

  useEffect(() => { load() }, [load])

  const handleResolve = async (id: string) => {
    await resolveSecurityEvent(id); toast.success("Resolved"); load()
  }

  const handleAddWhitelist = async () => {
    if (!newWhitelistIp) return
    await upsertIpWhitelist({ organization_id: orgId, ip_address: newWhitelistIp }); setNewWhitelistIp(""); toast.success("Added"); load()
  }

  const handleAddBlacklist = async () => {
    if (!newBlacklistIp) return
    await upsertIpBlacklist({ organization_id: orgId, ip_address: newBlacklistIp }); setNewBlacklistIp(""); toast.success("Added"); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-sm text-gray-500 mt-1">{events.filter(e => !e.is_resolved).length} unresolved events</p>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "events" ? "default" : "outline"} onClick={() => setTab("events")}><AlertTriangle className="h-4 w-4 mr-1" /> Events</Button>
        <Button variant={tab === "ip" ? "default" : "outline"} onClick={() => setTab("ip")}><Globe className="h-4 w-4 mr-1" /> IP Management</Button>
      </div>

      {tab === "events" && (
        <>
          <Card>
            <CardContent className="pt-4 flex gap-2">
              <Select options={[{ value: "", label: "All Severity" }, ...SECURITY_EVENT_TYPES.map(s => ({ value: s.severity, label: s.severity }))].filter((v, i, a) => a.findIndex(x => x.value === v.value) === i)} value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))} className="w-36" />
              <Select options={[{ value: "", label: "All Status" }, { value: "no", label: "Unresolved" }, { value: "yes", label: "Resolved" }]} value={filters.resolved} onChange={e => setFilters(f => ({ ...f, resolved: e.target.value }))} className="w-36" />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {events.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-400">
                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No security events</p>
              </CardContent></Card>
            ) : events.map(e => (
              <Card key={e.id} className={`${!e.is_resolved ? "border-l-4 border-red-400" : ""}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full mt-0.5 ${!e.is_resolved ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                        {!e.is_resolved ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{e.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${SEVERITY_COLORS[e.severity] || ""}`}>{e.severity}</span>
                          <span className="text-xs text-gray-400">{SECURITY_EVENT_TYPES.find(t => t.value === e.event_type)?.label || e.event_type}</span>
                        </div>
                        {e.description && <p className="text-sm text-gray-600 mt-0.5">{e.description}</p>}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{new Date(e.created_at).toLocaleString()}</span>
                          {e.ip_address && <span>IP: {e.ip_address}</span>}
                        </div>
                      </div>
                    </div>
                    {!e.is_resolved && (
                      <Button size="sm" variant="ghost" onClick={() => handleResolve(e.id)}>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "ip" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">IP Whitelist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newWhitelistIp} onChange={e => setNewWhitelistIp(e.target.value)} placeholder="IP address" />
                <Button size="sm" onClick={handleAddWhitelist}><Plus className="h-4 w-4" /></Button>
              </div>
              {whitelist.length === 0 ? (
                <p className="text-sm text-gray-400">No whitelisted IPs</p>
              ) : whitelist.map(w => (
                <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <Unlock className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-sm font-mono">{w.ip_address}</span>
                    {w.label && <span className="text-xs text-gray-400">({w.label})</span>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={async () => { await deleteIpWhitelist(w.id); load() }}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">IP Blacklist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newBlacklistIp} onChange={e => setNewBlacklistIp(e.target.value)} placeholder="IP address" />
                <Button size="sm" onClick={handleAddBlacklist}><Plus className="h-4 w-4" /></Button>
              </div>
              {blacklist.length === 0 ? (
                <p className="text-sm text-gray-400">No blacklisted IPs</p>
              ) : blacklist.map(b => (
                <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-sm font-mono">{b.ip_address}</span>
                    {b.reason && <span className="text-xs text-gray-400">({b.reason})</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${b.is_active ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{b.is_active ? "Active" : "Inactive"}</span>
                    {b.is_active && (
                      <Button size="sm" variant="ghost" onClick={async () => { await unblockIp(b.id); load() }}>
                        <Ban className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
