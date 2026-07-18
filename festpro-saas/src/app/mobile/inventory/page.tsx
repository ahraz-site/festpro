"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, Search, Loader2 } from "lucide-react"

export default function MobileInventory() {
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Inventory</h1><Package className="h-5 w-5 text-gray-400" /></div>
      <p className="text-sm text-gray-500">Check stock levels and scan assets</p>
      <Card><CardContent className="p-6 text-center"><Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Sync inventory data to view stock levels on the go.</p>
      </CardContent></Card>
    </div>
  )
}
