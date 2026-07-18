"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getFestivalDocuments, createFestivalDocument, deleteFestivalDocument, uploadFile } from "@/lib/actions/festival"
import type { FestivalDocument } from "@/types/festival"
import { Plus, Loader2, Trash2, FileText, Upload, Download, ExternalLink } from "lucide-react"

export default function FestivalDocumentsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [docs, setDocs] = useState<FestivalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")

  async function load() {
    const data = await getFestivalDocuments(festivalId)
    setDocs(data as FestivalDocument[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!title.trim()) { toast.error("Title is required"); return }
    setUploading(true)
    const result = await uploadFile(festivalId, "festival-documents", file, `docs/${category}`)
    if (result.error) { toast.error(result.error) }
    else if (result.url) {
      const r = await createFestivalDocument(festivalId, { title, description: description || undefined, file_url: result.url, file_type: file.type, category })
      if (r.error) toast.error(r.error)
      else { toast.success("Document uploaded!"); setTitle(""); setDescription(""); setShowUpload(false) }
    }
    setUploading(false)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return
    const result = await deleteFestivalDocument(id)
    if (result.error) toast.error(result.error)
    else toast.success("Document deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Upload rules, brochures, schedules, and circulars.</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload
        </Button>
      </div>

      {showUpload && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Festival Rules" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: "general", label: "General" }, { value: "rules", label: "Rules" }, { value: "schedule", label: "Schedule" }, { value: "brochure", label: "Brochure" }, { value: "circular", label: "Circular" }, { value: "form", label: "Form" }]} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload document (PDF, DOC, TXT)</span>
              <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </CardContent>
        </Card>
      )}

      {docs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents uploaded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {doc.description && <span>{doc.description}</span>}
                      <span className="capitalize">{doc.category}</span>
                      {doc.file_size && <span>({(doc.file_size / 1024).toFixed(0)} KB)</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Download className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
