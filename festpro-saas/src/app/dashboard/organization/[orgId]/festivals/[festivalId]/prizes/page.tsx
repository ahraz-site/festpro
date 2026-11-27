"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Gift, Search, X, Trophy, Loader2 } from "lucide-react"

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
  amount: number
  isGiven: boolean
}

export default function FestivalPrizesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"Winners" | "Candidates">("Winners")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [showSetPrizesModal, setShowSetPrizesModal] = useState(false)
  const [firstPrizeAmount, setFirstPrizeAmount] = useState("1000")
  const [secondPrizeAmount, setSecondPrizeAmount] = useState("500")
  const [thirdPrizeAmount, setThirdPrizeAmount] = useState("250")

  const [categories, setCategories] = useState<string[]>([])
  const [prizes, setPrizes] = useState<PrizeRow[]>([])

  const loadPrizes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/workspace?scope=prizes`, {
        cache: "no-store",
      })
      if (!res.ok) return
      const json = await res.json()

      const pConfig = json.customFields?.prize_config
      const fAmt = pConfig?.first ?? "1000"
      const sAmt = pConfig?.second ?? "500"
      const tAmt = pConfig?.third ?? "250"
      setFirstPrizeAmount(String(fAmt))
      setSecondPrizeAmount(String(sAmt))
      setThirdPrizeAmount(String(tAmt))

      const givenMap: Record<string, boolean> = json.customFields?.prize_given || {}
      const cats = (json.categories || []).map((c: any) => c.name)
      setCategories(cats)

      const resultItems: any[] = json.resultItems || []
      const liveWinners = resultItems.filter(
        (item) => (item.status === "live" || item.status === "published") && item.rank && item.rank <= 3
      )

      const rows: PrizeRow[] = liveWinners.map((item) => {
        const rank = Number(item.rank)
        const placeStr = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"
        const amtNum = rank === 1 ? Number(fAmt) || 0 : rank === 2 ? Number(sAmt) || 0 : Number(tAmt) || 0
        const rewardLabel =
          amtNum > 0
            ? `₹${amtNum.toLocaleString()} + ${rank === 1 ? "Trophy" : "Medal"}`
            : rank === 1
            ? "Trophy + Certificate"
            : "Medal + Certificate"

        return {
          id: item.id,
          program: item.competition?.name || "Program",
          category: item.participant?.division || "General",
          place: placeStr,
          winnerName: item.participant
            ? `${item.participant.first_name || ""} ${item.participant.last_name || ""}`.trim()
            : "Participant",
          winnerCode: item.participant?.chest_number || item.participant?.participant_id || "-",
          team: item.participant?.unit || "",
          grade: item.grade || "—",
          prize: rewardLabel,
          amount: amtNum,
          isGiven: !!givenMap[item.id],
        }
      })

      setPrizes(rows)
    } catch (err) {
      console.error("Failed to load prizes:", err)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    if (festivalId) loadPrizes()
  }, [festivalId, loadPrizes])

  const handleToggleGive = async (id: string) => {
    const current = prizes.find((p) => p.id === id)
    if (!current) return
    const next = !current.isGiven

    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, isGiven: next } : p)))
    try {
      await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_prize_given",
          payload: { resultId: id, isGiven: next },
        }),
      })
      toast.success(next ? `Prize awarded to ${current.winnerName}` : "Marked as pending")
    } catch {
      toast.error("Failed to update prize status")
    }
  }

  const handleSavePrizeSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_prize_config",
          payload: {
            first: firstPrizeAmount,
            second: secondPrizeAmount,
            third: thirdPrizeAmount,
          },
        }),
      })
      toast.success("Prize amounts updated across festival")
      setShowSetPrizesModal(false)
      loadPrizes()
    } catch {
      toast.error("Failed to update prize settings")
    }
  }

  const givenCount = prizes.filter((p) => p.isGiven).length
  const totalCount = prizes.length
  const wonCount = prizes.length
  const paidTotal = prizes.filter((p) => p.isGiven).reduce((sum, p) => sum + p.amount, 0)
  const pendingTotal = prizes.filter((p) => !p.isGiven).reduce((sum, p) => sum + p.amount, 0)

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
    { header: "Winner", accessor: (p: PrizeRow) => `${p.winnerName} (${p.winnerCode}${p.team ? ` · ${p.team}` : ""})` },
    { header: "Grade", accessor: (p: PrizeRow) => p.grade || "-" },
    { header: "Prize", accessor: (p: PrizeRow) => p.prize || "-" },
    { header: "Status", accessor: (p: PrizeRow) => (p.isGiven ? "Given" : "Pending") },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prizes</h1>
            <p className="text-xs text-slate-500 font-medium">
              Award distribution sheet synced directly from published competition results
            </p>
          </div>
        </div>

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

      {/* ── 4 METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Won</span>
          <div className="text-2xl font-black text-slate-900">{wonCount}</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Paid</span>
          <div className="text-2xl font-black text-slate-900">₹{paidTotal.toLocaleString()}</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">To pay</span>
          <div className="text-2xl font-black text-slate-900">₹{pendingTotal.toLocaleString()}</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <span className="text-xs text-slate-400 font-medium">Given</span>
          <div className="text-2xl font-black text-slate-900">
            {givenCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* ── TABS & FILTER BAR ── */}
      <div className="space-y-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setTab("Winners")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === "Winners" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Winners
          </button>
          <button
            onClick={() => setTab("Candidates")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === "Candidates" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Candidates
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search winner, program, chest # or team..."
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
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

      {/* ── PRIZES TABLE OR CLEAN EMPTY STATE ── */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span>Loading published winners...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-2">
          <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No published winners yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Once marks are entered and published from Enter Marks or the Judge Console, 1st, 2nd, and 3rd place winners will appear here automatically.
          </p>
        </div>
      ) : (
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
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">{row.program}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{row.category}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900">{row.place}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{row.winnerName}</div>
                      <div className="text-slate-400 text-xs font-mono">
                        {row.winnerCode}
                        {row.team ? ` · ${row.team}` : ""}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-semibold">{row.grade || "—"}</td>
                    <td className="py-4 px-5 text-slate-500 font-semibold">{row.prize || "—"}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            toast.success(`Printing award slip for ${row.winnerName}`)
                            window.print()
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer"
                        >
                          Print Slip
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleToggleGive(row.id)}
                          className={`rounded-xl text-xs font-bold px-4 shadow-xs ${
                            row.isGiven
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
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
      )}

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
                <label className="block text-slate-600">1st Place Cash Prize (₹)</label>
                <Input
                  value={firstPrizeAmount}
                  onChange={(e) => setFirstPrizeAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">2nd Place Cash Prize (₹)</label>
                <Input
                  value={secondPrizeAmount}
                  onChange={(e) => setSecondPrizeAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">3rd Place Cash Prize (₹)</label>
                <Input
                  value={thirdPrizeAmount}
                  onChange={(e) => setThirdPrizeAmount(e.target.value)}
                  placeholder="e.g. 250"
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
