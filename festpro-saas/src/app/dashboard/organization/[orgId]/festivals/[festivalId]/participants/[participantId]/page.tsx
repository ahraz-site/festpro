"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getParticipantById, uploadParticipantPhoto, upsertGuardian } from "@/lib/actions/participant"
import { createRegistration, updateRegistrationStatus } from "@/lib/actions/participant/registrations"
import { getCompetitions } from "@/lib/actions/competition"
import { generateQrCard } from "@/lib/actions/participant/qr"
import { REGISTRATION_STATUSES } from "@/config/participant"
import type { Participant } from "@/types/participant"
import type { Competition } from "@/types/competition"
import { User, Mail, Phone, MapPin, Calendar, Camera, QrCode, ChevronLeft, Edit, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ParticipantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const participantId = params.participantId as string
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selComp, setSelComp] = useState("")
  const [selTeam, setSelTeam] = useState("")
  const [regNotes, setRegNotes] = useState("")

  useEffect(() => {
    async function load() {
      const [pRes, cRes] = await Promise.all([
        getParticipantById(participantId),
        getCompetitions(festivalId),
      ])
      if (pRes.error) { toast.error(pRes.error); return }
      setParticipant(pRes.data as Participant)
      setCompetitions(cRes as Competition[])
      setLoading(false)
    }
    load()
  }, [participantId, festivalId])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    const res = await uploadParticipantPhoto(participantId, fd)
    if (res.error) toast.error(res.error); else {
      toast.success("Photo uploaded")
      setParticipant(prev => prev ? { ...prev, photo_url: res.url ?? null } : prev)
    }
  }

  const handleRegister = async () => {
    if (!selComp) { toast.error("Select a competition"); return }
    const res = await createRegistration(festivalId, { participant_id: participantId, competition_id: selComp, team_id: selTeam, notes: regNotes })
    if (res.error) toast.error(res.error); else {
      toast.success("Registered!")
      setSelComp(""); setSelTeam(""); setRegNotes("")
      const refreshed = await getParticipantById(participantId)
      setParticipant(refreshed.data as Participant)
    }
  }

  const handleGenerateQr = async () => {
    const res = await generateQrCard(participantId, festivalId)
    if (res.error) toast.error(res.error); else toast.success("QR generated!")
  }

  const handleApproval = async (regId: string, status: "approved" | "rejected") => {
    const res = await updateRegistrationStatus(regId, status)
    if (res.error) toast.error(res.error); else {
      toast.success(`Registration ${status}`)
      const refreshed = await getParticipantById(participantId)
      setParticipant(refreshed.data as Participant)
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!participant) return <div className="text-center py-12 text-red-500">Participant not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{participant.first_name} {participant.last_name}</h1>
            <p className="text-sm text-gray-500">{participant.participant_id} | {participant.chest_number || "No chest"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateQr}><QrCode className="h-4 w-4 mr-1" />QR</Button>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/${participantId}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4 mr-1" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photo + Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-indigo-100 mx-auto overflow-hidden flex items-center justify-center">
                  {participant.photo_url ? (
                    <img src={participant.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-indigo-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              <h2 className="text-lg font-semibold mt-4">{participant.first_name} {participant.last_name}</h2>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p className="flex items-center justify-center gap-1"><Mail className="h-3.5 w-3.5" />{participant.email || "-"}</p>
                <p className="flex items-center justify-center gap-1"><Phone className="h-3.5 w-3.5" />{participant.phone || "-"}</p>
                <p className="flex items-center justify-center gap-1"><MapPin className="h-3.5 w-3.5" />{participant.city || participant.district || "-"}</p>
                <p className="flex items-center justify-center gap-1"><Calendar className="h-3.5 w-3.5" />{participant.date_of_birth ? new Date(participant.date_of_birth).toLocaleDateString() : "-"} ({participant.age || "?"} yrs)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Gender</span><span className="font-medium capitalize">{participant.gender}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Unit</span><span className="font-medium">{participant.unit || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Division</span><span className="font-medium">{participant.division || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Sector</span><span className="font-medium">{participant.sector || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Institution</span><span className="font-medium">{participant.institution_name || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Reg. Number</span><span className="font-medium font-mono text-xs">{participant.registration_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Chest Number</span><span className="font-medium font-mono">{participant.chest_number || "-"}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Registrations + Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Register */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Register for Competition</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="Select Competition" value={selComp} onChange={e => setSelComp(e.target.value)} className="flex-1 min-w-[200px]" />
                <Input placeholder="Notes" value={regNotes} onChange={e => setRegNotes(e.target.value)} className="flex-1 min-w-[150px]" />
                <Button size="sm" onClick={handleRegister}><Plus className="h-4 w-4 mr-1" />Register</Button>
              </div>
            </CardContent>
          </Card>

          {/* Registrations */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Registrations ({participant.registrations?.length || 0})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Competition</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Chest</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(!participant.registrations || participant.registrations.length === 0) ? (
                      <tr><td colSpan={4} className="text-center py-4 text-gray-400">No registrations</td></tr>
                    ) : participant.registrations.map((reg: any) => {
                      const statusConfig = REGISTRATION_STATUSES.find(s => s.value === reg.status)
                      return (
                        <tr key={reg.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{reg.competition?.name || "Unknown"}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color || ""}`}>
                              {statusConfig?.label || reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">{reg.chest_number || "-"}</td>
                          <td className="px-4 py-2 text-right">
                            {reg.status === "pending" && (
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" className="text-green-600 h-7 text-xs" onClick={() => handleApproval(reg.id, "approved")}>Approve</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 h-7 text-xs" onClick={() => handleApproval(reg.id, "rejected")}>Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Documents ({participant.documents?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500">Upload documents (coming in next update)</p>
              </div>
            </CardContent>
          </Card>

          {/* Medical + Guardian - simplified */}
          {participant.medical && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Medical Information</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Blood: {participant.medical.blood_group || "-"}</p>
                <p>Allergies: {participant.medical.allergies || "None"}</p>
                <p>Emergency: {participant.medical.emergency_contact_name} - {participant.medical.emergency_contact_phone}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
