"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { getOfflineForms } from "@/lib/actions/mobile-platform"
import { OFFLINE_FORM_STATUSES } from "@/config/mobile-platform"
import { Loader2, FileText } from "lucide-react"

export default function OfflineFormsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  const load = useCallback(async () => {
    setLoading(true); const f = await getOfflineForms(orgId, filter || undefined); setForms(f.data || []); setLoading(false)
  }, [orgId, filter])
  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Offline Forms</h1><p className="text-sm text-gray-500 mt-1">{forms.length} offline form submissions</p></div>
      <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm max-w-xs" value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="">All Statuses</option>{OFFLINE_FORM_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <div className="grid gap-3">
        {forms.map((f: any) => (
          <Card key={f.id}><CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center"><FileText className="h-4 w-4 text-purple-600" /></div>
              <div><p className="text-sm font-medium">{f.form_type}</p><p className="text-xs text-gray-500">{new Date(f.created_at).toLocaleString()}</p></div></div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${OFFLINE_FORM_STATUSES.find(s => s.value === f.status)?.color || "bg-gray-100"}`}>{OFFLINE_FORM_STATUSES.find(s => s.value === f.status)?.label || f.status}</span>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
