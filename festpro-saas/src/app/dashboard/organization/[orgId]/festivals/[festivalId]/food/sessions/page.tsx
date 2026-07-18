"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMealSessions, createMealSession, updateMealSessionStatus, deleteMealSession, getKitchens } from "@/lib/actions/food-catering"
import { MEAL_SESSION_STATUSES, MEAL_TYPES } from "@/config/food-catering"
import { Loader2, Clock, Plus, Search, Trash2, CalendarDays } from "lucide-react"

export default function SessionsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [sessions, setSessions] = useState<any[]>([])
  const [kitchens, setKitchens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kitchen_id: "", session_name: "", meal_type: "breakfast", session_date: "", start_time: "", end_time: "", total_portions: "0" })

  const load = useCallback(async () => {
    setLoading(true)
    const [s, k] = await Promise.all([getMealSessions(festivalId, dateFilter || undefined), getKitchens(festivalId)])
    setSessions(s.data || []); setKitchens(k.data || []); setLoading(false)
  }, [festivalId, dateFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.session_name || !form.session_date) return
    await createMealSession({ ...form, festival_id: festivalId, total_portions: Number(form.total_portions) })
    setForm({ kitchen_id: "", session_name: "", meal_type: "breakfast", session_date: "", start_time: "", end_time: "", total_portions: "0" })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => { await updateMealSessionStatus(id, status); load() }
  const handleDelete = async (id: string) => { await deleteMealSession(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Meal Sessions</h1><p className="text-sm text-gray-500 mt-1">Schedule and manage meal service sessions.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Session"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Schedule Session</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Session Name *</label><Input value={form.session_name} onChange={e => setForm({...form, session_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Kitchen</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.kitchen_id} onChange={e => setForm({...form, kitchen_id: e.target.value})}>
              <option value="">Select...</option>{kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.kitchen_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Meal Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.meal_type} onChange={e => setForm({...form, meal_type: e.target.value})}>
              {MEAL_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Date *</label><Input type="date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Start Time</label><Input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">End Time</label><Input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Total Portions</label><Input type="number" value={form.total_portions} onChange={e => setForm({...form, total_portions: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}><CalendarDays className="h-4 w-4 mr-1" /> Schedule</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Input type="date" className="max-w-[200px]" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Session</th><th className="px-4 py-3">Meal Type</th><th className="px-4 py-3">Kitchen</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Portions</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {sessions.filter(s => !search || s.session_name.toLowerCase().includes(search.toLowerCase())).map((s: any) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium">{s.session_name}</td>
            <td className="px-4 py-3 text-sm">{MEAL_TYPES.find(m => m.value === s.meal_type)?.label || s.meal_type}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{s.kitchens?.kitchen_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{s.session_date ? new Date(s.session_date).toLocaleDateString() : "—"}</td>
            <td className="px-4 py-3 text-sm">{s.start_time ? s.start_time.substring(0, 5) : "—"} - {s.end_time ? s.end_time.substring(0, 5) : "—"}</td>
            <td className="px-4 py-3 text-sm">{s.served_portions}/{s.total_portions}</td>
            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MEAL_SESSION_STATUSES.find(x => x.value === s.status)?.color || "bg-gray-100 text-gray-600"}`}>{MEAL_SESSION_STATUSES.find(x => x.value === s.status)?.label || s.status}</span></td>
            <td className="px-4 py-3 text-right">
              {s.status === "planned" && <Button size="sm" variant="outline" className="mr-1" onClick={() => handleStatus(s.id, "preparing")}>Prepare</Button>}
              {s.status === "preparing" && <Button size="sm" variant="outline" className="mr-1" onClick={() => handleStatus(s.id, "ready")}>Ready</Button>}
              {s.status === "ready" && <Button size="sm" variant="outline" className="mr-1" onClick={() => handleStatus(s.id, "serving")}>Serve</Button>}
              {s.status === "serving" && <Button size="sm" variant="outline" className="mr-1" onClick={() => handleStatus(s.id, "completed")}>Done</Button>}
              <Button size="sm" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
