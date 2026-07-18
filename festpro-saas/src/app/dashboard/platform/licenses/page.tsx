import { getLicenseKeys } from "@/lib/actions/saas-platform"
import { LICENSE_STATUSES } from "@/config/saas-platform"

export default async function LicensesPage() {
  const result = await getLicenseKeys()
  if (result.error) return <div className="text-red-500">{result.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">License Keys</h1>
        <p className="text-sm text-gray-500">{result.data?.length || 0} licenses</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">License Key</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Activations</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {result.data?.map((l: any) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{l.license_key}</td>
                <td className="px-4 py-3 text-gray-600">{l.saas_tenants?.tenant_name || "-"}</td>
                <td className="px-4 py-3">{l.license_type}</td>
                <td className="px-4 py-3">{l.current_activations}/{l.max_activations}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${LICENSE_STATUSES.find(s => s.value === l.status)?.color || ""}`}>{l.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{l.expires_at ? new Date(l.expires_at).toLocaleDateString() : "Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
