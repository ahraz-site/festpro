"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UtensilsCrossed, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function MobileMealVerification() {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [verifying, setVerifying] = useState(false)

  const handleVerify = () => {
    if (!code.trim()) return
    setVerifying(true)
    setTimeout(() => {
      setResult({ success: true, message: "Meal coupon verified" })
      setVerifying(false)
    }, 800)
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Meal Verification</h1><UtensilsCrossed className="h-5 w-5 text-orange-400" /></div>
      <p className="text-sm text-gray-500">Verify meal coupons and distribute meals</p>
      <Input placeholder="Scan or enter coupon code..." value={code} onChange={e => setCode(e.target.value)} />
      <Button className="w-full" onClick={handleVerify} disabled={verifying || !code.trim()}>{verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Verify Coupon</Button>
      {result && (
        <Card className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardContent className="p-4 flex items-center gap-3">{result.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}<p className="text-sm font-medium">{result.message}</p></CardContent>
        </Card>
      )}
    </div>
  )
}
