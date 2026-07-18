"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getCrmActivities, createCrmActivity, getCrmTasks, upsertCrmTask, updateCrmTaskStatus, getCrmNotes, createCrmNote } from "@/lib/actions/sponsor-crm"
import { CRM_ACTIVITY_TYPES } from "@/config/sponsor-crm"
import type { CrmActivity, CrmTask, CrmNote } from "@/types/sponsor-crm"
import { Loader2, Plus, X, Phone, Users, Mail, FileText, Bell, CheckCircle, MessageSquare, CalendarDays, User, Clock, CheckSquare } from "lucide-react"

const activityIcons: Record<string, any> = { call: Phone, meeting: Users, email: Mail, note: FileText, followup: Bell, task: CheckCircle, whatsapp: MessageSquare, sms: MessageSquare }

export default function CrmPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [tasks, setTasks] = useState<CrmTask[]>([])
  const [notes, setNotes] = useState<CrmNote[]>([])
  const [loading, setLoading] = useState(true)
  const [entityType, setEntityType] = useState("sponsor")
  const [entityId, setEntityId] = useState("")
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [actForm, setActForm] = useState({ activity_type: "call", subject: "", description: "", outcome: "" })
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", assigned_to: "", due_date: "" })
  const [noteForm, setNoteForm] = useState({ content: "" })

  const loadAll = useCallback(async () => {
    if (!entityId) { setLoading(false); return }
    const [aRes, tRes, nRes] = await Promise.all([
      getCrmActivities(entityType, entityId),
      getCrmTasks(entityType, entityId),
      getCrmNotes(entityType, entityId),
    ])
    setActivities(aRes.data || []); setTasks(tRes.data || []); setNotes(nRes.data || []); setLoading(false)
  }, [entityType, entityId])

  useEffect(() => { if (entityId) { setLoading(true); loadAll() } else { setLoading(false) } }, [loadAll, entityId])

  const handleActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCrmActivity({ entity_type: entityType, entity_id: entityId, ...actForm })
    setShowActivityForm(false); setActForm({ activity_type: "call", subject: "", description: "", outcome: "" }); loadAll()
  }

  const handleTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertCrmTask({ ...taskForm, entity_type: entityType, entity_id: entityId })
    setShowTaskForm(false); setTaskForm({ title: "", description: "", priority: "medium", assigned_to: "", due_date: "" }); loadAll()
  }

  const handleNote = async (e: React.FormEvent) => {
    e.preventDefault()
    await createCrmNote({ entity_type: entityType, entity_id: entityId, content: noteForm.content })
    setShowNoteForm(false); setNoteForm({ content: "" }); loadAll()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
      </div>

      <div className="flex gap-3 items-end">
        <div>
          <label className="text-sm font-medium">Entity Type</label>
          <Select value={entityType} onChange={e => setEntityType(e.target.value)} options={[
            { value: "sponsor", label: "Sponsor" },
            { value: "donor", label: "Donor" },
            { value: "collector", label: "Collector" },
          ]} className="w-40" />
        </div>
        <div>
          <label className="text-sm font-medium">Entity ID</label>
          <Input value={entityId} onChange={e => setEntityId(e.target.value)} placeholder="UUID or search..." className="w-64" />
        </div>
        {entityId && (
          <>
            <Button size="sm" variant="outline" onClick={() => setShowActivityForm(true)}><Plus className="h-4 w-4 mr-1" /> Log Activity</Button>
            <Button size="sm" variant="outline" onClick={() => setShowTaskForm(true)}><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNoteForm(true)}><Plus className="h-4 w-4 mr-1" /> Add Note</Button>
          </>
        )}
      </div>

      {showActivityForm && (
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Log Activity</h2><Button variant="ghost" size="sm" onClick={() => setShowActivityForm(false)}><X className="h-4 w-4" /></Button></div>
          <form onSubmit={handleActivity} className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-sm font-medium">Type</label>
              <Select value={actForm.activity_type} onChange={e => setActForm(f => ({ ...f, activity_type: e.target.value }))} options={CRM_ACTIVITY_TYPES.map(at => ({ value: at.value, label: at.label }))} />
            </div>
            <div><label className="text-sm font-medium">Subject *</label><Input value={actForm.subject} onChange={e => setActForm(f => ({ ...f, subject: e.target.value }))} required /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={actForm.description} onChange={e => setActForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Outcome</label><Input value={actForm.outcome} onChange={e => setActForm(f => ({ ...f, outcome: e.target.value }))} /></div>
            <div className="sm:col-span-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowActivityForm(false)}>Cancel</Button><Button type="submit">Log</Button></div>
          </form>
        </CardContent></Card>
      )}

      {showTaskForm && (
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">New Task</h2><Button variant="ghost" size="sm" onClick={() => setShowTaskForm(false)}><X className="h-4 w-4" /></Button></div>
          <form onSubmit={handleTask} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className="text-sm font-medium">Priority</label>
              <Select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} />
            </div>
            <div><label className="text-sm font-medium">Due Date</label><Input type="datetime-local" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} /></div>
            <div className="sm:col-span-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>Cancel</Button><Button type="submit">Create</Button></div>
          </form>
        </CardContent></Card>
      )}

      {showNoteForm && (
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Add Note</h2><Button variant="ghost" size="sm" onClick={() => setShowNoteForm(false)}><X className="h-4 w-4" /></Button></div>
          <form onSubmit={handleNote} className="space-y-4">
            <Textarea value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))} placeholder="Write a note..." required />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowNoteForm(false)}>Cancel</Button><Button type="submit">Save</Button></div>
          </form>
        </CardContent></Card>
      )}

      {!entityId ? (
        <p className="text-gray-500 text-center py-8">Enter an entity ID above to view CRM activities, tasks, and notes.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg"><Clock className="h-5 w-5 inline mr-1" /> Activity Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {activities.map(a => {
                  const AIcon = activityIcons[a.activity_type] || Phone
                  const actType = CRM_ACTIVITY_TYPES.find(at => at.value === a.activity_type)
                  return (
                    <div key={a.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${actType?.color || "bg-gray-100"}`}>
                        <AIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{a.subject}</p>
                        {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                        {a.outcome && <p className="text-xs text-green-600 mt-0.5">{a.outcome}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(a.performed_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
                {activities.length === 0 && <p className="text-gray-500 text-center py-4">No activities logged.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg"><FileText className="h-5 w-5 inline mr-1" /> Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {notes.map(n => (
                  <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {notes.length === 0 && <p className="text-gray-500 text-center py-4">No notes added.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg"><CheckSquare className="h-5 w-5 inline mr-1" /> Tasks</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-start gap-2 p-2 border border-gray-200 rounded-lg">
                    <button onClick={async () => { await updateCrmTaskStatus(t.id, t.status === "completed" ? "pending" : "completed"); loadAll() }} className="mt-0.5">
                      {t.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${t.status === "completed" ? "line-through text-gray-400" : ""}`}>{t.title}</p>
                      {t.due_date && <p className="text-xs text-gray-400"><CalendarDays className="h-3 w-3 inline" /> {new Date(t.due_date).toLocaleDateString()}</p>}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${t.priority === "urgent" ? "bg-red-100 text-red-700" : t.priority === "high" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-gray-500 text-center py-4">No tasks.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
