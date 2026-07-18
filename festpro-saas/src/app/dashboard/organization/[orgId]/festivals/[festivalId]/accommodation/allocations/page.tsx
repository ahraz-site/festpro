"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRoomAllocations, createRoomAllocation, updateRoomAllocationStatus, deleteRoomAllocation, getRooms } from "@/lib/actions/accommodation-transport"
import type { RoomAllocation, Room } from "@/types/accommodation-transport"
import { ALLOCATION_STATUSES, OCCUPANT_TYPES } from "@/config/accommodation-transport"
import { Loader2, UserCheck, Plus, CheckCircle, XCircle, Trash2, Users, DoorOpen } from "lucide-react"

export default function RoomAllocationsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [allocations, setAllocations] = useState<any[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    room_id: "",
    occupant_type: "participant",
    occupant_name: "",
    occupant_email: "",
    occupant_phone: "",
    expected_check_in: "",
    expected_check_out: "",
    notes: "",
  })

  const load = useCallback(async () => {
    const [allocRes, roomsRes] = await Promise.all([
      getRoomAllocations(festivalId),
      getRooms(festivalId),
    ])
    setAllocations(allocRes.data || [])
    setRooms((roomsRes.data || []) as Room[])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRoomAllocation({ festival_id: festivalId, allocation_type: "manual", ...form })
    setShowForm(false)
    setForm({ room_id: "", occupant_type: "participant", occupant_name: "", occupant_email: "", occupant_phone: "", expected_check_in: "", expected_check_out: "", notes: "" })
    load()
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateRoomAllocationStatus(id, status)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this allocation? This will decrement room occupancy.")) return
    await deleteRoomAllocation(id)
    load()
  }

  const statusBadge = (status: string) => {
    const s = ALLOCATION_STATUSES.find(a => a.value === status)
    if (!s) return <span className="text-xs text-gray-500">{status}</span>
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
  }

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—"

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Allocations</h1>
          <p className="text-sm text-gray-500 mt-1">{allocations.length} total allocations.</p>
        </div>
        <Button onClick={() => { setForm({ room_id: "", occupant_type: "participant", occupant_name: "", occupant_email: "", occupant_phone: "", expected_check_in: "", expected_check_out: "", notes: "" }); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-1" /> New Allocation
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Room Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Room *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.room_id}
                  onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
                  required
                >
                  <option value="">Select room...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.room_number}{r.room_name ? ` - ${r.room_name}` : ""} (cap: {r.capacity}, occ: {r.current_occupancy})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Occupant Type *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.occupant_type}
                  onChange={e => setForm(f => ({ ...f, occupant_type: e.target.value }))}
                  required
                >
                  {OCCUPANT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Occupant Name *</label>
                <Input value={form.occupant_name} onChange={e => setForm(f => ({ ...f, occupant_name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={form.occupant_email} onChange={e => setForm(f => ({ ...f, occupant_email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={form.occupant_phone} onChange={e => setForm(f => ({ ...f, occupant_phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Expected Check-in</label>
                <Input type="datetime-local" value={form.expected_check_in} onChange={e => setForm(f => ({ ...f, expected_check_in: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Expected Check-out</label>
                <Input type="datetime-local" value={form.expected_check_out} onChange={e => setForm(f => ({ ...f, expected_check_out: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create Allocation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Occupant</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Type</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Room</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Alloc Type</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Check In</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Check Out</th>
                  <th className="text-left font-medium text-gray-500 px-4 py-3">Created</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(a => {
                  const roomInfo = a.rooms as any
                  return (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{a.occupant_name}</p>
                            {(a.occupant_email || a.occupant_phone) && (
                              <p className="text-xs text-gray-400">{a.occupant_email || a.occupant_phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.occupant_type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <DoorOpen className="h-3.5 w-3.5 text-gray-400" />
                          <span>{roomInfo?.room_number || "—"}</span>
                        </div>
                        {roomInfo?.accommodation_buildings?.building_name && (
                          <p className="text-xs text-gray-400">{roomInfo.accommodation_buildings.building_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.allocation_type}</td>
                      <td className="px-4 py-3">{statusBadge(a.status)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(a.expected_check_in)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(a.expected_check_out)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(a.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.status === "confirmed" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(a.id, "checked_in")} title="Check In">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(a.id, "cancelled")} title="Cancel">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">No allocations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
