import { getRetentionRules } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RETENTION_ACTIONS } from "@/config/edms"
import { Shield, Clock } from "lucide-react"

export default async function RetentionPage() {
  const result = await getRetentionRules()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const rules = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Retention Rules</h1>
        <p className="text-sm text-gray-500">Document retention policies and legal holds</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((r) => {
          const actCfg = RETENTION_ACTIONS.find((a) => a.value === r.action_on_expiry)
          const cat = r as any
          return (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium">{r.rule_name}</CardTitle>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {r.is_active ? "Active" : "Inactive"}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{r.retention_days} days</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{actCfg?.label ?? r.action_on_expiry}</span>
                </div>
                {r.is_legal_hold && <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">Legal Hold</span>}
                {cat.document_categories?.category_name && <p className="text-xs text-gray-400">Category: {cat.document_categories.category_name}</p>}
              </CardContent>
            </Card>
          )
        })}
        {rules.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-4 text-center">No retention rules configured</p>}
      </div>
    </div>
  )
}
