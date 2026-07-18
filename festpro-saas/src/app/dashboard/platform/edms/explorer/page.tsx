import { getDocuments, getFolders, getFolderTree } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from "@/config/edms"
import { FileText, Folder, Search, Filter } from "lucide-react"
import type { Document } from "@/types/edms"

interface Props { searchParams: Promise<{ folder_id?: string; status?: string; type?: string; q?: string }> }

async function FolderTree({ organizationId }: { organizationId: string }) {
  const result = await getFolderTree(organizationId)
  if ("error" in result) return <p className="text-sm text-red-500">{result.error}</p>
  const renderTree = (nodes: any[], depth = 0) => (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <div key={node.id}>
          <a href={`/dashboard/platform/edms/explorer?folder_id=${node.id}`}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded">
            <Folder className="h-3 w-3" />
            <span className="truncate">{node.folder_name}</span>
          </a>
          {node.children?.length > 0 && <div className="ml-3">{renderTree(node.children, depth + 1)}</div>}
        </div>
      ))}
    </div>
  )
  return renderTree(result.data)
}

export default async function ExplorerPage({ searchParams }: Props) {
  const sp = await searchParams
  const [docsRes, foldersRes] = await Promise.all([
    getDocuments({ folder_id: sp.folder_id, status: sp.status, type: sp.type, limit: 100 }),
    getFolders("00000000-0000-0000-0000-000000000000"),
  ]) as any
  if ("error" in docsRes) return <div className="text-red-500">{docsRes.error}</div>
  const { data: docs, total } = docsRes

  const wrapDoc = (doc: Document) => doc

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Explorer</h1>
        <p className="text-sm text-gray-500">Browse, search & manage documents</p>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Folder className="h-4 w-4" /> Folders</CardTitle>
            </CardHeader>
            <CardContent className="text-sm max-h-[500px] overflow-y-auto">
              <a href="/dashboard/platform/edms/explorer"
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded mb-1">
                <Folder className="h-3 w-3" /> All Documents
              </a>
              <FolderTree organizationId="00000000-0000-0000-0000-000000000000" />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-9">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{total} Documents</CardTitle>
                <form className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input name="q" defaultValue={sp.q} placeholder="Search..." className="border rounded px-2 py-1 text-xs w-40" />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Search</button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {docs.map((doc: Document) => {
                  const stCfg = DOCUMENT_STATUSES.find((s) => s.value === doc.status)
                  const tpCfg = DOCUMENT_TYPES.find((t) => t.value === doc.document_type)
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm hover:bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? doc.status}</span>
                        <span className="font-medium text-gray-900 truncate">{doc.document_title}</span>
                        <span className="text-xs text-gray-400">{tpCfg?.label ?? doc.document_type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                        <span>v{doc.current_version}</span>
                        {(doc as any).document_folders?.folder_name && <span>{(doc as any).document_folders.folder_name}</span>}
                        <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })}
                {docs.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">No documents found</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
