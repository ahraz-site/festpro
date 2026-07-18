"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRooms, createRoom, deleteRoom, getAccommodationBuildings, getRoomTypes } from "@/lib/actions/accommodation-transport"
import { ROOM_STATUSES } from "@/config/accommodation-transport"
import { Loader2, DoorOpen, Plus, Search, Pencil, Trash2, Building2 } from "lucide-react"

export default function RoomsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [rooms, setRooms] = useState<any[]>([])
  const [buildings, setBuildings] = useState<any[]>([])
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ room_number: "", room_name: "", building_id: "", room_type_id: "", capacity: "1", total_beds: "1", floor_area: "", is_accessible: false, notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [r, b, rt] = await Promise.all([
      getRooms(festivalId, buildingFilter || undefined, statusFilter || undefined),
      getAccommodationBuildings(festivalId),
      getRoomTypes(),
    ])
    setRooms(r.data || [])
    setBuildings(b.data || [])
    setRoomTypes(rt.data || [])
    setLoading(false)
  }, [festivalId, buildingFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.room_number || !form.building_id) return
    await createRoom({ ...form, festival_id: festivalId, capacity: Number(form.capacity), total_beds: Number(form.total_beds), floor_area: form.floor_area ? Number(form.floor_area) : null })
    setForm({ room_number: "", room_name: "", building_id: "", room_type_id: "", capacity: "1", total_beds: "1", floor_area: "", is_accessible: false, notes: "" })
    setShowForm(false); load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return
    await deleteRoom(id); load()
  }

  const getStatusBadge = (status: string) => {
    const s = ROOM_STATUSES.find(st => st.value === status)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s?.color || "bg-gray-100 text-gray-600"}`}>{s?.label || status}</span>
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Rooms</h1><p className="text-sm text-gray-500 mt-1">Manage rooms across all buildings.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Room"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>New Room</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Room Number *</label><Input value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Room Name</label><Input value={form.room_name} onChange={e => setForm({...form, room_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Building *</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.building_id} onChange={e => setForm({...form, building_id: e.target.value})}>
              <option value="">Select...</option>
              {buildings.map((b: any) => <option key={b.id} value={b.id}>{b.building_name}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-medium">Room Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.room_type_id} onChange={e => setForm({...form, room_type_id: e.target.value})}>
              <option value="">Select...</option>
              {roomTypes.map((rt: any) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Total Beds</label><Input type="number" value={form.total_beds} onChange={e => setForm({...form, total_beds: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Floor Area (sqft)</label><Input type="number" value={form.floor_area} onChange={e => setForm({...form, floor_area: e.target.value})} /></div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="accessible" checked={form.is_accessible} onChange={e => setForm({...form, is_accessible: e.target.checked})} />
            <label htmlFor="accessible" className="text-sm">Accessible Room</label>
          </div>
          <div className="md:col-span-3"><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={handleCreate}>Create Room</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input className="pl-10" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}>
          <option value="">All Buildings</option>
          {buildings.map((b: any) => <option key={b.id} value={b.id}>{b.building_name}</option>)}
        </select>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {ROOM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card><CardContent className="p-0">
        <table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <th className="px-4 py-3">Room #</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Building</th><th className="px-4 py-3">Type</th>
          <th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Occupancy</th><th className="px-4 py-3">Beds</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
        </tr></thead>
        <tbody className="divide-y divide-gray-100">
          {rooms.filter(r => !search || r.room_number.toLowerCase().includes(search.toLowerCase()) || r.room_name?.toLowerCase().includes(search.toLowerCase())).map((room: any) => (
            <tr key={room.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono text-gray-500">{room.room_number}</td>
              <td className="px-4 py-3 text-sm font-medium">{room.room_name || "—"}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{room.accommodation_buildings?.building_name || "—"}</td>
              <td className="px-4 py-3 text-sm">{room.room_types?.name || "—"}</td>
              <td className="px-4 py-3 text-sm">{room.capacity}</td>
              <td className="px-4 py-3 text-sm">{room.current_occupancy}/{room.capacity}</td>
              <td className="px-4 py-3 text-sm">{room.total_beds}</td>
              <td className="px-4 py-3">{getStatusBadge(room.status)}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(room.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div></td>
            </tr>
          ))}
        </tbody></table>
        {rooms.length === 0 && <p className="text-center text-gray-400 py-8">No rooms found</p>}
      </CardContent></Card>
    </div>
  )
}
