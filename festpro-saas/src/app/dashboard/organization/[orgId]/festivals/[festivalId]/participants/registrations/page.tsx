"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getRegistrations, bulkApproveRegistrations, bulkRejectRegistrations, updateRegistrationStatus } from "@/lib/actions/participant/registrations"
import { getCompetitions } from "@/lib/actions/competition"
import { REGISTRATION_STATUSES } from "@/config/participant"
import type { Registration } from "@/types/participant"
import type { Competition } from "@/types/competition"
import { CheckCircle, XCircle, Loader2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function RegistrationsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [compFilter, setCompFilter] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const [rRes, cRes] = await Promise.all([
      getRegistrations(festivalId, { status: statusFilter, competition_id: compFilter, page, limit }),
      getCompetitions(festivalId),
    ])
    setRegistrations(rRes.data as Registration[])
    setTotalCount(rRes.count || 0)
    setCompetitions(cRes as Competition[])
    setLoading(false)
  }, [festivalId, statusFilter, compFilter, page])

  useEffect(() => { load() }, [load])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkApprove = async () => {
    if (selected.length === 0) { toast.error("No items selected"); return }
    const res = await bulkApproveRegistrations(selected)
    if (res.error) toast.error(res.error); else { toast.success(`${selected.length} approved`); setSelected([]); load() }
  }

  const handleBulkReject = async () => {
    if (selected.length === 0) { toast.error("No items selected"); return }
    const res = await bulkRejectRegistrations(selected)
    if (res.error) toast.error(res.error); else { toast.success(`${selected.length} rejected`); setSelected([]); load() }
  }

  const handleSingleAction = async (id: string, status: "approved" | "rejected") => {
    const res = await updateRegistrationStatus(id, status)
    if (res.error) toast.error(res.error); else { toast.success(status); load() }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage participant registrations for competitions.</p>
        </div>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" className="text-green-600" variant="outline" onClick={handleBulkApprove}>
              <CheckCircle className="h-4 w-4 mr-1" />Approve ({selected.length})
            </Button>
            <Button size="sm" className="text-red-600" variant="outline" onClick={handleBulkReject}>
              <XCircle className="h-4 w-4 mr-1" />Reject ({selected.length})
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Select options={REGISTRATION_STATUSES.map(s => ({ value: s.value, label: s.label }))} placeholder="All Statuses" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} />
            <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="All Competitions" value={compFilter} onChange={e => { setCompFilter(e.target.value); setPage(1) }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-2 py-3"><input type="checkbox" className="rounded" /></th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Participant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Competition</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Chest No.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No registrations found</td></tr>
                ) : registrations.map((r: any) => {
                  const sc = REGISTRATION_STATUSES.find(s => s.value === r.status)
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3">
                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${r.participant?.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {r.participant?.first_name} {r.participant?.last_name}
                        </Link>
                        <div className="text-xs text-gray-400">{r.participant?.participant_id}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.competition?.name || "Unknown"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.chest_number || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc?.color || ""}`}>{sc?.label || r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        {r.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="text-green-600 h-7 text-xs" onClick={() => handleSingleAction(r.id, "approved")}>Approve</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 h-7 text-xs" onClick={() => handleSingleAction(r.id, "rejected")}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalCount} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
