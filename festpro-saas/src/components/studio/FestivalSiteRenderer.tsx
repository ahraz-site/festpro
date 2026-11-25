"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Trophy, Calendar, MapPin, Users, Award, Globe, Sparkles, Clock,
  Search, Video, Image as ImageIcon, Newspaper, Play, Phone, Mail,
  ChevronRight, Menu, X, Download, Maximize2, Radio, ShieldCheck,
  AlertTriangle, ExternalLink
} from "lucide-react"
import type {
  FestivalWebsiteConfig,
  BuilderSection,
  CreativeSticker,
  VideoItem,
  GalleryAspectRatio,
} from "@/types/website-studio"
import { getDefaultWebsiteConfig } from "@/types/website-studio"

export interface FestivalSiteRendererProps {
  festivalName: string
  festival?: any
  config?: FestivalWebsiteConfig
  results?: any[]
  teamPoints?: any[]
  schedules?: any[]
  stats?: { competitionsCount: number; participantsCount: number; stagesCount: number }
  isEditorMode?: boolean
  selectedStickerId?: string | null
  onSelectSticker?: (id: string | null) => void
  onUpdateStickerPos?: (id: string, x: number, y: number) => void
  selectedSectionId?: string | null
  onSelectSection?: (sectionId: string) => void
}

