"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRegistrationByToken } from "@/lib/actions/public"
import type { PublicRegistration } from "@/types/public"
import { REGISTRATION_STATUSES } from "@/config/public"
import { Loader2, Search, CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar } from "lucide-react"

export default function TrackRegistrationPage() {
  const [token, setToken] = useState("")
  const [reg, setReg] = useState<PublicRegistration | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!token) return
    setLoading(true); setSearched(true)
    const res = await getRegistrationByToken(token)
    setReg(res.data); setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Track Registration</h1>
      <p className="text-gray-500 text-center mb-8">Enter your tracking token to check registration status.</p>

      <div className="flex gap-2 mb-8">
        <Input value={token} onChange={e => setToken(e.target.value)} placeholder="Enter tracking token" className="flex-1" />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {searched && !loading && !reg && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No registration found with this token</p>
          </CardContent>
        </Card>
      )}

      {reg && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Registration #</p>
                <p className="font-bold text-lg">{reg.registration_number}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${REGISTRATION_STATUSES.find(s => s.value === reg.status)?.color || ""}`}>{reg.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div><p className="text-xs text-gray-500">Name</p><p className="text-sm font-medium">{reg.first_name} {reg.last_name}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div><p className="text-xs text-gray-500">Email</p><p className="text-sm">{reg.email}</p></div>
              </div>
              {reg.phone && <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm">{reg.phone}</p></div>
              </div>}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div><p className="text-xs text-gray-500">Registered</p><p className="text-sm">{new Date(reg.created_at).toLocaleDateString()}</p></div>
              </div>
            </div>

            {reg.registration_type === "team" && reg.team_name && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Team</p>
                <p className="font-medium">{reg.team_name}</p>
              </div>
            )}

            {reg.status === "confirmed" && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">Your registration has been confirmed!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
