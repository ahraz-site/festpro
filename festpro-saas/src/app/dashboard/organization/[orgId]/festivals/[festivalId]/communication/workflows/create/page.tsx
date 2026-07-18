"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { upsertWorkflow, getWorkflows } from "@/lib/actions/communication"
import { WORKFLOW_TRIGGER_TYPES, WORKFLOW_STATUSES, WORKFLOW_ACTIONS, AUTOMATIC_EVENTS } from "@/config/communication"
import { Loader2, Save, Zap } from "lucide-react"

export default function WorkflowCreatePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const festivalId = params.festivalId as string
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    rule_name: "", description: "", trigger_type: "notification_sent", trigger_event: "",
    condition_type: "equals", condition_field: "", condition_value: "",
    action_type: "send_notification", action_target: "", action_params: "{}",
    status: "draft", priority: 0, cooldown_minutes: 0,
  })

  useEffect(() => {
    if (editId) {
      (async () => {
        const res = await getWorkflows(festivalId)
        const w = res.data?.find((x: any) => x.id === editId)
        if (w) {
          const cond = w.conditions || {}
          const act = w.actions || {}
          setForm({
            rule_name: w.rule_name, description: w.description || "", trigger_type: w.trigger_type, trigger_event: w.trigger_event || "",
            condition_type: cond.type || "", condition_field: cond.field || "", condition_value: cond.value || "",
            action_type: act.type || "", action_target: act.target || "", action_params: typeof act.params === "object" ? JSON.stringify(act.params) : act.params || "{}",
            status: w.status, priority: w.priority, cooldown_minutes: cond.cooldown || 0,
          })
        }
      })()
    }
  }, [editId, festivalId])

  const handleSubmit = async () => {
    if (!form.rule_name || !form.trigger_type || !form.action_type) { toast.error("Name, trigger, and action required"); return }
    setLoading(true)
    const res = await upsertWorkflow({
      id: editId || undefined, festival_id: festivalId,
      rule_name: form.rule_name, description: form.description || undefined,
      trigger_type: form.trigger_type, trigger_event: form.trigger_event || undefined,
      condition_type: form.condition_type, condition_field: form.condition_field || undefined, condition_value: form.condition_value || undefined,
      action_type: form.action_type, action_target: form.action_target || undefined,
      action_params: form.action_params ? JSON.parse(form.action_params) : undefined,
      status: form.status, priority: form.priority, cooldown_minutes: form.cooldown_minutes,
    })
    setLoading(false)
    if (res.error) toast.error(res.error)
    else { toast.success(editId ? "Updated" : "Created"); router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/workflows`) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{editId ? "Edit" : "Create"} Workflow Rule</h1>
        <p className="text-sm text-gray-500 mt-1">Automate actions when events occur.</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <Input value={form.rule_name} onChange={e => setForm(f => ({ ...f, rule_name: e.target.value }))} placeholder="Rule name * (e.g. Notify judges when scores submitted)" />

          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[60px]" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Trigger Type *</label>
              <Select options={WORKFLOW_TRIGGER_TYPES.map(t => ({ value: t.value, label: t.label }))} value={form.trigger_type} onChange={e => setForm(f => ({ ...f, trigger_type: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Trigger Event</label>
              <Select options={AUTOMATIC_EVENTS.map(e => ({ value: e.value, label: e.label }))} value={form.trigger_event} onChange={e => setForm(f => ({ ...f, trigger_event: e.target.value }))} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Conditions (optional)</p>
            <div className="grid grid-cols-3 gap-3">
              <Select options={[{ value: "equals", label: "Equals" }, { value: "contains", label: "Contains" }, { value: "greater_than", label: "Greater Than" }, { value: "less_than", label: "Less Than" }, { value: "not_equals", label: "Not Equals" }]} value={form.condition_type} onChange={e => setForm(f => ({ ...f, condition_type: e.target.value }))} />
              <Input value={form.condition_field} onChange={e => setForm(f => ({ ...f, condition_field: e.target.value }))} placeholder="Field (e.g. score)" />
              <Input value={form.condition_value} onChange={e => setForm(f => ({ ...f, condition_value: e.target.value }))} placeholder="Value (e.g. 80)" />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Action *</p>
            <div className="grid grid-cols-2 gap-3">
              <Select options={WORKFLOW_ACTIONS.map(a => ({ value: a.value, label: a.label }))} value={form.action_type} onChange={e => setForm(f => ({ ...f, action_type: e.target.value }))} />
              <Input value={form.action_target} onChange={e => setForm(f => ({ ...f, action_target: e.target.value }))} placeholder="Target (user_id, role, email, etc.)" />
            </div>
            <div className="mt-3">
              <textarea value={form.action_params} onChange={e => setForm(f => ({ ...f, action_params: e.target.value }))} placeholder={'Action params as JSON (optional, e.g. {"template_id": "..."})'}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[60px] font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select options={WORKFLOW_STATUSES.map(s => ({ value: s.value, label: s.label }))} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
              <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cooldown (minutes)</label>
              <input type="number" value={form.cooldown_minutes} onChange={e => setForm(f => ({ ...f, cooldown_minutes: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              {editId ? "Update Rule" : "Create Rule"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