// Convert any pasted YouTube, Shorts, Vimeo, Instagram, or FB link into a clean iframe URL
function resolveVideoEmbed(video: VideoItem): { kind: "iframe" | "mp4"; src: string } {
  const raw = (video.url || "").trim()
  if (!raw) return { kind: "iframe", src: "" }
  if (video.platform === "mp4" || raw.endsWith(".mp4") || raw.endsWith(".webm")) {
    return { kind: "mp4", src: raw }
  }
  if (raw.includes("youtube.com/watch")) {
    try {
      const u = new URL(raw)
      const v = u.searchParams.get("v")
      if (v) return { kind: "iframe", src: `https://www.youtube.com/embed/${v}` }
    } catch {}
  }
  if (raw.includes("youtu.be/")) {
    const id = raw.split("youtu.be/")[1]?.split("?")[0]
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` }
  }
  if (raw.includes("youtube.com/shorts/")) {
    const id = raw.split("youtube.com/shorts/")[1]?.split("?")[0]
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` }
  }
  if (raw.includes("youtube.com/live/")) {
    const id = raw.split("youtube.com/live/")[1]?.split("?")[0]
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` }
  }
  if (raw.includes("vimeo.com/") && !raw.includes("player.vimeo.com")) {
    const id = raw.split("vimeo.com/")[1]?.split("?")[0]
    if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` }
  }
  if (raw.includes("instagram.com/")) {
    const clean = raw.split("?")[0].replace(/\/$/, "")
    if (!clean.endsWith("/embed")) return { kind: "iframe", src: `${clean}/embed` }
  }
  if (raw.includes("facebook.com/") && !raw.includes("plugins/video.php")) {
    return {
      kind: "iframe",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false`,
    }
  }
  return { kind: "iframe", src: raw }
}

function getRatioClass(ratio?: GalleryAspectRatio): string {
  switch (ratio) {
    case "1:1":
      return "aspect-square"
    case "4:3":
      return "aspect-[4/3]"
    case "16:9":
      return "aspect-video"
    case "3:4":
      return "aspect-[3/4]"
    case "9:16":
      return "aspect-[9/16]"
    default:
      return "aspect-auto"
  }
}

export default function FestivalSiteRenderer({
  festivalName,
  festival,
  config: incomingConfig,
  results = [],
  teamPoints = [],
  schedules = [],
  stats = { competitionsCount: 0, participantsCount: 0, stagesCount: 0 },
  isEditorMode = false,
  selectedStickerId = null,
  onSelectSticker,
  onUpdateStickerPos,
  selectedSectionId = null,
  onSelectSection,
}: FestivalSiteRendererProps) {
  const defaults = getDefaultWebsiteConfig(festival)
  const config: FestivalWebsiteConfig = {
    ...defaults,
    ...(incomingConfig || {}),
    globalDesign: {
      palette: {
        ...defaults.globalDesign!.palette,
        ...(incomingConfig?.globalDesign?.palette || {}),
      },
      typography: {
        ...defaults.globalDesign!.typography,
        ...(incomingConfig?.globalDesign?.typography || {}),
      },
      shape: {
        ...defaults.globalDesign!.shape,
        ...(incomingConfig?.globalDesign?.shape || {}),
      },
    },
    motionStudio: { ...defaults.motionStudio!, ...(incomingConfig?.motionStudio || {}) },
    heroConfig: { ...defaults.heroConfig!, ...(incomingConfig?.heroConfig || {}) },
    headerConfig: { ...defaults.headerConfig!, ...(incomingConfig?.headerConfig || {}) },
    footerConfig: { ...defaults.footerConfig!, ...(incomingConfig?.footerConfig || {}) },
    galleryStudio: { ...defaults.galleryStudio!, ...(incomingConfig?.galleryStudio || {}) },
    videoStudio: { ...defaults.videoStudio!, ...(incomingConfig?.videoStudio || {}) },
    navPages: { ...defaults.navPages!, ...(incomingConfig?.navPages || {}) },
    socialLinks: { ...defaults.socialLinks!, ...(incomingConfig?.socialLinks || {}) },
    popupBuilder: { ...defaults.popupBuilder!, ...(incomingConfig?.popupBuilder || {}) },
    seoAndAdvanced: { ...defaults.seoAndAdvanced!, ...(incomingConfig?.seoAndAdvanced || {}) },
  }

  const palette = config.globalDesign!.palette
  const typo = config.globalDesign!.typography
  const shape = config.globalDesign!.shape
  const motion = config.motionStudio!
  const isLight = palette.themeMode === "light"

  const [activeTab, setActiveTab] = useState<
    "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news"
  >("overview")
  const [search, setSearch] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<string>("All")
  const [activeVideoId, setActiveVideoId] = useState<string>(config.videoStudio?.videos?.[0]?.id || "")
  const [showPopup, setShowPopup] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Dragging sticker state inside Editor Mode
  const heroRef = useRef<HTMLDivElement>(null)
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null)

  useEffect(() => {
    if (config.popupBuilder?.enabled && !isEditorMode) {
      const timer = setTimeout(() => setShowPopup(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [config.popupBuilder?.enabled, isEditorMode])

  useEffect(() => {
    if (!motion.scrollProgressBar || isEditorMode) return
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [motion.scrollProgressBar, isEditorMode])

  // Countdown tick
  useEffect(() => {
    const targetStr = config.heroConfig?.countdownTargetDate
    if (!targetStr) return
    const tick = () => {
      const diff = new Date(targetStr).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [config.heroConfig?.countdownTargetDate])

  // Dynamic Font URLs
  const googleFontsList = Array.from(
    new Set([typo.headingFont, typo.bodyFont, typo.malayalamFont, typo.arabicFont].filter(Boolean))
  )
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&")

  // Style helpers based on Shape & Theme Studio
  const radiusVal = shape.borderRadius || "16px"
  const btnRadius =
    shape.buttonShape === "sharp"
      ? "0px"
      : shape.buttonShape === "pill"
      ? "9999px"
      : shape.buttonShape === "brutal"
      ? "0px"
      : "12px"

  const cardClass = [
    shape.stylePreset === "brutalist"
      ? `border-2 ${isLight ? "border-black shadow-[4px_4px_0px_#000]" : "border-white shadow-[4px_4px_0px_#fff]"}`
      : shape.stylePreset === "glassmorphism"
      ? "backdrop-blur-xl border border-white/15"
      : shape.stylePreset === "retro"
      ? "border-2 border-amber-500/40"
      : isLight
      ? "border border-slate-200"
      : "border border-white/10",
    shape.cardShadow === "elevated" ? "shadow-xl" : shape.cardShadow === "soft" ? "shadow-md" : "",
    !motion.reducedMotion && motion.defaultHover === "lift"
      ? "hover:-translate-y-1 transition-transform duration-300"
      : !motion.reducedMotion && motion.defaultHover === "scale"
      ? "hover:scale-[1.02] transition-transform duration-300"
      : !motion.reducedMotion && motion.defaultHover === "glow"
      ? "hover:shadow-lg transition-shadow duration-300"
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  const containerMaxW =
    shape.containerWidth === "narrow"
      ? "max-w-4xl"
      : shape.containerWidth === "wide"
      ? "max-w-7xl"
      : shape.containerWidth === "full"
      ? "max-w-full px-6"
      : "max-w-6xl"

  const sectionPy =
    shape.sectionSpacing === "compact"
      ? "py-6"
      : shape.sectionSpacing === "spacious"
      ? "py-14"
      : "py-10"

  const headingSizeClass =
    typo.headingSize === "compact"
      ? "text-2xl sm:text-4xl"
      : typo.headingSize === "standard"
      ? "text-3xl sm:text-5xl"
      : typo.headingSize === "large"
      ? "text-4xl sm:text-6xl"
      : "text-4xl sm:text-7xl"

  const letterSpacingVal =
    typo.letterSpacing === "tighter"
      ? "-0.04em"
      : typo.letterSpacing === "wide"
      ? "0.05em"
      : typo.letterSpacing === "wider"
      ? "0.1em"
      : "0em"

  const backgroundPatternCss =
    shape.backgroundTexture === "dots"
      ? `radial-gradient(${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"} 1px, transparent 1px)`
      : shape.backgroundTexture === "grid"
      ? `linear-gradient(to right, ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} 1px, transparent 1px), linear-gradient(to bottom, ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} 1px, transparent 1px)`
      : "none"

  // Maintenance Screen Check
  if (config.seoAndAdvanced?.maintenanceMode && !isEditorMode) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: palette.background, color: palette.text }}
      >
        <div
          className="max-w-md w-full p-8 space-y-5 border"
          style={{
            backgroundColor: palette.surface,
            borderRadius: radiusVal,
            borderColor: `${palette.primary}44`,
          }}
        >
          <div
            className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: `${palette.primary}25`, color: palette.primary }}
          >
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black">{config.heroTitle || festivalName}</h1>
          <p className="text-sm opacity-80">
            {config.seoAndAdvanced.maintenanceMessage ||
              "We are updating live schedules & scores. Back shortly!"}
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white"
            style={{ backgroundColor: palette.primary, borderRadius: btnRadius }}
          >
            Staff Console Login
          </Link>
        </div>
      </div>
    )
  }

  const heroTitle = config.heroTitle || festivalName
  const heroSubtitle =
    config.heroSubtitle ||
    "Track live scores, stage schedules, house points, and instant result announcements."

  const galleryItems = config.gallery || []
  const albums = ["All", ...Array.from(new Set(galleryItems.map((g) => g.album || g.category || "Event")))]
  const filteredGallery =
    selectedAlbum === "All"
      ? galleryItems
      : galleryItems.filter((g) => (g.album || g.category || "Event") === selectedAlbum)

  const videos = config.videoStudio?.videos || []
  const currentVideo = videos.find((v) => v.id === activeVideoId) || videos[0]

  const newsItems = config.news || []
  const filteredResults = results.filter(
    (r) =>
      !search ||
      r.participant?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.participant?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.participant?.chest_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.competition?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const navTabs = [
    config.navPages?.showOverview !== false && { id: "overview", label: "Overview", icon: Globe },
    config.navPages?.showResults !== false && { id: "results", label: `Results (${results.length})`, icon: Trophy },
    config.navPages?.showSchedule !== false && { id: "schedule", label: "Schedule", icon: Clock },
    config.navPages?.showLeaderboard !== false && { id: "leaderboard", label: `Standings`, icon: Award },
    config.navPages?.showGallery !== false && { id: "gallery", label: "Gallery", icon: ImageIcon },
    config.navPages?.showVideos !== false && { id: "videos", label: "Videos", icon: Video },
    config.navPages?.showNews !== false && { id: "news", label: "News", icon: Newspaper },
  ].filter(Boolean) as Array<{ id: string; label: string; icon: any }>

  // Dragging sticker pointer handlers inside Hero
  const handleHeroPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEditorMode || !draggingSticker || !heroRef.current || !onUpdateStickerPos) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = Math.max(2, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(2, Math.min(94, ((e.clientY - rect.top) / rect.height) * 100))
    onUpdateStickerPos(draggingSticker, Math.round(x), Math.round(y))
  }

  const handleHeroPointerUp = () => {
    if (draggingSticker) setDraggingSticker(null)
  }

  // Render Creative Sticker Element
  const renderSticker = (stk: CreativeSticker) => {
    const isSelected = isEditorMode && selectedStickerId === stk.id
    const animClass =
      motion.reducedMotion || stk.animation === "none"
        ? ""
        : stk.animation === "float"
        ? "fespro-anim-float"
        : stk.animation === "spin_slow"
        ? "fespro-anim-spin"
        : stk.animation === "pulse"
        ? "animate-pulse"
        : "animate-bounce"

    const visClass =
      stk.visibility === "desktop"
        ? "hidden md:flex"
        : stk.visibility === "mobile"
        ? "flex md:hidden"
        : "flex"

    return (
      <div
        key={stk.id}
        onPointerDown={(e) => {
          if (isEditorMode) {
            e.stopPropagation()
            onSelectSticker?.(stk.id)
            setDraggingSticker(stk.id)
          }
        }}
        className={`absolute select-none items-center justify-center ${visClass} ${animClass} ${
          isEditorMode ? "cursor-move hover:ring-2 hover:ring-amber-400 rounded-lg p-1" : "pointer-events-auto"
        } ${isSelected ? "ring-2 ring-amber-400 bg-black/20 rounded-lg p-1" : ""}`}
        style={{
          left: `${stk.x}%`,
          top: `${stk.y}%`,
          width: `${stk.size}px`,
          height: `${stk.size}px`,
          transform: `translate(-50%, -50%) rotate(${stk.rotation}deg)`,
          opacity: stk.opacity,
          zIndex: stk.layer === "back" ? 5 : 25,
        }}
        title={isEditorMode ? `Drag to move: ${stk.name}` : stk.name}
      >
        {stk.type === "emoji" && (
          <span style={{ fontSize: `${Math.round(stk.size * 0.78)}px`, lineHeight: 1 }}>
            {stk.source}
          </span>
        )}
        {(stk.type === "gif" || stk.type === "image") && (
          <img
            src={stk.source}
            alt={stk.name}
            className="w-full h-full object-contain pointer-events-none"
          />
        )}
        {stk.type === "svg_badge" && stk.source === "LIVE_PULSE" && (
          <div className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-lg flex items-center gap-1.5 border border-white/30">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            LIVE NOW
          </div>
        )}
        {stk.type === "svg_badge" && stk.source === "GOLD_SEAL" && (
          <div className="w-full h-full rounded-full border-2 border-amber-400 bg-amber-500/20 backdrop-blur-md flex flex-col items-center justify-center text-amber-300 font-black text-[10px] text-center leading-tight shadow-xl">
            <Sparkles className="h-4 w-4 mb-0.5" />
            OFFICIAL
          </div>
        )}
      </div>
    )
  }

  // Render Individual Widget / Section
  const renderSectionWidget = (section: BuilderSection) => {
    if (!section.enabled) return null

    const isSelected = isEditorMode && selectedSectionId === section.id
    const wrapClass = `${
      isEditorMode
        ? `relative transition-all ${
            isSelected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950" : "hover:ring-1 hover:ring-indigo-400/50"
          }`
        : ""
    }`

    const enterClass =
      motion.reducedMotion || section.animation === "none"
        ? ""
        : section.animation === "zoom_in" || (!section.animation && motion.defaultEntrance === "zoom_in")
        ? "fespro-enter-zoom"
        : "fespro-enter-fadeup"

    const sectionWrapper = (content: React.ReactNode, skipContainer = false) => (
      <div
        key={section.id}
        onClick={() => isEditorMode && onSelectSection?.(section.id)}
        style={section.bgOverride ? { backgroundColor: section.bgOverride } : undefined}
        className={`${wrapClass} ${enterClass} ${
          section.visibility === "desktop"
            ? "hidden md:block"
            : section.visibility === "mobile"
            ? "block md:hidden"
            : ""
        }`}
      >
        {isEditorMode && (
          <div className="absolute top-2 right-3 z-30 px-2 py-0.5 rounded bg-indigo-600/90 text-white text-[10px] font-bold uppercase tracking-wider pointer-events-none">
            {section.label}
          </div>
        )}
        {skipContainer ? content : <div className={`${containerMaxW} mx-auto px-4 sm:px-6 ${sectionPy}`}>{content}</div>}
      </div>
    )

    switch (section.type) {
      case "hero": {
        const heroGradient = palette.gradientEnabled
          ? `linear-gradient(${palette.gradientAngle}deg, ${palette.primary}38, ${palette.secondary}20, ${palette.background})`
          : palette.background

        return sectionWrapper(
          <section
            ref={heroRef}
            onPointerMove={handleHeroPointerMove}
            onPointerUp={handleHeroPointerUp}
            onPointerLeave={handleHeroPointerUp}
            className="relative py-16 sm:py-24 px-4 sm:px-8 overflow-hidden border-b"
            style={{
              background: config.bannerUrl ? undefined : heroGradient,
              borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
            }}
          >
            {/* Optional Background Video */}
            {config.heroConfig?.bgVideoUrl && (
              <video
                src={config.heroConfig.bgVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-45"
              />
            )}

            {/* Optional Background Banner Photo */}
            {config.bannerUrl && (
              <>
                <img
                  src={config.bannerUrl}
                  alt={heroTitle}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundColor: palette.background,
                    opacity: config.heroConfig?.overlayOpacity ?? 0.65,
                  }}
                />
              </>
            )}

            {/* Mesh Texture Accent */}
            {shape.backgroundTexture === "mesh" && (
              <div
                className="absolute inset-0 pointer-events-none z-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(at 20% 20%, ${palette.primary}55 0px, transparent 50%), radial-gradient(at 80% 30%, ${palette.accent}44 0px, transparent 50%)`,
                }}
              />
            )}

            {/* Creative Stickers & GIFs Overlay Layer */}
            {(config.stickers || [])
              .filter((s) => s.section === "hero")
              .map((stk) => renderSticker(stk))}

            <div
              className={`${containerMaxW} mx-auto relative z-10 space-y-6 ${
                config.heroConfig?.alignment === "left" ? "text-left" : "text-center"
              }`}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold border"
                style={{
                  borderRadius: btnRadius,
                  backgroundColor: `${palette.primary}20`,
                  borderColor: `${palette.primary}50`,
                  color: isLight ? palette.primary : palette.secondary,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: palette.accent }} />
                <span>{config.heroConfig?.badgeText || "Official Festival Portal • Real-Time Scoring"}</span>
              </div>

              <h1
                className={`${headingSizeClass} tracking-tight leading-tight`}
                style={{
                  fontFamily: `"${typo.headingFont}", "${typo.malayalamFont}", "${typo.arabicFont}", sans-serif`,
                  fontWeight: Number(typo.headingWeight),
                  letterSpacing: letterSpacingVal,
                  textTransform: typo.textTransform,
                  color: palette.text,
                }}
              >
                {heroTitle}
              </h1>

              <p
                className={`text-sm sm:text-lg max-w-2xl leading-relaxed ${
                  config.heroConfig?.alignment === "left" ? "" : "mx-auto"
                }`}
                style={{ color: palette.mutedText }}
              >
                {heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-wrap items-center gap-3 pt-2 ${
                  config.heroConfig?.alignment === "left" ? "justify-start" : "justify-center"
                }`}
              >
                <button
                  onClick={() => setActiveTab((config.heroConfig?.primaryCtaTarget as any) || "results")}
                  className="px-6 py-3 font-bold text-sm text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  style={{
                    background: palette.gradientEnabled
                      ? `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`
                      : palette.primary,
                    borderRadius: btnRadius,
                  }}
                >
                  {config.heroConfig?.primaryCtaText || "Live Results"}
                </button>
                <button
                  onClick={() => setActiveTab((config.heroConfig?.secondaryCtaTarget as any) || "leaderboard")}
                  className="px-6 py-3 font-bold text-sm border transition-all cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: `${palette.surface}cc`,
                    borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)",
                    color: palette.text,
                    borderRadius: btnRadius,
                  }}
                >
                  {config.heroConfig?.secondaryCtaText || "House Standings"}
                </button>
              </div>
            </div>
          </section>,
          true
        )
      }

      case "countdown":
        return sectionWrapper(
          <div
            className={`p-6 sm:p-8 text-center space-y-4 ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
          >
            <div className="text-xs font-black uppercase tracking-widest" style={{ color: palette.accent }}>
              {section.settings?.title || config.heroConfig?.countdownTitle || "Festival Countdown"}
            </div>
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Mins" },
                { val: countdown.seconds, label: "Secs" },
              ].map((u) => (
                <div
                  key={u.label}
                  className="p-3 border"
                  style={{
                    backgroundColor: palette.background,
                    borderRadius: radiusVal,
                    borderColor: `${palette.primary}30`,
                  }}
                >
                  <div className="text-2xl sm:text-4xl font-black" style={{ color: palette.text }}>
                    {String(u.val).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] font-bold uppercase mt-1" style={{ color: palette.mutedText }}>
                    {u.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "stats":
        return sectionWrapper(
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Published Results", value: results.length, sub: "Verified scores", color: palette.primary },
              { label: "Total Competitions", value: stats.competitionsCount, sub: "On & off-stage items", color: palette.secondary },
              { label: "Participants", value: stats.participantsCount, sub: "Registered candidates", color: palette.accent },
              { label: "Festival Stages", value: stats.stagesCount || 1, sub: "Active stage consoles", color: "#10B981" },
            ].map((s) => (
              <div
                key={s.label}
                className={`p-5 ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: palette.mutedText }}>
                  {s.label}
                </div>
                <div className="text-3xl font-black mt-2" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs mt-1" style={{ color: palette.mutedText }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        )

      case "leaderboard":
        return sectionWrapper(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-black flex items-center gap-2"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                <Award className="h-5 w-5" style={{ color: palette.accent }} />
                <span>House Championship Standings</span>
              </h2>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                Full Standings <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {teamPoints.length === 0 ? (
              <div
                className={`p-8 text-center text-xs ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
              >
                Standings will update live as competitions conclude.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamPoints.slice(0, section.settings?.maxItems || 6).map((t: any, i: number) => (
                  <div
                    key={t.id || i}
                    className={`p-4 flex items-center justify-between ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm text-white"
                        style={{
                          backgroundColor: i === 0 ? "#D97706" : i === 1 ? "#64748B" : palette.primary,
                        }}
                      >
                        #{t.rank || i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{t.team_name || `House ${i + 1}`}</h4>
                        <p className="text-[11px]" style={{ color: palette.mutedText }}>
                          Published house score
                        </p>
                      </div>
                    </div>
                    <div className="text-xl font-black" style={{ color: palette.accent }}>
                      {t.total_points || 0} <span className="text-[10px] font-bold">PTS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "results":
        return sectionWrapper(
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2
                className="text-xl font-black flex items-center gap-2"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                <Trophy className="h-5 w-5" style={{ color: palette.accent }} />
                <span>Latest Published Results</span>
              </h2>
              <button
                onClick={() => setActiveTab("results")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                Search All Results <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {results.length === 0 ? (
              <div
                className={`p-8 text-center text-xs ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
              >
                No published results yet. Live scores appear automatically once verified.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.slice(0, section.settings?.maxItems || 6).map((r: any, idx: number) => (
                  <div
                    key={r.id || idx}
                    className={`p-4 flex items-center justify-between gap-3 ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0"
                        style={{ backgroundColor: r.rank === 1 ? "#F59E0B" : palette.primary }}
                      >
                        #{r.rank || idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">
                          {r.participant?.first_name} {r.participant?.last_name}
                        </h4>
                        <p className="text-[11px] truncate" style={{ color: palette.mutedText }}>
                          {r.competition?.name || "Competition Item"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="px-2 py-0.5 rounded font-black text-[10px]"
                        style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                      >
                        {r.grade || "A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "schedule":
        return sectionWrapper(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-black flex items-center gap-2"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                <Clock className="h-5 w-5" style={{ color: palette.secondary }} />
                <span>Stage Schedules</span>
              </h2>
              <button
                onClick={() => setActiveTab("schedule")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                Full Schedule <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {(schedules.length > 0
                ? schedules.slice(0, 5)
                : [
                    { id: "d1", stage: { name: "Stage 1 - Main" }, competition: { name: "Opening Ceremony & Classical" }, start_time: "09:30 AM", status: "published" },
                    { id: "d2", stage: { name: "Stage 2 - Hall" }, competition: { name: "Light Music & Mappilapattu" }, start_time: "11:00 AM", status: "scheduled" },
                  ]
              ).map((sch: any) => (
                <div
                  key={sch.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <div>
                    <div className="text-xs font-bold" style={{ color: palette.secondary }}>
                      {sch.stage?.name || "Main Stage"} • {sch.start_time || "Scheduled"}
                    </div>
                    <div className="font-bold text-sm mt-0.5">{sch.competition?.name || "Festival Event"}</div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit"
                    style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}
                  >
                    {sch.status || "Upcoming"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )

      case "videos":
        return sectionWrapper(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-black flex items-center gap-2"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                <Video className="h-5 w-5 text-rose-500" />
                <span>Live Stream &amp; Video Studio</span>
              </h2>
              <button
                onClick={() => setActiveTab("videos")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                Open Video Gallery <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {currentVideo && (
              <div
                className={`overflow-hidden aspect-video max-h-[480px] ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
              >
                {(() => {
                  const emb = resolveVideoEmbed(currentVideo)
                  return emb.kind === "mp4" ? (
                    <video src={emb.src} controls className="w-full h-full object-cover" />
                  ) : (
                    <iframe
                      src={emb.src}
                      title={currentVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                })()}
              </div>
            )}
          </div>
        )

      case "gallery":
        return sectionWrapper(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-black flex items-center gap-2"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                <ImageIcon className="h-5 w-5" style={{ color: palette.secondary }} />
                <span>Photo Gallery Showcase</span>
              </h2>
              <button
                onClick={() => setActiveTab("gallery")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                Explore All Photos <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryItems.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  onClick={() =>
                    config.galleryStudio?.enableLightbox !== false && setLightboxImage({ url: g.url, title: g.title })
                  }
                  className={`group relative overflow-hidden cursor-pointer ${getRatioClass(
                    config.galleryStudio?.aspectRatio || "4:3"
                  )} ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <img
                    src={g.url}
                    alt={g.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {config.galleryStudio?.watermarkText && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-bold">
                      {config.galleryStudio.watermarkText}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[10px] font-bold uppercase" style={{ color: palette.accent }}>
                      {g.category || "Event"}
                    </span>
                    <span className="text-xs font-bold text-white line-clamp-1">{g.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "news":
        return sectionWrapper(
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl font-black flex items-center gap-2"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                <Newspaper className="h-5 w-5" style={{ color: palette.accent }} />
                <span>Official Bulletins &amp; News</span>
              </h2>
              <button
                onClick={() => setActiveTab("news")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                All Notices <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsItems.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`p-5 space-y-2 ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                      style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                    >
                      {n.badge || "News"}
                    </span>
                    <span style={{ color: palette.mutedText }}>{n.date}</span>
                  </div>
                  <h4 className="font-bold text-sm">{n.title}</h4>
                  <p className="text-xs line-clamp-2" style={{ color: palette.mutedText }}>
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case "team":
        return sectionWrapper(
          <div className="space-y-4">
            <h2
              className="text-xl font-black flex items-center gap-2"
              style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
            >
              <Users className="h-5 w-5" style={{ color: palette.secondary }} />
              <span>{section.settings?.title || "Organizing Committee"}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(config.teamMembers || []).map((m) => (
                <div
                  key={m.id}
                  className={`p-5 flex items-center gap-3.5 ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                    style={{ backgroundColor: palette.primary }}
                  >
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      m.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{m.name}</h4>
                    <p className="text-xs font-semibold" style={{ color: palette.accent }}>
                      {m.role}
                    </p>
                    {m.department && (
                      <p className="text-[11px]" style={{ color: palette.mutedText }}>
                        {m.department}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "contact":
        return sectionWrapper(
          <div
            className={`p-6 grid grid-cols-1 md:grid-cols-3 gap-4 ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
          >
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: palette.accent }} />
              <div>
                <div className="text-xs font-bold uppercase" style={{ color: palette.mutedText }}>
                  Festival Campus
                </div>
                <div className="text-sm font-bold mt-0.5">{config.venueCampus || "Main Auditorium"}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: palette.secondary }} />
              <div>
                <div className="text-xs font-bold uppercase" style={{ color: palette.mutedText }}>
                  Helpdesk Helpline
                </div>
                <div className="text-sm font-bold mt-0.5">{config.helpdeskPhone}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: palette.primary }} />
              <div>
                <div className="text-xs font-bold uppercase" style={{ color: palette.mutedText }}>
                  Official Email
                </div>
                <div className="text-sm font-bold mt-0.5">{config.helpdeskEmail}</div>
              </div>
            </div>
          </div>
        )

      case "heading_banner":
        return sectionWrapper(
          <div className="text-center space-y-2 py-4">
            <h2
              className="text-2xl sm:text-4xl font-black"
              style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
            >
              {section.settings?.heading || "Featured Festival Highlight"}
            </h2>
            <p className="text-sm" style={{ color: palette.mutedText }}>
              {section.settings?.subheading || "Real-time cultural competitions and announcements."}
            </p>
          </div>
        )

      case "divider":
        return sectionWrapper(
          <hr style={{ borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)" }} />
        )

      case "custom_html":
        return sectionWrapper(
          <div
            className={`p-4 ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
            dangerouslySetInnerHTML={{
              __html: section.settings?.html || "<div class='text-center text-xs'>Custom HTML Block</div>",
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative selection:bg-indigo-500/30"
      style={{
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: `"${typo.bodyFont}", "${typo.malayalamFont}", "${typo.arabicFont}", sans-serif`,
        backgroundImage: backgroundPatternCss,
        backgroundSize: shape.backgroundTexture === "dots" ? "20px 20px" : shape.backgroundTexture === "grid" ? "32px 32px" : undefined,
      }}
    >
      {/* Dynamic Google Fonts Loader */}
      {googleFontsList && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${googleFontsList}&display=swap`}
        />
      )}
      {typo.customFontUrl && typo.customFontName && (
        <style>{`@font-face { font-family: "${typo.customFontName}"; src: url("${typo.customFontUrl}"); }`}</style>
      )}
      {/* Studio CSS Keyframes */}
      <style>{`
        @keyframes fesproFloat { 0%, 100% { transform: translate(-50%, -50%) translateY(0px); } 50% { transform: translate(-50%, -50%) translateY(-10px); } }
        @keyframes fesproSpinSlow { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes fesproFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fesproZoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .fespro-anim-float { animation: fesproFloat 3.5s ease-in-out infinite; }
        .fespro-anim-spin { animation: fesproSpinSlow 14s linear infinite; }
        .fespro-enter-fadeup { animation: fesproFadeUp ${motion.duration}s ease-out both; }
        .fespro-enter-zoom { animation: fesproZoomIn ${motion.duration}s ease-out both; }
        ${config.seoAndAdvanced?.customCss || ""}
      `}</style>

      {/* Top Scroll Progress Bar */}
      {motion.scrollProgressBar && !isEditorMode && (
        <div
          className="fixed top-0 left-0 h-1 z-[60] transition-all duration-75"
          style={{
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})`,
          }}
        />
      )}

      {/* ── WHITE-LABELED HEADER ── */}
      <header
        className={`${config.headerConfig?.sticky !== false && !isEditorMode ? "sticky top-0" : "relative"} z-40 border-b transition-all`}
        style={{
          backgroundColor:
            config.headerConfig?.style === "solid"
              ? palette.surface
              : config.headerConfig?.style === "transparent"
              ? "transparent"
              : `${palette.background}e6`,
          backdropFilter: config.headerConfig?.style === "glass" ? "blur(14px)" : undefined,
          borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
        }}
      >
        <div className={`${containerMaxW} mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4`}>
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={festivalName}
                className="h-10 w-10 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white shadow-md text-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
                }}
              >
                {heroTitle.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div
                className="text-base sm:text-lg font-black tracking-tight leading-none"
                style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
              >
                {heroTitle}
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-widest mt-1"
                style={{ color: palette.accent }}
              >
                {config.headerConfig?.tagline || "OFFICIAL FESTIVAL PORTAL"}
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navTabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all cursor-pointer"
                  style={{
                    borderRadius: btnRadius,
                    backgroundColor: isActive ? palette.primary : "transparent",
                    color: isActive ? "#FFFFFF" : palette.mutedText,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Live Badge & Console Login */}
          <div className="hidden sm:flex items-center gap-2.5">
            {config.headerConfig?.showLiveBadge !== false && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </div>
            )}
            {config.headerConfig?.showConsoleLogin !== false && (
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-bold border transition-all"
                style={{
                  borderRadius: btnRadius,
                  backgroundColor: palette.surface,
                  borderColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)",
                }}
              >
                Console Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border"
            style={{ backgroundColor: palette.surface, borderColor: "rgba(255,255,255,0.1)" }}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t px-4 py-3 space-y-1.5"
            style={{ backgroundColor: palette.surface, borderColor: "rgba(255,255,255,0.08)" }}
          >
            {navTabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id as any)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold"
                  style={{
                    borderRadius: btnRadius,
                    backgroundColor: isActive ? palette.primary : "transparent",
                    color: isActive ? "#FFFFFF" : palette.text,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1">
        {activeTab === "overview" && (
          <div>
            {(config.sections || []).map((section) => renderSectionWidget(section))}
          </div>
        )}

        {/* Standalone Results Page */}
        {activeTab === "results" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                  Published Competition Results
                </h2>
                <p className="text-xs mt-1" style={{ color: palette.mutedText }}>
                  Search by contestant name, chest number, or competition event
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.mutedText }} />
                <input
                  type="text"
                  placeholder="Search chest no, participant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border focus:outline-none"
                  style={{
                    backgroundColor: palette.surface,
                    borderColor: `${palette.primary}40`,
                    color: palette.text,
                    borderRadius: btnRadius,
                  }}
                />
              </div>
            </div>
            {filteredResults.length === 0 ? (
              <div
                className={`p-12 text-center text-sm ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
              >
                No matching live results found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResults.map((r: any, idx: number) => (
                  <div
                    key={r.id || idx}
                    className={`p-4 flex items-center justify-between gap-4 ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                        style={{ backgroundColor: r.rank === 1 ? "#F59E0B" : palette.primary }}
                      >
                        #{r.rank || idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          {r.participant?.first_name} {r.participant?.last_name}
                        </h4>
                        <p className="text-xs" style={{ color: palette.mutedText }}>
                          {r.competition?.name || "Competition"} • Chest #{r.participant?.chest_number || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="px-2.5 py-1 rounded-full font-black text-xs"
                        style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                      >
                        Grade {r.grade || "A"}
                      </span>
                      <div className="text-xs mt-1 font-bold" style={{ color: palette.accent }}>
                        {r.total_points || 0} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Standalone Schedule Page */}
        {activeTab === "schedule" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-6`}>
            <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
              Complete Stage Schedules
            </h2>
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <div
                  className={`p-10 text-center text-sm ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
                >
                  Stage schedule timetable is syncing.
                </div>
              ) : (
                schedules.map((sch: any) => (
                  <div
                    key={sch.id}
                    className={`p-4 flex items-center justify-between ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <div>
                      <div className="text-xs font-bold" style={{ color: palette.accent }}>
                        {sch.stage?.name || "Stage"} • {sch.scheduled_date} • {sch.start_time}
                      </div>
                      <div className="font-bold text-sm mt-1">{sch.competition?.name || "Competition"}</div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                    >
                      {sch.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Standalone Leaderboard Page */}
        {activeTab === "leaderboard" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-6`}>
            <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
              House Championship Standings
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {teamPoints.length === 0 ? (
                <div
                  className={`p-10 text-center text-sm ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
                >
                  No published house points available yet.
                </div>
              ) : (
                teamPoints.map((t: any, i: number) => (
                  <div
                    key={t.id || i}
                    className={`p-5 flex items-center justify-between ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center font-black text-white"
                        style={{ backgroundColor: i === 0 ? "#F59E0B" : palette.primary }}
                      >
                        #{t.rank || i + 1}
                      </div>
                      <div>
                        <h3 className="font-black text-base">{t.team_name || `House ${i + 1}`}</h3>
                        <p className="text-xs" style={{ color: palette.mutedText }}>
                          Verified House Standing
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-black" style={{ color: palette.accent }}>
                      {t.total_points || 0} <span className="text-xs font-bold">PTS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Standalone Gallery Studio Page */}
        {activeTab === "gallery" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                  Festival Photo Gallery
                </h2>
                <p className="text-xs mt-1" style={{ color: palette.mutedText }}>
                  Moments captured across festival stages • {config.galleryStudio?.layout || "grid"} view
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {albums.map((alb) => (
                  <button
                    key={alb}
                    onClick={() => setSelectedAlbum(alb)}
                    className="px-3 py-1.5 text-xs font-bold cursor-pointer transition-all"
                    style={{
                      borderRadius: btnRadius,
                      backgroundColor: selectedAlbum === alb ? palette.primary : palette.surface,
                      color: selectedAlbum === alb ? "#FFFFFF" : palette.mutedText,
                    }}
                  >
                    {alb}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={
                config.galleryStudio?.layout === "masonry"
                  ? "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
                  : config.galleryStudio?.layout === "carousel"
                  ? "flex overflow-x-auto gap-4 pb-4 snap-x"
                  : `grid gap-4 grid-cols-${config.galleryStudio?.columnsMobile || 1} sm:grid-cols-2 lg:grid-cols-${
                      config.galleryStudio?.columnsDesktop || 3
                    }`
              }
            >
              {filteredGallery.map((g, idx) => (
                <div
                  key={g.id}
                  onClick={() =>
                    config.galleryStudio?.enableLightbox !== false && setLightboxImage({ url: g.url, title: g.title })
                  }
                  className={`group relative overflow-hidden cursor-pointer ${
                    config.galleryStudio?.layout === "carousel" ? "min-w-[300px] snap-center shrink-0" : ""
                  } ${
                    config.galleryStudio?.layout === "metro" && idx === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  } ${
                    config.galleryStudio?.layout === "masonry"
                      ? "break-inside-avoid"
                      : getRatioClass(config.galleryStudio?.aspectRatio || "4:3")
                  } ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <img
                    src={g.url}
                    alt={g.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {config.galleryStudio?.watermarkText && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      {config.galleryStudio.watermarkText}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[10px] font-bold uppercase" style={{ color: palette.accent }}>
                      {g.category || "Event"}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{g.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standalone Universal Video & Reels Page */}
        {activeTab === "videos" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-8`}>
            <div>
              <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                Video &amp; Live Stream Studio
              </h2>
              <p className="text-xs mt-1" style={{ color: palette.mutedText }}>
                YouTube, Reels, Shorts, Live Broadcasts &amp; Direct Video Highlights
              </p>
            </div>

            {currentVideo && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <div
                    className={`overflow-hidden ${
                      currentVideo.aspectRatio === "9:16"
                        ? "aspect-[9/16] max-h-[560px] mx-auto"
                        : currentVideo.aspectRatio === "1:1"
                        ? "aspect-square max-h-[500px] mx-auto"
                        : "aspect-video"
                    } ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    {(() => {
                      const emb = resolveVideoEmbed(currentVideo)
                      return emb.kind === "mp4" ? (
                        <video src={emb.src} controls className="w-full h-full object-cover" />
                      ) : (
                        <iframe
                          src={emb.src}
                          title={currentVideo.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )
                    })()}
                  </div>
                  <div className="space-y-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                      style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                    >
                      {currentVideo.platform.replace("_", " ")}
                    </span>
                    <h3 className="text-lg font-black">{currentVideo.title}</h3>
                    {currentVideo.description && (
                      <p className="text-xs" style={{ color: palette.mutedText }}>
                        {currentVideo.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: palette.mutedText }}>
                    Festival Playlist ({videos.length})
                  </h4>
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {videos.map((v) => {
                      const active = v.id === currentVideo.id
                      return (
                        <button
                          key={v.id}
                          onClick={() => setActiveVideoId(v.id)}
                          className={`w-full p-3 text-left flex items-center gap-3 cursor-pointer ${cardClass}`}
                          style={{
                            backgroundColor: active ? `${palette.primary}25` : palette.surface,
                            borderColor: active ? palette.primary : undefined,
                            borderRadius: radiusVal,
                          }}
                        >
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: palette.primary }}
                          >
                            <Play className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate">{v.title}</div>
                            <div className="text-[10px] uppercase mt-0.5" style={{ color: palette.accent }}>
                              {v.platform.replace("_", " ")} • {v.aspectRatio || "16:9"}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Standalone News Page */}
        {activeTab === "news" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-6`}>
            <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
              Official Bulletins &amp; Circulars
            </h2>
            <div className="space-y-4">
              {newsItems.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 space-y-2 ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="px-2.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                    >
                      {n.badge || "Bulletin"}
                    </span>
                    <span style={{ color: palette.mutedText }}>{n.date}</span>
                  </div>
                  <h3 className="text-base font-bold">{n.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: palette.mutedText }}>
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── WHITE-LABELED CUSTOM FOOTER WITH SOCIAL MEDIA ICONS ── */}
      <footer
        className="border-t pt-12 pb-8 mt-auto"
        style={{
          backgroundColor: palette.surface,
          borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
        }}
      >
        <div className={`${containerMaxW} mx-auto px-4 sm:px-6 space-y-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-sm"
                  style={{ backgroundColor: palette.primary }}
                >
                  {heroTitle.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-black text-lg" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                  {heroTitle}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: palette.mutedText }}>
                {heroSubtitle}
              </p>
              <div className="text-xs space-y-1 pt-1" style={{ color: palette.mutedText }}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" style={{ color: palette.accent }} />
                  <span>{config.venueCampus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" style={{ color: palette.secondary }} />
                  <span>{config.helpdeskPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" style={{ color: palette.primary }} />
                  <span>{config.helpdeskEmail}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs" style={{ color: palette.mutedText }}>
                {navTabs.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => {
                        setActiveTab(t.id as any)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider">Follow Our Updates</h4>
              <p className="text-xs" style={{ color: palette.mutedText }}>
                Live photos, winner announcements, and reels on official social channels.
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                {config.socialLinks?.instagram && (
                  <a
                    href={config.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all"
                    title="Instagram"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {config.socialLinks?.youtube && (
                  <a
                    href={config.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                    title="YouTube"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {config.socialLinks?.whatsapp && (
                  <a
                    href={config.socialLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                    title="WhatsApp"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </a>
                )}
                {config.socialLinks?.facebook && (
                  <a
                    href={config.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                    title="Facebook"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
                    </svg>
                  </a>
                )}
                {config.socialLinks?.twitter && (
                  <a
                    href={config.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                    title="Twitter / X"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div
            className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
            style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)", color: palette.mutedText }}
          >
            <p>{config.footerConfig?.copyrightText || `© ${new Date().getFullYear()} ${heroTitle}. All rights reserved.`}</p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:underline">Staff Login</Link>
              <span>•</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:underline cursor-pointer"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── LIGHTBOX IMAGE ZOOM MODAL ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="max-w-4xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <h4 className="font-bold text-sm">{lightboxImage.title}</h4>
              <div className="flex items-center gap-2">
                {config.galleryStudio?.allowDownload !== false && (
                  <a
                    href={lightboxImage.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    title="Open / Download Image"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ── POPUP ANNOUNCEMENT MODAL ── */}
      {showPopup && config.popupBuilder?.enabled && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="max-w-md w-full p-6 space-y-4 border shadow-2xl relative"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.primary,
              borderRadius: radiusVal,
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
            {config.popupBuilder.imageUrl && (
              <img
                src={config.popupBuilder.imageUrl}
                alt={config.popupBuilder.title}
                className="w-full h-40 object-cover rounded-xl"
              />
            )}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: palette.accent }}>
                Festival Announcement
              </div>
              <h3 className="text-lg font-black">{config.popupBuilder.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: palette.mutedText }}>
                {config.popupBuilder.message}
              </p>
            </div>
            {config.popupBuilder.ctaText && (
              <button
                onClick={() => {
                  setShowPopup(false)
                  setActiveTab("schedule")
                }}
                className="w-full py-2.5 text-xs font-bold text-white cursor-pointer"
                style={{ backgroundColor: palette.primary, borderRadius: btnRadius }}
              >
                {config.popupBuilder.ctaText}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
