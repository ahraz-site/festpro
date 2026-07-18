"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getKnowledgeArticles, createKnowledgeArticle, deleteKnowledgeArticle, getKnowledgeCategories } from "@/lib/actions/help-desk"
import { Loader2, Plus, Trash2, BookOpen, Search } from "lucide-react"

export default function KnowledgePage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", category_id: "", tags: "" })

  const load = useCallback(async () => {
    const [aRes, cRes] = await Promise.all([getKnowledgeArticles(festivalId, categoryFilter || undefined), getKnowledgeCategories(festivalId)])
    if (aRes.data) setArticles(aRes.data)
    if (cRes.data) setCategories(cRes.data)
    setLoading(false)
  }, [festivalId, categoryFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title) return
    setLoading(true)
    await createKnowledgeArticle({ ...form, festival_id: festivalId, tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [] })
    setForm({ title: "", content: "", category_id: "", tags: "" }); setShowForm(false); load()
  }

  if (loading && articles.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add Article</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Article</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Category</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
            </div>
            <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="min-h-[200px]" /></div>
            <Button onClick={handleCreate}>Save Article</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant={categoryFilter === "" ? "default" : "outline"} size="sm" onClick={() => { setCategoryFilter(""); setLoading(true) }}>All</Button>
        {categories.map(c => (
          <Button key={c.id} variant={categoryFilter === c.id ? "default" : "outline"} size="sm" onClick={() => { setCategoryFilter(c.id); setLoading(true) }}>{c.name}</Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-gray-400" /><span className="text-xs text-gray-500">{a.knowledge_base_categories?.name || "Uncategorized"}</span></div>
                <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await deleteKnowledgeArticle(a.id); load() } }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
              <p className="text-sm font-semibold mt-2">{a.title}</p>
              {a.content && <p className="text-xs text-gray-500 mt-1 line-clamp-3">{a.content}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>{a.view_count} views</span>
                <span>{a.helpful_count} helpful</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {articles.length === 0 && <p className="text-center text-gray-400 py-8 col-span-3">No articles yet</p>}
      </div>
    </div>
  )
}
