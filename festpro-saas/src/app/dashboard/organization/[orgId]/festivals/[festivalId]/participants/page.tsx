"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getParticipants, softDeleteParticipant, restoreParticipant } from "@/lib/actions/participant"
import { getInstitutions } from "@/lib/actions/participant"
import { REGISTRATION_STATUSES, GENDER_OPTIONS, UNITS, DIVISIONS, SECTORS } from "@/config/participant"
import type { Participant, Institution } from "@/types/participant"
import { Users, Plus, Search, Filter, Trash2, Undo2, Eye, Edit, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function ParticipantsListPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [participants, setParticipants] = useState<Participant[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [unitFilter, setUnitFilter] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("")
  const [sectorFilter, setSectorFilter] = useState("")
  const [genderFilter, setGenderFilter] = useState("")
  const [instFilter, setInstFilter] = useState("")
  const [showDeleted, setShowDeleted] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await getParticipants(festivalId, {
      search, unit: unitFilter, division: divisionFilter,
      sector: sectorFilter, gender: genderFilter, institution_id: instFilter,
      deleted: showDeleted ? "true" : "false", page, limit,
    })
    setParticipants(data as Participant[])
    setTotalCount(count || 0)
    setLoading(false)
  }, [festivalId, search, unitFilter, divisionFilter, sectorFilter, genderFilter, instFilter, showDeleted, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    getInstitutions(orgId).then(({ data }) => setInstitutions(data as Institution[]))
  }, [orgId])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this participant?")) return
    const res = await softDeleteParticipant(id)
    if (res.error) toast.error(res.error); else { toast.success("Deleted"); load() }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreParticipant(id)
    if (res.error) toast.error(res.error); else { toast.success("Restored"); load() }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all participants in this festival.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/import`}>
            <Button variant="outline" size="sm">Import</Button>
          </Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/create`}>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Participant</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search name, ID, chest..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
            </div>
            <Select options={UNITS.map(u => ({ value: u, label: u }))} placeholder="All Units" value={unitFilter} onChange={e => { setUnitFilter(e.target.value); setPage(1) }} />
            <Select options={DIVISIONS.map(d => ({ value: d, label: d }))} placeholder="All Divisions" value={divisionFilter} onChange={e => { setDivisionFilter(e.target.value); setPage(1) }} />
            <Select options={SECTORS.map(s => ({ value: s, label: s }))} placeholder="All Sectors" value={sectorFilter} onChange={e => { setSectorFilter(e.target.value); setPage(1) }} />
            <Select options={GENDER_OPTIONS.map(g => ({ value: g.value, label: g.label }))} placeholder="All Genders" value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(1) }} />
            <Select options={institutions.map(i => ({ value: i.id, label: i.name }))} placeholder="All Institutions" value={instFilter} onChange={e => { setInstFilter(e.target.value); setPage(1) }} />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={showDeleted} onChange={e => { setShowDeleted(e.target.checked); setPage(1) }} className="rounded" />
              Show deleted
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: totalCount, icon: Users, color: "text-indigo-600 bg-indigo-100" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Participant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ID / Chest</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Division</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Institution</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></td></tr>
                ) : participants.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No participants found</td></tr>
                ) : participants.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${p.deleted_at ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${p.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                        {p.first_name} {p.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <div>{p.participant_id}</div>
                      <div className="text-gray-400">{p.chest_number || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.unit || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{p.division || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{p.gender}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.institution_name || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${p.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        </Link>
                        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${p.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        {p.deleted_at ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleRestore(p.id)}><Undo2 className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalCount} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
