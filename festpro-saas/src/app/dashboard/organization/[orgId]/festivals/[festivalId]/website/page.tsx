"use client"

import React, { useState, useEffect, useTransition, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Layout,
  Layers,
  Palette,
  Type,
  Smile,
  Zap,
  Image as ImageIcon,
  Video,
  Newspaper,
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
  Copy,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Check,
  Sliders,
  Bell,
  MessageSquare,
  Sparkles,
  Settings,
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
  type CreativeSticker,
  type VideoPlatform,
  RECOMMENDED_COLOR_PALETTES,
  FONT_OPTIONS,
  SHAPE_PRESETS,
  STICKER_PRESET_LIBRARY,
  READY_MADE_TEMPLATES,
  getDefaultWebsiteConfig,
} from "@/types/website-studio"

type StudioPanelId =
  | "templates"
  | "sections"
  | "design"
  | "stickers"
  | "motion"
  | "media"
  | "header_footer"
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

  // Studio UI State
  const [activePanel, setActivePanel] = useState<StudioPanelId>("templates")
  const [designSubTab, setDesignSubTab] = useState<"colors" | "typography" | "shape">("colors")
  const [mediaSubTab, setMediaSubTab] = useState<"gallery" | "videos">("gallery")
  const [headerSubTab, setHeaderSubTab] = useState<"hero" | "header" | "footer" | "news" | "popup">("hero")

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("sec-hero")
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)

  // Config & Undo/Redo Stack
  const [config, setConfig] = useState<FestivalWebsiteConfig>(() => getDefaultWebsiteConfig())
  const [history, setHistory] = useState<FestivalWebsiteConfig[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  // Temporary input helpers
  const [newPhoto, setNewPhoto] = useState({ title: "", url: "", category: "Stage" })
  const [newVideo, setNewVideo] = useState<{
    title: string
    url: string
    platform: VideoPlatform
    aspectRatio: "16:9" | "9:16" | "1:1"
  }>({ title: "", url: "", platform: "youtube", aspectRatio: "16:9" })
  const [newNews, setNewNews] = useState({ title: "", date: "Today", badge: "Update", content: "" })
  const [customStickerUrl, setCustomStickerUrl] = useState({ name: "", url: "", isGif: false })

  useEffect(() => {
    Promise.all([
      getFestivalWebsiteConfigAction(festivalId),
      getPublicResults(festivalId),
      getPublicTeamPoints(festivalId),
      getPublicSchedules(festivalId),
      getPublicStats(festivalId),
    ]).then(([cfgRes, rRes, tRes, sRes, stRes]) => {
      if (cfgRes.success && cfgRes.data) {
        setFestivalData(cfgRes.data.festival)
        setConfig(cfgRes.data.config)
        setHistory([cfgRes.data.config])
        setHistoryIdx(0)
      }
      setResults(rRes.data || [])
      setTeamPoints(tRes.data || [])
      setSchedules(sRes.data || [])
      if (stRes.data) setStats(stRes.data)
      setLoading(false)
    })
  }, [festivalId])

  // Centralized state updater with Undo/Redo history tracking
  const updateConfig = useCallback(
    (updater: FestivalWebsiteConfig | ((prev: FestivalWebsiteConfig) => FestivalWebsiteConfig)) => {
      setConfig((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        setHistory((h) => {
          const sliced = h.slice(0, historyIdx + 1)
          const updated = [...sliced, next].slice(-30) // Keep last 30 states
          setHistoryIdx(updated.length - 1)
          return updated
        })
        setHasUnsaved(true)
        return next
      })
    },
    [historyIdx]
  )

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

  // Apply Ready-Made Template Preset
  const applyTemplate = (tplId: string) => {
    const tpl = READY_MADE_TEMPLATES.find((t) => t.id === tplId)
    if (!tpl) return
    updateConfig((prev) => ({
      ...prev,
      templateId: tpl.id,
      globalDesign: {
        ...prev.globalDesign!,
        ...(tpl.patch.globalDesign || {}),
      },
      motionStudio: tpl.patch.motionStudio
        ? { ...prev.motionStudio!, ...tpl.patch.motionStudio }
        : prev.motionStudio,
    }))
    toast.success(`Applied "${tpl.name}" template style!`)
  }

  // Section Management
  const addSectionWidget = (type: SectionWidgetType, label: string) => {
    const newSec: BuilderSection = {
      id: `sec-${Date.now()}`,
      type,
      label,
      enabled: true,
      animation: "fade_up",
      settings: type === "heading_banner" ? { heading: "New Highlight Section", subheading: "Festival update" } : {},
    }
    updateConfig((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSec],
    }))
    setSelectedSectionId(newSec.id)
    toast.success(`Added "${label}" section to page`)
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

  // Add Creative Sticker
  const addStickerFromPreset = (preset: typeof STICKER_PRESET_LIBRARY[0]) => {
    const stk: CreativeSticker = {
      id: `stk-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      source: preset.source,
      section: "hero",
      x: 20 + Math.floor(Math.random() * 60),
      y: 20 + Math.floor(Math.random() * 55),
      size: 64,
      rotation: 0,
      opacity: 1,
      animation: preset.defaultAnim,
      layer: "front",
      visibility: "all",
    }
    updateConfig((prev) => ({
      ...prev,
      stickers: [...(prev.stickers || []), stk],
    }))
    setSelectedStickerId(stk.id)
    toast.success(`Placed "${preset.name}" — Drag it on the Hero preview!`)
  }

  const festSlug =
    festivalData?.short_name?.toLowerCase() ||
    festivalData?.code?.toLowerCase() ||
    festivalData?.name?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    festivalId
  const liveSiteUrl = `https://${festSlug}.ahraz.site`

  const selectedSticker = (config.stickers || []).find((s) => s.id === selectedStickerId)
  const selectedSection = (config.sections || []).find((s) => s.id === selectedSectionId)

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
          <span className="text-sm font-bold">Loading FesPro Studio...</span>
        </div>
      </div>
    )
  }

  const palette = config.globalDesign!.palette
  const typo = config.globalDesign!.typography
  const shape = config.globalDesign!.shape
  const motion = config.motionStudio!

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── TOP STUDIO BAR ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Back & Studio Title */}
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
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {festivalData?.name || "Festival Designer"} {hasUnsaved && "• Unsaved edits"}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Undo/Redo & Device Viewport */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Undo"
            >
              <Undo className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Redo"
            >
              <Redo className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[
              { id: "desktop", icon: Monitor, label: "Desktop" },
              { id: "tablet", icon: Tablet, label: "Tablet" },
              { id: "mobile", icon: Smartphone, label: "Mobile" },
            ].map((v) => {
              const Icon = v.icon
              return (
                <button
                  key={v.id}
                  onClick={() => setViewport(v.id as any)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    viewport === v.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                  title={v.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isPreviewMode
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isPreviewMode ? "Viewing Clean Preview" : "Preview"}</span>
          </button>
        </div>

        {/* Right: Open Live & Publish */}
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
        {/* LEFT PANE: ICON RAIL + INSPECTOR PANEL */}
        {!isPreviewMode && (
          <aside className="flex h-full border-r border-slate-800 bg-slate-900 shrink-0 z-20">
            {/* Icon Rail */}
            <nav className="w-16 border-r border-slate-800 flex flex-col items-center py-3 gap-2 overflow-y-auto bg-slate-950/60">
              {[
                { id: "templates", label: "Templates", icon: Layout },
                { id: "sections", label: "Builder", icon: Layers },
                { id: "design", label: "Design", icon: Palette },
                { id: "stickers", label: "Stickers", icon: Smile },
                { id: "motion", label: "Motion", icon: Zap },
                { id: "media", label: "Media", icon: ImageIcon },
                { id: "header_footer", label: "Content", icon: Globe },
                { id: "seo", label: "Code", icon: Code },
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

            {/* Inspector Drawer */}
            <div className="w-72 sm:w-80 overflow-y-auto p-4 space-y-5 bg-slate-900 text-xs">
              {/* ── PANEL 1: TEMPLATE LIBRARY ── */}
              {activePanel === "templates" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Ready-Made Templates</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      One-click aesthetic kits designed for festivals &amp; kalolsavams.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {READY_MADE_TEMPLATES.map((tpl) => {
                      const isCurrent = config.templateId === tpl.id
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => applyTemplate(tpl.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isCurrent
                              ? "border-indigo-500 bg-indigo-500/15"
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                          }`}
                        >
                          <div className={`h-14 rounded-lg bg-gradient-to-r ${tpl.previewGradient} mb-2.5 flex items-end p-2`}>
                            <span className="px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold uppercase">
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
                          <p className="text-[10px] text-slate-400 mt-0.5">{tpl.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── PANEL 2: DRAG & DROP PAGE SECTIONS & WIDGETS ── */}
              {activePanel === "sections" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-white">Drag &amp; Drop Builder</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag rows to reorder your homepage layout or toggle visibility.
                    </p>
                  </div>

                  {/* Section Navigator Stack */}
                  <div className="space-y-1.5">
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
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isSel
                              ? "border-indigo-500 bg-indigo-500/15"
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                          } ${!sec.enabled ? "opacity-50" : ""}`}
                        >
                          <GripVertical className="h-3.5 w-3.5 text-slate-500 cursor-grab shrink-0" />
                          <div className="flex-1 min-w-0 truncate font-bold text-slate-200">{sec.label}</div>
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => moveSection(idx, -1)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveSection(idx, 1)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <input
                              type="checkbox"
                              checked={sec.enabled}
                              onChange={(e) => {
                                updateConfig((prev) => ({
                                  ...prev,
                                  sections: (prev.sections || []).map((s) =>
                                    s.id === sec.id ? { ...s, enabled: e.target.checked } : s
                                  ),
                                }))
                              }}
                              className="accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Selected Section Inspector */}
                  {selectedSection && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-400 uppercase text-[10px]">
                          Edit Widget: {selectedSection.label}
                        </span>
                        {selectedSection.type !== "hero" && (
                          <button
                            onClick={() => {
                              updateConfig((prev) => ({
                                ...prev,
                                sections: (prev.sections || []).filter((s) => s.id !== selectedSection.id),
                              }))
                              setSelectedSectionId(null)
                            }}
                            className="text-rose-400 hover:text-rose-300"
                            title="Remove Section"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          Section Animation Override
                        </label>
                        <select
                          value={selectedSection.animation || "inherit"}
                          onChange={(e) => {
                            updateConfig((prev) => ({
                              ...prev,
                              sections: (prev.sections || []).map((s) =>
                                s.id === selectedSection.id ? { ...s, animation: e.target.value as any } : s
                              ),
                            }))
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
                        >
                          <option value="inherit">Inherit Global Motion</option>
                          <option value="fade_up">Fade Up</option>
                          <option value="zoom_in">Zoom In</option>
                          <option value="none">No Animation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          Custom Background Override (Optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedSection.bgOverride || palette.background}
                            onChange={(e) => {
                              updateConfig((prev) => ({
                                ...prev,
                                sections: (prev.sections || []).map((s) =>
                                  s.id === selectedSection.id ? { ...s, bgOverride: e.target.value } : s
                                ),
                              }))
                            }}
                            className="h-7 w-9 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                          />
                          <button
                            onClick={() => {
                              updateConfig((prev) => ({
                                ...prev,
                                sections: (prev.sections || []).map((s) =>
                                  s.id === selectedSection.id ? { ...s, bgOverride: undefined } : s
                                ),
                              }))
                            }}
                            className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {selectedSection.type === "heading_banner" && (
                        <>
                          <input
                            type="text"
                            placeholder="Heading Text"
                            value={selectedSection.settings?.heading || ""}
                            onChange={(e) => {
                              updateConfig((prev) => ({
                                ...prev,
                                sections: (prev.sections || []).map((s) =>
                                  s.id === selectedSection.id
                                    ? { ...s, settings: { ...s.settings, heading: e.target.value } }
                                    : s
                                ),
                              }))
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                          />
                          <input
                            type="text"
                            placeholder="Subheading Text"
                            value={selectedSection.settings?.subheading || ""}
                            onChange={(e) => {
                              updateConfig((prev) => ({
                                ...prev,
                                sections: (prev.sections || []).map((s) =>
                                  s.id === selectedSection.id
                                    ? { ...s, settings: { ...s.settings, subheading: e.target.value } }
                                    : s
                                ),
                              }))
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                          />
                        </>
                      )}

                      {selectedSection.type === "custom_html" && (
                        <textarea
                          rows={4}
                          placeholder="<div class='p-6 text-center'>Custom HTML Embed</div>"
                          value={selectedSection.settings?.html || ""}
                          onChange={(e) => {
                            updateConfig((prev) => ({
                              ...prev,
                              sections: (prev.sections || []).map((s) =>
                                s.id === selectedSection.id
                                  ? { ...s, settings: { ...s.settings, html: e.target.value } }
                                  : s
                              ),
                            }))
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-[11px]"
                        />
                      )}
                    </div>
                  )}

                  {/* Add Widget Library */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      + Add Widget / Section
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { type: "countdown", label: "Countdown" },
                        { type: "heading_banner", label: "Heading Block" },
                        { type: "stats", label: "Live Stats" },
                        { type: "results", label: "Results Grid" },
                        { type: "leaderboard", label: "Leaderboard" },
                        { type: "schedule", label: "Schedule" },
                        { type: "team", label: "Organizers" },
                        { type: "divider", label: "Divider" },
                        { type: "custom_html", label: "Custom HTML" },
                      ].map((w) => (
                        <button
                          key={w.type}
                          onClick={() => addSectionWidget(w.type as SectionWidgetType, w.label)}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3 text-indigo-400" />
                          <span className="truncate">{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PANEL 3: GLOBAL DESIGN SYSTEM ── */}
              {activePanel === "design" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: "colors", label: "Colours" },
                      { id: "typography", label: "Fonts" },
                      { id: "shape", label: "Shape & Theme" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDesignSubTab(t.id as any)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                          designSubTab === t.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* A. Colour Palette Studio */}
                  {designSubTab === "colors" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          Recommended Palettes
                        </span>
                        <div className="grid grid-cols-1 gap-2">
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
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer ${
                                palette.id === pal.id
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : "border-slate-800 bg-slate-950"
                              }`}
                            >
                              <span className="font-bold text-slate-200">{pal.name}</span>
                              <div className="flex -space-x-1">
                                {[pal.primary, pal.secondary, pal.accent, pal.background].map((c, idx) => (
                                  <span
                                    key={idx}
                                    className="h-4 w-4 rounded-full border border-white/20"
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            Custom Colour Pickers
                          </span>
                          <button
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                themeMode: palette.themeMode === "dark" ? "light" : "dark",
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  palette: {
                                    ...palette,
                                    themeMode: palette.themeMode === "dark" ? "light" : "dark",
                                    background: palette.themeMode === "dark" ? "#F8FAFC" : "#0F172A",
                                    surface: palette.themeMode === "dark" ? "#FFFFFF" : "#1E293B",
                                    text: palette.themeMode === "dark" ? "#0F172A" : "#FFFFFF",
                                    mutedText: palette.themeMode === "dark" ? "#475569" : "#94A3B8",
                                  },
                                },
                              }))
                            }
                            className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-amber-300 cursor-pointer"
                          >
                            Switch to {palette.themeMode === "dark" ? "Light Mode" : "Dark Mode"}
                          </button>
                        </div>

                        {[
                          { key: "primary", label: "Primary Color" },
                          { key: "secondary", label: "Secondary Color" },
                          { key: "accent", label: "Accent Highlight" },
                          { key: "background", label: "Page Background" },
                          { key: "surface", label: "Card Surface" },
                          { key: "text", label: "Heading & Body Text" },
                        ].map((cf) => (
                          <div key={cf.key} className="flex items-center justify-between">
                            <span className="text-slate-300">{cf.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400">
                                {(palette as any)[cf.key]}
                              </span>
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
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-bold text-slate-300">Hero &amp; Button Gradients</span>
                          <input
                            type="checkbox"
                            checked={palette.gradientEnabled}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  palette: { ...palette, gradientEnabled: e.target.checked },
                                },
                              }))
                            }
                            className="accent-indigo-500 h-4 w-4"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* B. Typography Studio */}
                  {designSubTab === "typography" && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Heading Font Family
                        </label>
                        <select
                          value={typo.headingFont}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              globalDesign: {
                                ...prev.globalDesign!,
                                typography: { ...typo, headingFont: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                        >
                          {FONT_OPTIONS.heading.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Body Font Family
                        </label>
                        <select
                          value={typo.bodyFont}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              globalDesign: {
                                ...prev.globalDesign!,
                                typography: { ...typo, bodyFont: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                        >
                          {FONT_OPTIONS.body.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Malayalam Font
                          </label>
                          <select
                            value={typo.malayalamFont}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  typography: { ...typo, malayalamFont: e.target.value },
                                },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            {FONT_OPTIONS.malayalam.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Arabic / Urdu Font
                          </label>
                          <select
                            value={typo.arabicFont}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  typography: { ...typo, arabicFont: e.target.value },
                                },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            {FONT_OPTIONS.arabic.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Heading Size
                          </label>
                          <select
                            value={typo.headingSize}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  typography: { ...typo, headingSize: e.target.value as any },
                                },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="compact">Compact</option>
                            <option value="standard">Standard</option>
                            <option value="large">Large</option>
                            <option value="heroic">Heroic Display</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Text Transform
                          </label>
                          <select
                            value={typo.textTransform}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  typography: { ...typo, textTransform: e.target.value as any },
                                },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="none">Normal</option>
                            <option value="uppercase">UPPERCASE</option>
                            <option value="capitalize">Capitalize</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400">
                          Custom Font URL (WOFF2 / TTF / OTF)
                        </label>
                        <input
                          type="text"
                          placeholder="Font Family Name (e.g. CustomDisplay)"
                          value={typo.customFontName || ""}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              globalDesign: {
                                ...prev.globalDesign!,
                                typography: { ...typo, customFontName: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                        />
                        <input
                          type="text"
                          placeholder="https://.../font.woff2"
                          value={typo.customFontUrl || ""}
                          onChange={(e) =>
                            updateConfig((prev) => ({
                              ...prev,
                              globalDesign: {
                                ...prev.globalDesign!,
                                typography: { ...typo, customFontUrl: e.target.value },
                              },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* C. Theme & Shape Studio */}
                  {designSubTab === "shape" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {SHAPE_PRESETS.map((sp) => (
                          <button
                            key={sp.id}
                            onClick={() =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: { ...prev.globalDesign!, shape: sp.config },
                              }))
                            }
                            className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                              shape.stylePreset === sp.id
                                ? "border-indigo-500 bg-indigo-500/15"
                                : "border-slate-800 bg-slate-950"
                            }`}
                          >
                            <div className="font-bold text-white text-[11px]">{sp.name}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{sp.desc}</div>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-slate-800">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Card Border Radius
                          </label>
                          <select
                            value={shape.borderRadius}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  shape: { ...shape, borderRadius: e.target.value as any },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="0px">0px (Sharp Edge)</option>
                            <option value="8px">8px (Crisp)</option>
                            <option value="16px">16px (Rounded)</option>
                            <option value="24px">24px (Soft Pill)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Button Shape
                          </label>
                          <select
                            value={shape.buttonShape}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  shape: { ...shape, buttonShape: e.target.value as any },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="sharp">Sharp Rectangle</option>
                            <option value="rounded">Modern Rounded</option>
                            <option value="pill">Full Pill</option>
                            <option value="brutal">Brutalist Solid</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Background Texture
                          </label>
                          <select
                            value={shape.backgroundTexture}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                globalDesign: {
                                  ...prev.globalDesign!,
                                  shape: { ...shape, backgroundTexture: e.target.value as any },
                                },
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="none">Solid Clean</option>
                            <option value="dots">Dotted Pattern</option>
                            <option value="grid">Architectural Grid</option>
                            <option value="mesh">Color Mesh Glow</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PANEL 4: STICKERS, GIFS & CREATIVE ELEMENTS STUDIO ── */}
              {activePanel === "stickers" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Stickers &amp; Animated GIFs</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click to add a sticker, then drag it directly on the Hero banner!
                    </p>
                  </div>

                  {/* Preset Stickers & GIFs */}
                  <div className="grid grid-cols-3 gap-2">
                    {STICKER_PRESET_LIBRARY.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => addStickerFromPreset(preset)}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                        title={preset.name}
                      >
                        {preset.type === "emoji" && <span className="text-2xl">{preset.source}</span>}
                        {preset.type === "gif" && (
                          <img src={preset.source} alt={preset.name} className="h-8 w-8 object-contain rounded" />
                        )}
                        {preset.type === "svg_badge" && (
                          <Sparkles className="h-5 w-5 text-amber-400" />
                        )}
                        <span className="text-[9px] font-bold text-slate-300 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Sticker / Animated WebP / GIF URL Adder */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      + Add Custom PNG / GIF / Lottie GIF URL
                    </span>
                    <input
                      type="text"
                      placeholder="Label (e.g. Custom Mascot)"
                      value={customStickerUrl.name}
                      onChange={(e) => setCustomStickerUrl({ ...customStickerUrl, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                    <input
                      type="text"
                      placeholder="https://.../sticker.gif or .webp"
                      value={customStickerUrl.url}
                      onChange={(e) => setCustomStickerUrl({ ...customStickerUrl, url: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                    <button
                      onClick={() => {
                        if (!customStickerUrl.url.trim()) return
                        const stk: CreativeSticker = {
                          id: `stk-${Date.now()}`,
                          name: customStickerUrl.name || "Custom Sticker",
                          type: "gif",
                          source: customStickerUrl.url.trim(),
                          section: "hero",
                          x: 50,
                          y: 30,
                          size: 80,
                          rotation: 0,
                          opacity: 1,
                          animation: "float",
                          layer: "front",
                          visibility: "all",
                        }
                        updateConfig((prev) => ({
                          ...prev,
                          stickers: [...(prev.stickers || []), stk],
                        }))
                        setSelectedStickerId(stk.id)
                        setCustomStickerUrl({ name: "", url: "", isGif: false })
                        toast.success("Custom sticker placed on Hero banner!")
                      }}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Place on Canvas
                    </button>
                  </div>

                  {/* Selected Sticker Controls */}
                  {selectedSticker ? (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-indigo-300 text-[11px]">
                          Editing: {selectedSticker.name}
                        </span>
                        <button
                          onClick={() => {
                            updateConfig((prev) => ({
                              ...prev,
                              stickers: (prev.stickers || []).filter((s) => s.id !== selectedSticker.id),
                            }))
                            setSelectedStickerId(null)
                          }}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Size: {selectedSticker.size}px</label>
                          <input
                            type="range"
                            min={28}
                            max={180}
                            value={selectedSticker.size}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                stickers: (prev.stickers || []).map((s) =>
                                  s.id === selectedSticker.id ? { ...s, size: Number(e.target.value) } : s
                                ),
                              }))
                            }
                            className="w-full accent-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Rotate: {selectedSticker.rotation}°</label>
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            value={selectedSticker.rotation}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                stickers: (prev.stickers || []).map((s) =>
                                  s.id === selectedSticker.id ? { ...s, rotation: Number(e.target.value) } : s
                                ),
                              }))
                            }
                            className="w-full accent-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Animation</label>
                          <select
                            value={selectedSticker.animation}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                stickers: (prev.stickers || []).map((s) =>
                                  s.id === selectedSticker.id ? { ...s, animation: e.target.value as any } : s
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                          >
                            <option value="none">Static</option>
                            <option value="float">Float</option>
                            <option value="pulse">Pulse</option>
                            <option value="bounce">Bounce</option>
                            <option value="spin_slow">Slow Spin</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Layer</label>
                          <select
                            value={selectedSticker.layer}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                stickers: (prev.stickers || []).map((s) =>
                                  s.id === selectedSticker.id ? { ...s, layer: e.target.value as any } : s
                                ),
                              }))
                            }
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                          >
                            <option value="front">Front Overlay</option>
                            <option value="back">Behind Text</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    (config.stickers || []).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Active Stickers (click to select):</span>
                        {(config.stickers || []).map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStickerId(s.id)}
                            className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-left flex justify-between items-center text-slate-300"
                          >
                            <span>{s.name}</span>
                            <span className="text-[10px] text-indigo-400">Edit</span>
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ── PANEL 5: ADVANCED MOTION STUDIO ── */}
              {activePanel === "motion" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Advanced Motion Studio</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Configure entrance transitions, hover interactions &amp; performance accessibility.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Global Section Entrance Animation
                    </label>
                    <select
                      value={motion.defaultEntrance}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          motionStudio: { ...motion, defaultEntrance: e.target.value as any },
                        }))
                      }
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                    >
                      <option value="none">None</option>
                      <option value="fade_up">Fade Up Reveal</option>
                      <option value="zoom_in">Smooth Zoom In</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Card Hover Interaction
                    </label>
                    <select
                      value={motion.defaultHover}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          motionStudio: { ...motion, defaultHover: e.target.value as any },
                        }))
                      }
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                    >
                      <option value="none">None</option>
                      <option value="lift">Elegant Lift (-4px)</option>
                      <option value="scale">Subtle Scale (1.02x)</option>
                      <option value="glow">Ambient Glow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Animation Duration: {motion.duration}s
                    </label>
                    <input
                      type="range"
                      min={0.2}
                      max={2.0}
                      step={0.1}
                      value={motion.duration}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          motionStudio: { ...motion, duration: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-bold text-slate-300">Scroll Progress Top Bar</span>
                      <input
                        type="checkbox"
                        checked={motion.scrollProgressBar}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            motionStudio: { ...motion, scrollProgressBar: e.target.checked },
                          }))
                        }
                        className="accent-indigo-500 h-4 w-4"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div>
                        <div className="font-bold text-amber-300">Reduced Motion Mode</div>
                        <div className="text-[10px] text-amber-200/70">
                          Mandatory performance/accessibility option
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={motion.reducedMotion}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            motionStudio: { ...motion, reducedMotion: e.target.checked },
                          }))
                        }
                        className="accent-amber-500 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* ── PANEL 6: GALLERY & UNIVERSAL VIDEO STUDIO ── */}
              {activePanel === "media" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setMediaSubTab("gallery")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        mediaSubTab === "gallery" ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Gallery Studio
                    </button>
                    <button
                      onClick={() => setMediaSubTab("videos")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        mediaSubTab === "videos" ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Video &amp; Reels
                    </button>
                  </div>

                  {mediaSubTab === "gallery" ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400">Gallery Layout</label>
                          <select
                            value={config.galleryStudio?.layout || "grid"}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                galleryStudio: { ...prev.galleryStudio!, layout: e.target.value as any },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                          >
                            <option value="grid">Standard Grid</option>
                            <option value="masonry">Pinterest Masonry</option>
                            <option value="metro">Metro Highlight Grid</option>
                            <option value="carousel">Horizontal Carousel</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400">Aspect Ratio</label>
                          <select
                            value={config.galleryStudio?.aspectRatio || "4:3"}
                            onChange={(e) =>
                              updateConfig((prev) => ({
                                ...prev,
                                galleryStudio: { ...prev.galleryStudio!, aspectRatio: e.target.value as any },
                              }))
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                          >
                            <option value="original">Original Ratio</option>
                            <option value="1:1">1:1 Square</option>
                            <option value="4:3">4:3 Landscape</option>
                            <option value="16:9">16:9 Widescreen</option>
                            <option value="3:4">3:4 Portrait</option>
                            <option value="9:16">9:16 Story</option>
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Optional Watermark Text (e.g. © Optimuz)"
                        value={config.galleryStudio?.watermarkText || ""}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            galleryStudio: { ...prev.galleryStudio!, watermarkText: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">+ Add Gallery Photo</span>
                        <input
                          type="text"
                          placeholder="Photo Caption"
                          value={newPhoto.title}
                          onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <input
                          type="text"
                          placeholder="https://... image URL"
                          value={newPhoto.url}
                          onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Album / Category (Stage, Dance...)"
                          value={newPhoto.category}
                          onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <button
                          onClick={() => {
                            if (!newPhoto.url.trim()) return
                            updateConfig((prev) => ({
                              ...prev,
                              gallery: [
                                {
                                  id: `g-${Date.now()}`,
                                  title: newPhoto.title || "Festival Capture",
                                  url: newPhoto.url.trim(),
                                  category: newPhoto.category || "Event",
                                  album: newPhoto.category || "Event",
                                },
                                ...(prev.gallery || []),
                              ],
                            }))
                            setNewPhoto({ title: "", url: "", category: "Stage" })
                            toast.success("Photo added to Gallery!")
                          }}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                        >
                          Add Photo
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {(config.gallery || []).map((g) => (
                          <div
                            key={g.id}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <img src={g.url} alt={g.title} className="h-8 w-8 rounded object-cover" />
                            <span className="truncate flex-1 text-slate-300">{g.title}</span>
                            <button
                              onClick={() =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  gallery: (prev.gallery || []).filter((x) => x.id !== g.id),
                                }))
                              }
                              className="text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          + Add YouTube / Reel / Shorts / MP4 Video
                        </span>
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
                          <option value="facebook">Facebook Video Embed</option>
                          <option value="vimeo">Vimeo Video</option>
                          <option value="mp4">Direct MP4 Video URL</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Paste YouTube / Reel / MP4 link..."
                          value={newVideo.url}
                          onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <select
                          value={newVideo.aspectRatio}
                          onChange={(e) => setNewVideo({ ...newVideo, aspectRatio: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        >
                          <option value="16:9">16:9 Widescreen</option>
                          <option value="9:16">9:16 Vertical Reels / Shorts</option>
                          <option value="1:1">1:1 Square</option>
                        </select>
                        <button
                          onClick={() => {
                            if (!newVideo.url.trim()) return
                            updateConfig((prev) => ({
                              ...prev,
                              liveStreamUrl: newVideo.url.trim(),
                              videoStudio: {
                                layout: prev.videoStudio?.layout || "featured_playlist",
                                videos: [
                                  {
                                    id: `vid-${Date.now()}`,
                                    title: newVideo.title || "Festival Video",
                                    platform: newVideo.platform,
                                    url: newVideo.url.trim(),
                                    aspectRatio: newVideo.aspectRatio,
                                  },
                                  ...(prev.videoStudio?.videos || []),
                                ],
                              },
                            }))
                            setNewVideo({ title: "", url: "", platform: "youtube", aspectRatio: "16:9" })
                            toast.success("Video added to Festival Video Studio!")
                          }}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                        >
                          Add Video to Playlist
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {(config.videoStudio?.videos || []).map((v) => (
                          <div
                            key={v.id}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-200 truncate">{v.title}</div>
                              <div className="text-[10px] text-indigo-400 uppercase">{v.platform}</div>
                            </div>
                            <button
                              onClick={() =>
                                updateConfig((prev) => ({
                                  ...prev,
                                  videoStudio: {
                                    layout: prev.videoStudio?.layout || "featured_playlist",
                                    videos: (prev.videoStudio?.videos || []).filter((x) => x.id !== v.id),
                                  },
                                }))
                              }
                              className="text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PANEL 7: HERO, HEADER, FOOTER, NEWS & POPUP BUILDER ── */}
              {activePanel === "header_footer" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: "hero", label: "Hero" },
                      { id: "header", label: "Header" },
                      { id: "footer", label: "Footer" },
                      { id: "news", label: "News" },
                      { id: "popup", label: "Popup" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setHeaderSubTab(t.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                          headerSubTab === t.id ? "bg-indigo-600 text-white" : "text-slate-400"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {headerSubTab === "hero" && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Festival Main Title"
                        value={config.heroTitle || ""}
                        onChange={(e) => updateConfig((p) => ({ ...p, heroTitle: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                      />
                      <textarea
                        rows={3}
                        placeholder="Hero Description / Tagline"
                        value={config.heroSubtitle || ""}
                        onChange={(e) => updateConfig((p) => ({ ...p, heroSubtitle: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Logo Image URL"
                        value={config.logoUrl || ""}
                        onChange={(e) => updateConfig((p) => ({ ...p, logoUrl: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Hero Background Photo URL"
                        value={config.bannerUrl || ""}
                        onChange={(e) => updateConfig((p) => ({ ...p, bannerUrl: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Hero Background Video MP4 URL (Optional)"
                        value={config.heroConfig?.bgVideoUrl || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            heroConfig: { ...p.heroConfig, bgVideoUrl: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <div>
                        <label className="text-[10px] text-slate-400">Countdown Target Date</label>
                        <input
                          type="date"
                          value={config.heroConfig?.countdownTargetDate || ""}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              heroConfig: { ...p.heroConfig, countdownTargetDate: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1"
                        />
                      </div>
                    </div>
                  )}

                  {headerSubTab === "header" && (
                    <div className="space-y-3">
                      <select
                        value={config.headerConfig?.style || "glass"}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            headerConfig: { ...p.headerConfig, style: e.target.value as any },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      >
                        <option value="glass">Glassmorphism Translucent Header</option>
                        <option value="solid">Solid Brand Header</option>
                        <option value="transparent">Transparent Hero Overlay</option>
                      </select>

                      <span className="block text-[10px] font-bold text-slate-400 uppercase pt-2">
                        Toggle Header Pages
                      </span>
                      {[
                        { key: "showResults", label: "Live Results Tab" },
                        { key: "showSchedule", label: "Stage Schedules Tab" },
                        { key: "showLeaderboard", label: "House Standings Tab" },
                        { key: "showGallery", label: "Gallery Tab" },
                        { key: "showVideos", label: "Videos & Live Tab" },
                        { key: "showNews", label: "News & Bulletins Tab" },
                      ].map((np) => (
                        <label key={np.key} className="flex items-center justify-between cursor-pointer">
                          <span className="text-slate-300">{np.label}</span>
                          <input
                            type="checkbox"
                            checked={(config.navPages as any)?.[np.key] !== false}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                navPages: { ...p.navPages, [np.key]: e.target.checked },
                              }))
                            }
                            className="accent-indigo-500 h-4 w-4"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {headerSubTab === "footer" && (
                    <div className="space-y-2.5">
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
                        placeholder="Official Email"
                        value={config.helpdeskEmail || ""}
                        onChange={(e) => updateConfig((p) => ({ ...p, helpdeskEmail: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <span className="block text-[10px] font-bold text-slate-400 uppercase pt-2">
                        Footer Social Media Icons Links
                      </span>
                      {["instagram", "youtube", "whatsapp", "facebook", "twitter"].map((soc) => (
                        <input
                          key={soc}
                          type="text"
                          placeholder={`${soc.toUpperCase()} URL`}
                          value={(config.socialLinks as any)?.[soc] || ""}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              socialLinks: { ...p.socialLinks, [soc]: e.target.value },
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                        />
                      ))}
                    </div>
                  )}

                  {headerSubTab === "news" && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Bulletin Headline"
                          value={newNews.title}
                          onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        />
                        <textarea
                          rows={2}
                          placeholder="Announcement details..."
                          value={newNews.content}
                          onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
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
                          Publish News Bulletin
                        </button>
                      </div>
                      {(config.news || []).map((n) => (
                        <div key={n.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center gap-2">
                          <span className="truncate text-slate-300">{n.title}</span>
                          <button
                            onClick={() =>
                              updateConfig((p) => ({ ...p, news: (p.news || []).filter((x) => x.id !== n.id) }))
                            }
                            className="text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {headerSubTab === "popup" && (
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="font-bold text-white">Enable Welcome Popup Modal</span>
                        <input
                          type="checkbox"
                          checked={config.popupBuilder?.enabled || false}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              popupBuilder: { ...p.popupBuilder!, enabled: e.target.checked },
                            }))
                          }
                          className="accent-indigo-500 h-4 w-4"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Popup Title"
                        value={config.popupBuilder?.title || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            popupBuilder: { ...p.popupBuilder!, title: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Announcement message..."
                        value={config.popupBuilder?.message || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            popupBuilder: { ...p.popupBuilder!, message: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Action Button Text"
                        value={config.popupBuilder?.ctaText || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            popupBuilder: { ...p.popupBuilder!, ctaText: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── PANEL 8: SEO, CUSTOM CSS & MAINTENANCE MODE ── */}
              {activePanel === "seo" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">SEO &amp; Advanced Developer</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Custom CSS overrides, meta tags, and maintenance lock.
                    </p>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 cursor-pointer">
                    <div>
                      <div className="font-bold text-rose-300">Maintenance Mode Lock</div>
                      <div className="text-[10px] text-rose-200/70">Show temporary lock screen to public</div>
                    </div>
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

                  <input
                    type="text"
                    placeholder="SEO Meta Title"
                    value={config.seoAndAdvanced?.metaTitle || ""}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        seoAndAdvanced: { ...p.seoAndAdvanced, metaTitle: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />

                  <textarea
                    rows={2}
                    placeholder="SEO Meta Description"
                    value={config.seoAndAdvanced?.metaDescription || ""}
                    onChange={(e) =>
                      updateConfig((p) => ({
                        ...p,
                        seoAndAdvanced: { ...p.seoAndAdvanced, metaDescription: e.target.value },
                      }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">
                      Custom CSS Rules
                    </label>
                    <textarea
                      rows={6}
                      placeholder="/* Custom CSS */ .hero-title { letter-spacing: 2px; }"
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
                </div>
              )}
            </div>
          </aside>
        )}

        {/* RIGHT PANE: LIVE WYSIWYG INTERACTIVE CANVAS */}
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
              selectedStickerId={selectedStickerId}
              onSelectSticker={(id) => {
                setSelectedStickerId(id)
                if (id) setActivePanel("stickers")
              }}
              onUpdateStickerPos={(id, x, y) => {
                updateConfig((prev) => ({
                  ...prev,
                  stickers: (prev.stickers || []).map((s) => (s.id === id ? { ...s, x, y } : s)),
                }))
              }}
              selectedSectionId={selectedSectionId}
              onSelectSection={(secId) => {
                setSelectedSectionId(secId)
                if (activePanel !== "sections" && activePanel !== "stickers") {
                  setActivePanel("sections")
                }
              }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
