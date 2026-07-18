"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getReceipts, updateReceiptStatus, verifyReceipt } from "@/lib/actions/sponsor-crm"
import { RECEIPT_STATUSES, DONATION_METHODS } from "@/config/sponsor-crm"
import { Loader2, Receipt, CheckCircle, XCircle, Search, Printer, Download, DollarSign, CalendarDays, Shield } from "lucide-react"

export default function ReceiptsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; data?: any; error?: string } | null>(null)
  const [verifyInput, setVerifyInput] = useState("")

  const load = useCallback(async () => {
    const res = await getReceipts(festivalId)
    setReceipts(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleVerify = async () => {
    if (!verifyInput.trim()) return
    const res = await verifyReceipt(verifyInput.trim())
    setVerifyResult({ valid: res.valid || false, data: res.data, error: res.error })
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">{receipts.length} receipts.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-9" placeholder="Verify receipt by number..." value={verifyInput} onChange={e => setVerifyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleVerify()} />
            </div>
            <Button onClick={handleVerify}><Shield className="h-4 w-4 mr-1" /> Verify</Button>
          </div>
          {verifyResult && (
            <div className={`mt-3 p-3 rounded-lg ${verifyResult.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <div className="flex items-center gap-2">
                {verifyResult.valid ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <span className="font-semibold">{verifyResult.valid ? "Valid Receipt" : verifyResult.error || "Invalid"}</span>
              </div>
              {verifyResult.data && (
                <div className="mt-2 text-sm">
                  <p>Donor: {verifyResult.data.donor_name}</p>
                  <p>Amount: ₹{verifyResult.data.amount.toLocaleString()}</p>
                  <p>Date: {verifyResult.data.receipt_date}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {receipts.map(r => (
          <Card key={r.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${r.status === "issued" ? "bg-green-50" : "bg-gray-50"} flex items-center justify-center`}>
                    <Receipt className={`h-5 w-5 ${r.status === "issued" ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{r.donor_name}</p>
                    <p className="text-xs text-gray-500">{r.receipt_number}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${RECEIPT_STATUSES.find(rs => rs.value === r.status)?.color || "bg-gray-100"}`}>
                  {RECEIPT_STATUSES.find(rs => rs.value === r.status)?.label || r.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ₹{r.amount.toLocaleString()}</div>
                <div className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {r.receipt_date}</div>
                <div className="flex items-center gap-1"><Receipt className="h-3.5 w-3.5" /> {DONATION_METHODS.find(dm => dm.value === r.payment_method)?.label || r.payment_method}</div>
                {r.is_verified && <p className="text-green-600 text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</p>}
              </div>
              {r.status === "draft" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { await updateReceiptStatus(r.id, "issued"); load() }}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Issue</Button>
                </div>
              )}
              {r.status === "issued" && r.donation && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { await updateReceiptStatus(r.id, "cancelled"); load() }} className="text-red-500">Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {receipts.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No receipts generated.</p>}
      </div>
    </div>
  )
}
