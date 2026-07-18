"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getCampaigns, upsertCampaign, updateCampaignStatus } from "@/lib/actions/sponsor-crm"
import { CAMPAIGN_STATUSES } from "@/config/sponsor-crm"
import type { FundCampaign } from "@/types/sponsor-crm"
import { Loader2, Plus, Pencil, X, Target, CalendarDays, TrendingUp, DollarSign } from "lucide-react"

export default function CampaignsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [campaigns, setCampaigns] = useState<FundCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("")
  const [form, setForm] = useState({ name: "", description: "", goal_amount: "", start_date: "", end_date: "" })

  const load = useCallback(async () => {
    const res = await getCampaigns(festivalId, { status: filterStatus || undefined })
    setCampaigns(res.data || []); setLoading(false)
  }, [festivalId, filterStatus])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertCampaign({ id: editingId || undefined, festival_id: festivalId, ...form, goal_amount: Number(form.goal_amount) })
    setShowForm(false); setEditingId(null); setForm({ name: "", description: "", goal_amount: "", start_date: "", end_date: "" })
    load()
  }

  const handleEdit = (c: FundCampaign) => {
    setForm({ name: c.name, description: c.description || "", goal_amount: c.goal_amount.toString(), start_date: c.start_date, end_date: c.end_date })
    setEditingId(c.id); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fund Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">{campaigns.length} campaigns.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: "", description: "", goal_amount: "", start_date: "", end_date: "" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> New Campaign</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Campaign" : "New Campaign"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="text-sm font-medium">Campaign Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Goal Amount *</label><Input type="number" value={form.goal_amount} onChange={e => setForm(f => ({ ...f, goal_amount: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Start Date *</label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">End Date *</label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...CAMPAIGN_STATUSES.map(cs => ({ value: cs.value, label: cs.label }))]} className="w-44" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map(c => {
          const progress = c.goal_amount > 0 ? Math.min(Math.round((c.collected_amount / c.goal_amount) * 100), 100) : 0
          return (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <Target className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${CAMPAIGN_STATUSES.find(cs => cs.value === c.status)?.color || "bg-gray-100"}`}>
                        {CAMPAIGN_STATUSES.find(cs => cs.value === c.status)?.label || c.status}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">₹{c.collected_amount.toLocaleString()} / ₹{c.goal_amount.toLocaleString()}</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {c.start_date} - {c.end_date}</div>
                </div>
                {c.status === "draft" && (
                  <div className="mt-3"><Button size="sm" variant="outline" onClick={async () => { await updateCampaignStatus(c.id, "active"); load() }}>Activate</Button></div>
                )}
                {c.status === "active" && (
                  <div className="mt-3"><Button size="sm" variant="outline" onClick={async () => { await updateCampaignStatus(c.id, "completed"); load() }}>Complete</Button></div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {campaigns.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No campaigns created.</p>}
      </div>
    </div>
  )
}
