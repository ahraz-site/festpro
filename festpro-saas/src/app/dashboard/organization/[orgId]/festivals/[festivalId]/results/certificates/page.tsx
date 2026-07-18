"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getCertificates, publishCertificates, revokeCertificate, generateCertificates, getTemplates, getBatches } from "@/lib/actions/certificate"
import { getCompetitions } from "@/lib/actions/competition"
import { CERTIFICATE_STATUSES, CERTIFICATE_TYPES } from "@/config/result"
import type { Certificate, CertificateTemplate, CertificateBatch } from "@/types/result"
import type { Competition } from "@/types/competition"
import { Loader2, Plus, Download, CheckCircle, RotateCcw, XCircle, Package, FileText, Printer } from "lucide-react"

export default function CertificatesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const orgId = params.orgId as string
  const [certs, setCerts] = useState<Certificate[]>([])
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [batches, setBatches] = useState<CertificateBatch[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genTemplate, setGenTemplate] = useState("")
  const [genType, setGenType] = useState("participant")
  const [genComp, setGenComp] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState("")

  const load = useCallback(async () => {
    const [cRes, tRes, bRes, compRes] = await Promise.all([
      getCertificates(festivalId, statusFilter || undefined),
      getTemplates(festivalId), getBatches(festivalId), getCompetitions(festivalId),
    ])
    setCerts(cRes.data || []); setTemplates(tRes.data || []); setBatches(bRes.data || []); setCompetitions(compRes || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => {
    if (!genTemplate) { toast.error("Select a template"); return }
    setGenerating(true)
    const res = await generateCertificates(festivalId, genTemplate, genType, genComp || undefined)
    if (res.error) toast.error(res.error); else { toast.success(`Generated ${res.total} certificates`); load() }
    setGenerating(false)
  }

  const handlePublish = async () => {
    if (selected.size === 0) { toast.error("Select certificates"); return }
    const res = await publishCertificates(Array.from(selected))
    if (res.error) toast.error(res.error); else { toast.success(`${selected.size} certificates published`); setSelected(new Set()); load() }
  }

  const handleRevoke = async (id: string) => {
    const reason = prompt("Revoke reason:")
    if (!reason) return
    const res = await revokeCertificate(id, reason)
    if (res.error) toast.error(res.error); else { toast.success("Certificate revoked"); load() }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">Generate, publish, and manage QR-verified certificates.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/certificates/templates`}>
            <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" /> Templates</Button>
          </Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/certificates/batches`}>
            <Button variant="outline" size="sm"><Package className="h-4 w-4 mr-1" /> Batches</Button>
          </Link>
          {selected.size > 0 && (
            <Button size="sm" onClick={handlePublish} className="text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Publish ({selected.size})</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Generate Certificates</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <select value={genTemplate} onChange={e => setGenTemplate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">Select template...</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.template_name}</option>)}
          </select>
          <select value={genType} onChange={e => setGenType(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            {CERTIFICATE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="Competition (optional)" value={genComp} onChange={e => setGenComp(e.target.value)} />
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />} Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <Select
            options={[{ value: "", label: "All Status" }, ...CERTIFICATE_STATUSES.map(s => ({ value: s.value, label: s.label }))]}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      {certs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No certificates. Select a template and generate.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {certs.map(c => (
            <Card key={c.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{c.recipient_name}</p>
                      <span className="text-xs text-gray-400 capitalize">({c.recipient_type})</span>
                      <span className="text-xs text-gray-400 font-mono">{c.certificate_number}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {c.certificate_type} {c.position ? `— ${c.position}` : ""}
                      {c.grade ? ` — ${c.grade}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.is_verified && <span className="text-xs text-green-600">✓ Verified ({new Date(c.last_verified_at || "").toLocaleDateString()})</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CERTIFICATE_STATUSES.find(s => s.value === c.status)?.color || ""}`}>{c.status}</span>
                    {c.status === "generated" && (
                      <Button size="sm" variant="ghost" className="text-green-600" onClick={() => { setSelected(new Set([c.id])); handlePublish() }}>
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {c.status !== "revoked" && (
                      <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleRevoke(c.id)}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
