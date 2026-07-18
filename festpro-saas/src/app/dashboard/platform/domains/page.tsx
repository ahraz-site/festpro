import { getCustomDomains } from "@/lib/actions/saas-platform"
import { DOMAIN_STATUSES } from "@/config/saas-platform"

export default async function DomainsPage() {
  const result = await getCustomDomains()
  if (result.error) return <div className="text-red-500">{result.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Custom Domains</h1>
        <p className="text-sm text-gray-500">{result.data?.length || 0} domains</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Domain</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Verified</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">SSL</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Primary</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.data?.map((d: any) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{d.domain}</td>
                <td className="px-4 py-3">{d.saas_tenants?.tenant_name || "-"}</td>
                <td className="px-4 py-3">{d.is_verified ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-amber-600">No</span>}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DOMAIN_STATUSES.find(s => s.value === d.ssl_status)?.color || ""}`}>{d.ssl_status}</span>
                </td>
                <td className="px-4 py-3">{d.is_primary ? <span className="text-indigo-600 font-medium">Yes</span> : "No"}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
