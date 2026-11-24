"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getFestivalStages } from "@/lib/actions/festival"
import type { FestivalStage } from "@/types/festival"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Tv, Plus, ExternalLink, Copy, QrCode, Monitor,
  X, Check, Trash2, Edit3, Loader2, Sparkles
} from "lucide-react"

interface CustomScreen {
  id: string
  name: string
  type: string
  stageName?: string
  url: string
}

export default function TvDisplaysPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [stages, setStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)
  const [customScreens, setCustomScreens] = useState<CustomScreen[]>([])

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState<string | null>(null)
  const [screenName, setScreenName] = useState("")
  const [screenType, setScreenType] = useState("stage_board")
  const [screenStage, setScreenStage] = useState("")

  const [copied, setCopied] = useState(false)

  const portalBase = typeof window !== "undefined" ? window.location.origin : "https://festpro.ahraz.site"
  const allStagesUrl = `${portalBase}/live?festival=${festivalId}`

  useEffect(() => {
    async function load() {
      try {
        const stgs = await getFestivalStages(festivalId)
        const stageList = (stgs || []) as FestivalStage[]
        setStages(stageList)
        if (stageList[0]) setScreenStage(stageList[0].id)

        // Restore custom screens from storage if any
        try {
          const cached = localStorage.getItem(`festpro_tv_screens_${festivalId}`)
          if (cached) setCustomScreens(JSON.parse(cached))
        } catch {}
      } catch (err) {
        console.error("Failed to load stages for TV:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [festivalId])

  const saveScreens = (screens: CustomScreen[]) => {
    setCustomScreens(screens)
    try {
      localStorage.setItem(`festpro_tv_screens_${festivalId}`, JSON.stringify(screens))
    } catch {}
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Live display URL copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddScreen = (e: React.FormEvent) => {
    e.preventDefault()
    if (!screenName.trim()) {
      toast.error("Screen name is required")
      return
    }

    const stageObj = stages.find((s) => s.id === screenStage)
    const newScreen: CustomScreen = {
      id: "screen-" + Date.now(),
      name: screenName,
      type: screenType,
      stageName: stageObj ? stageObj.name : "All Stages",
      url: `${portalBase}/live?festival=${festivalId}&stage=${screenStage}&type=${screenType}`,
    }

    const updated = [...customScreens, newScreen]
    saveScreens(updated)
    toast.success("TV screen added")
    setShowAddModal(false)
    setScreenName("")
  }

  const handleAddScreenForEachStage = () => {
    if (stages.length === 0) {
      toast.error("No stages available yet")
      return
    }

    const created: CustomScreen[] = stages.map((stg) => ({
      id: "screen-" + stg.id + "-" + Date.now(),
      name: `${stg.name} Display`,
      type: "stage_board",
      stageName: stg.name,
      url: `${portalBase}/live?festival=${festivalId}&stage=${stg.id}&type=stage_board`,
    }))

    const combined = [...customScreens, ...created]
    saveScreens(combined)
    toast.success(`Created ${created.length} TV display screens for all stages`)
  }

  const handleDeleteScreen = (id: string) => {
    const updated = customScreens.filter((s) => s.id !== id)
    saveScreens(updated)
    toast.success("Screen removed")
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 4) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TV displays</h1>
          <p className="text-xs text-slate-500 font-medium">Fullscreen projection feeds for LED walls, audience halls, and stage boards</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add a screen for each stage button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddScreenForEachStage}
            className="rounded-xl text-xs font-semibold px-3.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Add a screen for each stage
          </Button>

          {/* Add screen button */}
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add screen
          </Button>
        </div>
      </div>

      {/* ── DEFAULT LIVE SCREEN (Screenshot 4: All stages Card) ── */}
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-300 transition-all space-y-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800 font-black text-base">
            <Monitor className="h-5 w-5 text-indigo-600" />
            <span>All stages</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 truncate">
            {allStagesUrl}
          </div>
        </div>

        {/* Feature Tags (Screenshot 4: Stage board, Latest results) */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
            Stage board
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
            Latest results
          </span>
        </div>

        {/* Action Buttons (Screenshot 4: Open, Copy link, QR code) */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <a
            href={allStagesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            <span>Open</span>
          </a>

          <button
            onClick={() => handleCopy(allStagesUrl)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-indigo-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>

          <button
            onClick={() => setShowQrModal(allStagesUrl)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <QrCode className="h-3.5 w-3.5 text-slate-500" />
            <span>QR code</span>
          </button>
        </div>
      </div>

      {/* ── CUSTOM SCREENS SECTION (Screenshot 4) ── */}
      {customScreens.length === 0 ? (
        /* Empty State Matching Screenshot 4 */
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs max-w-2xl">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">No screens of your own yet</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Add a screen to choose what a TV shows.</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add screen
          </Button>
        </div>
      ) : (
        /* Grid of Custom Screens */
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Your Custom Screens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customScreens.map((screen) => (
              <div
                key={screen.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900">{screen.name}</h3>
                    <button
                      onClick={() => handleDeleteScreen(screen.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{screen.stageName} · {screen.type}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={screen.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3 w-3" /> Open
                  </a>
                  <button
                    onClick={() => handleCopy(screen.url)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                  <button
                    onClick={() => setShowQrModal(screen.url)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <QrCode className="h-3 w-3" /> QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADD SCREEN MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Add TV Screen</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddScreen} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Screen Name *</label>
                <Input
                  required
                  placeholder="e.g. Auditorium LED Wall, Stage 1 TV"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Screen Mode</label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="stage_board">Live Stage Board (Current & Next)</option>
                  <option value="leaderboard">Team Points Leaderboard</option>
                  <option value="results">Latest Published Results Ticker</option>
                  <option value="welcome">Festival Welcome Screen</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Target Stage</label>
                <select
                  value={screenStage}
                  onChange={(e) => setScreenStage(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="">All Stages</option>
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>{stg.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Create Screen
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QR CODE MODAL ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Scan to Open Display</h3>
              <button onClick={() => setShowQrModal(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              {/* Dynamic QR Code Generator Image */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(showQrModal)}`}
                alt="Display QR Code"
                className="h-48 w-48 rounded-lg shadow-xs"
              />
            </div>

            <p className="text-xs text-slate-500 font-medium">Scan with smart TV camera or phone to launch fullscreen display.</p>

            <Button
              size="sm"
              onClick={() => handleCopy(showQrModal)}
              className="w-full rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Copy Link
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
