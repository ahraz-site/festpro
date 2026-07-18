"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getVisitors, createVisitor, blacklistVisitor, deleteVisitor } from "@/lib/actions/help-desk"
import { VISITOR_CATEGORIES } from "@/config/help-desk"
import { Loader2, Plus, Trash2, Crown, Search, Ban } from "lucide-react"

export default function VisitorsPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name: "", last_name: "", visitor_category: "general", email: "", phone: "", company_name: "", designation: "", purpose_of_visit: "", host_name: "", host_department: "", is_vip: false })

  const load = useCallback(async () => {
    const res = await getVisitors(festivalId, filter || undefined, search || undefined)
    if (res.data) setVisitors(res.data); setLoading(false)
  }, [festivalId, filter, search])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name) return
    setLoading(true)
    await createVisitor({ ...form, festival_id: festivalId })
    setForm({ first_name: "", last_name: "", visitor_category: "general", email: "", phone: "", company_name: "", designation: "", purpose_of_visit: "", host_name: "", host_department: "", is_vip: false })
    setShowForm(false); load()
  }

  const vc = (cat: string) => VISITOR_CATEGORIES.find(x => x.value === cat)

  if (loading && visitors.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Register Visitor</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Register Visitor</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><Label>Category</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.visitor_category} onChange={e => setForm({ ...form, visitor_category: e.target.value })}>{VISITOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} /></div>
              <div><Label>Designation</Label><Input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
              <div><Label>Host Name</Label><Input value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} /></div>
              <div><Label>Host Department</Label><Input value={form.host_department} onChange={e => setForm({ ...form, host_department: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Purpose of Visit</Label><Input value={form.purpose_of_visit} onChange={e => setForm({ ...form, purpose_of_visit: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={form.is_vip} onChange={e => setForm({ ...form, is_vip: e.target.checked })} /><span className="text-sm font-medium">VIP Visitor</span></div>
            </div>
            <Button onClick={handleCreate}>Register</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search visitors..." className="pl-10" value={search} onChange={e => { setSearch(e.target.value); setLoading(true) }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => { setFilter(""); setLoading(true) }}>All</Button>
          {VISITOR_CATEGORIES.slice(0, 6).map(c => (
            <Button key={c.value} variant={filter === c.value ? "default" : "outline"} size="sm" onClick={() => { setFilter(c.value); setLoading(true) }}>{c.label}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visitors.map((v: any) => {
          const cat = vc(v.visitor_category)
          return (
            <Card key={v.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/help-desk/visitors/${v.id}`)}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat?.color || ""}`}>{cat?.label || v.visitor_category}</span>
                    {v.is_vip && <Crown className="h-4 w-4 text-amber-500" />}
                    {v.is_blacklisted && <Ban className="h-4 w-4 text-red-500" />}
                  </div>
                  <Button size="sm" variant="ghost" onClick={async (e) => { e.stopPropagation(); if (confirm("Delete visitor?")) { await deleteVisitor(v.id); load() } }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
                <p className="text-sm font-semibold mt-2">{v.first_name} {v.last_name}</p>
                {v.email && <p className="text-xs text-gray-500">{v.email}</p>}
                {v.phone && <p className="text-xs text-gray-500">{v.phone}</p>}
                {v.company_name && <p className="text-xs text-gray-400">{v.company_name}</p>}
                {v.purpose_of_visit && <p className="text-xs text-gray-400 mt-1">Purpose: {v.purpose_of_visit}</p>}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>Visits: {v.total_visits}</span>
                  {v.host_name && <span>Host: {v.host_name}</span>}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {visitors.length === 0 && <p className="text-center text-gray-400 py-8 col-span-4">No visitors registered</p>}
      </div>
    </div>
  )
}
