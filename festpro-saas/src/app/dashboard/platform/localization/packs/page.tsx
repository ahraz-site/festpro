import { getLanguagePacks } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileKey } from "lucide-react"

export default async function LanguagePacksPage() {
  const result = await getLanguagePacks()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const packs = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Language Packs</h1>
        <p className="text-sm text-gray-500">Translation packs with coverage tracking</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((p) => {
          const lang = p as any
          return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <FileKey className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium">{p.pack_name}</CardTitle>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {p.is_active ? "Active" : "Inactive"}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Language</span>
                  <span>{lang.languages?.name ?? p.language_id} ({lang.languages?.code ?? ""})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span>{p.pack_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Keys</span>
                  <span>{p.translated_keys}/{p.total_keys}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Coverage</span>
                    <span className={p.coverage_percent >= 80 ? "text-green-600" : p.coverage_percent >= 50 ? "text-amber-600" : "text-red-600"}>
                      {p.coverage_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${
                      p.coverage_percent >= 80 ? "bg-green-500" : p.coverage_percent >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`} style={{ width: `${p.coverage_percent}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {packs.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-4 text-center">No language packs configured</p>}
      </div>
    </div>
  )
}
