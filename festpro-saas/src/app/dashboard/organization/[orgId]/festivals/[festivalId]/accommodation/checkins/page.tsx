"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCheckins, checkIn, checkOut, getRoomAllocations, getRooms } from "@/lib/actions/accommodation-transport"
import { CHECK_IN_METHODS } from "@/config/accommodation-transport"
import { Loader2, LogIn, LogOut, Plus, Search } from "lucide-react"

export default function CheckinsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [activeTab, setActiveTab] = useState<"checkin" | "checkout" | "history">("checkin")
  const [loading, setLoading] = useState(true)
  const [checkins, setCheckins] = useState<any[]>([])
  const [allocations, setAllocations] = useState<any[]>([])
  const [checkedInAllocs, setCheckedInAllocs] = useState<any[]>([])

  const [showForm, setShowForm] = useState(false)
  const [allocationId, setAllocationId] = useState("")
  const [checkInMethod, setCheckInMethod] = useState("manual")
  const [idProofType, setIdProofType] = useState("")
  const [idProofNumber, setIdProofNumber] = useState("")
  const [notes, setNotes] = useState("")

  const [checkoutAllocId, setCheckoutAllocId] = useState("")
  const [roomCondition, setRoomCondition] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const [ci, ca, co] = await Promise.all([
      getCheckins(festivalId),
      getRoomAllocations(festivalId, "confirmed"),
      getRoomAllocations(festivalId, "checked_in"),
    ])
    setCheckins(ci.data || [])
    setAllocations(ca.data || [])
    setCheckedInAllocs(co.data || [])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCheckIn = async () => {
    if (!allocationId) return
    const alloc = allocations.find((a: any) => a.id === allocationId)
    if (!alloc) return
    await checkIn({ festival_id: festivalId, allocation_id: allocationId, room_id: alloc.room_id, occupant_name: alloc.occupant_name, occupant_type: alloc.occupant_type, check_in_method: checkInMethod, id_proof_type: idProofType || null, id_proof_number: idProofNumber || null, notes: notes || null })
    setAllocationId(""); setShowForm(false); load()
  }

  const handleCheckOut = async () => {
    if (!checkoutAllocId) return
    const alloc = checkedInAllocs.find((a: any) => a.id === checkoutAllocId)
    if (!alloc) return
    await checkOut({ festival_id: festivalId, allocation_id: checkoutAllocId, room_id: alloc.room_id, occupant_name: alloc.occupant_name, occupant_type: alloc.occupant_type, room_condition: roomCondition || null })
    setCheckoutAllocId(""); load()
  }

  const tabClass = (tab: string) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Check-In / Check-Out</h1><p className="text-sm text-gray-500 mt-1">Manage room check-ins and check-outs.</p></div>

      <div className="flex gap-2">
        <button className={tabClass("checkin")} onClick={() => setActiveTab("checkin")}><LogIn className="h-4 w-4 inline mr-1" /> Check In</button>
        <button className={tabClass("checkout")} onClick={() => setActiveTab("checkout")}><LogOut className="h-4 w-4 inline mr-1" /> Check Out</button>
        <button className={tabClass("history")} onClick={() => setActiveTab("history")}><Search className="h-4 w-4 inline mr-1" /> History</button>
      </div>

      {activeTab === "checkin" && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Check-In"}</Button></div>
          {showForm && (
            <Card><CardHeader><CardTitle>New Check-In</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium">Allocation *</label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={allocationId} onChange={e => setAllocationId(e.target.value)}>
                  <option value="">Select allocation...</option>
                  {allocations.map((a: any) => <option key={a.id} value={a.id}>{a.occupant_name} - Room {a.rooms?.room_number}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium">Check-In Method</label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={checkInMethod} onChange={e => setCheckInMethod(e.target.value)}>
                  {CHECK_IN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">ID Proof Type</label><Input value={idProofType} onChange={e => setIdProofType(e.target.value)} placeholder="e.g. Aadhaar, Passport" /></div>
                <div><label className="text-sm font-medium">ID Proof Number</label><Input value={idProofNumber} onChange={e => setIdProofNumber(e.target.value)} /></div>
              </div>
              <div><label className="text-sm font-medium">Notes</label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
              <Button onClick={handleCheckIn}><LogIn className="h-4 w-4 mr-1" /> Confirm Check-In</Button>
            </CardContent></Card>
          )}
          <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Room</th><th className="px-4 py-3">Allocation</th><th className="px-4 py-3">Action</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {allocations.map((a: any) => <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium">{a.occupant_name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{a.occupant_type}</td>
              <td className="px-4 py-3 text-sm">{a.rooms?.room_number || "—"}</td>
              <td className="px-4 py-3 text-sm">{a.allocation_type}</td>
              <td className="px-4 py-3"><Button size="sm" onClick={() => { setAllocationId(a.id); setShowForm(true) }}><LogIn className="h-4 w-4 mr-1" /> Check In</Button></td>
            </tr>)}
          </tbody></table></CardContent></Card>
        </div>
      )}

      {activeTab === "checkout" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Check Out</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Occupant *</label>
              <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={checkoutAllocId} onChange={e => setCheckoutAllocId(e.target.value)}>
                <option value="">Select occupant...</option>
                {checkedInAllocs.map((a: any) => <option key={a.id} value={a.id}>{a.occupant_name} - Room {a.rooms?.room_number}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Room Condition</label><Input value={roomCondition} onChange={e => setRoomCondition(e.target.value)} placeholder="e.g. Good, needs cleaning" /></div>
            <Button onClick={handleCheckOut}><LogOut className="h-4 w-4 mr-1" /> Confirm Check-Out</Button>
          </CardContent></Card>
        </div>
      )}

      {activeTab === "history" && (
        <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <th className="px-4 py-3">Name</th><th className="px-4 py-3">Room</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Checked In By</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Notes</th>
        </tr></thead><tbody className="divide-y divide-gray-100">
          {checkins.map((c: any) => <tr key={c.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium">{c.occupant_name}</td>
            <td className="px-4 py-3 text-sm">{c.rooms?.room_number || "—"}</td>
            <td className="px-4 py-3 text-sm">{c.check_in_method}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{c.checked_in_by || "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.checked_in_at).toLocaleString()}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{c.notes || "—"}</td>
          </tr>)}
        </tbody></table></CardContent></Card>
      )}
    </div>
  )
}
