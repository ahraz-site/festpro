import { getFileImports, getImportTemplates } from "@/lib/actions/integration-hub"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IMPORT_STATUSES } from "@/config/integration-hub"
import { Upload, FileText, Plus } from "lucide-react"

export default async function ImportsPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const [impRes, tmpRes] = await Promise.all([getFileImports(orgId), getImportTemplates(orgId)])
  if (impRes.error) return <div className="text-red-500">{impRes.error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">File Imports</h1><p className="text-sm text-gray-500">{impRes.data?.length || 0} imports · {tmpRes.data?.length || 0} templates</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> Templates</Button>
          <Button size="sm"><Upload className="h-4 w-4 mr-1" /> New Import</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">File</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Template</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Format</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Rows</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {impRes.data?.map((imp: any) => (
                <tr key={imp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{imp.filename}</td>
                  <td className="px-4 py-3 text-gray-500">{imp.import_templates?.template_name || "-"}</td>
                  <td className="px-4 py-3 text-xs font-mono uppercase">{imp.format}</td>
                  <td className="px-4 py-3 text-gray-500">{imp.processed_rows}/{imp.total_rows}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${IMPORT_STATUSES.find(s => s.value === imp.status)?.color || ""}`}>{imp.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(imp.created_at).toLocaleString()}</td>
                </tr>
              )) || <tr><td colSpan={6} className="py-8 text-center text-gray-400">No imports yet</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
