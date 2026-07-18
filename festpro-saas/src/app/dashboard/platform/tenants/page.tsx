import Link from "next/link"
import { getTenants } from "@/lib/actions/saas-platform"
import { TENANT_STATUSES } from "@/config/saas-platform"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function TenantsPage(props: { searchParams?: Promise<{ status?: string; search?: string; page?: string }> }) {
  const sp = await props.searchParams
  const result = await getTenants({ status: sp?.status, search: sp?.search, page: Number(sp?.page) || 1, limit: 20 })
  if (result.error) return <div className="text-red-500">{result.error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500">{result.total} total tenants</p>
        </div>
        <div className="flex gap-2">
          {TENANT_STATUSES.map((s) => (
            <Link key={s.value} href={`/dashboard/platform/tenants?status=${s.value}`} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${sp?.status === s.value ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s.label}
            </Link>
          ))}
          <Link href="/dashboard/platform/tenants" className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!sp?.status ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            All
          </Link>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Tenant</Button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.data?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/platform/tenants/${t.id}`} className="font-mono text-xs text-indigo-600 hover:underline">{t.tenant_code}</Link>
                </td>
                <td className="px-4 py-3 font-medium">{t.tenant_name}</td>
                <td className="px-4 py-3 text-gray-500">{t.contact_email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TENANT_STATUSES.find(s => s.value === t.status)?.color || ""}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
