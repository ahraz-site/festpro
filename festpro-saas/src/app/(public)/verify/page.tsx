"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyCertificate } from "@/lib/actions/public"
import { Loader2, Search, CheckCircle, XCircle, Award, User, Trophy, Calendar } from "lucide-react"

export default function VerifyCertificatePage() {
  const [code, setCode] = useState("")
  const [cert, setCert] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleVerify = async () => {
    if (!code) return
    setLoading(true); setSearched(true)
    const res = await verifyCertificate(code)
    setCert(res.data); setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Award className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
        <p className="text-gray-500 mt-2">Enter the certificate code or scan the QR code to verify.</p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter certificate code" className="flex-1 font-mono text-center" />
        <Button onClick={handleVerify} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {searched && !loading && !cert && (
        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-700">Certificate Not Found</p>
            <p className="text-sm text-gray-500 mt-1">No certificate matches this code. Please check and try again.</p>
          </CardContent>
        </Card>
      )}

      {cert && (
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-700 text-lg">Verified Certificate</p>
              <p className="text-xs text-gray-400">This certificate is authentic and issued by FestPro.</p>
            </div>
            <div className="space-y-4 p-4 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Participant</p>
                  <p className="font-medium">{cert.participant?.first_name} {cert.participant?.last_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Competition</p>
                  <p className="font-medium">{cert.competition?.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Achievement</p>
                  <p className="font-medium">{cert.grade || cert.rank || "Certificate of Participation"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Issue Date</p>
                  <p className="font-medium">{new Date(cert.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">Certificate Code: <span className="font-mono text-gray-600">{code}</span></p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
