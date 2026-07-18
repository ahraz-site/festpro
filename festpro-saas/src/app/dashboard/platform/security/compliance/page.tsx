"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getComplianceEvidence, getComplianceSummary } from "@/lib/actions/enterprise"
import type { ComplianceEvidence } from "@/types/enterprise"
import { COMPLIANCE_FRAMEWORKS, COMPLIANCE_STATUSES } from "@/config/enterprise"
import { Loader2, CheckCircle, XCircle, FileText, ArrowLeft, Plus } from "lucide-react"

export default function CompliancePage() {
  const [evidence, setEvidence] = useState<ComplianceEvidence[]>([])
  const [summary, setSummary] = useState<{ total: number; compliant: number; compliance_rate: number; by_framework: Record<string, { total: number; compliant: number }> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [framework, setFramework] = useState("")

  const load = useCallback(async () => {
    const [eRes, sRes] = await Promise.all([getComplianceEvidence(framework || undefined), getComplianceSummary()])
    if (eRes.data) setEvidence(eRes.data)
    if (sRes.data) setSummary(sRes.data)
    setLoading(false)
  }, [framework])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/platform/security"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Readiness</h1>
          <p className="text-sm text-gray-500">SOC 2, ISO 27001, GDPR readiness tracking</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLIANCE_FRAMEWORKS.map((fw) => {
          const fwData = summary?.by_framework[fw.value]
          const rate = fwData ? Math.round((fwData.compliant / fwData.total) * 100) : 0
          return (
            <Card key={fw.value} className={framework === fw.value ? "ring-2 ring-indigo-400" : ""} onClick={() => setFramework(framework === fw.value ? "" : fw.value)}>
              <CardContent className="p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${fw.color}`}>{fw.label}</span>
                  {rate >= 80 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-amber-500" />}
                </div>
                <p className="text-2xl font-bold mt-2">{rate}%</p>
                <p className="text-xs text-gray-500">{fwData ? `${fwData.compliant}/${fwData.total} controls` : "0 controls"}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Control Evidence {framework ? `- ${COMPLIANCE_FRAMEWORKS.find((f) => f.value === framework)?.label}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evidence.map((e) => {
              const stCfg = COMPLIANCE_STATUSES.find((s) => s.value === e.status)
              return (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{e.control_id}</span>
                      <span className="font-medium text-sm">{e.control_title}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stCfg?.color}`}>{stCfg?.label || e.status}</span>
                    </div>
                    {e.control_description && <p className="text-xs text-gray-500 mt-1">{e.control_description}</p>}
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>Type: {e.evidence_type}</span>
                      {e.next_review_date && <span>Next review: {new Date(e.next_review_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {evidence.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No compliance evidence found. Select a framework above.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
