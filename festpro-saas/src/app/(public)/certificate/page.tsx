"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyCertificate } from "@/lib/actions/certificate"
import { Loader2, CheckCircle, XCircle, Shield, Award, Calendar, Hash, User } from "lucide-react"

function VerifyForm() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code") || ""
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [inputCode, setInputCode] = useState(code)

  useEffect(() => {
    if (code) { verify() }
    else setLoading(false)
  }, [code])

  const verify = async () => {
    if (!inputCode.trim()) { setError("Enter verification code"); setLoading(false); return }
    setLoading(true); setError("")
    const res = await verifyCertificate(inputCode.trim())
    if (res.error) { setError(res.error); setData(null) }
    else { setData(res.data); if (!res.valid) setError("This certificate has been revoked or is not yet published.") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-gray-500">Verify the authenticity of a FestPro certificate</p>
        </div>

        <Card>
          <CardContent className="pt-4 flex gap-2">
            <input value={inputCode} onChange={e => setInputCode(e.target.value)}
              placeholder="Enter certificate verification code"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onKeyDown={e => e.key === "Enter" && verify()}
            />
            <button onClick={verify} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Verify
            </button>
          </CardContent>
        </Card>

        {loading && <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>}

        {error && data && (
          <Card className="border-yellow-400">
            <CardContent className="pt-4 text-center">
              <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-700">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Certificate: {data.certificate_number}</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <Card className={`${data.status === "published" ? "border-green-400" : "border-red-400"}`}>
            <CardContent className="pt-6 text-center">
              {data.status === "published" ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
              )}
              <h2 className="text-xl font-bold mb-4">
                {data.status === "published" ? "✓ Valid Certificate" : "✗ Invalid Certificate"}
              </h2>
              <div className="space-y-3 text-left bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-gray-400" /> <strong>{data.recipient_name}</strong></div>
                <div className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-gray-400" /> {data.certificate_type} {data.position ? `— ${data.position}` : ""}</div>
                <div className="flex items-center gap-2 text-sm"><Hash className="h-4 w-4 text-gray-400" /> {data.certificate_number}</div>
                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-gray-400" /> Generated: {new Date(data.generated_at || data.created_at).toLocaleDateString()}</div>
                {data.festival && <div className="flex items-center gap-2 text-sm"><Award className="h-4 w-4 text-gray-400" /> {data.festival.name}</div>}
              </div>
              {data.status === "revoked" && data.revoke_reason && (
                <p className="text-sm text-red-600 mt-3">Reason: {data.revoke_reason}</p>
              )}
              <p className="text-xs text-gray-400 mt-4">Verified via FestPro Secure QR System</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function CertificateVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>}>
      <VerifyForm />
    </Suspense>
  )
}
