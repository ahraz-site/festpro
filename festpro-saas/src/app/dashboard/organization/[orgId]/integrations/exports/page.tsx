import { getFileExports } from "@/lib/actions/integration-hub"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EXPORT_FORMATS } from "@/config/integration-hub"
import { Download, Plus } from "lucide-react"

export default async function ExportsPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const result = await getFileExports(orgId)
  if (result.error) return <div className="text-red-500">{result.error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">File Exports</h1><p className="text-sm text-gray-500">{result.data?.length || 0} exports</p></div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Export</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Format</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Records</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.data?.map((exp: any) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{exp.export_name}</td>
                  <td className="px-4 py-3 text-gray-500">{exp.entity_type}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-gray-100 rounded-full">{EXPORT_FORMATS.find(f => f.value === exp.format)?.label || exp.format}</span></td>
                  <td className="px-4 py-3 text-gray-500">{exp.total_records}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${exp.status === "completed" ? "bg-green-100 text-green-700" : exp.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{exp.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(exp.created_at).toLocaleString()}</td>
                </tr>
              )) || <tr><td colSpan={6} className="py-8 text-center text-gray-400">No exports yet</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
