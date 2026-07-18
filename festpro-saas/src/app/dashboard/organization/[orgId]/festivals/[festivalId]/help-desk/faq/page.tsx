"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getFaqItems, createFaqItem, deleteFaqItem, getKnowledgeCategories } from "@/lib/actions/help-desk"
import { Loader2, Plus, Trash2, HelpCircle } from "lucide-react"

export default function FaqPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: "", answer: "", category_id: "" })

  const load = useCallback(async () => {
    const [iRes, cRes] = await Promise.all([getFaqItems(festivalId), getKnowledgeCategories(festivalId)])
    if (iRes.data) setItems(iRes.data)
    if (cRes.data) setCategories(cRes.data)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.question || !form.answer) return
    await createFaqItem({ ...form, festival_id: festivalId })
    setForm({ question: "", answer: "", category_id: "" }); setShowForm(false); load()
  }

  if (loading && items.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add FAQ</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New FAQ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Question *</Label><Input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} /></div>
              <div><Label>Category</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>
            <div><Label>Answer *</Label><Textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} className="min-h-[120px]" /></div>
            <Button onClick={handleCreate}>Save FAQ</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-semibold">{item.question}</span>
                    {item.knowledge_base_categories && <span className="text-xs text-gray-400">{item.knowledge_base_categories.name}</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.answer}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await deleteFaqItem(item.id); load() } }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No FAQs yet</p>}
      </div>
    </div>
  )
}
