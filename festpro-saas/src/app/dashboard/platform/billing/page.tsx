import { getInvoices } from "@/lib/actions/saas-platform"
import { INVOICE_STATUSES } from "@/config/saas-platform"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function BillingPage(props: { searchParams?: Promise<{ status?: string; page?: string }> }) {
  const sp = await props.searchParams
  const result = await getInvoices({ status: sp?.status as any, page: Number(sp?.page) || 1, limit: 20 })
  if (result.error) return <div className="text-red-500">{result.error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-sm text-gray-500">{result.total} total invoices</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {INVOICE_STATUSES.slice(0, 4).map((s) => (
              <a key={s.value} href={`/dashboard/platform/billing?status=${s.value}`} className={`px-2 py-1 text-xs rounded-full ${sp?.status === s.value ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s.label}</a>
            ))}
            <a href="/dashboard/platform/billing" className={`px-2 py-1 text-xs rounded-full ${!sp?.status ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>All</a>
          </div>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Invoice</Button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Invoice</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Due</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.data?.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-indigo-600">{inv.invoice_number}</td>
                <td className="px-4 py-3">{inv.saas_tenants?.tenant_name || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.due_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right font-medium">${Number(inv.total).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUSES.find(s => s.value === inv.status)?.color || ""}`}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
