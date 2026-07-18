"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getFestivals, archiveFestival, duplicateFestival, deleteFestival } from "@/lib/actions/festival"
import { FESTIVAL_STATUSES, FESTIVAL_STATUS_MAP } from "@/config/festival"
import type { Festival } from "@/types/festival"
import { CalendarDays, Plus, Search, Copy, Archive, Trash2, MoreHorizontal, Loader2 } from "lucide-react"

export default function FestivalsListPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getFestivals(orgId)
      setFestivals(data as Festival[])
      setLoading(false)
    }
    load()
  }, [orgId])

  const filtered = festivals.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && f.status !== statusFilter) return false
    return true
  })

  async function handleArchive(id: string) {
    await archiveFestival(id)
    setFestivals((prev) => prev.map((f) => (f.id === id ? { ...f, status: "archived" as const } : f)))
    setOpenMenu(null)
  }

  async function handleDuplicate(id: string) {
    const result = await duplicateFestival(id)
    if (result.festivalId) {
      const data = await getFestivals(orgId)
      setFestivals(data as Festival[])
    }
    setOpenMenu(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this festival?")) return
    await deleteFestival(id)
    setFestivals((prev) => prev.filter((f) => f.id !== id))
    setOpenMenu(null)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Festivals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your organization's festivals.</p>
        </div>
        <Link href={`/dashboard/organization/${orgId}/festivals/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Festival
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search festivals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All Status" },
            ...FESTIVAL_STATUSES.map((s) => ({ value: s.value, label: s.label })),
          ]}
          className="w-full sm:w-44"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No festivals yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first festival to get started.</p>
            <Link href={`/dashboard/organization/${orgId}/festivals/create`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Festival
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((festival) => {
            const statusInfo = FESTIVAL_STATUSES.find((s) => s.value === festival.status)
            return (
              <Card key={festival.id} className="hover:shadow-md transition-shadow relative group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: "#4F46E5" }}
                    >
                      {festival.name[0]}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === festival.id ? null : festival.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                      {openMenu === festival.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                            <button
                              onClick={() => { router.push(`/dashboard/organization/${orgId}/festivals/${festival.id}`); setOpenMenu(null) }}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <CalendarDays className="h-4 w-4" />
                              View Dashboard
                            </button>
                            <button
                              onClick={() => handleDuplicate(festival.id)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </button>
                            {festival.status !== "archived" && (
                              <button
                                onClick={() => handleArchive(festival.id)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 w-full text-left"
                              >
                                <Archive className="h-4 w-4" />
                                Archive
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(festival.id)}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Link href={`/dashboard/organization/${orgId}/festivals/${festival.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">{festival.name}</h3>
                    {festival.short_name && (
                      <p className="text-xs text-gray-500 mb-2">{festival.short_name}</p>
                    )}
                    {statusInfo && (
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                      {festival.start_date && (
                        <span>{new Date(festival.start_date).toLocaleDateString()}</span>
                      )}
                      {festival.venue_name && (
                        <span className="truncate">{festival.venue_name}</span>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
