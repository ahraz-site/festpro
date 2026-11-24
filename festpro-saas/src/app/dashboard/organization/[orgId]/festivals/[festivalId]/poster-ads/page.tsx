"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Megaphone, Plus, Trash2, Archive, CheckCircle, Image as ImageIcon,
  Sparkles, X, ChevronRight, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SponsorAd {
  id: string
  name: string
  subtitle: string
  status: "Active" | "Archived"
  imageUrl?: string
}

interface AdRule {
  id: string
  resultNumber: number
  adName: string
}

export default function FestivalPosterAdsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // State (Screenshot 9)
  const [ads, setAds] = useState<SponsorAd[]>([
    {
      id: "1",
      name: "a1",
      subtitle: "qwee",
      status: "Active",
    },
  ])

  const [rules, setRules] = useState<AdRule[]>([])
  const [testResultNum, setTestResultNum] = useState("3")
  const [showAddAdModal, setShowAddAdModal] = useState(false)
  const [showAddRuleModal, setShowAddRuleModal] = useState(false)

  // New Ad Form
  const [adName, setAdName] = useState("")
  const [adSubtitle, setAdSubtitle] = useState("")

  // New Rule Form
  const [ruleResultNum, setRuleResultNum] = useState("1")
  const [ruleSelectedAd, setRuleSelectedAd] = useState(ads[0]?.name || "a1")

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adName.trim()) return

    const newAd: SponsorAd = {
      id: Date.now().toString(),
      name: adName,
      subtitle: adSubtitle || "Main Sponsor",
      status: "Active",
    }

    setAds([...ads, newAd])
    setShowAddAdModal(false)
    setAdName("")
    setAdSubtitle("")
    toast.success("Sponsor ad added successfully!")
  }

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(ruleResultNum) || 1
    const newRule: AdRule = {
      id: Date.now().toString(),
      resultNumber: num,
      adName: ruleSelectedAd,
    }

    setRules([...rules, newRule])
    setShowAddRuleModal(false)
    toast.success(`Rule configured for Result #${num}!`)
  }

  const handleArchiveAd = (id: string) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Archived" : "Active" } : a))
    toast.info("Sponsor ad status updated.")
  }

  // Evaluate matching rule for test result number
  const matchingRule = rules.find(r => r.resultNumber === parseInt(testResultNum))

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-16">
      {/* ── HEADER (Screenshot 9) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Poster ads
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select which ad appears for each published result number.
          </p>
        </div>

        <Button
          onClick={() => setShowAddAdModal(true)}
          className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add ad
        </Button>
      </div>

      {/* ── 2-COLUMN MAIN LAYOUT (Screenshot 9) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ── LEFT CARD: ADS (6 cols) ── */}
        <div className="md:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">Ads</h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Upload sponsor artwork before you make a rule.
              </p>
            </div>
            <button
              onClick={() => setShowAddAdModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 flex flex-col justify-between"
              >
                {/* Visual Art Preview Card */}
                <div className="h-32 bg-gradient-to-tr from-slate-100 to-indigo-50/50 p-4 flex flex-col justify-between border-b border-slate-200">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Model Sector
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Sahityotsav
                    </span>
                    <span className="text-[9px] text-slate-400 block">2026 Place Sponsor</span>
                  </div>
                  <div />
                </div>

                <div className="p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{ad.name}</h3>
                      <span className="text-[10px] text-slate-400">{ad.subtitle}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ad.status === "Active" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-500"
                    }`}>
                      {ad.status}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchiveAd(ad.id)}
                    className="w-full rounded-lg text-[11px] h-7 border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {ad.status === "Active" ? "Archive" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: TEST A RESULT & RULES (6 cols) ── */}
        <div className="md:col-span-6 space-y-5">
          {/* Test a Result Card (Screenshot 9) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5 text-xs font-semibold text-slate-700">
            <div>
              <h2 className="text-sm font-black text-slate-900">Test a result</h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Exact rules override ranges. Ranges override the default.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Result number</label>
              <Input
                type="number"
                value={testResultNum}
                onChange={(e) => setTestResultNum(e.target.value)}
                className="h-9 text-xs font-bold w-full"
              />
            </div>

            {/* Evaluation Result Box */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              {matchingRule ? (
                <>
                  <div className="text-xs font-bold text-indigo-700">
                    Showing Ad: {matchingRule.adName}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Matched rule for Result #{matchingRule.resultNumber}.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold text-slate-900">No ad</div>
                  <p className="text-[11px] text-slate-500 font-normal">
                    This poster stays unchanged.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Rules Card (Screenshot 9) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Rules</h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Changes apply to the next poster generation.
                </p>
              </div>
              <button
                onClick={() => setShowAddRuleModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>

            {rules.length > 0 ? (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Result #{rule.resultNumber}</span>
                      <span className="text-slate-500 ml-2">→ Sponsor: {rule.adName}</span>
                    </div>
                    <button
                      onClick={() => setRules(rules.filter(r => r.id !== rule.id))}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 font-normal text-xs flex flex-col items-center gap-1.5">
                <Megaphone className="h-6 w-6 text-slate-300" />
                <span>No rules</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ADD AD MODAL ── */}
      {showAddAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Add Sponsor Artwork</h2>
              <button onClick={() => setShowAddAdModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Sponsor / Ad Name</label>
                <Input
                  required
                  placeholder="e.g. Sahityotsav Title Sponsor"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Subtitle / Tagline</label>
                <Input
                  placeholder="e.g. Associate Partner 2026"
                  value={adSubtitle}
                  onChange={(e) => setAdSubtitle(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Artwork Image</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddAdModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Sponsor Ad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD RULE MODAL ── */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Add Poster Ad Rule</h2>
              <button onClick={() => setShowAddRuleModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Result Number (Published Index)</label>
                <Input
                  type="number"
                  required
                  value={ruleResultNum}
                  onChange={(e) => setRuleResultNum(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Assign Sponsor Ad</label>
                <select
                  value={ruleSelectedAd}
                  onChange={(e) => setRuleSelectedAd(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  {ads.map(a => (
                    <option key={a.id} value={a.name}>{a.name} ({a.subtitle})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddRuleModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
