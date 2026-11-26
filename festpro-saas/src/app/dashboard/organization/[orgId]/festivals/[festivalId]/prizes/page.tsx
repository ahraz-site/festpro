"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Gift, Search, Check, X, Award,
  SlidersHorizontal, Trophy, DollarSign, Loader2
} from "lucide-react"

interface PrizeRow {
  id: string
  program: string
  category: string
  place: string
  winnerName: string
  winnerCode: string
  team: string
  grade: string
  prize: string
  isGiven: boolean
}

export default function FestivalPrizesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // Screenshot 6 Tabs & Filters
  const [tab, setTab] = useState<"Winners" | "Candidates">("Winners")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modal State
  const [showSetPrizesModal, setShowSetPrizesModal] = useState(false)
  const [firstPrizeAmount, setFirstPrizeAmount] = useState("1000")
  const [secondPrizeAmount, setSecondPrizeAmount] = useState("500")
  const [thirdPrizeAmount, setThirdPrizeAmount] = useState("250")

  // Prizes Data Matching Screenshot 6
  const [prizes, setPrizes] = useState<PrizeRow[]>([
    {
      id: "p1",
      program: "Madh Song",
      category: "Senior",
      place: "1st",
      winnerName: "Shamil",
      winnerCode: "BJ003",
      team: "BJP",
      grade: "A+",
      prize: "₹1,000 + Trophy",
      isGiven: false,
    },
    {
      id: "p2",
      program: "Madh Song",
      category: "Senior",
      place: "2nd",
      winnerName: "Rashid",
      winnerCode: "CJ001",
      team: "CJP",
      grade: "A",
      prize: "₹500 + Medal",
      isGiven: false,
    },
    {
      id: "p3",
      program: "Madh Song",
      category: "Senior",
      place: "3rd",
      winnerName: "Ruhaib",
      winnerCode: "CJ003",
      team: "CJP",
      grade: "A",
      prize: "₹250 + Medal",
      isGiven: false,
    },
  ])

  const handleToggleGive = (id: string) => {
    setPrizes((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const next = !p.isGiven
        toast.success(next ? `Prize awarded to ${p.winnerName}` : `Marked as pending`)
        return { ...p, isGiven: next }
      })
    )
  }

  const handleSavePrizeSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Prize amounts updated across all programs")
    setShowSetPrizesModal(false)
  }

  const givenCount = prizes.filter((p) => p.isGiven).length
  const totalCount = prizes.length
  const wonCount = prizes.length

  const filtered = prizes.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch =
      p.program.toLowerCase().includes(q) ||
      p.winnerName.toLowerCase().includes(q) ||
      p.winnerCode.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q)
    if (!matchesSearch) return false

    if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false
    if (statusFilter === "given" && !p.isGiven) return false
    if (statusFilter === "pending" && p.isGiven) return false

    return true
  })

  const exportColumns = [
    { header: "Program", accessor: (p: PrizeRow) => `${p.program} (${p.category})` },
    { header: "Place", accessor: (p: PrizeRow) => p.place },
    { header: "Winner", accessor: (p: PrizeRow) => `${p.winnerName} (${p.winnerCode} · ${p.team})` },
    { header: "Grade", accessor: (p: PrizeRow) => p.grade || "-" },
    { header: "Prize", accessor: (p: PrizeRow) => p.prize || "-" },
    { header: "Status", accessor: (p: PrizeRow) => (p.isGiven ? "Given" : "Pending") },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 6) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prizes</h1>
        </div>

        {/* Top Right Action Button (Screenshot 6: Set prizes) */}
        <div className="flex items-center gap-2">
          <ExportPrintBar
            title="Festival Prize Distribution Sheet"
            subtitle="FestPro Honors & Awards"
            data={filtered}
            columns={exportColumns}
            filename="prizes-sheet"
          />

          <Button
            size="sm"
            onClick={() => setShowSetPrizesModal(true)}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4"
          >
            Set prizes
          </Button>
        </div>
      </div>

      {/* ── 4 METRIC STAT CARDS (Screenshot 6: Won, Paid, To pay, Given) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Won */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Won</span>
          <div className="text-2xl font-black text-slate-900">{wonCount}</div>
        </div>

        {/* Paid */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Paid</span>
          <div className="text-2xl font-black text-slate-900">₹0</div>
        </div>

        {/* To pay */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">To pay</span>
          <div className="text-2xl font-black text-slate-900">₹0</div>
        </div>

        {/* Given (Screenshot 6: Given 0/3) */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Given</span>
          <div className="text-2xl font-black text-slate-900">{givenCount}/{totalCount}</div>
        </div>
      </div>

      {/* ── TABS & FILTER BAR (Screenshot 6) ── */}
      <div className="space-y-4">
        {/* Tab switch (Winners | Candidates) */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setTab("Winners")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "Winners" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Winners
          </button>
          <button
            onClick={() => setTab("Candidates")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === "Candidates" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Candidates
          </button>
        </div>

        {/* Filter Inputs (Search, All categories, All) */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs shadow-xs"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 w-44 shadow-xs"
          >
            <option value="all">All categories</option>
            <option value="Senior">Senior</option>
            <option value="Junior">Junior</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 w-32 shadow-xs"
          >
            <option value="all">All</option>
            <option value="given">Given</option>
            <option value="pending">Not Given</option>
          </select>
        </div>
      </div>

      {/* ── PRIZES TABLE (Screenshot 6: Program, Place, Winner, Grade, Prize, Action) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-3.5 px-5">Program</th>
                <th className="py-3.5 px-5">Place</th>
                <th className="py-3.5 px-5">Winner</th>
                <th className="py-3.5 px-5">Grade</th>
                <th className="py-3.5 px-5">Prize</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Program & Category */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 text-sm">{row.program}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{row.category}</div>
                  </td>

                  {/* Place */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-900">{row.place}</span>
                  </td>

                  {/* Winner */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900">{row.winnerName}</div>
                    <div className="text-slate-400 text-xs font-mono">{row.winnerCode} · {row.team}</div>
                  </td>

                  {/* Grade */}
                  <td className="py-4 px-5 text-slate-500 font-semibold">{row.grade || "—"}</td>

                  {/* Prize */}
                  <td className="py-4 px-5 text-slate-500 font-semibold">{row.prize || "—"}</td>

                  {/* Action (Give button & Print Slip) */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toast.success(`Printing Stage Award Slip for ${row.winnerName} (${row.place} · ${row.program})`)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer"
                      >
                        Print Slip
                      </button>
                      <Button
                        size="sm"
                        onClick={() => handleToggleGive(row.id)}
                        className={`rounded-xl text-xs font-bold px-4 shadow-xs ${
                          row.isGiven
                            ? "bg-slate-100 text-indigo-700 hover:bg-slate-200 border border-indigo-200"
                            : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        {row.isGiven ? "Given ✓" : "Give"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SET PRIZES MODAL ── */}
      {showSetPrizesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Set Prize Structure</h2>
              <button onClick={() => setShowSetPrizesModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrizeSettings} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">1st Place Prize</label>
                <Input
                  value={firstPrizeAmount}
                  onChange={(e) => setFirstPrizeAmount(e.target.value)}
                  placeholder="e.g. 1000 or Gold Trophy"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">2nd Place Prize</label>
                <Input
                  value={secondPrizeAmount}
                  onChange={(e) => setSecondPrizeAmount(e.target.value)}
                  placeholder="e.g. 500 or Silver Trophy"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">3rd Place Prize</label>
                <Input
                  value={thirdPrizeAmount}
                  onChange={(e) => setThirdPrizeAmount(e.target.value)}
                  placeholder="e.g. 250 or Bronze Trophy"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSetPrizesModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Prizes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
