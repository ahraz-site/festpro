"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getVisitor, updateVisitor, blacklistVisitor, generateVisitorPass, getVisitorPasses, deleteVisitor } from "@/lib/actions/help-desk"
import { VISITOR_CATEGORIES } from "@/config/help-desk"
import { Loader2, Crown, Ban, QrCode, Trash2, ArrowLeft } from "lucide-react"

export default function VisitorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const visitorId = params.id as string
  const festivalId = params.festivalId as string
  const [visitor, setVisitor] = useState<any>(null)
  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    const [vRes, pRes] = await Promise.all([getVisitor(visitorId), getVisitorPasses(festivalId, visitorId)])
    if (vRes.data) setVisitor(vRes.data)
    if (pRes.data) setPasses(pRes.data)
    setLoading(false)
  }, [visitorId, festivalId])

  useEffect(() => { load() }, [load])

  const handleGeneratePass = async () => {
    const res = await generateVisitorPass(visitorId)
    if (res.data) load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!visitor) return <p className="text-center py-12 text-gray-500">Visitor not found</p>

  const cat = VISITOR_CATEGORIES.find(x => x.value === visitor.visitor_category)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-bold text-gray-900">{visitor.first_name} {visitor.last_name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${cat?.color || ""}`}>{cat?.label || visitor.visitor_category}</span>
          {visitor.is_vip && <Crown className="h-4 w-4 text-amber-500" />}
          {visitor.is_blacklisted && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Blacklisted</span>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleGeneratePass}><QrCode className="h-4 w-4 mr-1" /> Generate Pass</Button>
          <Button size="sm" variant="outline" onClick={async () => { await blacklistVisitor(visitorId, !visitor.is_blacklisted); load() }}><Ban className="h-4 w-4 mr-1" /> {visitor.is_blacklisted ? "Unblacklist" : "Blacklist"}</Button>
          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={async () => { if (confirm("Delete visitor?")) { await deleteVisitor(visitorId); router.back() } }}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Visitor Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">Name</span><p className="font-medium">{visitor.first_name} {visitor.last_name}</p></div>
              <div><span className="text-gray-500">Email</span><p>{visitor.email || "N/A"}</p></div>
              <div><span className="text-gray-500">Phone</span><p>{visitor.phone || "N/A"}</p></div>
              <div><span className="text-gray-500">Company</span><p>{visitor.company_name || "N/A"}</p></div>
              <div><span className="text-gray-500">Designation</span><p>{visitor.designation || "N/A"}</p></div>
              <div><span className="text-gray-500">Category</span><p>{cat?.label || visitor.visitor_category}</p></div>
              <div><span className="text-gray-500">Total Visits</span><p>{visitor.total_visits}</p></div>
              <div><span className="text-gray-500">Last Visit</span><p>{visitor.last_visit_date ? new Date(visitor.last_visit_date).toLocaleDateString() : "N/A"}</p></div>
            </div>
            <div className="pt-2"><span className="text-gray-500">Purpose of Visit</span><p>{visitor.purpose_of_visit || "N/A"}</p></div>
            <div><span className="text-gray-500">Host</span><p>{visitor.host_name ? `${visitor.host_name} (${visitor.host_department || "N/A"})` : "N/A"}</p></div>
            {visitor.notes && <div><span className="text-gray-500">Notes</span><p className="text-gray-700">{visitor.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Visitor Passes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {passes.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-mono">{p.pass_number}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Issued: {new Date(p.issued_at).toLocaleDateString()}</span>
                    {p.validity_end && <span>Expires: {new Date(p.validity_end).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.is_active ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                  {p.is_used && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Used</span>}
                </div>
              </div>
            ))}
            {passes.length === 0 && <p className="text-sm text-gray-400">No passes issued yet</p>}
            <Button size="sm" variant="outline" onClick={handleGeneratePass}><QrCode className="h-4 w-4 mr-1" /> Generate New Pass</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
