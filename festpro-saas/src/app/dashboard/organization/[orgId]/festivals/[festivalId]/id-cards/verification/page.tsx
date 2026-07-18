"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyByQr, verifyByManualSearch } from "@/lib/actions/id-card"
import type { IdCard, Pass } from "@/types/id-card"
import { Loader2, Scan, Search, QrCode, IdCard as IdCardIcon, CreditCard, User, CalendarDays, Shield, CheckCircle, XCircle } from "lucide-react"

export default function VerificationPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [mode, setMode] = useState<"qr" | "manual">("qr")
  const [qrInput, setQrInput] = useState("")
  const [manualInput, setManualInput] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; data?: any; error?: string } | null>(null)
  const [searchResults, setSearchResults] = useState<{ cards: IdCard[]; passes: Pass[] } | null>(null)

  const handleQrVerify = async () => {
    if (!qrInput.trim()) return
    setVerifying(true)
    const res = await verifyByQr(qrInput.trim())
    setResult({ valid: res.valid || false, data: res.data, error: res.error })
    setVerifying(false)
  }

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return
    setVerifying(true)
    const res = await verifyByManualSearch(manualInput.trim())
    setSearchResults(res)
    setVerifying(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Verify ID cards, passes, and QR codes in real-time.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "qr" ? "default" : "outline"} onClick={() => { setMode("qr"); setResult(null); setSearchResults(null) }}>
          <QrCode className="h-4 w-4 mr-1" /> QR Scan
        </Button>
        <Button variant={mode === "manual" ? "default" : "outline"} onClick={() => { setMode("manual"); setResult(null); setSearchResults(null) }}>
          <Search className="h-4 w-4 mr-1" /> Manual Search
        </Button>
      </div>

      {mode === "qr" && (
        <Card>
          <CardHeader><CardTitle className="text-lg"><Scan className="h-5 w-5 inline mr-1" /> QR Code Verification</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input placeholder="Scan or paste QR token..." value={qrInput} onChange={e => setQrInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQrVerify()} />
              <Button onClick={handleQrVerify} disabled={verifying}>{verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "manual" && (
        <Card>
          <CardHeader><CardTitle className="text-lg"><Search className="h-5 w-5 inline mr-1" /> Manual Search</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input placeholder="Search by name, card number, or pass number..." value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleManualSearch()} />
              <Button onClick={handleManualSearch} disabled={verifying}>{verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={result.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-3">
              {result.valid ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="text-lg font-bold">{result.valid ? "Valid" : "Invalid"}</p>
                <p className="text-sm">{result.error || "Verification successful"}</p>
              </div>
            </div>
            {result.data && (
              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                {result.data.first_name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{result.data.first_name} {result.data.last_name}</span>
                  </div>
                )}
                {(result.data.card_number || result.data.pass_number) && (
                  <div className="flex items-center gap-2">
                    <IdCardIcon className="h-4 w-4 text-gray-500" />
                    <span>{result.data.card_number || result.data.pass_number}</span>
                  </div>
                )}
                {result.data.card_type && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{result.data.card_type}</span>
                  </div>
                )}
                {result.data.pass_type && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{result.data.pass_type}</span>
                  </div>
                )}
                {result.data.validity_end && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span>Valid until: {new Date(result.data.validity_end).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchResults && (
        <div className="space-y-4">
          {searchResults.cards.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">ID Cards ({searchResults.cards.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {searchResults.cards.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <IdCardIcon className="h-5 w-5 text-indigo-500" />
                      <div>
                        <p className="font-medium">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-500">{c.card_number}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {searchResults.passes.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Passes ({searchResults.passes.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {searchResults.passes.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{p.holder_name}</p>
                        <p className="text-xs text-gray-500">{p.pass_number}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {searchResults.cards.length === 0 && searchResults.passes.length === 0 && (
            <p className="text-gray-500 text-center py-4">No results found.</p>
          )}
        </div>
      )}
    </div>
  )
}
