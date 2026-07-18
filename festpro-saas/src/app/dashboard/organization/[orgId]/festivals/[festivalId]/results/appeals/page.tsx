"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getAppeals, updateAppealStatus, assignAppeal } from "@/lib/actions/appeal"
import { getOrganizationMembers } from "@/lib/actions/organization"
import { APPEAL_STATUSES, APPEAL_TYPES } from "@/config/result"
import type { Appeal } from "@/types/result"
import type { OrganizationMember } from "@/types"
import { Loader2, Plus, Eye, CheckCircle, XCircle, UserCheck, Clock, AlertTriangle } from "lucide-react"

export default function AppealsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const orgId = params.orgId as string
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const load = useCallback(async () => {
    const [aRes, mRes] = await Promise.all([getAppeals(festivalId, statusFilter || undefined), getOrganizationMembers(orgId)])
    setAppeals(aRes.data || []); setMembers(mRes || []); setLoading(false)
  }, [festivalId, orgId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleStatus = async (id: string, status: string) => {
    const res = await updateAppealStatus(id, status as any)
    if (res.error) toast.error(res.error); else { toast.success(`Appeal ${status}`); load() }
  }

  const handleAssign = async (id: string, assigneeId: string) => {
    const res = await assignAppeal(id, assigneeId)
    if (res.error) toast.error(res.error); else { toast.success("Assigned"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appeals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage participant appeals, score disputes, and result reviews.</p>
        </div>
        <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/results/appeals/create`}>
          <Button><Plus className="h-4 w-4 mr-1" /> New Appeal</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Select
            options={[{ value: "", label: "All Status" }, ...APPEAL_STATUSES.map(s => ({ value: s.value, label: s.label }))]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      {appeals.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No appeals found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {appeals.map(a => (
            <Card key={a.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{a.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${APPEAL_STATUSES.find(s => s.value === a.status)?.color || ""}`}>{a.status}</span>
                      <span className="text-xs text-gray-400 capitalize">{a.appeal_type.replace("_", " ")}</span>
                      {a.priority === "urgent" && <span className="text-xs text-red-500 flex items-center"><AlertTriangle className="h-3 w-3 mr-0.5" />Urgent</span>}
                    </div>
                    <p className="text-sm text-gray-600">{a.description?.slice(0, 200)}{(a.description?.length || 0) > 200 ? "..." : ""}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{a.participant?.first_name} {a.participant?.last_name}</span>
                      <span>{a.competition?.name}</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{new Date(a.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {a.status === "submitted" && (
                      <>
                        <select onChange={e => handleAssign(a.id, e.target.value)} className="text-xs rounded border border-gray-200 px-2 py-1" defaultValue="">
                          <option value="" disabled>Assign to...</option>
                          {members.map(m => <option key={m.id} value={m.user_id}>{m.profile?.first_name} {m.profile?.last_name}</option>)}
                        </select>
                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleStatus(a.id, "approved")}><CheckCircle className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleStatus(a.id, "rejected")}><XCircle className="h-3 w-3" /></Button>
                      </>
                    )}
                    <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/results/appeals/${a.id}`}>
                      <Button size="sm" variant="ghost"><Eye className="h-3 w-3" /></Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
