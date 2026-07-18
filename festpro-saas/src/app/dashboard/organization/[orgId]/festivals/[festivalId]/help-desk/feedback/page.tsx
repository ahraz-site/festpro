"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getFeedbackForms, createFeedbackForm, getFeedbackResponses, submitFeedbackResponse } from "@/lib/actions/help-desk"
import { FEEDBACK_FORM_TYPES } from "@/config/help-desk"
import { Loader2, Plus, ClipboardList, Star } from "lucide-react"

export default function FeedbackPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [forms, setForms] = useState<any[]>([])
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"forms" | "responses">("forms")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", form_type: "general", questions: "" })

  const load = useCallback(async () => {
    const [fRes, rRes] = await Promise.all([getFeedbackForms(festivalId), getFeedbackResponses(festivalId)])
    if (fRes.data) setForms(fRes.data)
    if (rRes.data) setResponses(rRes.data)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title) return
    setLoading(true)
    const questions = form.questions ? form.questions.split("\n").filter(q => q.trim()).map(q => ({ question: q.trim(), type: "text" })) : []
    await createFeedbackForm({ ...form, festival_id: festivalId, questions })
    setForm({ title: "", description: "", form_type: "general", questions: "" }); setShowForm(false); load()
  }

  if (loading && forms.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
        <div className="flex gap-2">
          <Button variant={tab === "forms" ? "default" : "outline"} size="sm" onClick={() => setTab("forms")}>Forms</Button>
          <Button variant={tab === "responses" ? "default" : "outline"} size="sm" onClick={() => setTab("responses")}>Responses ({responses.length})</Button>
          {tab === "forms" && <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> New Form</Button>}
        </div>
      </div>

      {showForm && tab === "forms" && (
        <Card>
          <CardHeader><CardTitle>Create Feedback Form</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Type</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.form_type} onChange={e => setForm({ ...form, form_type: e.target.value })}>{FEEDBACK_FORM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Questions (one per line)</Label><Textarea value={form.questions} onChange={e => setForm({ ...form, questions: e.target.value })} className="min-h-[120px]" placeholder="How was your experience?&#10;How can we improve?&#10;Rate our service (1-5)" /></div>
            <Button onClick={handleCreate}>Create Form</Button>
          </CardContent>
        </Card>
      )}

      {tab === "forms" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((f: any) => (
            <Card key={f.id}>
              <CardHeader><CardTitle className="text-sm">{f.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">{f.description || "No description"}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100">{FEEDBACK_FORM_TYPES.find(t => t.value === f.form_type)?.label || f.form_type}</span>
                  <span>{f.questions?.length || 0} questions</span>
                  <span>{f.is_active ? "Active" : "Inactive"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {forms.length === 0 && <p className="text-center text-gray-400 py-8 col-span-3">No feedback forms</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{r.feedback_forms?.title || "Unknown Form"}</span>
                  <span className="text-xs text-gray-400">{r.respondent_name || "Anonymous"}</span>
                  <span className="text-xs text-gray-400">{new Date(r.submitted_at).toLocaleString()}</span>
                </div>
                {r.responses && typeof r.responses === "object" && !Array.isArray(r.responses) && (
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    {Object.entries(r.responses).map(([key, val]) => (
                      <p key={key}><span className="font-medium">{key}:</span> {String(val)}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {responses.length === 0 && <p className="text-center text-gray-400 py-8">No responses yet</p>}
        </div>
      )}
    </div>
  )
}
