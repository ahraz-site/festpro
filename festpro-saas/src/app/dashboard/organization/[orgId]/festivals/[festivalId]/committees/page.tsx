"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getFestivalCommittees, createFestivalCommittee, updateFestivalCommittee, deleteFestivalCommittee } from "@/lib/actions/festival"
import { COMMITTEE_ROLES } from "@/config/festival"
import type { FestivalCommittee } from "@/types/festival"
import { Plus, Loader2, Trash2, Users, Save } from "lucide-react"

export default function FestivalCommitteesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [committees, setCommittees] = useState<FestivalCommittee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", committee_role: "member", description: "", contact_email: "", contact_phone: "" })

  async function load() {
    const data = await getFestivalCommittees(festivalId)
    setCommittees(data as FestivalCommittee[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Committee name is required"); return }
    setSaving(true)
    const payload = { name: form.name, committee_role: form.committee_role as any, description: form.description || null, contact_email: form.contact_email || null, contact_phone: form.contact_phone || null }
    const result = editingId ? await updateFestivalCommittee(editingId, payload) : await createFestivalCommittee(festivalId, payload)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Committee updated" : "Committee created"); setShowForm(false); setEditingId(null); setForm({ name: "", committee_role: "member", description: "", contact_email: "", contact_phone: "" }) }
    setSaving(false)
    await load()
  }

  async function handleEdit(committee: FestivalCommittee) {
    setForm({ name: committee.name, committee_role: committee.committee_role, description: committee.description || "", contact_email: committee.contact_email || "", contact_phone: committee.contact_phone || "" })
    setEditingId(committee.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this committee?")) return
    const result = await deleteFestivalCommittee(id)
    if (result.error) toast.error(result.error)
    else toast.success("Committee deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Committees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage festival committees and their members.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", committee_role: "member", description: "", contact_email: "", contact_phone: "" }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Committee
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cultural Committee" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select value={form.committee_role} onChange={(e) => setForm({ ...form, committee_role: e.target.value })} options={COMMITTEE_ROLES} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contact Email</label>
                <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {committees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No committees added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {committees.map((committee) => (
            <Card key={committee.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{committee.name}</h3>
                      <span className="text-xs text-gray-500 capitalize">{committee.committee_role}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(committee)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs">Edit</button>
                    <button onClick={() => handleDelete(committee.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {committee.description && <p className="text-sm text-gray-500 mt-2">{committee.description}</p>}
                {(committee.contact_email || committee.contact_phone) && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {committee.contact_email && <span>{committee.contact_email}</span>}
                    {committee.contact_phone && <span>{committee.contact_phone}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
