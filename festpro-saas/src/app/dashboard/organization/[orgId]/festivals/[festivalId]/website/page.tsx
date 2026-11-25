"use client"

import React, { useState, useEffect, useTransition, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Layout,
  Layers,
  Palette,
  Zap,
  Image as ImageIcon,
  Globe,
  Code,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Plus,
  Trash2,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Check,
  Sliders,
  Share2,
  Video,
  Sparkles,
} from "lucide-react"
import FestivalSiteRenderer from "@/components/studio/FestivalSiteRenderer"
import {
  getFestivalWebsiteConfigAction,
  saveFestivalWebsiteConfigAction,
} from "@/lib/actions/website-builder"
import {
  getPublicResults,
  getPublicTeamPoints,
  getPublicSchedules,
  getPublicStats,
} from "@/lib/actions/certificate"
import {
  type FestivalWebsiteConfig,
  type BuilderSection,
  type SectionWidgetType,
  type VideoPlatform,
  type SliderSlideItem,
  RECOMMENDED_COLOR_PALETTES,
  FONT_OPTIONS,
  SHAPE_PRESETS,
  READY_MADE_TEMPLATES,
  getDefaultWebsiteConfig,
} from "@/types/website-studio"

type StudioPanelId =
  | "templates"
  | "sections"
  | "design"
  | "header"
  | "footer"
  | "media"
  | "motion"
  | "seo"

