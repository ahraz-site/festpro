"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getVisitorCheckins, checkInVisitor, checkOutVisitor, getVisitors, getHelpDesks } from "@/lib/actions/help-desk"
import { VISITOR_CATEGORIES } from "@/config/help-desk"
import { Loader2, LogIn, LogOut, UserCheck, QrCode } from "lucide-react"

export default function CheckinsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [checkins, setCheckins] = useState<any[]>([])
  const [visitors, setVisitors] = useState<any[]>([])
  const [desks, setDesks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ visitor_id: "", desk_id: "", badge_issued: false, badge_number: "", vehicle_number: "", notes: "" })
  const [qrInput, setQrInput] = useState("")

  const load = useCallback(async () => {
    const [cRes, vRes, dRes] = await Promise.all([getVisitorCheckins(festivalId), getVisitors(festivalId), getHelpDesks(festivalId)])
    if (cRes.data) setCheckins(cRes.data)
    if (vRes.data) setVisitors(vRes.data)
    if (dRes.data) setDesks(dRes.data)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCheckin = async () => {
    if (!form.visitor_id) return
    setLoading(true)
    await checkInVisitor({ ...form, festival_id: festivalId, check_in_method: "manual" })
    setForm({ visitor_id: "", desk_id: "", badge_issued: false, badge_number: "", vehicle_number: "", notes: "" })
    setShowForm(false); load()
  }

  const handleCheckout = async (id: string) => {
    await checkOutVisitor(id); load()
  }

  const handleQrCheckin = async () => {
    if (!qrInput.trim()) return
    const v = visitors.find((v: any) => v.id === qrInput)
    if (v) {
      await checkInVisitor({ visitor_id: qrInput, festival_id: festivalId, check_in_method: "qr" })
      setQrInput(""); load()
    }
  }

  if (loading && checkins.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const checkedInVisitorIds = new Set(checkins.filter(c => !c.visitor_checkout_logs?.[0]).map(c => c.visitor_id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Visitor Check-ins</h1>
        <Button onClick={() => setShowForm(!showForm)}><LogIn className="h-4 w-4 mr-1" /> Check In</Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 flex gap-2">
          <Input placeholder="Scan QR code / Visitor ID" value={qrInput} onChange={e => setQrInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQrCheckin()} />
          <Button variant="outline" onClick={handleQrCheckin}><QrCode className="h-4 w-4 mr-1" /> Verify</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Manual Check-in</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Visitor *</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.visitor_id} onChange={e => setForm({ ...form, visitor_id: e.target.value })}><option value="">Select...</option>{visitors.filter((v: any) => !checkedInVisitorIds.has(v.id)).map((v: any) => <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>)}</select></div>
              <div><Label>Desk</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.desk_id} onChange={e => setForm({ ...form, desk_id: e.target.value })}><option value="">Select...</option>{desks.filter(d => d.is_active).map(d => <option key={d.id} value={d.id}>{d.desk_name}</option>)}</select></div>
              <div><Label>Badge Number</Label><Input value={form.badge_number} onChange={e => setForm({ ...form, badge_number: e.target.value })} /></div>
              <div><Label>Vehicle Number</Label><Input value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.badge_issued} onChange={e => setForm({ ...form, badge_issued: e.target.checked })} /> Badge Issued</label>
              <div className="flex-1"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <Button onClick={handleCheckin}>Check In</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {checkins.map((c: any) => {
          const v = c.visitors
          return (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold">{v ? `${v.first_name} ${v.last_name}` : "Unknown"}</span>
                      {v && <span className="text-xs text-gray-500">{v.visitor_category}</span>}
                      <span className="text-xs text-gray-400">{new Date(c.check_in_time).toLocaleString()}</span>
                      {c.help_desks && <span className="text-xs text-gray-400">@{c.help_desks.desk_name}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {c.badge_number && <span>Badge: {c.badge_number}</span>}
                      {c.vehicle_number && <span>Vehicle: {c.vehicle_number}</span>}
                      <span>Method: {c.check_in_method}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCheckout(c.id)}><LogOut className="h-4 w-4 mr-1" /> Check Out</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {checkins.length === 0 && <p className="text-center text-gray-400 py-8">No check-ins recorded</p>}
      </div>
    </div>
  )
}
