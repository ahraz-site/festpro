"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getCompetitions, getCompetitionStats } from "@/lib/actions/competition"
import { getCategories } from "@/lib/actions/competition/categories"
import { COMPETITION_STATUSES } from "@/config/competition"
import type { Competition, CompetitionCategory } from "@/types/competition"
import { Trophy, Plus, Search, Filter, Users, Layers, Loader2 } from "lucide-react"

export default function CompetitionsListPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    async function load() {
      const [comps, cats, st] = await Promise.all([
        getCompetitions(festivalId),
        getCategories(festivalId),
        getCompetitionStats(festivalId),
      ])
      setCompetitions(comps as Competition[])
      setCategories(cats as CompetitionCategory[])
      setStats(st)
      setLoading(false)
    }
    load()
  }, [festivalId])

  const filtered = competitions.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.code?.toLowerCase().includes(search.toLowerCase()))) return false
    if (categoryFilter && c.category_id !== categoryFilter) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  if (loading) return <div className="text-center py-12 text-gray-500"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage competition categories and entries.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/categories`}>
            <Button variant="outline">
              <Layers className="h-4 w-4 mr-2" />
              Categories
            </Button>
          </Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Competition
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Layers className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stats.categories}</p>
              <p className="text-xs text-gray-500">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stats.byStatus?.registration_open || 0}</p>
              <p className="text-xs text-gray-500">Open Registration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Loader2 className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stats.byStatus?.running || 0}</p>
              <p className="text-xs text-gray-500">Running</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} className="w-full sm:w-44" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All Status" }, ...COMPETITION_STATUSES.map((s) => ({ value: s.value, label: s.label }))]} className="w-full sm:w-40" />
      </div>

      {/* Competition List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No competitions yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first competition.</p>
            <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/create`}>
              <Button><Plus className="h-4 w-4 mr-2" />Create Competition</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((comp) => {
            const statusInfo = COMPETITION_STATUSES.find((s) => s.value === comp.status)
            const cat = categories.find((c) => c.id === comp.category_id)
            return (
              <Card key={comp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}`)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold" style={{ backgroundColor: cat?.color || "#4F46E5" }}>
                      {comp.name[0]}
                    </div>
                    {statusInfo && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{comp.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    {cat && <span style={{ color: cat.color }}>{cat.name}</span>}
                    {comp.code && <span>#{comp.code}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="capitalize">{comp.competition_type}</span>
                    <span>{comp.duration_minutes}min</span>
                    <span>{comp.judge_count} judge{(comp.judge_count || 0) > 1 ? "s" : ""}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
