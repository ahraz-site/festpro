"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getVolunteerCertificates, issueCertificate } from "@/lib/actions/volunteer"
import { Loader2, Plus, X, Award, FileText, CalendarDays, CheckCircle } from "lucide-react"

export default function CertificatesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [certs, setCerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [form, setForm] = useState({ volunteer_id: "", staff_id: "", certificate_type: "volunteer", title: "", description: "", total_hours: "" })

  const load = useCallback(async () => {
    const res = await getVolunteerCertificates(festivalId)
    setCerts(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await issueCertificate({ festival_id: festivalId, ...form, total_hours: form.total_hours ? Number(form.total_hours) : undefined })
    if (res.certificate_code) setIssuedCode(res.certificate_code)
    setShowForm(false); setForm({ volunteer_id: "", staff_id: "", certificate_type: "volunteer", title: "", description: "", total_hours: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">{certs.length} certificates issued.</p>
        </div>
        <Button onClick={() => { setIssuedCode(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Issue Certificate</Button>
      </div>

      {issuedCode && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Certificate Issued Successfully</p>
                <p className="text-sm">Code: <strong>{issuedCode}</strong></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue Certificate</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Volunteer ID</label><Input value={form.volunteer_id} onChange={e => setForm(f => ({ ...f, volunteer_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Staff ID</label><Input value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Certificate Type</label>
                <select value={form.certificate_type} onChange={e => setForm(f => ({ ...f, certificate_type: e.target.value }))} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="volunteer">Volunteer</option>
                  <option value="appreciation">Appreciation</option>
                  <option value="completion">Completion</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Total Hours</label><Input type="number" value={form.total_hours} onChange={e => setForm(f => ({ ...f, total_hours: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Issue</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.is_verified ? "bg-green-50" : "bg-amber-50"}`}>
                    <Award className={`h-5 w-5 ${c.is_verified ? "text-green-600" : "text-amber-600"}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.volunteer ? `${c.volunteer.first_name} ${c.volunteer.last_name}` : c.staff ? `${c.staff.first_name} ${c.staff.last_name}` : "Unknown"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {c.is_verified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1"><FileText className="h-3 w-3" /> {c.certificate_code}</div>
                {c.total_hours && <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {c.total_hours} hours</div>}
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Issued: {new Date(c.issue_date).toLocaleDateString()}</div>
              </div>
              {c.description && <p className="mt-2 text-xs text-gray-400">{c.description}</p>}
            </CardContent>
          </Card>
        ))}
        {certs.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No certificates issued yet.</p>}
      </div>
    </div>
  )
}
