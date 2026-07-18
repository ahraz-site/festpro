"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMedicalCases, createMedicalCase, updateMedicalCaseStatus, getPatients, getMedicalCenters, getMedicalStaff, addMedicalObservation, addMedicalTreatment, addPrescription } from "@/lib/actions/medical-emergency"
import { MEDICAL_CASE_STATUSES, CASE_SEVERITIES } from "@/config/medical-emergency"
import { Loader2, Stethoscope, Plus, Search, Activity, Pill, Thermometer } from "lucide-react"

export default function CasesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [cases, setCases] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [caseDetail, setCaseDetail] = useState<any>(null)
  const [obsForm, setObsForm] = useState({ observation_type: "", observation_value: "", unit: "" })
  const [treatmentForm, setTreatmentForm] = useState({ treatment_name: "", treatment_type: "", description: "" })
  const [rxForm, setRxForm] = useState({ medication_name: "", dosage: "", frequency: "", quantity: "1" })
  const [form, setForm] = useState({ patient_id: "", center_id: "", chief_complaint: "", symptoms: "", severity: "minor", assigned_doctor_id: "", is_emergency: false })

  const load = useCallback(async () => {
    setLoading(true)
    const [c, p, ct, st] = await Promise.all([
      getMedicalCases(festivalId, statusFilter || undefined), getPatients(festivalId),
      getMedicalCenters(festivalId), getMedicalStaff(festivalId),
    ])
    setCases(c.data || []); setPatients(p.data || []); setCenters(ct.data || []); setStaff(st.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.patient_id || !form.chief_complaint) return
    await createMedicalCase({ ...form, festival_id: festivalId })
    setForm({ patient_id: "", center_id: "", chief_complaint: "", symptoms: "", severity: "minor", assigned_doctor_id: "", is_emergency: false })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => { await updateMedicalCaseStatus(id, status); load() }
  const handleObs = async () => {
    if (!obsForm.observation_type || !obsForm.observation_value || !selectedCase) return
    const c = caseDetail || cases.find((cc: any) => cc.id === selectedCase)
    await addMedicalObservation({ ...obsForm, case_id: selectedCase, organization_id: c?.organization_id }); setObsForm({ observation_type: "", observation_value: "", unit: "" }); loadCaseDetail(selectedCase)
  }
  const handleTreatment = async () => {
    if (!treatmentForm.treatment_name || !selectedCase) return
    const c = caseDetail || cases.find((cc: any) => cc.id === selectedCase)
    await addMedicalTreatment({ ...treatmentForm, case_id: selectedCase, organization_id: c?.organization_id }); setTreatmentForm({ treatment_name: "", treatment_type: "", description: "" }); loadCaseDetail(selectedCase)
  }
  const handleRx = async () => {
    if (!rxForm.medication_name || !rxForm.dosage || !selectedCase) return
    const c = caseDetail || cases.find((cc: any) => cc.id === selectedCase)
    await addPrescription({ ...rxForm, case_id: selectedCase, organization_id: c?.organization_id, quantity: Number(rxForm.quantity) }); setRxForm({ medication_name: "", dosage: "", frequency: "", quantity: "1" }); loadCaseDetail(selectedCase)
  }

  const loadCaseDetail = async (id: string) => {
    setSelectedCase(id); setCaseDetail(null)
    const { data } = await import("@/lib/actions/medical-emergency").then(m => m.getMedicalCase(id))
    setCaseDetail(data)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medical Cases</h1><p className="text-sm text-gray-500 mt-1">Manage patient cases, treatments and prescriptions.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Case"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Create Medical Case</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Patient *</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
              <option value="">Select...</option>{patients.map((p: any) => <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Center</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.center_id} onChange={e => setForm({...form, center_id: e.target.value})}>
              <option value="">Select...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
            </select></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Chief Complaint *</label><Input value={form.chief_complaint} onChange={e => setForm({...form, chief_complaint: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Symptoms</label><Input value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Severity</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
              {CASE_SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Doctor</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.assigned_doctor_id} onChange={e => setForm({...form, assigned_doctor_id: e.target.value})}>
              <option value="">Select...</option>{staff.filter((s: any) => s.role === "doctor").map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select></div>
          <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={form.is_emergency} onChange={e => setForm({...form, is_emergency: e.target.checked})} /><label className="text-sm text-red-600 font-medium">Emergency</label></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Create Case</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>{MEDICAL_CASE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {cases.filter(c => !search || c.chief_complaint?.toLowerCase().includes(search.toLowerCase()) || c.patients?.full_name?.toLowerCase().includes(search.toLowerCase())).map((c: any) => (
          <Card key={c.id} className={selectedCase === c.id ? "ring-2 ring-indigo-500" : ""}><CardContent className="pt-4">
            <div className="flex items-start justify-between cursor-pointer" onClick={() => loadCaseDetail(c.id)}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center"><Stethoscope className="h-5 w-5 text-red-600" /></div>
                <div><p className="font-semibold">{c.patients?.full_name || "—"}</p><p className="text-xs text-gray-500">{c.case_number} · {c.chief_complaint}</p></div>
              </div>
              <div className="text-right"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MEDICAL_CASE_STATUSES.find(x => x.value === c.status)?.color || ""}`}>{MEDICAL_CASE_STATUSES.find(x => x.value === c.status)?.label || c.status}</span>
                <p className={`text-xs mt-1 ${CASE_SEVERITIES.find(x => x.value === c.severity)?.color || ""}`}>{CASE_SEVERITIES.find(x => x.value === c.severity)?.label || c.severity}</p></div>
            </div>
            <div className="flex gap-1 mt-2">
              {c.status === "open" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(c.id, "in_treatment")}>Start Treatment</Button>}
              {c.status === "in_treatment" && <><Button size="sm" variant="outline" className="text-xs mr-1" onClick={() => handleStatus(c.id, "discharged")}>Discharge</Button><Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(c.id, "referred")}>Refer</Button></>}
              {c.status === "discharged" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(c.id, "closed")}>Close Case</Button>}
            </div>
            {selectedCase === c.id && caseDetail && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {caseDetail.medical_observations?.length > 0 && (
                  <div><p className="text-sm font-semibold mb-2">Observations</p>
                    {caseDetail.medical_observations.map((o: any) => (
                      <div key={o.id} className="text-sm p-2 bg-gray-50 rounded mb-1"><strong>{o.observation_type}:</strong> {o.observation_value} {o.unit || ""} <span className="text-xs text-gray-400">{new Date(o.observed_at).toLocaleString()}</span></div>
                    ))}
                  </div>
                )}
                {caseDetail.medical_treatments?.length > 0 && (
                  <div><p className="text-sm font-semibold mb-2">Treatments</p>
                    {caseDetail.medical_treatments.map((t: any) => (
                      <div key={t.id} className="text-sm p-2 bg-gray-50 rounded mb-1"><strong>{t.treatment_name}</strong> ({t.treatment_type})<p className="text-xs text-gray-500">{t.description}</p></div>
                    ))}
                  </div>
                )}
                {caseDetail.prescriptions?.length > 0 && (
                  <div><p className="text-sm font-semibold mb-2">Prescriptions</p>
                    {caseDetail.prescriptions.map((rx: any) => (
                      <div key={rx.id} className="text-sm p-2 bg-gray-50 rounded mb-1"><strong>{rx.medication_name}</strong> {rx.dosage} · {rx.frequency}<span className="text-xs text-gray-400 ml-2">Qty: {rx.quantity}</span></div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                  <div className="space-y-1"><p className="text-xs font-semibold">Add Observation</p><Input placeholder="Type" value={obsForm.observation_type} onChange={e => setObsForm({...obsForm, observation_type: e.target.value})} className="text-xs" /><Input placeholder="Value" value={obsForm.observation_value} onChange={e => setObsForm({...obsForm, observation_value: e.target.value})} className="text-xs" /><Input placeholder="Unit" value={obsForm.unit} onChange={e => setObsForm({...obsForm, unit: e.target.value})} className="text-xs" /><Button size="sm" onClick={handleObs}><Activity className="h-3 w-3 mr-1" /> Add</Button></div>
                  <div className="space-y-1"><p className="text-xs font-semibold">Add Treatment</p><Input placeholder="Name" value={treatmentForm.treatment_name} onChange={e => setTreatmentForm({...treatmentForm, treatment_name: e.target.value})} className="text-xs" /><Input placeholder="Type" value={treatmentForm.treatment_type} onChange={e => setTreatmentForm({...treatmentForm, treatment_type: e.target.value})} className="text-xs" /><Input placeholder="Description" value={treatmentForm.description} onChange={e => setTreatmentForm({...treatmentForm, description: e.target.value})} className="text-xs" /><Button size="sm" onClick={handleTreatment}><Thermometer className="h-3 w-3 mr-1" /> Add</Button></div>
                  <div className="space-y-1"><p className="text-xs font-semibold">Add Prescription</p><Input placeholder="Medication" value={rxForm.medication_name} onChange={e => setRxForm({...rxForm, medication_name: e.target.value})} className="text-xs" /><Input placeholder="Dosage" value={rxForm.dosage} onChange={e => setRxForm({...rxForm, dosage: e.target.value})} className="text-xs" /><Input placeholder="Frequency" value={rxForm.frequency} onChange={e => setRxForm({...rxForm, frequency: e.target.value})} className="text-xs" /><Button size="sm" onClick={handleRx}><Pill className="h-3 w-3 mr-1" /> Add</Button></div>
                </div>
              </div>
            )}
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
