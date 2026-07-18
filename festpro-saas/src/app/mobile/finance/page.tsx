"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Loader2 } from "lucide-react"

export default function MobileFinance() {
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Finance</h1><DollarSign className="h-5 w-5 text-emerald-400" /></div>
      <p className="text-sm text-gray-500">View collections, expenses and financial summaries</p>
      <Card><CardContent className="p-6 text-center"><DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Sync financial data to view reports on the go.</p>
      </CardContent></Card>
    </div>
  )
}
