"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getServiceRatings, submitServiceRating, getHelpDesks } from "@/lib/actions/help-desk"
import { Loader2, Star, Plus } from "lucide-react"

export default function RatingsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [ratings, setRatings] = useState<any[]>([])
  const [desks, setDesks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ rating: 5, desk_id: "", comment: "", visitor_name: "" })

  const load = useCallback(async () => {
    const [rRes, dRes] = await Promise.all([getServiceRatings(festivalId), getHelpDesks(festivalId)])
    if (rRes.data) setRatings(rRes.data)
    if (dRes.data) setDesks(dRes.data)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    setLoading(true)
    await submitServiceRating({ ...form, festival_id: festivalId })
    setForm({ rating: 5, desk_id: "", comment: "", visitor_name: "" }); setShowForm(false); load()
  }

  const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : "N/A"
  const distribution = [0, 0, 0, 0, 0]
  ratings.forEach(r => { if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++ })

  if (loading && ratings.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Service Ratings</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add Rating</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Submit Rating</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: parseInt(e.target.value) || 5 })} /></div>
              <div><Label>Desk</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.desk_id} onChange={e => setForm({ ...form, desk_id: e.target.value })}><option value="">General</option>{desks.map(d => <option key={d.id} value={d.id}>{d.desk_name}</option>)}</select></div>
              <div><Label>Visitor Name</Label><Input value={form.visitor_name} onChange={e => setForm({ ...form, visitor_name: e.target.value })} /></div>
            </div>
            <div><Label>Comment</Label><Input value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} /></div>
            <Button onClick={handleSubmit}>Submit</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Rating Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold">{avgRating}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />)}
              </div>
              <p className="text-sm text-gray-500 mt-1">{ratings.length} ratings</p>
            </div>
            {distribution.map((count, i) => (
              <div key={i} className="flex items-center gap-2 text-sm mb-1">
                <span className="w-16 text-gray-500">{5 - i} star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-amber-400" style={{ width: `${ratings.length ? (count / ratings.length) * 100 : 0}%` }} /></div>
                <span className="w-8 text-right text-gray-500">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Ratings</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {ratings.slice(0, 20).map(r => (
              <div key={r.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50">
                <div>
                  <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />)}</div>
                  {r.comment && <p className="text-xs text-gray-600 mt-1">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">{r.visitor_name || "Anonymous"} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                {r.support_tickets && <span className="text-xs text-gray-400">{r.support_tickets.ticket_number}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