export default function FesProStudioPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [festivalData, setFestivalData] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [stats, setStats] = useState({ competitionsCount: 0, participantsCount: 0, stagesCount: 0 })

  // Studio Panels & Sub-tabs
  const [activePanel, setActivePanel] = useState<StudioPanelId>("sections")
  const [sectionSubTab, setSectionSubTab] = useState<"content" | "layout" | "background" | "effects">("background")
  const [designSubTab, setDesignSubTab] = useState<"colors" | "typography" | "shape">("colors")
  const [mediaSubTab, setMediaSubTab] = useState<"gallery" | "videos">("gallery")
  const [seoSubTab, setSeoSubTab] = useState<"news" | "popup" | "seo">("news")

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("sec-hero")
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)

  // Config & Undo/Redo Stack
  const [config, setConfig] = useState<FestivalWebsiteConfig>(() => getDefaultWebsiteConfig())
  const [history, setHistory] = useState<FestivalWebsiteConfig[]>(() => [getDefaultWebsiteConfig()])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  // Temp inputs
  const [newPhoto, setNewPhoto] = useState({ title: "", url: "", category: "Stage" })
  const [newVideo, setNewVideo] = useState<{
    title: string
    url: string
    platform: VideoPlatform
    aspectRatio: "16:9" | "9:16" | "1:1"
  }>({ title: "", url: "", platform: "youtube", aspectRatio: "16:9" })
  const [newNews, setNewNews] = useState({ title: "", date: "Today", badge: "Update", content: "" })
  const [newBgSlideUrl, setNewBgSlideUrl] = useState("")
  const [newSlide, setNewSlide] = useState({ imageUrl: "", heading: "", description: "", ctaText: "Explore" })

  useEffect(() => {
    let active = true
    const safetyTimer = setTimeout(() => {
      if (active) setLoading(false)
    }, 5000)

    async function syncStudioData() {
      try {
        const [cfgRes, rRes, tRes, sRes, stRes] = await Promise.allSettled([
          getFestivalWebsiteConfigAction(festivalId),
          getPublicResults(festivalId),
          getPublicTeamPoints(festivalId),
          getPublicSchedules(festivalId),
          getPublicStats(festivalId),
        ])

        if (!active) return

        if (cfgRes.status === "fulfilled" && cfgRes.value?.success && cfgRes.value?.data) {
          setFestivalData(cfgRes.value.data.festival)
          if (cfgRes.value.data.config) {
            setConfig(cfgRes.value.data.config)
            setHistory([cfgRes.value.data.config])
            setHistoryIdx(0)
          }
        }
        if (rRes.status === "fulfilled" && rRes.value?.data) setResults(rRes.value.data)
        if (tRes.status === "fulfilled" && tRes.value?.data) setTeamPoints(tRes.value.data)
        if (sRes.status === "fulfilled" && sRes.value?.data) setSchedules(sRes.value.data)
        if (stRes.status === "fulfilled" && stRes.value?.data) setStats(stRes.value.data)
      } catch (err) {
        console.warn("Studio sync warning:", err)
      } finally {
        clearTimeout(safetyTimer)
        if (active) setLoading(false)
      }
    }

    syncStudioData()
    return () => {
      active = false
      clearTimeout(safetyTimer)
    }
  }, [festivalId])

  const updateConfig = useCallback(
    (updater: FestivalWebsiteConfig | ((prev: FestivalWebsiteConfig) => FestivalWebsiteConfig)) => {
      setConfig((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        setHistory((h) => {
          const sliced = h.slice(0, historyIdx + 1)
          const updated = [...sliced, next].slice(-30)
          setHistoryIdx(updated.length - 1)
          return updated
        })
        setHasUnsaved(true)
        return next
      })
    },
    [historyIdx]
  )

  const updateSelectedSection = (patchFn: (sec: BuilderSection) => BuilderSection) => {
    if (!selectedSectionId) return
    updateConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) => (s.id === selectedSectionId ? patchFn(s) : s)),
    }))
  }

  const handleUndo = () => {
    if (historyIdx > 0) {
      const targetIdx = historyIdx - 1
      setHistoryIdx(targetIdx)
      setConfig(history[targetIdx])
      setHasUnsaved(true)
    }
  }

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const targetIdx = historyIdx + 1
      setHistoryIdx(targetIdx)
      setConfig(history[targetIdx])
      setHasUnsaved(true)
    }
  }

  const handleSavePublish = () => {
    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, config)
      if (res.error) {
        toast.error(res.error)
      } else {
        setHasUnsaved(false)
        toast.success("FesPro Studio site published live!")
      }
    })
  }

  const applyTemplate = (tplId: string) => {
    const tpl = READY_MADE_TEMPLATES.find((t) => t.id === tplId)
    if (!tpl) return
    updateConfig((prev) => ({
      ...prev,
      templateId: tpl.id,
      globalDesign: { ...prev.globalDesign!, ...(tpl.patch.globalDesign || {}) },
    }))
    toast.success(`Applied "${tpl.name}" template!`)
  }

  const addSectionWidget = (type: SectionWidgetType, label: string, insertAfterSelected = true) => {
    const defaultSettings: Record<string, any> =
      type === "marquee"
        ? { text: "🔥 FESTIVAL LIVE UPDATES • CHECK RESULTS & SCHEDULES •", speedSeconds: 20 }
        : type === "slider_banner"
        ? {
            autoplay: true,
            transition: "fade",
            intervalMs: 4500,
            showArrows: true,
            showDots: true,
            slides: [
              {
                id: `sl-${Date.now()}`,
                imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
                heading: "Festival Spotlight",
                description: "Explore live competitions and stage events.",
                ctaText: "View Results",
                ctaUrl: "#results",
                overlayOpacity: 45,
              },
            ],
          }
        : type === "gif_banner"
        ? { mediaUrl: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "Live Festival Celebrations!", subtitle: "Catch every stage moment live" }
        : type === "image_banner"
        ? { mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80", title: "Welcome to Our Campus Festival", subtitle: "Three days of art, culture, and brilliance" }
        : type === "heading_banner"
        ? { heading: "Highlight Section Title", subheading: "Official updates & announcements" }
        : {}

    const newSec: BuilderSection = {
      id: `sec-${Date.now()}`,
      type,
      label,
      enabled: true,
      background: { type: "inherit", overlayOpacity: 50 },
      layout: { widthMode: type === "marquee" ? "full" : "boxed", paddingY: type === "marquee" ? "compact" : "normal" },
      effects: { entrance: "fade_up", hover: "none", topDivider: "none", bottomDivider: "none", opacity: 100 },
      settings: defaultSettings,
    }

    updateConfig((prev) => {
      const list = [...(prev.sections || [])]
      const selIdx = selectedSectionId ? list.findIndex((s) => s.id === selectedSectionId) : -1
      if (insertAfterSelected && selIdx !== -1) {
        list.splice(selIdx + 1, 0, newSec)
      } else {
        list.push(newSec)
      }
      return { ...prev, sections: list }
    })
    setSelectedSectionId(newSec.id)
    setSectionSubTab("content")
    toast.success(`Inserted "${label}"`)
  }

  const moveSection = (index: number, dir: -1 | 1) => {
    updateConfig((prev) => {
      const arr = [...(prev.sections || [])]
      const target = index + dir
      if (target < 0 || target >= arr.length) return prev
      const [item] = arr.splice(index, 1)
      arr.splice(target, 0, item)
      return { ...prev, sections: arr }
    })
  }

  const handleDropSection = (targetId: string) => {
    if (!draggedSectionId || draggedSectionId === targetId) return
    updateConfig((prev) => {
      const arr = [...(prev.sections || [])]
      const fromIdx = arr.findIndex((s) => s.id === draggedSectionId)
      const toIdx = arr.findIndex((s) => s.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [item] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, item)
      return { ...prev, sections: arr }
    })
    setDraggedSectionId(null)
  }

  const festSlug =
    festivalData?.short_name?.toLowerCase() ||
    festivalData?.code?.toLowerCase() ||
    festivalData?.name?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    festivalId
  const liveSiteUrl = `https://${festSlug}.ahraz.site`

  const selectedSection = (config.sections || []).find((s) => s.id === selectedSectionId)
  const palette = config.globalDesign!.palette
  const typo = config.globalDesign!.typography
  const shape = config.globalDesign!.shape
  const motion = config.motionStudio!
  const hdr = config.headerConfig!

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── TOP STUDIO BAR ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}`}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Back to Festival Console"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xs text-white shrink-0">
              FS
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-white">FesPro Studio</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-black uppercase">
                  PRO
                </span>
                {loading && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Syncing
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {festivalData?.name || "Festival Designer"} {hasUnsaved && "• Unsaved changes"}
              </p>
            </div>
          </div>
        </div>

        {/* Center Controls */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button onClick={handleUndo} disabled={historyIdx <= 0} className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer" title="Undo">
              <Undo className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleRedo} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer" title="Redo">
              <Redo className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[
              { id: "desktop", icon: Monitor },
              { id: "tablet", icon: Tablet },
              { id: "mobile", icon: Smartphone },
            ].map((v) => {
              const Icon = v.icon
              return (
                <button
                  key={v.id}
                  onClick={() => setViewport(v.id as any)}
                  className={`p-1.5 rounded cursor-pointer ${viewport === v.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
              isPreviewMode ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isPreviewMode ? "Clean Preview" : "Preview"}</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={liveSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold"
          >
            <span>Open Live</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={handleSavePublish}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isPending ? "Publishing..." : "Publish Site"}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN IDE WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          <aside className="flex h-full border-r border-slate-800 bg-slate-900 shrink-0 z-20">
            {/* Updated FesPro Studio Sidebar Rail (Zero Stickers Tab) */}
            <nav className="w-16 border-r border-slate-800 flex flex-col items-center py-3 gap-1.5 overflow-y-auto bg-slate-950/60">
              {[
                { id: "sections", label: "Sections", icon: Layers },
                { id: "templates", label: "Templates", icon: Layout },
                { id: "design", label: "Design", icon: Palette },
                { id: "header", label: "Header", icon: Sparkles },
                { id: "footer", label: "Footer", icon: Share2 },
                { id: "media", label: "Media", icon: ImageIcon },
                { id: "motion", label: "Motion", icon: Zap },
                { id: "seo", label: "Advanced", icon: Code },
              ].map((item) => {
                const Icon = item.icon
                const active = activePanel === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id as StudioPanelId)}
                    className={`w-12 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-bold">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Inspector Panel */}
            <div className="w-80 sm:w-88 overflow-y-auto p-4 space-y-5 bg-slate-900 text-xs">
              {/* ── 1. SECTION BUILDER + PER-SECTION BACKGROUND STUDIO + BETWEEN-SECTION INSERT ── */}
              {activePanel === "sections" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Section &amp; Background Studio</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag to reorder, edit per-section Background/Layout/Effects, or insert Banners &amp; Sliders between sections.
                    </p>
                  </div>

                  {/* Section Stack */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {(config.sections || []).map((sec, idx) => {
                      const isSel = selectedSectionId === sec.id
                      return (
                        <div
                          key={sec.id}
                          draggable
                          onDragStart={() => setDraggedSectionId(sec.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropSection(sec.id)}
                          onClick={() => setSelectedSectionId(sec.id)}
                          className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isSel ? "border-indigo-500 bg-indigo-500/15" : "border-slate-800 bg-slate-950/60"
                          } ${!sec.enabled ? "opacity-50" : ""}`}
                        >
                          <GripVertical className="h-3.5 w-3.5 text-slate-500 cursor-grab shrink-0" />
                          <div className="flex-1 min-w-0 truncate font-bold text-slate-200">{sec.label}</div>
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => moveSection(idx, -1)} className="p-0.5 text-slate-400 hover:text-white">
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button onClick={() => moveSection(idx, 1)} className="p-0.5 text-slate-400 hover:text-white">
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <input
                              type="checkbox"
                              checked={sec.enabled}
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  sections: (prev.sections || []).map((s) =>
                                    s.id === sec.id ? { ...s, enabled: e.target.checked } : s
                                  ),
                                }))
                              }
                              className="accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Elementor-style Inspector for Selected Section */}
                  {selectedSection && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-400 text-[10px] uppercase">
                          Editing: {selectedSection.label}
                        </span>
                        {selectedSection.type !== "hero" && (
                          <button
                            onClick={() => {
                              updateConfig((prev) => ({
                                ...prev,
                                sections: (prev.sections || []).filter((s) => s.id !== selectedSection.id),
                              }))
                              setSelectedSectionId("sec-hero")
                            }}
                            className="text-rose-400 hover:text-rose-300"
                            title="Delete Section"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 4 Subtabs: Content | Background | Layout | Effects */}
                      <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg">
                        {[
                          { id: "content", label: "Content" },
                          { id: "background", label: "BG Studio" },
                          { id: "layout", label: "Layout" },
                          { id: "effects", label: "Effects" },
                        ].map((st) => (
                          <button
                            key={st.id}
                            onClick={() => setSectionSubTab(st.id as any)}
                            className={`py-1 rounded text-[10px] font-bold cursor-pointer ${
                              sectionSubTab === st.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      {/* SUBTAB A: SECTION BACKGROUND STUDIO */}
                      {sectionSubTab === "background" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Section Background Type
                            </label>
                            <select
                              value={selectedSection.background?.type || "inherit"}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  background: { ...s.background, type: e.target.value as any },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
                            >
                              <option value="inherit">Inherit Theme Background</option>
                              <option value="solid">Solid Color</option>
                              <option value="gradient">Custom Gradient</option>
                              <option value="image">Image Background</option>
                              <option value="gif">Animated GIF Background</option>
                              <option value="slider">Background Image Slider</option>
                              <option value="video">Loop MP4 Video Background</option>
                              <option value="pattern">Pattern / Dots / Grid</option>
                              <option value="glass">Blur / Glassmorphism</option>
                            </select>
                          </div>

                          {selectedSection.background?.type === "solid" && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Solid Color</span>
                              <input
                                type="color"
                                value={selectedSection.background.solidColor || palette.surface}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    background: { ...s.background!, solidColor: e.target.value },
                                  }))
                                }
                                className="h-7 w-10 rounded bg-slate-900 border border-slate-700"
                              />
                            </div>
                          )}

                          {selectedSection.background?.type === "gradient" && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400">From</label>
                                <input
                                  type="color"
                                  value={selectedSection.background.gradientFrom || palette.primary}
                                  onChange={(e) =>
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      background: { ...s.background!, gradientFrom: e.target.value },
                                    }))
                                  }
                                  className="w-full h-7 rounded bg-slate-900"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400">To</label>
                                <input
                                  type="color"
                                  value={selectedSection.background.gradientTo || palette.background}
                                  onChange={(e) =>
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      background: { ...s.background!, gradientTo: e.target.value },
                                    }))
                                  }
                                  className="w-full h-7 rounded bg-slate-900"
                                />
                              </div>
                            </div>
                          )}

                          {(selectedSection.background?.type === "image" || selectedSection.background?.type === "gif") && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder={
                                  selectedSection.background.type === "gif"
                                    ? "Paste Animated GIF URL (https://...gif)"
                                    : "Paste Background Image URL"
                                }
                                value={selectedSection.background.imageUrl || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    background: { ...s.background!, imageUrl: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={selectedSection.background.attachment || "scroll"}
                                  onChange={(e) =>
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      background: { ...s.background!, attachment: e.target.value as any },
                                    }))
                                  }
                                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                                >
                                  <option value="scroll">Normal Scroll</option>
                                  <option value="fixed">Fixed Parallax</option>
                                </select>
                                <select
                                  value={selectedSection.background.bgAnimation || "none"}
                                  onChange={(e) =>
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      background: { ...s.background!, bgAnimation: e.target.value as any },
                                    }))
                                  }
                                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                                >
                                  <option value="none">No Motion</option>
                                  <option value="ken_burns">Ken Burns Slow Pan</option>
                                  <option value="zoom">Slight Zoom</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {selectedSection.background?.type === "video" && (
                            <input
                              type="text"
                              placeholder="MP4 Background Loop URL"
                              value={selectedSection.background.videoUrl || ""}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  background: { ...s.background!, videoUrl: e.target.value },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                            />
                          )}

                          {selectedSection.background?.type === "slider" && (
                            <div className="space-y-2">
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Add Slide Image URL..."
                                  value={newBgSlideUrl}
                                  onChange={(e) => setNewBgSlideUrl(e.target.value)}
                                  className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                                />
                                <button
                                  onClick={() => {
                                    if (!newBgSlideUrl.trim()) return
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      background: {
                                        ...s.background!,
                                        sliderImages: [...(s.background?.sliderImages || []), newBgSlideUrl.trim()],
                                      },
                                    }))
                                    setNewBgSlideUrl("")
                                  }}
                                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold"
                                >
                                  Add
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {(selectedSection.background.sliderImages || []).length} background slide(s) active
                              </div>
                            </div>
                          )}

                          {selectedSection.background?.type === "pattern" && (
                            <select
                              value={selectedSection.background.patternType || "dots"}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  background: { ...s.background!, patternType: e.target.value as any },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                            >
                              <option value="dots">Modern Dots</option>
                              <option value="grid">Architectural Grid</option>
                            </select>
                          )}

                          {/* Overlay Opacity */}
                          <div>
                            <label className="text-[10px] text-slate-400">
                              Background Overlay Opacity: {selectedSection.background?.overlayOpacity ?? 50}%
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={95}
                              value={selectedSection.background?.overlayOpacity ?? 50}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  background: {
                                    ...s.background!,
                                    type: s.background?.type || "inherit",
                                    overlayOpacity: Number(e.target.value),
                                  },
                                }))
                              }
                              className="w-full accent-indigo-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* SUBTAB B: SECTION LAYOUT */}
                      {sectionSubTab === "layout" && (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400">Width Mode</label>
                              <select
                                value={selectedSection.layout?.widthMode || "boxed"}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    layout: { ...s.layout!, widthMode: e.target.value as any },
                                  }))
                                }
                                className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                              >
                                <option value="boxed">Boxed Container</option>
                                <option value="full">Full Width</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">Vertical Padding</label>
                              <select
                                value={selectedSection.layout?.paddingY || "normal"}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    layout: { ...s.layout!, paddingY: e.target.value as any },
                                  }))
                                }
                                className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                              >
                                <option value="compact">Compact</option>
                                <option value="normal">Normal</option>
                                <option value="spacious">Spacious</option>
                                <option value="heroic">Heroic Tall</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400">Min Height</label>
                              <select
                                value={selectedSection.layout?.minHeight || "auto"}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    layout: { ...s.layout!, minHeight: e.target.value },
                                  }))
                                }
                                className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                              >
                                <option value="auto">Auto</option>
                                <option value="280px">280px</option>
                                <option value="420px">420px</option>
                                <option value="580px">580px</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">Visibility</label>
                              <select
                                value={selectedSection.visibility || "all"}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({ ...s, visibility: e.target.value as any }))
                                }
                                className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                              >
                                <option value="all">All Devices</option>
                                <option value="desktop">Desktop Only</option>
                                <option value="mobile">Mobile Only</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB C: SECTION EFFECTS & SVG SHAPE DIVIDERS */}
                      {sectionSubTab === "effects" && (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400">Top Shape Divider</label>
                              <select
                                value={selectedSection.effects?.topDivider || "none"}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    effects: { ...s.effects!, topDivider: e.target.value as any },
                                  }))
                                }
                                className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                              >
                                <option value="none">None</option>
                                <option value="wave">Wave</option>
                                <option value="curve">Smooth Curve</option>
                                <option value="angle">Angle</option>
                                <option value="triangle">Triangle</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">Bottom Shape Divider</label>
                              <select
                                value={selectedSection.effects?.bottomDivider || "none"}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    effects: { ...s.effects!, bottomDivider: e.target.value as any },
                                  }))
                                }
                                className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                              >
                                <option value="none">None</option>
                                <option value="wave">Wave</option>
                                <option value="curve">Smooth Curve</option>
                                <option value="angle">Angle</option>
                                <option value="triangle">Triangle</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400">Entrance Animation</label>
                            <select
                              value={selectedSection.effects?.entrance || "inherit"}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  effects: { ...s.effects!, entrance: e.target.value as any },
                                }))
                              }
                              className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white mt-0.5"
                            >
                              <option value="inherit">Inherit Global</option>
                              <option value="fade_up">Fade Up</option>
                              <option value="zoom_in">Zoom In</option>
                              <option value="none">No Animation</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB D: SECTION CONTENT & SLIDER STUDIO */}
                      {sectionSubTab === "content" && (
                        <div className="space-y-2.5">
                          {selectedSection.type === "hero" && (
                            <>
                              <input
                                type="text"
                                placeholder="Hero Main Heading"
                                value={config.heroTitle || ""}
                                onChange={(e) => updateConfig((p) => ({ ...p, heroTitle: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                              />
                              <textarea
                                rows={2}
                                placeholder="Hero Subtitle"
                                value={config.heroSubtitle || ""}
                                onChange={(e) => updateConfig((p) => ({ ...p, heroSubtitle: e.target.value }))}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                            </>
                          )}

                          {selectedSection.type === "marquee" && (
                            <>
                              <textarea
                                rows={3}
                                placeholder="Marquee ticker scrolling text..."
                                value={selectedSection.settings?.text || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, text: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <label className="text-[10px] text-slate-400">
                                Scroll Speed: {selectedSection.settings?.speedSeconds || 22}s
                              </label>
                              <input
                                type="range"
                                min={8}
                                max={45}
                                value={selectedSection.settings?.speedSeconds || 22}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, speedSeconds: Number(e.target.value) },
                                  }))
                                }
                                className="w-full accent-indigo-500"
                              />
                            </>
                          )}

                          {(selectedSection.type === "image_banner" || selectedSection.type === "gif_banner") && (
                            <>
                              <input
                                type="text"
                                placeholder="Image or GIF URL"
                                value={selectedSection.settings?.mediaUrl || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, mediaUrl: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Overlay Title (Optional)"
                                value={selectedSection.settings?.title || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, title: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                            </>
                          )}

                          {selectedSection.type === "slider_banner" && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={selectedSection.settings?.transition || "fade"}
                                  onChange={(e) =>
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      settings: { ...s.settings, transition: e.target.value },
                                    }))
                                  }
                                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                                >
                                  <option value="fade">Fade</option>
                                  <option value="zoom">Zoom</option>
                                  <option value="ken_burns">Ken Burns</option>
                                </select>
                                <label className="flex items-center gap-1.5 text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={selectedSection.settings?.autoplay !== false}
                                    onChange={(e) =>
                                      updateSelectedSection((s) => ({
                                        ...s,
                                        settings: { ...s.settings, autoplay: e.target.checked },
                                      }))
                                    }
                                    className="accent-indigo-500"
                                  />
                                  Autoplay
                                </label>
                              </div>

                              <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1.5">
                                <span className="text-[10px] font-bold text-indigo-400">+ Add New Slide</span>
                                <input
                                  type="text"
                                  placeholder="Slide Image URL"
                                  value={newSlide.imageUrl}
                                  onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Slide Heading"
                                  value={newSlide.heading}
                                  onChange={(e) => setNewSlide({ ...newSlide, heading: e.target.value })}
                                  className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white"
                                />
                                <button
                                  onClick={() => {
                                    if (!newSlide.imageUrl.trim()) return
                                    const item: SliderSlideItem = {
                                      id: `sl-${Date.now()}`,
                                      imageUrl: newSlide.imageUrl.trim(),
                                      heading: newSlide.heading || "Festival Highlight",
                                      ctaText: newSlide.ctaText,
                                      ctaUrl: "#results",
                                      overlayOpacity: 45,
                                    }
                                    updateSelectedSection((s) => ({
                                      ...s,
                                      settings: { ...s.settings, slides: [...(s.settings?.slides || []), item] },
                                    }))
                                    setNewSlide({ imageUrl: "", heading: "", description: "", ctaText: "Explore" })
                                    toast.success("Slide added to Slider!")
                                  }}
                                  className="w-full py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                                >
                                  Add Slide
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedSection.type === "announcement_bar" && (
                            <input
                              type="text"
                              placeholder="Alert notice text..."
                              value={selectedSection.settings?.text || ""}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  settings: { ...s.settings, text: e.target.value },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                            />
                          )}

                          {selectedSection.type === "custom_html" && (
                            <textarea
                              rows={4}
                              placeholder="<div>Custom HTML</div>"
                              value={selectedSection.settings?.html || ""}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  settings: { ...s.settings, html: e.target.value },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-[11px]"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Between-Sections Creative Component Insert Library */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                      + Insert Between Sections (Creative Library)
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { type: "image_banner", label: "Image Banner" },
                        { type: "gif_banner", label: "GIF Banner" },
                        { type: "slider_banner", label: "Image Slider" },
                        { type: "video_banner", label: "Video Banner" },
                        { type: "marquee", label: "Live Marquee" },
                        { type: "promo_banner", label: "Promo + CTA" },
                        { type: "announcement_bar", label: "Notice Strip" },
                        { type: "logo_carousel", label: "Sponsor Logos" },
                        { type: "testimonial_slider", label: "Testimonials" },
                        { type: "countdown", label: "Countdown Strip" },
                        { type: "heading_banner", label: "Heading Block" },
                        { type: "custom_html", label: "Custom HTML" },
                      ].map((w) => (
                        <button
                          key={w.type}
                          onClick={() => addSectionWidget(w.type as SectionWidgetType, w.label)}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. TEMPLATES ── */}
              {activePanel === "templates" && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-white">Festival Template Kits</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Instant design kits built for every cultural &amp; campus event.</p>
                  </div>
                  <div className="space-y-2.5">
                    {READY_MADE_TEMPLATES.map((tpl) => {
                      const isCurrent = config.templateId === tpl.id
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => applyTemplate(tpl.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isCurrent ? "border-indigo-500 bg-indigo-500/15" : "border-slate-800 bg-slate-950/60"
                          }`}
                        >
                          <div className={`h-12 rounded-lg bg-gradient-to-r ${tpl.previewGradient} mb-2 flex items-end p-2`}>
                            <span className="px-2 py-0.5 rounded bg-black/50 text-white text-[9px] font-bold uppercase">
                              {tpl.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{tpl.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-black text-indigo-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Active
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── 3. GLOBAL DESIGN SYSTEM ── */}
              {activePanel === "design" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: "colors", label: "Colours" },
                      { id: "typography", label: "Fonts" },
                      { id: "shape", label: "Theme & Shape" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDesignSubTab(t.id as any)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                          designSubTab === t.id ? "bg-indigo-600 text-white" : "text-slate-400"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {designSubTab === "colors" && (
                    <div className="space-y-3">
                      {RECOMMENDED_COLOR_PALETTES.map((pal) => (
                        <button
                          key={pal.id}
                          onClick={() =>
                            updateConfig((prev) => ({
                              ...prev,
                              accentColor: pal.primary,
                              themeMode: pal.themeMode,
                              globalDesign: { ...prev.globalDesign!, palette: pal },
                            }))
                          }
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                            palette.id === pal.id ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-950"
                          }`}
                        >
                          <span className="font-bold text-slate-200">{pal.name}</span>
                          <div className="flex -space-x-1">
                            {[pal.primary, pal.secondary, pal.accent, pal.background].map((c, idx) => (
                              <span key={idx} className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </button>
                      ))}

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        {[
                          { key: "primary", label: "Primary Color" },
                          { key: "secondary", label: "Secondary Color" },
                          { key: "accent", label: "Accent Highlight" },
                          { key: "background", label: "Page Background" },
                          { key: "surface", label: "Card Surface" },
                        ].map((cf) => (
                          <div key={cf.key} className="flex items-center justify-between">
                            <span className="text-slate-300">{cf.label}</span>
                            <input
                              type="color"
                              value={(palette as any)[cf.key]}
                              onChange={(e) =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  accentColor: cf.key === "primary" ? e.target.value : prev.accentColor,
                                  globalDesign: {
                                    ...prev.globalDesign!,
                                    palette: { ...palette, id: "custom", [cf.key]: e.target.value },
                                  },
                                }))
                              }
                              className="h-6 w-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {designSubTab === "typography" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400">Heading Font</label>
                        <select
                          value={typo.headingFont}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, headingFont: e.target.value } } }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                        >
                          {FONT_OPTIONS.heading.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Body Font</label>
                        <select
                          value={typo.bodyFont}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, bodyFont: e.target.value } } }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                        >
                          {FONT_OPTIONS.body.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Malayalam Font</label>
                          <select
                            value={typo.malayalamFont}
                            onChange={(e) =>
                              updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, malayalamFont: e.target.value } } }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                          >
                            {FONT_OPTIONS.malayalam.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Arabic Font</label>
                          <select
                            value={typo.arabicFont}
                            onChange={(e) =>
                              updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, arabicFont: e.target.value } } }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                          >
                            {FONT_OPTIONS.arabic.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Custom WOFF2 / TTF Font URL"
                        value={typo.customFontUrl || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, customFontUrl: e.target.value } } }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  )}

                  {designSubTab === "shape" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {SHAPE_PRESETS.map((sp) => (
                          <button
                            key={sp.id}
                            onClick={() =>
                              updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, shape: sp.config } }))
                            }
                            className={`p-2 rounded-xl border text-left cursor-pointer ${
                              shape.stylePreset === sp.id ? "border-indigo-500 bg-indigo-500/15" : "border-slate-800 bg-slate-950"
                            }`}
                          >
                            <div className="font-bold text-white text-[11px]">{sp.name}</div>
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Global Radius</label>
                        <select
                          value={shape.borderRadius}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, shape: { ...shape, borderRadius: e.target.value as any } } }))
                          }
                          className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white mt-1"
                        >
                          <option value="0px">0px (Sharp)</option>
                          <option value="8px">8px</option>
                          <option value="16px">16px</option>
                          <option value="24px">24px</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 4. HEADER DESIGN STUDIO ── */}
              {activePanel === "header" && (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-sm font-black text-white">Header Design Studio</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Customize header background (Solid, Gradient, Image, GIF, Video), layout &amp; scroll behavior.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Header Background Mode</label>
                    <select
                      value={hdr.bgType || "inherit"}
                      onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, bgType: e.target.value as any } }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1 font-semibold"
                    >
                      <option value="inherit">Glass / Blur Default</option>
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Gradient Header</option>
                      <option value="image">Image Background</option>
                      <option value="gif">Animated GIF Background</option>
                      <option value="video">Loop Video Background</option>
                      <option value="transparent">Transparent Header</option>
                    </select>
                  </div>

                  {(hdr.bgType === "image" || hdr.bgType === "gif" || hdr.bgType === "video") && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Header Media URL (Image / GIF / MP4)"
                        value={hdr.bgMediaUrl || ""}
                        onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, bgMediaUrl: e.target.value } }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <label className="text-[10px] text-slate-400">Overlay Opacity: {hdr.overlayOpacity ?? 50}%</label>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        value={hdr.overlayOpacity ?? 50}
                        onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, overlayOpacity: Number(e.target.value) } }))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  )}

                  {hdr.bgType === "solid" && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Header Background Color</span>
                      <input
                        type="color"
                        value={hdr.bgColor || palette.surface}
                        onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, bgColor: e.target.value } }))}
                        className="h-7 w-10 rounded"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Logo Position</label>
                      <select
                        value={hdr.logoPosition || "left"}
                        onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, logoPosition: e.target.value as any } }))}
                        className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white mt-0.5"
                      >
                        <option value="left">Logo Left</option>
                        <option value="center">Logo Center</option>
                        <option value="right">Logo Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Scroll Effect</label>
                      <select
                        value={hdr.scrollEffect || "none"}
                        onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, scrollEffect: e.target.value as any } }))}
                        className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white mt-0.5"
                      >
                        <option value="none">Normal Sticky</option>
                        <option value="shrink">Shrink on Scroll</option>
                        <option value="bg_change">BG Change on Scroll</option>
                        <option value="hide_on_scroll">Hide on Scroll Down</option>
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Custom Header CTA Text (Optional)"
                    value={hdr.ctaText || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, ctaText: e.target.value } }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Visible Header Pages</span>
                    {[
                      { key: "showResults", label: "Live Results" },
                      { key: "showSchedule", label: "Stage Schedules" },
                      { key: "showLeaderboard", label: "Standings" },
                      { key: "showGallery", label: "Gallery" },
                      { key: "showVideos", label: "Videos" },
                      { key: "showNews", label: "News & Bulletins" },
                    ].map((np) => (
                      <label key={np.key} className="flex items-center justify-between cursor-pointer">
                        <span className="text-slate-300">{np.label}</span>
                        <input
                          type="checkbox"
                          checked={(config.navPages as any)?.[np.key] !== false}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, navPages: { ...p.navPages, [np.key]: e.target.checked } }))
                          }
                          className="accent-indigo-500 h-4 w-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 5. FOOTER & SOCIALS ── */}
              {activePanel === "footer" && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-black text-white">Footer &amp; Social Media</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Configure campus info, helpdesk &amp; social channels.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Logo Image URL"
                    value={config.logoUrl || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, logoUrl: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Campus Venue Address"
                    value={config.venueCampus || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, venueCampus: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Helpdesk Phone"
                    value={config.helpdeskPhone || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, helpdeskPhone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Helpdesk Email"
                    value={config.helpdeskEmail || ""}
                    onChange={(e) => updateConfig((p) => ({ ...p, helpdeskEmail: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                  <span className="block text-[10px] font-bold text-slate-400 uppercase pt-2">Social Media URLs</span>
                  {["instagram", "youtube", "whatsapp", "facebook", "twitter"].map((soc) => (
                    <input
                      key={soc}
                      type="text"
                      placeholder={`${soc.toUpperCase()} URL`}
                      value={(config.socialLinks as any)?.[soc] || ""}
                      onChange={(e) =>
                        updateConfig((p) => ({ ...p, socialLinks: { ...p.socialLinks, [soc]: e.target.value } }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  ))}
                </div>
              )}

              {/* ── 6. GALLERY & VIDEO STUDIO ── */}
              {activePanel === "media" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setMediaSubTab("gallery")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        mediaSubTab === "gallery" ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Gallery Builder
                    </button>
                    <button
                      onClick={() => setMediaSubTab("videos")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        mediaSubTab === "videos" ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Video Studio
                    </button>
                  </div>

                  {mediaSubTab === "gallery" ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={config.galleryStudio?.layout || "grid"}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, galleryStudio: { ...p.galleryStudio!, layout: e.target.value as any } }))
                          }
                          className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                        >
                          <option value="grid">Grid Layout</option>
                          <option value="masonry">Masonry</option>
                          <option value="metro">Metro Grid</option>
                          <option value="carousel">Carousel</option>
                        </select>
                        <select
                          value={config.galleryStudio?.aspectRatio || "4:3"}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, galleryStudio: { ...p.galleryStudio!, aspectRatio: e.target.value as any } }))
                          }
                          className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                        >
                          <option value="original">Original Ratio</option>
                          <option value="1:1">1:1 Square</option>
                          <option value="4:3">4:3 Landscape</option>
                          <option value="16:9">16:9 Wide</option>
                          <option value="3:4">3:4 Portrait</option>
                          <option value="9:16">9:16 Story</option>
                        </select>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Photo Title"
                          value={newPhoto.title}
                          onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={newPhoto.url}
                          onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <button
                          onClick={() => {
                            if (!newPhoto.url.trim()) return
                            updateConfig((p) => ({
                              ...p,
                              gallery: [{ id: `g-${Date.now()}`, ...newPhoto }, ...(p.gallery || [])],
                            }))
                            setNewPhoto({ title: "", url: "", category: "Stage" })
                            toast.success("Photo added!")
                          }}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                        >
                          + Add Gallery Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Video Title"
                          value={newVideo.title}
                          onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <select
                          value={newVideo.platform}
                          onChange={(e) => setNewVideo({ ...newVideo, platform: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        >
                          <option value="youtube">YouTube Video / Live</option>
                          <option value="youtube_shorts">YouTube Shorts (9:16)</option>
                          <option value="instagram_reel">Instagram Reel Embed</option>
                          <option value="facebook">Facebook Video</option>
                          <option value="vimeo">Vimeo</option>
                          <option value="mp4">Direct MP4 Video</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Paste Video / Reel / MP4 URL"
                          value={newVideo.url}
                          onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <button
                          onClick={() => {
                            if (!newVideo.url.trim()) return
                            updateConfig((p) => ({
                              ...p,
                              videoStudio: {
                                layout: p.videoStudio?.layout || "featured_playlist",
                                videos: [{ id: `v-${Date.now()}`, ...newVideo }, ...(p.videoStudio?.videos || [])],
                              },
                            }))
                            setNewVideo({ title: "", url: "", platform: "youtube", aspectRatio: "16:9" })
                            toast.success("Video added to playlist!")
                          }}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                        >
                          + Add Video
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 7. MOTION STUDIO ── */}
              {activePanel === "motion" && (
                <div className="space-y-3.5">
                  <h3 className="text-sm font-black text-white">Motion Studio</h3>
                  <select
                    value={motion.defaultEntrance}
                    onChange={(e) =>
                      updateConfig((p) => ({ ...p, motionStudio: { ...motion, defaultEntrance: e.target.value as any } }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="fade_up">Fade Up Reveal</option>
                    <option value="zoom_in">Smooth Zoom In</option>
                    <option value="none">No Entrance Motion</option>
                  </select>
                  <select
                    value={motion.defaultHover}
                    onChange={(e) =>
                      updateConfig((p) => ({ ...p, motionStudio: { ...motion, defaultHover: e.target.value as any } }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="lift">Card Hover Lift</option>
                    <option value="scale">Card Scale (1.02x)</option>
                    <option value="glow">Card Glow</option>
                    <option value="none">None</option>
                  </select>
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
                    <span className="font-bold text-amber-300">Reduced Motion Mode</span>
                    <input
                      type="checkbox"
                      checked={motion.reducedMotion}
                      onChange={(e) =>
                        updateConfig((p) => ({ ...p, motionStudio: { ...motion, reducedMotion: e.target.checked } }))
                      }
                      className="accent-amber-500 h-4 w-4"
                    />
                  </label>
                </div>
              )}

              {/* ── 8. ADVANCED, NEWS, POPUP & SEO ── */}
              {activePanel === "seo" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: "news", label: "News" },
                      { id: "popup", label: "Popup" },
                      { id: "seo", label: "SEO & CSS" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSeoSubTab(t.id as any)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                          seoSubTab === t.id ? "bg-indigo-600 text-white" : "text-slate-400"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {seoSubTab === "news" && (
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="News Headline"
                        value={newNews.title}
                        onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Details..."
                        value={newNews.content}
                        onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <button
                        onClick={() => {
                          if (!newNews.title.trim()) return
                          updateConfig((p) => ({
                            ...p,
                            news: [{ id: `n-${Date.now()}`, ...newNews }, ...(p.news || [])],
                          }))
                          setNewNews({ title: "", date: "Just now", badge: "Bulletin", content: "" })
                          toast.success("News published!")
                        }}
                        className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                      >
                        + Publish Bulletin
                      </button>
                    </div>
                  )}

                  {seoSubTab === "popup" && (
                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="font-bold text-white">Enable Welcome Popup</span>
                        <input
                          type="checkbox"
                          checked={config.popupBuilder?.enabled || false}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, popupBuilder: { ...p.popupBuilder!, enabled: e.target.checked } }))
                          }
                          className="accent-indigo-500 h-4 w-4"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Popup Title"
                        value={config.popupBuilder?.title || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, popupBuilder: { ...p.popupBuilder!, title: e.target.value } }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Popup message..."
                        value={config.popupBuilder?.message || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, popupBuilder: { ...p.popupBuilder!, message: e.target.value } }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  )}

                  {seoSubTab === "seo" && (
                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 cursor-pointer">
                        <span className="font-bold text-rose-300">Maintenance Mode Lock</span>
                        <input
                          type="checkbox"
                          checked={config.seoAndAdvanced?.maintenanceMode || false}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              seoAndAdvanced: { ...p.seoAndAdvanced, maintenanceMode: e.target.checked },
                            }))
                          }
                          className="accent-rose-500 h-4 w-4"
                        />
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Custom CSS Overrides..."
                        value={config.seoAndAdvanced?.customCss || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            seoAndAdvanced: { ...p.seoAndAdvanced, customCss: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* RIGHT PANE: LIVE WYSIWYG CANVAS */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-3 sm:p-6 flex justify-center items-start">
          <div
            className={`transition-all duration-300 border border-slate-800 shadow-2xl overflow-hidden bg-slate-950 ${
              viewport === "mobile"
                ? "w-[390px] rounded-[2rem] border-4 border-slate-800"
                : viewport === "tablet"
                ? "w-[768px] rounded-2xl border-2 border-slate-800"
                : "w-full rounded-xl"
            }`}
          >
            <FestivalSiteRenderer
              festivalName={festivalData?.name || "Festival Portal"}
              festival={festivalData}
              config={config}
              results={results}
              teamPoints={teamPoints}
              schedules={schedules}
              stats={stats}
              isEditorMode={!isPreviewMode}
              selectedSectionId={selectedSectionId}
              onSelectSection={(secId) => {
                setSelectedSectionId(secId)
                setActivePanel("sections")
              }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
