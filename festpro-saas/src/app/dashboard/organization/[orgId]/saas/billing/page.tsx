import { getMyTenant, getMyInvoices } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INVOICE_STATUSES, BILLING_CYCLES } from "@/config/saas-platform"
import { DollarSign, CreditCard, Building2 } from "lucide-react"

export default async function BillingPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const [tenantRes, invRes] = await Promise.all([getMyTenant(orgId), getMyInvoices(orgId)])
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!
  const totalPaid = invRes.data?.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.total || 0), 0) || 0
  const totalDue = invRes.data?.filter((i: any) => i.status !== "paid" && i.status !== "cancelled").reduce((s: number, i: any) => s + Number(i.total || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500">Invoices and payment history</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalDue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Currency</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{t.currency}</div></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Invoice History</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-200"><th className="pb-3">Invoice</th><th className="pb-3">Date</th><th className="pb-3">Due</th><th className="pb-3 text-right">Amount</th><th className="pb-3">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {invRes.data?.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="py-2 font-mono text-xs">{inv.invoice_number}</td>
                  <td className="py-2 text-gray-500">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td className="py-2 text-gray-500">{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td className="py-2 text-right font-medium">${Number(inv.total).toFixed(2)}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUSES.find(s => s.value === inv.status)?.color || ""}`}>{inv.status}</span></td>
                </tr>
              )) || <tr><td colSpan={5} className="py-4 text-center text-gray-400">No invoices</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
