import { getTranslationImports, getTranslationExports } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IMPORT_EXPORT_FORMATS } from "@/config/localization"
import { Upload, Download } from "lucide-react"

export default async function ImportsPage() {
  const [importsRes, exportsRes] = await Promise.all([getTranslationImports(), getTranslationExports()])
  if ("error" in importsRes) return <div className="text-red-500">{importsRes.error}</div>
  if ("error" in exportsRes) return <div className="text-red-500">{exportsRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-sm text-gray-500">Bulk translation import and export in multiple formats</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-4 w-4" /> Recent Imports ({importsRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {importsRes.data.map((i) => {
              const lang = i as any
              return (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      i.status === "completed" ? "bg-green-100 text-green-700" :
                      i.status === "failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                    }`}>{i.status}</span>
                    <span className="text-gray-900">{i.file_name}</span>
                    <span className="text-xs text-gray-400">{lang.languages?.name ?? i.language_id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{i.imported_keys}/{i.total_keys} keys</span>
                    {i.failed_keys > 0 && <span className="text-red-500">{i.failed_keys} failed</span>}
                    <span>{new Date(i.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
            {importsRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No imports yet</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Download className="h-4 w-4" /> Recent Exports ({exportsRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exportsRes.data.map((e) => {
              const lang = e as any; const pack = e as any
              return (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{e.export_format}</span>
                    <span className="text-gray-900">{lang.languages?.name ?? e.language_id}</span>
                    {pack.language_packs?.pack_name && <span className="text-xs text-gray-400">{pack.language_packs.pack_name}</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>{e.key_count} keys</span>
                    <span className="ml-3">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
            {exportsRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No exports yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
