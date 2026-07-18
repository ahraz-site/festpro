"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getGrades, upsertGrade, deleteGrade } from "@/lib/actions/result"
import { GRADE_COLORS, GRADE_LABELS, DEFAULT_GRADES } from "@/config/result"
import type { ResultGrade, GradeLetter } from "@/types/result"
import { Loader2, Plus, Trash2, Save, Palette } from "lucide-react"

export default function GradesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [grades, setGrades] = useState<ResultGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ grade: "", min: "", max: "", label: "", pass: true, color: "#22c55e", order: 0 })

  const load = useCallback(async () => {
    const res = await getGrades(festivalId)
    setGrades(res.data || [])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const res = await upsertGrade(festivalId, {
      id: editing || undefined, grade: editForm.grade,
      min_percentage: parseFloat(editForm.min), max_percentage: parseFloat(editForm.max),
      label: editForm.label, is_pass: editForm.pass, color: editForm.color,
      display_order: editForm.order,
    })
    if (res.error) toast.error(res.error); else { toast.success("Grade saved"); setEditing(null); load() }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteGrade(id)
    if (res.error) toast.error(res.error); else { toast.success("Grade deleted"); load() }
  }

  const startEdit = (g: ResultGrade) => {
    setEditing(g.id)
    setEditForm({ grade: g.grade, min: String(g.min_percentage), max: String(g.max_percentage), label: g.label || "", pass: g.is_pass, color: g.color, order: g.display_order })
  }

  const handleSeed = async () => {
    for (const dg of DEFAULT_GRADES) {
      await upsertGrade(festivalId, {
        grade: dg.grade, min_percentage: dg.min, max_percentage: dg.max,
        label: dg.label, is_pass: dg.pass, color: dg.color, display_order: dg.order,
      })
    }
    toast.success("Default grades seeded")
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Configure grade thresholds for result classification.</p>
        </div>
        {grades.length === 0 && <Button onClick={handleSeed} variant="outline"><Plus className="h-4 w-4 mr-1" /> Seed Defaults</Button>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {grades.map(g => (
          <Card key={g.id}>
            <CardContent className="pt-4">
              {editing === g.id ? (
                <div className="space-y-2">
                  <Input value={editForm.grade} onChange={e => setEditForm(f => ({ ...f, grade: e.target.value }))} placeholder="Grade" />
                  <Input type="number" value={editForm.min} onChange={e => setEditForm(f => ({ ...f, min: e.target.value }))} placeholder="Min %" />
                  <Input type="number" value={editForm.max} onChange={e => setEditForm(f => ({ ...f, max: e.target.value }))} placeholder="Max %" />
                  <Input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} placeholder="Label" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editForm.pass} onChange={e => setEditForm(f => ({ ...f, pass: e.target.checked }))} />
                    Passing grade
                  </label>
                  <div className="flex gap-1">
                    <Input type="color" value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} className="w-12 p-1" />
                    <Input type="number" value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} placeholder="Order" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleSave}><Save className="h-3 w-3 mr-1" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold" style={{ color: g.color }}>{g.grade}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(g)}>
                        <Palette className="h-3 w-3 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)}>
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{g.label || GRADE_LABELS[g.grade as GradeLetter]}</p>
                  <p className="text-xs text-gray-400">{g.min_percentage}% — {g.max_percentage}%</p>
                  <span className={`text-xs ${g.is_pass ? "text-green-600" : "text-red-500"}`}>
                    {g.is_pass ? "Passing" : "Failing"}
                  </span>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {grades.length === 0 && !editing && (
        <Card><CardContent className="py-12 text-center text-gray-400">No grades configured. Click "Seed Defaults" or create manually.</CardContent></Card>
      )}
    </div>
  )
}
