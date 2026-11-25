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
  Share2,
  Sparkles,
} from "lucide-react"
import FestivalSiteRenderer from "@/components/studio/FestivalSiteRenderer"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
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
  TYPOGRAPHY_PRESETS,
  getDefaultWebsiteConfig,
  type LogoDisplayMode,
  type NavFontWeight,
} from "@/types/website-studio"

type StudioPanelId =
  | "sections"
  | "templates"
  | "design"
  | "header"
  | "footer"
  | "media"
  | "motion"
  | "seo"

type CanvasTabType = "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news"

function compressImageFile(file: File, maxDim = 1200, onLoaded: (url: string) => void) {
  if (file.size > 5 * 1024 * 1024) {
    toast.warning("File is larger than 5MB. Compressing for optimum web performance...")
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    const raw = e.target?.result as string
    if (!raw) return
    if (file.type === "image/gif" || file.type === "image/svg+xml") {
      if (raw.length > 2_500_000) {
        toast.warning("GIF/SVG file is large (>2MB). Consider using an external URL if publishing takes time.")
      }
      onLoaded(raw)
      return
    }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let w = img.width
      let h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, w, h)
        onLoaded(canvas.toDataURL("image/webp", 0.8))
      } else {
        onLoaded(raw)
      }
    }
    img.onerror = () => {
      toast.error("Could not process this image. Please try another file.")
    }
    img.src = raw
  }
  reader.onerror = () => {
    toast.error("Failed to read image file.")
  }
  reader.readAsDataURL(file)
}

