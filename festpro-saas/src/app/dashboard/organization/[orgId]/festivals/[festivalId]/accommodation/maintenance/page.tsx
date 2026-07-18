"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRoomMaintenance, createRoomMaintenance, getRooms } from "@/lib/actions/accommodation-transport"
import { ROOM_MAINTENANCE_PRIORITIES, ROOM_MAINTENANCE_STATUSES } from "@/config/accommodation-transport"
import { Loader2, Wrench, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function RoomMaintenancePage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [records, setRecords] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [roomId, setRoomId] = useState("")
  const [issue, setIssue] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("normal")

  const load = useCallback(async () => {
    setLoading(true)
    const [r, rm] = await Promise.all([getRoomMaintenance(festivalId), getRooms(festivalId)])
    setRecords(r.data || []); setRooms(rm.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!roomId || !issue) return
    await createRoomMaintenance({ festival_id: festivalId, room_id: roomId, issue, description: description || null, priority })
    setRoomId(""); setIssue(""); setDescription(""); setPriority("normal"); setShowForm(false); load()
  }

  const getPriorityBadge = (p: string) => {
    const s = ROOM_MAINTENANCE_PRIORITIES.find(x => x.value === p)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s?.color || "bg-gray-100 text-gray-600"}`}>{s?.label || p}</span>
  }

  const getStatusBadge = (s: string) => {
    const st = ROOM_MAINTENANCE_STATUSES.find(x => x.value === s)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st?.color || "bg-gray-100 text-gray-600"}`}>{st?.label || s}</span>
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Room Maintenance</h1><p className="text-sm text-gray-500 mt-1">Track and manage room maintenance issues.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Report Issue"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Report Maintenance Issue</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium">Room *</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={roomId} onChange={e => setRoomId(e.target.value)}>
              <option value="">Select room...</option>
              {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.room_number} - {r.accommodation_buildings?.building_name}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-medium">Issue *</label><Input value={issue} onChange={e => setIssue(e.target.value)} placeholder="e.g. AC not working" /></div>
          <div><label className="text-sm font-medium">Description</label><textarea className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Priority</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={priority} onChange={e => setPriority(e.target.value)}>
              {ROOM_MAINTENANCE_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <Button onClick={handleCreate}>Report Issue</Button>
        </CardContent></Card>
      )}

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Room</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Reported</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {records.map((r: any) => <tr key={r.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm">{r.rooms?.room_number || "—"}</td>
          <td className="px-4 py-3 text-sm font-medium">{r.issue}</td>
          <td className="px-4 py-3">{getPriorityBadge(r.priority)}</td>
          <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
          <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
        </tr>)}
      </tbody></table></CardContent></Card>
    </div>
  )
}
