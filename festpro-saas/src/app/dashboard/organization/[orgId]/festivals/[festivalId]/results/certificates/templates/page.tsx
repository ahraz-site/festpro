"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getTemplates, upsertTemplate, deleteTemplate } from "@/lib/actions/certificate"
import { CERTIFICATE_TYPES } from "@/config/result"
import type { CertificateTemplate } from "@/types/result"
import { Loader2, Plus, Save, Trash2, Edit3, FileText, Palette } from "lucide-react"

export default function TemplatesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ template_name: "", certificate_type: "participant", body_template: "", header_text: "", footer_text: "", orientation: "landscape", primary_color: "#1a365d", accent_color: "#d4af37" })

  const load = useCallback(async () => {
    const res = await getTemplates(festivalId)
    setTemplates(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.template_name || !form.body_template) { toast.error("Name and body template required"); return }
    const res = await upsertTemplate(festivalId, { id: editing || undefined, ...form })
    if (res.error) toast.error(res.error); else { toast.success("Template saved"); setEditing(null); load() }
  }

  const handleEdit = (t: CertificateTemplate) => {
    setEditing(t.id); setForm({
      template_name: t.template_name, certificate_type: t.certificate_type,
      body_template: t.body_template, header_text: t.header_text || "",
      footer_text: t.footer_text || "", orientation: t.orientation,
      primary_color: t.primary_color, accent_color: t.accent_color,
    })
  }

  const handleDelete = async (id: string) => {
    const res = await deleteTemplate(id)
    if (res.error) toast.error(res.error); else { toast.success("Template deleted"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Design certificate layouts with dynamic fields.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{editing ? "Edit Template" : "New Template"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Template name" value={form.template_name} onChange={e => setForm(f => ({ ...f, template_name: e.target.value }))} className="flex-1" />
            <select value={form.certificate_type} onChange={e => setForm(f => ({ ...f, certificate_type: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {CERTIFICATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.orientation} onChange={e => setForm(f => ({ ...f, orientation: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="landscape">Landscape</option><option value="portrait">Portrait</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Header text" value={form.header_text} onChange={e => setForm(f => ({ ...f, header_text: e.target.value }))} className="flex-1" />
            <Input placeholder="Footer text" value={form.footer_text} onChange={e => setForm(f => ({ ...f, footer_text: e.target.value }))} className="flex-1" />
          </div>
          <div className="flex gap-2">
            <Input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-16 p-1" />
            <Input type="color" value={form.accent_color} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))} className="w-16 p-1" />
          </div>
          <Textarea placeholder="Body template (use {{name}}, {{rank}}, {{competition}}, etc.)" value={form.body_template} onChange={e => setForm(f => ({ ...f, body_template: e.target.value }))} rows={4} />
          <p className="text-xs text-gray-400">Available variables: <code>{`{{name}}, {{rank}}, {{competition}}, {{grade}}, {{score}}, {{position}}, {{date}}, {{festival}}, {{certificate_number}}, {{verification_url}}`}</code></p>
          <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> {editing ? "Update" : "Create"} Template</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map(t => (
          <Card key={t.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                {t.template_name}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Edit3 className="h-3.5 w-3.5 text-gray-400" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 capitalize">{t.certificate_type} | {t.orientation} | v{t.version}</p>
              <div className="flex gap-2 mt-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: t.primary_color }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: t.accent_color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
