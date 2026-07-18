"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyQrCode, logMobileActivity } from "@/lib/actions/mobile-platform"
import { QR_TYPES } from "@/config/mobile-platform"
import { QrCode, Camera, CheckCircle, XCircle, Loader2, Scan as ScanIcon } from "lucide-react"

export default function QrScanner() {
  const [mode, setMode] = useState<"select" | "manual" | "result">("select")
  const [qrType, setQrType] = useState("participant")
  const [input, setInput] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [scanning, setScanning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleScan = useCallback(async () => {
    if (!input.trim()) return
    setScanning(true); setError(""); setResult(null)
    const res = await verifyQrCode(input.trim())
    if (!res.valid) { setError(res.message); setResult(res.data); setMode("result"); setScanning(false); return }
    setResult(res); setMode("result")
    await logMobileActivity({ activity_type: "scan", description: `QR scanned: ${res.type}`, metadata: { type: res.type, valid: true } })
    setScanning(false)
  }, [input])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const text = await file.text()
      setInput(text)
      const res = await verifyQrCode(text)
      if (!res.valid) { setError(res.message); setResult(res.data); setMode("result"); setScanning(false); return }
      setResult(res); setMode("result")
      await logMobileActivity({ activity_type: "scan", description: `QR scanned from file: ${res.type}` })
    } catch { setError("Could not read QR code from file") }
    setScanning(false)
  }

  const reset = () => { setMode("select"); setInput(""); setResult(null); setError("") }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">QR Scanner</h1><QrCode className="h-5 w-5 text-gray-400" /></div>
      <p className="text-sm text-gray-500">Scan QR codes for participants, meal coupons, certificates, assets and more.</p>

      {mode === "select" && (
        <div className="space-y-4">
          <div><label className="text-sm font-medium mb-1 block">QR Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={qrType} onChange={e => setQrType(e.target.value)}>
              {QR_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => { fileRef.current?.click() }}>
              <Camera className="h-6 w-6" /><span className="text-xs">Upload Photo</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setMode("manual")}>
              <ScanIcon className="h-6 w-6" /><span className="text-xs">Manual Entry</span>
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-3">
          <div><label className="text-sm font-medium mb-1 block">QR Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={qrType} onChange={e => setQrType(e.target.value)}>
              {QR_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select></div>
          <Input placeholder="Paste QR data or JSON..." value={input} onChange={e => setInput(e.target.value)} className="font-mono text-xs" />
          <div className="flex gap-2"><Button onClick={handleScan} disabled={scanning || !input.trim()} className="flex-1">{scanning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Verify</Button>
            <Button variant="outline" onClick={reset}>Cancel</Button></div>
        </div>
      )}

      {mode === "result" && (
        <div className="space-y-3">
          {error && <Card className="bg-red-50 border-red-200"><CardContent className="p-4 flex items-center gap-3"><XCircle className="h-5 w-5 text-red-600 shrink-0" /><div><p className="text-sm font-medium text-red-800">Invalid</p><p className="text-xs text-red-600">{error}</p></div></CardContent></Card>}
          {result?.valid && <Card className="bg-green-50 border-green-200"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-600 shrink-0" /><div><p className="text-sm font-medium text-green-800">{result.message}</p><p className="text-xs text-green-600">Type: {QR_TYPES.find(t => t.type === result.type)?.label || result.type}</p></div></CardContent></Card>}
          <Button variant="outline" className="w-full" onClick={reset}>Scan Another</Button>
        </div>
      )}
    </div>
  )
}
