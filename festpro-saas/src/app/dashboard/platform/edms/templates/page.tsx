import { getTemplates } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TEMPLATE_TYPES } from "@/config/edms"
import { CheckCircle, FileText } from "lucide-react"

export default async function TemplatesPage() {
  const result = await getTemplates()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const templates = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
        <p className="text-sm text-gray-500">Templates for certificates, invoices, letters & reports</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => {
          const tpCfg = TEMPLATE_TYPES.find((tp) => tp.value === t.template_type)
          const cat = t as any
          return (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium">{t.template_name}</CardTitle>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${t.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {t.is_active ? "Active" : "Inactive"}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span>{tpCfg?.label ?? t.template_type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Version</span><span>v{t.current_version}</span></div>
                {cat.document_categories?.category_name && (
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{cat.document_categories.category_name}</span></div>
                )}
                {t.variables?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {t.variables.map((v) => <span key={v} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{`{${v}}`}</span>)}
                  </div>
                )}
                {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
              </CardContent>
            </Card>
          )
        })}
        {templates.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-4 text-center">No templates created</p>}
      </div>
    </div>
  )
}
