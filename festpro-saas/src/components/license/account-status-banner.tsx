"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ShieldAlert, Phone, CreditCard } from "lucide-react"
import type { SaasLicense } from "@/types/licensing"
import { getOrganizationLicense } from "@/lib/actions/licensing"

export function AccountStatusBanner({ organizationId }: { organizationId?: string | null }) {
  const [license, setLicense] = useState<SaasLicense | null>(null)

  useEffect(() => {
    if (!organizationId) return
    async function check() {
      if (!organizationId) return
      const lic = await getOrganizationLicense(organizationId)
      setLicense(lic)
    }
    check()
  }, [organizationId])

  if (!license) return null

  if (license.status === "on_hold") {
    return (
      <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                Account Temporarily On Hold
              </h3>
              <span className="text-[11px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                Action Required
              </span>
            </div>
            <p className="text-sm text-amber-800 mt-1">
              {license.hold_reason || "Your festival access is currently on hold due to pending balance payment."}
            </p>
            {license.pending_amount > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-amber-200 rounded-lg text-xs font-semibold text-amber-900">
                <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                Pending Payment: ₹{Number(license.pending_amount).toLocaleString("en-IN")}
              </div>
            )}
            <p className="text-xs text-amber-700 mt-2">
              Please contact the platform administrator to clear the dues and restore full festival editing and scoring capabilities.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (license.status === "blocked") {
    return (
      <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">
              Account Suspended / Blocked
            </h3>
            <p className="text-sm text-red-800 mt-1">
              Your organization account has been suspended by administration. All festival activities and score entries are frozen.
            </p>
            <p className="text-xs text-red-700 mt-2">
              Contact support or management immediately to resolve this status.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
