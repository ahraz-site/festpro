import { getKnowledgeSources, getKnowledgeDocuments } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KNOWLEDGE_SOURCE_TYPES } from "@/config/ai-platform"
import { Database, FileText, Search } from "lucide-react"

export default async function KnowledgePage() {
  const [sourcesRes, docsRes] = await Promise.all([
    getKnowledgeSources(), getKnowledgeDocuments(),
  ])
  if ("error" in sourcesRes) return <div className="text-red-500">{sourcesRes.error}</div>
  if ("error" in docsRes) return <div className="text-red-500">{docsRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-sm text-gray-500">Manage knowledge sources and indexed documents</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Database className="h-4 w-4" /> Knowledge Sources ({sourcesRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sourcesRes.data.map((s) => {
              const tpCfg = KNOWLEDGE_SOURCE_TYPES.find((t) => t.value === s.source_type)
              return (
                <div key={s.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{s.source_name}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{tpCfg?.label ?? s.source_type}</span>
                  {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                  {s.last_synced_at && <p className="text-xs text-gray-400 mt-1">Last synced: {new Date(s.last_synced_at).toLocaleString()}</p>}
                </div>
              )
            })}
            {sourcesRes.data.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-4 text-center">No knowledge sources configured</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-4 w-4" /> Documents ({docsRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {docsRes.data.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    d.status === "indexed" ? "bg-green-100 text-green-700" :
                    d.status === "indexing" ? "bg-blue-100 text-blue-700" :
                    d.status === "failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}>{d.status}</span>
                  <span className="font-medium text-gray-900 truncate">{d.document_title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                  <span>{d.chunk_count} chunks</span>
                  <span>{d.document_type}</span>
                </div>
              </div>
            ))}
            {docsRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No documents indexed yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
