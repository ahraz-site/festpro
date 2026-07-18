"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getEmailTemplates, upsertEmailTemplate, deleteEmailTemplate } from "@/lib/actions/communication"
import type { EmailTemplate } from "@/types/communication"
import { Loader2, FileText, Plus, Edit2, Trash2, Save } from "lucide-react"

export default function EmailTemplatesPage() {
  const festivalId = useParams().festivalId as string
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ template_name: "", subject: "", body_html: "", variables: "" })

  const load = useCallback(async () => {
    const res = await getEmailTemplates()
    setTemplates(res.data || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async (id?: string) => {
    if (!form.template_name || !form.body_html) { toast.error("Name and body required"); return }
    const res = await upsertEmailTemplate({ id, template_name: form.template_name, subject: form.subject, body_html: form.body_html, variables: form.variables ? form.variables.split(",").map(v => v.trim()) : [] })
    if (res.error) toast.error(res.error); else { toast.success(id ? "Updated" : "Created"); setEditing(null); setForm({ template_name: "", subject: "", body_html: "", variables: "" }); load() }
  }

  const handleDelete = async (id: string) => {
    await deleteEmailTemplate(id); toast.success("Deleted"); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">{templates.length} templates</p>
        </div>
        <Button onClick={() => { setEditing("new"); setForm({ template_name: "", subject: "", body_html: "", variables: "" }) }}><Plus className="h-4 w-4 mr-1" /> New Template</Button>
      </div>

      {editing === "new" && (
        <TemplateForm form={form} setForm={setForm} onSave={() => handleSave()} onCancel={() => setEditing(null)} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.length === 0 ? (
          <Card className="sm:col-span-2"><CardContent className="py-12 text-center text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No templates yet</p>
          </CardContent></Card>
        ) : templates.map(t => (
          <Card key={t.id}>
            <CardContent className="pt-4">
              {editing === t.id ? (
                <TemplateForm form={form} setForm={setForm} onSave={() => handleSave(t.id)} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{t.template_name}</p>
                      {t.subject && <p className="text-sm text-gray-500">Subject: {t.subject}</p>}
                      <p className="text-xs text-gray-400 mt-1">{t.variables?.length ? `Variables: ${t.variables.join(", ")}` : "No variables"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(t.id); setForm({ template_name: t.template_name, subject: t.subject || "", body_html: t.body_html, variables: t.variables?.join(", ") || "" }) }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">{t.body_html}</div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function TemplateForm({ form, setForm, onSave, onCancel }: { form: any; setForm: any; onSave: () => void; onCancel: () => void }) {
  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <Input value={form.template_name} onChange={e => setForm((f: any) => ({ ...f, template_name: e.target.value }))} placeholder="Template name *" />
        <Input value={form.subject} onChange={e => setForm((f: any) => ({ ...f, subject: e.target.value }))} placeholder="Subject (optional)" />
        <textarea value={form.body_html} onChange={e => setForm((f: any) => ({ ...f, body_html: e.target.value }))} placeholder="HTML body with {{variables}}..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[100px] font-mono" />
        <Input value={form.variables} onChange={e => setForm((f: any) => ({ ...f, variables: e.target.value }))} placeholder="Variables (comma-separated, e.g. name, festival_name)" />
        <div className="flex gap-2">
          <Button onClick={onSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}
