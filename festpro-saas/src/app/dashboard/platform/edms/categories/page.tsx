import { getDocumentCategories, getDocumentTags } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, Tag } from "lucide-react"

export default async function CategoriesPage() {
  const [catRes, tagRes] = await Promise.all([getDocumentCategories(), getDocumentTags()])
  if ("error" in catRes) return <div className="text-red-500">{catRes.error}</div>
  if ("error" in tagRes) return <div className="text-red-500">{tagRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories & Tags</h1>
        <p className="text-sm text-gray-500">Organize documents with categories and tags</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Folder className="h-4 w-4" /> Categories ({catRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {catRes.data.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border text-sm flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: c.color || "#f3f4f6" }}>
                  {c.icon || <Folder className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{c.category_name}</p>
                  {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                </div>
              </div>
            ))}
            {catRes.data.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-4 text-center">No categories defined</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Tag className="h-4 w-4" /> Tags ({tagRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {tagRes.data.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <Tag className="h-3 w-3" /> {t.tag_name}
                <span className="text-gray-400 ml-1">({t.usage_count})</span>
              </span>
            ))}
            {tagRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No tags defined</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
