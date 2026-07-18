"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getFestivalGallery, createFestivalGalleryItem, deleteFestivalGalleryItem, uploadFile } from "@/lib/actions/festival"
import type { FestivalGalleryItem } from "@/types/festival"
import { Plus, Loader2, Trash2, Image, Upload, X } from "lucide-react"

export default function FestivalGalleryPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [items, setItems] = useState<FestivalGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("general")

  async function load() {
    const data = await getFestivalGallery(festivalId)
    setItems(data as FestivalGalleryItem[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const result = await uploadFile(festivalId, "festival-gallery", file, `gallery/${category}`)
    if (result.error) { toast.error(result.error) }
    else if (result.url) {
      const r = await createFestivalGalleryItem(festivalId, { title: title || undefined, file_url: result.url, gallery_type: file.type.startsWith("video") ? "video" : "image", category })
      if (r.error) toast.error(r.error)
      else { toast.success("Uploaded!"); setTitle(""); setShowUpload(false) }
    }
    setUploading(false)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return
    const result = await deleteFestivalGalleryItem(id)
    if (result.error) toast.error(result.error)
    else toast.success("Deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage festival photos and videos.</p>
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
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Photo title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: "general", label: "General" }, { value: "inauguration", label: "Inauguration" }, { value: "events", label: "Events" }, { value: "cultural", label: "Cultural" }, { value: "sports", label: "Sports" }, { value: "valedictory", label: "Valedictory" }]} />
              </div>
            </div>
            <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500">Click to upload images or videos</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No gallery items yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="relative aspect-square">
                {item.gallery_type === "video" ? (
                  <video src={item.file_url} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={item.file_url} alt={item.title || ""} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title || "Untitled"}</p>
                <p className="text-xs text-gray-500 capitalize">{item.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
