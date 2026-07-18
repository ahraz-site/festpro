import { getTranslationKeys, getLanguages } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TRANSLATION_STATUSES } from "@/config/localization"
import { Globe, Search, Filter } from "lucide-react"

interface Props { searchParams: Promise<{ pack_id?: string; namespace?: string; q?: string }> }

export default async function TranslationsPage({ searchParams }: Props) {
  const sp = await searchParams
  const [keysRes, langsRes] = await Promise.all([
    getTranslationKeys({ pack_id: sp.pack_id, namespace: sp.namespace, limit: 100 }),
    getLanguages(),
  ])
  if ("error" in keysRes) return <div className="text-red-500">{keysRes.error}</div>
  if ("error" in langsRes) return <div className="text-red-500">{langsRes.error}</div>
  const { data: keys, total } = keysRes

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Translations</h1>
        <p className="text-sm text-gray-500">Translation editor ({total} keys)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="flex items-center gap-1">
                <Search className="h-4 w-4 text-gray-400" />
                <input name="q" defaultValue={sp.q} placeholder="Search keys..." className="border rounded px-2 py-1.5 text-sm w-48" />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Apply</button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-4 w-4" /> Translation Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {keys.map((k) => {
              const vals = (k as any).translation_values ?? []
              const status = vals.length > 0 ? vals[0].status : "missing"
              const stCfg = TRANSLATION_STATUSES.find((s) => s.value === status)
              return (
                <div key={k.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{k.namespace}</span>
                      <span className="font-mono text-xs text-gray-900 font-medium">{k.key_name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? "bg-gray-100 text-gray-500"}`}>
                        {stCfg?.label ?? "Missing"}
                      </span>
                    </div>
                    {k.variables?.length > 0 && (
                      <div className="flex gap-1">
                        {k.variables.map((v) => <span key={v} className="text-xs bg-blue-50 text-blue-600 px-1 rounded">{`{${v}}`}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {langsRes.data.filter((l) => l.is_enabled).map((lang) => {
                      const val = vals.find((v: any) => v.language_id === lang.id)
                      return (
                        <div key={lang.id} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded px-1.5 py-0.5">
                          <span>{lang.code}</span>
                          <span className={val?.status === "approved" ? "text-green-600" : "text-gray-300"}>{(val?.value ?? "").slice(0, 20) || "—"}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {keys.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No translation keys found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
