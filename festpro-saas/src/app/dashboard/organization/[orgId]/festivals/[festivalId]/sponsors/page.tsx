"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getFestivalSponsors, createFestivalSponsor, updateFestivalSponsor, deleteFestivalSponsor, uploadFile } from "@/lib/actions/festival"
import { SPONSOR_CATEGORIES, SPONSOR_STATUSES } from "@/config/festival"
import type { FestivalSponsor } from "@/types/festival"
import { Plus, Loader2, Trash2, CreditCard, Upload, Save } from "lucide-react"

export default function FestivalSponsorsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [sponsors, setSponsors] = useState<FestivalSponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", website: "", description: "", category: "partner", amount: "", status: "pending" })

  async function load() {
    const data = await getFestivalSponsors(festivalId)
    setSponsors(data as FestivalSponsor[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Sponsor name is required"); return }
    setSaving(true)
    const payload: Record<string, any> = {
      name: form.name, website: form.website || null, description: form.description || null,
      category: form.category, status: form.status, amount: form.amount ? parseFloat(form.amount) : null,
    }
    const result = editingId ? await updateFestivalSponsor(editingId, payload) : await createFestivalSponsor(festivalId, payload)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Sponsor updated" : "Sponsor created"); setShowForm(false); setEditingId(null); setForm({ name: "", website: "", description: "", category: "partner", amount: "", status: "pending" }) }
    setSaving(false)
    await load()
  }

  async function handleEdit(sponsor: FestivalSponsor) {
    setForm({ name: sponsor.name, website: sponsor.website || "", description: sponsor.description || "", category: sponsor.category, amount: sponsor.amount?.toString() || "", status: sponsor.status })
    setEditingId(sponsor.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this sponsor?")) return
    const result = await deleteFestivalSponsor(id)
    if (result.error) toast.error(result.error)
    else toast.success("Sponsor deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage festival sponsors and partners.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", website: "", description: "", category: "partner", amount: "", status: "pending" }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sponsor Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Website</label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={SPONSOR_CATEGORIES} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={SPONSOR_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {sponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sponsors added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sponsors.map((sponsor) => {
            const statusInfo = SPONSOR_STATUSES.find((s) => s.value === sponsor.status)
            return (
              <Card key={sponsor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{sponsor.name}</h3>
                        <span className="text-xs text-gray-500 capitalize">{sponsor.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusInfo && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>}
                      <button onClick={() => handleEdit(sponsor)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs">Edit</button>
                      <button onClick={() => handleDelete(sponsor.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {sponsor.description && <p className="text-sm text-gray-500 mt-2">{sponsor.description}</p>}
                  {sponsor.amount && <p className="text-sm font-medium text-gray-700 mt-1">₹{sponsor.amount.toLocaleString()}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
