import { getPrompts } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers } from "lucide-react"

export default async function PromptsPage() {
  const result = await getPrompts({ limit: 100 })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: prompts, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prompt Library</h1>
        <p className="text-sm text-gray-500">Manage AI prompt templates ({total} prompts)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-4 w-4" /> Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {prompts.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border text-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{p.prompt_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{p.prompt_category}</span>
                    <span className="text-xs text-gray-400">v{p.version}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{p.prompt_text}</p>
                {p.prompt_variables?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {p.prompt_variables.map((v) => <span key={v} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{v}</span>)}
                  </div>
                )}
              </div>
            ))}
            {prompts.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No prompts created yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