export default function FesProStudioPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [festivalData, setFestivalData] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [stats, setStats] = useState({ competitionsCount: 0, participantsCount: 0, stagesCount: 0 })

  // Studio UI State
  const [activePanel, setActivePanel] = useState<StudioPanelId>("sections")
  const [sectionSubTab, setSectionSubTab] = useState<"content" | "background" | "layout" | "effects">("content")
  const [designSubTab, setDesignSubTab] = useState<"colors" | "typography" | "shape">("colors")
  const [mediaSubTab, setMediaSubTab] = useState<"gallery" | "videos">("gallery")
  const [seoSubTab, setSeoSubTab] = useState<"news" | "popup" | "seo">("news")

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [canvasTab, setCanvasTab] = useState<CanvasTabType>("overview")
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>("sec-hero")
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)

  // Atomic Studio State (with instant LocalStorage recovery so user work is NEVER lost!)
  const [studio, setStudio] = useState<{
    config: FestivalWebsiteConfig
    history: FestivalWebsiteConfig[]
    historyIdx: number
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`festpro_studio_draft_${festivalId}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed && typeof parsed === "object" && (parsed.heroTitle || parsed.logoUrl || parsed.wordmarkUrl || parsed.sections)) {
            return { config: parsed, history: [parsed], historyIdx: 0 }
          }
        }
      } catch {}
    }
    const initial = getDefaultWebsiteConfig()
    return { config: initial, history: [initial], historyIdx: 0 }
  })
  const [hasUnsaved, setHasUnsaved] = useState(false)

  const config = studio.config

  // Form temporary inputs
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
  const [newQuote, setNewQuote] = useState({ name: "", quote: "" })

  // Instant draft restoration on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`festpro_studio_draft_${festivalId}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && typeof parsed === "object" && (parsed.heroTitle || parsed.logoUrl || parsed.wordmarkUrl)) {
          setStudio((prev) => {
            if (!prev.config.heroTitle || prev.config.heroTitle === "Festival 2026") {
              return { config: parsed, history: [parsed], historyIdx: 0 }
            }
            return prev
          })
        }
      }
    } catch {}
  }, [festivalId])

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
            const loaded = cfgRes.value.data.config

            // Check if local storage has a customized draft
            let localDraft: any = null
            try {
              const raw = localStorage.getItem(`festpro_studio_draft_${festivalId}`)
              if (raw) localDraft = JSON.parse(raw)
            } catch {}

            const isServerDefault = !loaded.heroTitle || loaded.heroTitle === "Festival 2026" || loaded.heroTitle === "Festival Portal"
            const hasCustomLocal = localDraft && localDraft.heroTitle && localDraft.heroTitle !== "Festival Portal" && localDraft.heroTitle !== "Festival 2026"

            if (isServerDefault && hasCustomLocal) {
              setStudio({ config: localDraft, history: [localDraft], historyIdx: 0 })
              // Auto-sync this custom draft to server in background
              fetch("/api/website-studio/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ festivalId, config: localDraft }),
              }).catch(() => {})
            } else {
              setStudio({ config: loaded, history: [loaded], historyIdx: 0 })
              try {
                localStorage.setItem(`festpro_studio_draft_${festivalId}`, JSON.stringify(loaded))
              } catch {}
            }
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
      setStudio((prev) => {
        const nextConfig = typeof updater === "function" ? updater(prev.config) : updater
        const slicedHistory = prev.history.slice(0, prev.historyIdx + 1)
        const nextHistory = [...slicedHistory, nextConfig].slice(-30)
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(`festpro_studio_draft_${festivalId}`, JSON.stringify(nextConfig))
          }
        } catch {}
        return {
          config: nextConfig,
          history: nextHistory,
          historyIdx: nextHistory.length - 1,
        }
      })
      setHasUnsaved(true)
    },
    [festivalId]
  )

  const updateSelectedSection = (patchFn: (sec: BuilderSection) => BuilderSection) => {
    if (!selectedSectionId) return
    updateConfig((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) => (s.id === selectedSectionId ? patchFn(s) : s)),
    }))
  }

  const handleUndo = () => {
    setStudio((prev) => {
      if (prev.historyIdx <= 0) return prev
      const targetIdx = prev.historyIdx - 1
      return {
        ...prev,
        config: prev.history[targetIdx],
        historyIdx: targetIdx,
      }
    })
    setHasUnsaved(true)
  }

  const handleRedo = () => {
    setStudio((prev) => {
      if (prev.historyIdx >= prev.history.length - 1) return prev
      const targetIdx = prev.historyIdx + 1
      return {
        ...prev,
        config: prev.history[targetIdx],
        historyIdx: targetIdx,
      }
    })
    setHasUnsaved(true)
  }

  const handleSavePublish = async () => {
    if (isSaving || isPending) return
    setIsSaving(true)
    const toastId = toast.loading("Publishing festival website live...")

    // 0. Instant LocalStorage backup
    try {
      localStorage.setItem(`festpro_studio_draft_${festivalId}`, JSON.stringify(config))
    } catch {}

    // 1. Direct browser client save (authenticated user session in browser)
    try {
      const supabase = createBrowserClient()
      const primaryColor = config.globalDesign?.palette?.primary || config.accentColor || "#4F46E5"
      const isDark = (config.globalDesign?.palette?.themeMode || config.themeMode || "dark") !== "light"
      const stampedConfig = {
        ...config,
        headerConfig: {
          ...(config.headerConfig || {
            style: "glass",
            sticky: true,
            showLiveBadge: false,
            showConsoleLogin: false,
          }),
          brandingVersion: 2,
        },
      }

      // Upsert festival_settings
      await supabase.from("festival_settings").upsert({
        festival_id: festivalId,
        theme_color: primaryColor,
        festival_color: primaryColor,
        dark_mode: isDark,
        custom_fields: { website_config: stampedConfig },
        updated_at: new Date().toISOString(),
      }, { onConflict: "festival_id" })

      // Upsert public_homepage_settings (publicly accessible by all site visitors)
      await supabase.from("public_homepage_settings").upsert({
        festival_id: festivalId,
        hero_title: config.heroTitle || "Festival",
        hero_subtitle: config.heroSubtitle || "",
        hero_image_url: config.bannerUrl || "",
        featured_sections: [stampedConfig],
        seo_meta: { website_config: stampedConfig },
        is_published: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "festival_id" })

      // Update festivals table
      const updatePayload: any = {}
      if (config.heroTitle?.trim()) updatePayload.name = config.heroTitle.trim()
      if (config.heroSubtitle) updatePayload.description = config.heroSubtitle
      if (config.logoUrl !== undefined) updatePayload.logo_url = config.logoUrl
      if (config.bannerUrl !== undefined) updatePayload.banner_url = config.bannerUrl
      if (Object.keys(updatePayload).length > 0) {
        await supabase.from("festivals").update(updatePayload).eq("id", festivalId)
      }
    } catch (browserErr) {
      console.warn("Direct browser client save warning:", browserErr)
    }

    // 2. Primary: REST API Route (Pure JSON server dual-write)
    try {
      const res = await fetch("/api/website-studio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, config }),
      })
      const result = await res.json()
      if (result.success) {
        setHasUnsaved(false)
        toast.success("FesPro Studio site published live!", { id: toastId })
        setIsSaving(false)
        return
      }
      if (result.error) {
        console.warn("REST save notice:", result.error)
      }
    } catch (apiErr) {
      console.warn("Direct API publish error, trying fallback action:", apiErr)
    }

    // 3. Fallback: Clean Server Action
    try {
      const actionRes = await saveFestivalWebsiteConfigAction(festivalId, config)
      if (actionRes?.error) {
        toast.error(actionRes.error, { id: toastId })
      } else {
        setHasUnsaved(false)
        toast.success("FesPro Studio site published live!", { id: toastId })
      }
    } catch (err: any) {
      console.error("Save publish error:", err)
      toast.error(err?.message || "Failed to publish website. Please try again.", { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const applyTemplate = (tplId: string) => {
    const tpl = READY_MADE_TEMPLATES.find((t) => t.id === tplId)
    if (!tpl) return
    const patchDesign: any = tpl.patch.globalDesign || {}
    const palette = patchDesign.palette || RECOMMENDED_COLOR_PALETTES[0]
    updateConfig((prev) => ({
      ...prev,
      templateId: tpl.id,
      accentColor: palette.primary,
      themeMode: palette.themeMode || prev.themeMode || "dark",
      globalDesign: {
        ...prev.globalDesign!,
        ...patchDesign,
        palette: {
          ...prev.globalDesign?.palette,
          ...palette,
        },
        typography: {
          ...prev.globalDesign?.typography,
          ...(patchDesign.typography || {}),
        },
        shape: {
          ...prev.globalDesign?.shape,
          ...(patchDesign.shape || {}),
        },
      },
    }))
    setCanvasTab("overview")
    toast.success(`Applied "${tpl.name}" template kit!`)
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
        : type === "testimonial_slider"
        ? {
            quotes: [
              { name: "Chief Jury", quote: "Remarkable energy and punctual stage operations." },
              { name: "Principal", quote: "A proud celebration of campus art and heritage." },
            ],
          }
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
    setCanvasTab("overview")
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
        <div className="flex items-center gap-2.5 min-w-0">
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
            <div className="truncate hidden sm:block">
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

        {/* Center Controls (Always accessible across viewports!) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={handleUndo}
              disabled={studio.historyIdx <= 0}
              className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Undo"
            >
              <Undo className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={studio.historyIdx >= studio.history.length - 1}
              className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Redo"
            >
              <Redo className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
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
                  title={v.id}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
              isPreviewMode ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isPreviewMode ? "Clean Preview" : "Preview"}</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={liveSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold"
          >
            <span>Open Live</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={handleSavePublish}
            disabled={isSaving || isPending}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving || isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isSaving || isPending ? "Publishing..." : "Publish Site"}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN IDE WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          <aside className="flex h-full border-r border-slate-800 bg-slate-900 shrink-0 z-20">
            {/* Icon Rail */}
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

            {/* Inspector Drawer */}
            <div className="w-80 sm:w-88 overflow-y-auto p-4 space-y-5 bg-slate-900 text-xs">
              {/* ── 1. SECTION BUILDER + INSPECTOR + BETWEEN-SECTION INSERT ── */}
              {activePanel === "sections" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Section &amp; Background Studio</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Drag to reorder, edit Content/BG/Layout/Effects, or insert Banners &amp; Sliders.
                    </p>
                  </div>

                  {/* Section Stack */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(config.sections || []).map((sec, idx) => {
                      const isSel = selectedSectionId === sec.id
                      return (
                        <div
                          key={sec.id}
                          draggable
                          onDragStart={() => setDraggedSectionId(sec.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDropSection(sec.id)}
                          onClick={() => {
                            setSelectedSectionId(sec.id)
                            setCanvasTab("overview")
                          }}
                          className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                            isSel ? "border-indigo-500 bg-indigo-500/15" : "border-slate-800 bg-slate-950/60"
                          } ${!sec.enabled ? "opacity-50" : ""}`}
                        >
                          <GripVertical className="h-3.5 w-3.5 text-slate-500 cursor-grab shrink-0" />
                          <div className="flex-1 min-w-0 truncate font-bold text-slate-200">{sec.label}</div>
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => moveSection(idx, -1)} className="p-0.5 text-slate-400 hover:text-white cursor-pointer" title="Move Up">
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button onClick={() => moveSection(idx, 1)} className="p-0.5 text-slate-400 hover:text-white cursor-pointer" title="Move Down">
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

                  {/* Selected Section Inspector */}
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
                            className="text-rose-400 hover:text-rose-300 cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 4 Subtabs */}
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

                      {/* SUBTAB A: COMPLETE SECTION CONTENT */}
                      {sectionSubTab === "content" && (
                        <div className="space-y-2.5">
                          {selectedSection.type === "hero" && (
                            <>
                              <input
                                type="text"
                                placeholder="Hero Badge Text"
                                value={config.heroConfig?.badgeText || ""}
                                onChange={(e) =>
                                  updateConfig((p) => ({ ...p, heroConfig: { ...p.heroConfig, badgeText: e.target.value } }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300"
                              />
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
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Button 1 Text"
                                  value={config.heroConfig?.primaryCtaText || ""}
                                  onChange={(e) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      heroConfig: { ...p.heroConfig, primaryCtaText: e.target.value },
                                    }))
                                  }
                                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Button 2 Text"
                                  value={config.heroConfig?.secondaryCtaText || ""}
                                  onChange={(e) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      heroConfig: { ...p.heroConfig, secondaryCtaText: e.target.value },
                                    }))
                                  }
                                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={config.heroConfig?.alignment || "center"}
                                  onChange={(e) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      heroConfig: { ...p.heroConfig, alignment: e.target.value as any },
                                    }))
                                  }
                                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                                >
                                  <option value="center">Center Align</option>
                                  <option value="left">Left Align</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Banner Photo URL"
                                  value={config.bannerUrl || ""}
                                  onChange={(e) => updateConfig((p) => ({ ...p, bannerUrl: e.target.value }))}
                                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                                />
                              </div>
                            </>
                          )}

                          {selectedSection.type === "countdown" && (
                            <>
                              <input
                                type="text"
                                placeholder="Countdown Title"
                                value={selectedSection.settings?.title || config.heroConfig?.countdownTitle || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, title: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                              />
                              <div>
                                <label className="text-[10px] text-slate-400">Target Event Date</label>
                                <input
                                  type="date"
                                  value={config.heroConfig?.countdownTargetDate || ""}
                                  onChange={(e) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      heroConfig: { ...p.heroConfig, countdownTargetDate: e.target.value },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white mt-0.5"
                                />
                              </div>
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
                              <input
                                type="text"
                                placeholder="Overlay Subtitle (Optional)"
                                value={selectedSection.settings?.subtitle || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, subtitle: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                            </>
                          )}

                          {selectedSection.type === "video_banner" && (
                            <input
                              type="text"
                              placeholder="YouTube or Direct MP4 Video URL"
                              value={selectedSection.settings?.videoUrl || ""}
                              onChange={(e) =>
                                updateSelectedSection((s) => ({
                                  ...s,
                                  settings: { ...s.settings, videoUrl: e.target.value },
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                            />
                          )}

                          {selectedSection.type === "promo_banner" && (
                            <>
                              <input
                                type="text"
                                placeholder="Promo Side Image URL"
                                value={selectedSection.settings?.imageUrl || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, imageUrl: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Promo Title"
                                value={selectedSection.settings?.title || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, title: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                              />
                              <textarea
                                rows={2}
                                placeholder="Description..."
                                value={selectedSection.settings?.description || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, description: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <input
                                type="text"
                                placeholder="CTA Button Label"
                                value={selectedSection.settings?.ctaText || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, ctaText: e.target.value },
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

                              {/* Existing Slides List with Delete */}
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {(selectedSection.settings?.slides || []).map((sl: any, sIdx: number) => (
                                  <div key={sl.id || sIdx} className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                                    <span className="truncate text-[11px] text-slate-300">{sl.heading || `Slide ${sIdx + 1}`}</span>
                                    <button
                                      onClick={() =>
                                        updateSelectedSection((s) => ({
                                          ...s,
                                          settings: {
                                            ...s.settings,
                                            slides: (s.settings?.slides || []).filter((_: any, i: number) => i !== sIdx),
                                          },
                                        }))
                                      }
                                      className="text-rose-400 hover:text-rose-300 cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
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
                            <>
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
                              <input
                                type="text"
                                placeholder="CTA Button Label (Optional)"
                                value={selectedSection.settings?.ctaText || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, ctaText: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                            </>
                          )}

                          {selectedSection.type === "logo_carousel" && (
                            <>
                              <input
                                type="text"
                                placeholder="Sponsor Section Title"
                                value={selectedSection.settings?.title || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, title: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Partner Names (comma-separated)"
                                value={(selectedSection.settings?.logos || []).join(", ")}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: {
                                      ...s.settings,
                                      logos: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                                    },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                            </>
                          )}

                          {selectedSection.type === "testimonial_slider" && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Person / Jury Name"
                                value={newQuote.name}
                                onChange={(e) => setNewQuote({ ...newQuote, name: e.target.value })}
                                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Quote / Review"
                                value={newQuote.quote}
                                onChange={(e) => setNewQuote({ ...newQuote, quote: e.target.value })}
                                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white"
                              />
                              <button
                                onClick={() => {
                                  if (!newQuote.quote.trim()) return
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: {
                                      ...s.settings,
                                      quotes: [...(s.settings?.quotes || []), { ...newQuote }],
                                    },
                                  }))
                                  setNewQuote({ name: "", quote: "" })
                                }}
                                className="w-full py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                              >
                                + Add Quote
                              </button>
                            </div>
                          )}

                          {selectedSection.type === "heading_banner" && (
                            <>
                              <input
                                type="text"
                                placeholder="Heading Title"
                                value={selectedSection.settings?.heading || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, heading: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Subheading"
                                value={selectedSection.settings?.subheading || ""}
                                onChange={(e) =>
                                  updateSelectedSection((s) => ({
                                    ...s,
                                    settings: { ...s.settings, subheading: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                              />
                            </>
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

                          {["stats", "leaderboard", "results", "schedule", "gallery", "videos", "news", "contact"].includes(
                            selectedSection.type
                          ) && (
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                              <p>
                                Dynamically synced with FesPro Database. Use <strong>BG Studio</strong>, <strong>Layout</strong>, or <strong>Effects</strong> above to style this section!
                              </p>
                              {(selectedSection.type === "gallery" || selectedSection.type === "videos") && (
                                <button
                                  onClick={() => {
                                    setActivePanel("media")
                                    setMediaSubTab(selectedSection.type === "gallery" ? "gallery" : "videos")
                                  }}
                                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                                >
                                  Open Media Studio
                                </button>
                              )}
                              {selectedSection.type === "news" && (
                                <button
                                  onClick={() => {
                                    setActivePanel("seo")
                                    setSeoSubTab("news")
                                  }}
                                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                                >
                                  Manage Bulletins
                                </button>
                              )}
                              {selectedSection.type === "contact" && (
                                <button
                                  onClick={() => setActivePanel("footer")}
                                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                                >
                                  Edit Venue &amp; Contact
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUBTAB B: SECTION BACKGROUND STUDIO */}
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
                                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>
                              <div className="space-y-1 max-h-24 overflow-y-auto">
                                {(selectedSection.background.sliderImages || []).map((url, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-900 text-[10px]">
                                    <span className="truncate text-slate-300">Slide {idx + 1}</span>
                                    <button
                                      onClick={() =>
                                        updateSelectedSection((s) => ({
                                          ...s,
                                          background: {
                                            ...s.background!,
                                            sliderImages: (s.background?.sliderImages || []).filter((_, i) => i !== idx),
                                          },
                                        }))
                                      }
                                      className="text-rose-400 cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
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

                          <div>
                            <label className="text-[10px] text-slate-400">
                              Overlay Opacity: {selectedSection.background?.overlayOpacity ?? 50}%
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

                      {/* SUBTAB C: SECTION LAYOUT */}
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

                      {/* SUBTAB D: SECTION EFFECTS & SVG SHAPE DIVIDERS */}
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
                    </div>
                  )}

                  {/* Between-Sections Insert Library */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                      + Insert Between Sections
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
                    <p className="text-[11px] text-slate-400 mt-0.5">One-click style presets for every event type.</p>
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

              {/* ── 3. DESIGN SYSTEM ── */}
              {activePanel === "design" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: "colors", label: "Colours" },
                      { id: "typography", label: "Fonts" },
                      { id: "shape", label: "Shape" },
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
                        className="w-full py-2 rounded-xl bg-slate-950 border border-slate-800 font-bold text-amber-300 cursor-pointer"
                      >
                        Switch to {palette.themeMode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                      </button>

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
                          { key: "text", label: "Primary Text Color" },
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
                    <div className="space-y-3.5">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Curated Typography Pairings
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {TYPOGRAPHY_PRESETS.map((tp) => {
                            const isMatch =
                              typo.headingFont === tp.config.headingFont &&
                              typo.bodyFont === tp.config.bodyFont
                            return (
                              <button
                                key={tp.id}
                                onClick={() =>
                                  updateConfig((p) => ({
                                    ...p,
                                    globalDesign: {
                                      ...p.globalDesign!,
                                      typography: { ...typo, ...tp.config },
                                    },
                                  }))
                                }
                                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                  isMatch
                                    ? "border-indigo-500 bg-indigo-500/15"
                                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                                }`}
                              >
                                <div className="text-xs font-bold text-white flex items-center justify-between">
                                  <span>{tp.name}</span>
                                  {isMatch && <Check className="h-3 w-3 text-indigo-400" />}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                  {tp.category}
                                </div>
                                <div className="text-[11px] text-slate-300 mt-1 truncate italic">
                                  {tp.sampleText}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Custom Font Configuration
                        </div>
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
                            <label className="text-[10px] text-slate-400">Malayalam</label>
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
                            <label className="text-[10px] text-slate-400">Arabic / Urdu</label>
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
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={typo.headingSize}
                            onChange={(e) =>
                              updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, headingSize: e.target.value as any } } }))
                            }
                            className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="compact">Compact Size</option>
                            <option value="standard">Standard Size</option>
                            <option value="large">Large Display</option>
                            <option value="heroic">Heroic Display</option>
                          </select>
                          <select
                            value={typo.textTransform}
                            onChange={(e) =>
                              updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, typography: { ...typo, textTransform: e.target.value as any } } }))
                            }
                            className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                          >
                            <option value="none">Normal Case</option>
                            <option value="uppercase">UPPERCASE</option>
                            <option value="capitalize">Capitalize</option>
                          </select>
                        </div>
                      </div>
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
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={shape.borderRadius}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, shape: { ...shape, borderRadius: e.target.value as any } } }))
                          }
                          className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                        >
                          <option value="0px">Radius: 0px</option>
                          <option value="8px">Radius: 8px</option>
                          <option value="16px">Radius: 16px</option>
                          <option value="24px">Radius: 24px</option>
                        </select>
                        <select
                          value={shape.buttonShape}
                          onChange={(e) =>
                            updateConfig((p) => ({ ...p, globalDesign: { ...p.globalDesign!, shape: { ...shape, buttonShape: e.target.value as any } } }))
                          }
                          className="px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white"
                        >
                          <option value="rounded">Btn: Rounded</option>
                          <option value="pill">Btn: Pill</option>
                          <option value="sharp">Btn: Sharp</option>
                          <option value="brutal">Btn: Brutal</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 4. HEADER DESIGN STUDIO ── */}
              {activePanel === "header" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-white">Header &amp; Brand Studio</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Configure official brand mode, upload wordmark/logo, nav font styling &amp; header effects.
                    </p>
                  </div>

                  {/* Brand Display Mode */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <label className="text-[11px] font-bold text-white uppercase tracking-wider">
                      Brand Presentation Mode
                    </label>
                    <select
                      value={hdr.logoMode || "logo_and_name"}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          headerConfig: { ...hdr, logoMode: e.target.value as LogoDisplayMode },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                    >
                      <option value="logo_and_name">Logo Image + Festival Name (Typed)</option>
                      <option value="wordmark_only">Wordmark Image Only (No typed text)</option>
                      <option value="logo_and_wordmark">Logo Icon + Wordmark Image</option>
                      <option value="name_only">Clean Festival Name Only (No icons)</option>
                    </select>

                    {/* Wordmark Upload & URL */}
                    {(hdr.logoMode === "wordmark_only" || hdr.logoMode === "logo_and_wordmark") && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300">Wordmark Image</span>
                          {config.wordmarkUrl && (
                            <button
                              onClick={() => updateConfig((p) => ({ ...p, wordmarkUrl: "" }))}
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {config.wordmarkUrl && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center max-h-16 overflow-hidden">
                            <img src={config.wordmarkUrl} alt="Wordmark" className="h-10 max-w-full object-contain" />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center cursor-pointer transition-all">
                            <span>Upload Wordmark</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) compressImageFile(f, 800, (url) => updateConfig((p) => ({ ...p, wordmarkUrl: url })))
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste Wordmark Image URL"
                          value={config.wordmarkUrl || ""}
                          onChange={(e) => updateConfig((p) => ({ ...p, wordmarkUrl: e.target.value }))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    )}

                    {/* Logo Upload & URL */}
                    {(hdr.logoMode === "logo_and_name" || hdr.logoMode === "logo_and_wordmark" || !hdr.logoMode) && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300">Logo Icon / Emblem</span>
                          {config.logoUrl && (
                            <button
                              onClick={() => updateConfig((p) => ({ ...p, logoUrl: "" }))}
                              className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {config.logoUrl && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center max-h-16 overflow-hidden">
                            <img src={config.logoUrl} alt="Logo" className="h-10 max-w-full object-contain" />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center cursor-pointer transition-all">
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) compressImageFile(f, 600, (url) => updateConfig((p) => ({ ...p, logoUrl: url })))
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste Logo Image URL"
                          value={config.logoUrl || ""}
                          onChange={(e) => updateConfig((p) => ({ ...p, logoUrl: e.target.value }))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Nav Link Typography Weight */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Header Nav Links Font Weight
                    </label>
                    <select
                      value={hdr.navFontWeight || "light"}
                      onChange={(e) =>
                        updateConfig((p) => ({
                          ...p,
                          headerConfig: { ...hdr, navFontWeight: e.target.value as NavFontWeight },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1 text-xs font-medium"
                    >
                      <option value="light">Light (Weight 300 - Clean &amp; Elegant)</option>
                      <option value="normal">Normal (Weight 400)</option>
                      <option value="medium">Medium (Weight 500)</option>
                      <option value="semibold">Semibold (Weight 600)</option>
                    </select>
                  </div>

                  {/* Background Mode */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Header Background Mode
                    </label>
                    <select
                      value={hdr.bgType || "inherit"}
                      onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, bgType: e.target.value as any } }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white mt-1 text-xs font-semibold"
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

                  {hdr.bgType === "gradient" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Gradient From</label>
                        <input
                          type="color"
                          value={hdr.gradientFrom || palette.primary}
                          onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, gradientFrom: e.target.value } }))}
                          className="w-full h-7 rounded bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Gradient To</label>
                        <input
                          type="color"
                          value={hdr.gradientTo || palette.secondary}
                          onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, gradientTo: e.target.value } }))}
                          className="w-full h-7 rounded bg-slate-950"
                        />
                      </div>
                    </div>
                  )}

                  {(hdr.bgType === "image" || hdr.bgType === "gif" || hdr.bgType === "video") && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer">
                          <span>Upload Header BG</span>
                          <input
                            type="file"
                            accept="image/*,video/mp4"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) compressImageFile(f, 1600, (url) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, bgMediaUrl: url } })))
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste Media URL"
                          value={hdr.bgMediaUrl || ""}
                          onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, bgMediaUrl: e.target.value } }))}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                        />
                      </div>
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
                      <span className="text-slate-300 text-xs">Header Background Color</span>
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
                        className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white mt-0.5 text-xs"
                      >
                        <option value="left">Logo Left</option>
                        <option value="center">Logo Center</option>
                        <option value="right">Logo Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Header Height</label>
                      <select
                        value={hdr.height || "standard"}
                        onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, height: e.target.value as any } }))}
                        className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white mt-0.5 text-xs"
                      >
                        <option value="compact">Compact</option>
                        <option value="standard">Standard</option>
                        <option value="tall">Tall</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Scroll Effect</label>
                    <select
                      value={hdr.scrollEffect || "none"}
                      onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, scrollEffect: e.target.value as any } }))}
                      className="w-full px-2 py-1.5 rounded bg-slate-950 border border-slate-800 text-white mt-0.5 text-xs"
                    >
                      <option value="none">Normal Sticky</option>
                      <option value="shrink">Shrink on Scroll</option>
                      <option value="bg_change">BG Change on Scroll</option>
                      <option value="hide_on_scroll">Hide on Scroll Down</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Tagline / Subtext (Optional)</label>
                    <input
                      type="text"
                      placeholder="Leave blank for clean title only"
                      value={hdr.tagline || ""}
                      onChange={(e) => updateConfig((p) => ({ ...p, headerConfig: { ...hdr, tagline: e.target.value } }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs mt-0.5"
                    />
                  </div>

                  {/* Header Elements Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Header Badges &amp; Controls
                    </span>
                    <label className="flex items-center justify-between cursor-pointer text-xs">
                      <span className="text-slate-300">Show LIVE Badge in Header</span>
                      <input
                        type="checkbox"
                        checked={hdr.showLiveBadge === true}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            headerConfig: { ...hdr, showLiveBadge: e.target.checked },
                          }))
                        }
                        className="accent-indigo-500 h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer text-xs">
                      <span className="text-slate-300">Show Console Login in Header</span>
                      <input
                        type="checkbox"
                        checked={hdr.showConsoleLogin === true}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            headerConfig: { ...hdr, showConsoleLogin: e.target.checked },
                          }))
                        }
                        className="accent-indigo-500 h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer text-xs">
                      <span className="text-slate-300">Show Social Media Icons in Header</span>
                      <input
                        type="checkbox"
                        checked={hdr.showSocialIcons === true}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            headerConfig: { ...hdr, showSocialIcons: e.target.checked },
                          }))
                        }
                        className="accent-indigo-500 h-4 w-4"
                      />
                    </label>
                  </div>

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
                      <label key={np.key} className="flex items-center justify-between cursor-pointer text-xs">
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
                  <input
                    type="text"
                    placeholder="Custom Copyright Text"
                    value={config.footerConfig?.copyrightText || ""}
                    onChange={(e) =>
                      updateConfig((p) => ({ ...p, footerConfig: { ...p.footerConfig, copyrightText: e.target.value } }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              )}

              {/* ── 6. MEDIA STUDIO (WITH DELETE BUTTONS!) ── */}
              {activePanel === "media" && (
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => {
                        setMediaSubTab("gallery")
                        setCanvasTab("gallery")
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                        mediaSubTab === "gallery" ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Gallery Builder
                    </button>
                    <button
                      onClick={() => {
                        setMediaSubTab("videos")
                        setCanvasTab("videos")
                      }}
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

                      <input
                        type="text"
                        placeholder="Watermark Text (Optional)"
                        value={config.galleryStudio?.watermarkText || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, galleryStudio: { ...p.galleryStudio!, watermarkText: e.target.value } }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                      />

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

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {(config.gallery || []).map((g) => (
                          <div key={g.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                            <img src={g.url} alt={g.title} className="h-8 w-8 rounded object-cover" />
                            <span className="flex-1 truncate text-slate-300">{g.title}</span>
                            <button
                              onClick={() =>
                                updateConfig((p) => ({ ...p, gallery: (p.gallery || []).filter((x) => x.id !== g.id) }))
                              }
                              className="text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
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
                        <select
                          value={newVideo.aspectRatio}
                          onChange={(e) => setNewVideo({ ...newVideo, aspectRatio: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white"
                        >
                          <option value="16:9">16:9 Widescreen</option>
                          <option value="9:16">9:16 Vertical Reels</option>
                          <option value="1:1">1:1 Square</option>
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

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {(config.videoStudio?.videos || []).map((v) => (
                          <div key={v.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                            <span className="truncate text-slate-300 flex-1">{v.title}</span>
                            <button
                              onClick={() =>
                                updateConfig((p) => ({
                                  ...p,
                                  videoStudio: {
                                    layout: p.videoStudio?.layout || "featured_playlist",
                                    videos: (p.videoStudio?.videos || []).filter((x) => x.id !== v.id),
                                  },
                                }))
                              }
                              className="text-rose-400 cursor-pointer"
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
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pt-2">
                        {(config.news || []).map((n) => (
                          <div key={n.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                            <span className="truncate text-slate-300 flex-1">{n.title}</span>
                            <button
                              onClick={() =>
                                updateConfig((p) => ({ ...p, news: (p.news || []).filter((x) => x.id !== n.id) }))
                              }
                              className="text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
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
                      <input
                        type="text"
                        placeholder="Popup Action Button Text"
                        value={config.popupBuilder?.ctaText || ""}
                        onChange={(e) =>
                          updateConfig((p) => ({ ...p, popupBuilder: { ...p.popupBuilder!, ctaText: e.target.value } }))
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

        {/* RIGHT PANE: LIVE INTERACTIVE CANVAS */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* Canvas Page Switcher Strip */}
          {!isPreviewMode && (
            <div className="bg-slate-900/70 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 mr-2">CANVAS VIEW:</span>
                {[
                  { id: "overview", label: "Overview Home" },
                  { id: "results", label: "Results" },
                  { id: "schedule", label: "Schedule" },
                  { id: "leaderboard", label: "Standings" },
                  { id: "gallery", label: "Gallery" },
                  { id: "videos", label: "Videos" },
                  { id: "news", label: "News" },
                ].map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setCanvasTab(ct.id as CanvasTabType)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                      canvasTab === ct.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 hidden lg:inline">Click any section on canvas to edit</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center items-start">
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
                festivalName={festivalData?.name || config.heroTitle || "Festival"}
                festival={festivalData}
                config={config}
                results={results}
                teamPoints={teamPoints}
                schedules={schedules}
                stats={stats}
                isEditorMode={!isPreviewMode}
                selectedSectionId={selectedSectionId}
                forcedTab={canvasTab}
                onTabChange={(t) => setCanvasTab(t)}
                onSelectSection={(secId) => {
                  setSelectedSectionId(secId)
                  setActivePanel("sections")
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
