"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getTaskLists, upsertTaskList, upsertTask, updateTaskStatus } from "@/lib/actions/volunteer"
import { STAFF_DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES } from "@/config/volunteer"
import { Loader2, Plus, Pencil, X, CheckCircle, Circle, AlertTriangle, Trash2 } from "lucide-react"

export default function TasksPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [taskLists, setTaskLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [filterDept, setFilterDept] = useState("")
  const [form, setForm] = useState({ title: "", description: "", department: "" })
  const [taskForm, setTaskForm] = useState({ task_list_id: "", title: "", description: "", priority: "medium", assigned_to: "", assigned_staff: "", due_date: "" })

  const load = useCallback(async () => {
    const res = await getTaskLists(festivalId, filterDept || undefined)
    setTaskLists(res.data || []); setLoading(false)
  }, [festivalId, filterDept])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertTaskList({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ title: "", description: "", department: "" })
    load()
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertTask(taskForm)
    setShowTaskForm(false); setTaskForm({ task_list_id: "", title: "", description: "", priority: "medium", assigned_to: "", assigned_staff: "", due_date: "" })
    load()
  }

  const handleEdit = (tl: any) => {
    setForm({ title: tl.title, description: tl.description || "", department: tl.department || "" })
    setEditingId(tl.id); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Lists</h1>
          <p className="text-sm text-gray-500 mt-1">{taskLists.length} task lists.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSelectedListId(null); setShowTaskForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Task</Button>
          <Button onClick={() => { setEditingId(null); setForm({ title: "", description: "", department: "" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> New List</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Task List" : "New Task List"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Department</label>
                <Select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Select department" options={[{ value: "", label: "General" }, ...STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))]} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showTaskForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Task</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTaskForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleTaskSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Task List</label>
                <Select value={taskForm.task_list_id} onChange={e => setTaskForm(f => ({ ...f, task_list_id: e.target.value }))} placeholder="Select list" options={taskLists.map(tl => ({ value: tl.id, label: tl.title }))} />
              </div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Priority</label>
                <Select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} options={TASK_PRIORITIES.map(p => ({ value: p.value, label: p.label }))} />
              </div>
              <div><label className="text-sm font-medium">Due Date</label><Input type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Select value={filterDept} onChange={e => setFilterDept(e.target.value)} placeholder="All Departments" options={[{ value: "", label: "All Departments" }, ...STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))]} className="w-48" />

      <div className="grid gap-6 md:grid-cols-2">
        {taskLists.map(tl => (
          <Card key={tl.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{tl.title}</CardTitle>
                  {tl.description && <p className="text-xs text-gray-500 mt-0.5">{tl.description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(tl)}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tl.tasks && tl.tasks.length > 0 ? tl.tasks.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <button onClick={async () => { await updateTaskStatus(t.id, t.status === "completed" ? "pending" : "completed"); load() }} className="mt-0.5">
                    {t.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-300" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.status === "completed" ? "line-through text-gray-400" : ""}`}>{t.title}</p>
                    {t.due_date && <p className="text-xs text-gray-400">Due: {t.due_date}</p>}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${TASK_PRIORITIES.find(p => p.value === t.priority)?.color || "bg-gray-100"}`}>
                    {t.priority}
                  </span>
                </div>
              )) : <p className="text-sm text-gray-400 py-2">No tasks in this list.</p>}
              <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => { setSelectedListId(tl.id); setTaskForm(f => ({ ...f, task_list_id: tl.id })); setShowTaskForm(true) }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Task
              </Button>
            </CardContent>
          </Card>
        ))}
        {taskLists.length === 0 && <p className="text-gray-500 col-span-2 text-center py-8">No task lists created.</p>}
      </div>
    </div>
  )
}
