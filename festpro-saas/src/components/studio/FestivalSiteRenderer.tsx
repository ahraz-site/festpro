"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Trophy, Calendar, MapPin, Users, Award, Globe, Sparkles, Clock,
  Search, Video, Image as ImageIcon, Newspaper, Play, Phone, Mail,
  ChevronRight, ChevronLeft, Menu, X, Download, AlertTriangle, Megaphone, Eye
} from "lucide-react"
import type {
  FestivalWebsiteConfig,
  BuilderSection,
  VideoItem,
  GalleryAspectRatio,
  ShapeDividerType,
  SliderSlideItem,
} from "@/types/website-studio"
import { normalizeWebsiteConfig } from "@/types/website-studio"

export interface FestivalSiteRendererProps {
  festivalName: string
  festival?: any
  config?: FestivalWebsiteConfig
  results?: any[]
  teamPoints?: any[]
  schedules?: any[]
  stats?: { competitionsCount: number; participantsCount: number; stagesCount: number }
  isEditorMode?: boolean
  selectedSectionId?: string | null
  onSelectSection?: (sectionId: string) => void
  forcedTab?: "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news"
  onTabChange?: (tab: "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news") => void
}

// Smart Video URL Resolver (YouTube, Shorts, Live, Instagram Reels, FB, Vimeo, MP4)
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

function resolveVideoThumb(video: VideoItem): string {
  const raw = (video.url || "").trim()
  if (video.thumbnailUrl) return video.thumbnailUrl
  if (raw.includes("youtube.com/watch")) {
    try {
      const u = new URL(raw)
      const v = u.searchParams.get("v")
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`
    } catch {}
  }
  if (raw.includes("youtu.be/")) {
    const id = raw.split("youtu.be/")[1]?.split("?")[0]
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  if (raw.includes("youtube.com/shorts/")) {
    const id = raw.split("youtube.com/shorts/")[1]?.split("?")[0]
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  if (raw.includes("youtube.com/live/")) {
    const id = raw.split("youtube.com/live/")[1]?.split("?")[0]
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  if (raw.includes("youtube.com/embed/")) {
    const id = raw.split("youtube.com/embed/")[1]?.split("?")[0]
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  return "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
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

function ShapeDividerSvg({
  type,
  position,
  color,
}: {
  type: ShapeDividerType
  position: "top" | "bottom"
  color: string
}) {
  if (!type || type === "none") return null
  const flip = position === "top" ? "rotate-180" : ""
  const posClass = position === "top" ? "top-0" : "bottom-0"

  return (
    <div className={`absolute left-0 right-0 ${posClass} overflow-hidden leading-none pointer-events-none z-10 ${flip}`}>
      {type === "wave" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 sm:h-12 fill-current" style={{ color }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      )}
      {type === "curve" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 sm:h-12 fill-current" style={{ color }}>
          <path d="M0,0V6c0,21.6,291,111.46,741,110.26,445.39,3.6,459-88.3,459-110.26V0Z" />
        </svg>
      )}
      {type === "angle" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 sm:h-12 fill-current" style={{ color }}>
          <path d="M1200 120L0 16.48V120z" />
        </svg>
      )}
      {type === "triangle" && (
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 sm:h-10 fill-current" style={{ color }}>
          <path d="M600,120L0,0V120H1200V0Z" />
        </svg>
      )}
    </div>
  )
}

// Reusable Advanced Slider Widget Component
function AdvancedSliderWidget({
  slides,
  autoplay,
  intervalMs = 4500,
  transition = "fade",
  showArrows = true,
  showDots = true,
  radiusVal,
  btnRadius,
  primaryColor,
  onNavigateTab,
}: {
  slides: SliderSlideItem[]
  autoplay?: boolean
  intervalMs?: number
  transition?: string
  showArrows?: boolean
  showDots?: boolean
  radiusVal: string
  btnRadius: string
  primaryColor: string
  onNavigateTab: (target: any) => void
}) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const list = slides.length > 0 ? slides : []

  useEffect(() => {
    if (!autoplay || paused || list.length <= 1) return
    const timer = setInterval(() => {
      setIdx((c) => (c + 1) % list.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [autoplay, paused, list.length, intervalMs])

  if (list.length === 0) return null
  const activeSlide = list[idx % list.length]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden aspect-[16/7] min-h-[260px] sm:min-h-[380px] shadow-2xl border border-white/10"
      style={{ borderRadius: radiusVal }}
    >
      {list.map((sl, i) => {
        const isCurrent = i === idx % list.length
        return (
          <div
            key={sl.id || i}
            className={`absolute inset-0 transition-all duration-700 ${
              isCurrent
                ? "opacity-100 scale-100 z-10"
                : transition === "zoom"
                ? "opacity-0 scale-105 z-0 pointer-events-none"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={sl.imageUrl}
              alt={sl.heading || "Slide"}
              className={`w-full h-full object-cover ${transition === "ken_burns" && isCurrent ? "fespro-ken-burns" : ""}`}
            />
            <div
              className="absolute inset-0 bg-slate-950"
              style={{ opacity: (sl.overlayOpacity ?? 45) / 100 }}
            />
          </div>
        )
      })}

      {/* Slide Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent text-white">
        {activeSlide.heading && (
          <h3 className="text-xl sm:text-3xl font-black tracking-tight max-w-2xl">
            {activeSlide.heading}
          </h3>
        )}
        {activeSlide.description && (
          <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl">
            {activeSlide.description}
          </p>
        )}
        {activeSlide.ctaText && (
          <div className="mt-4">
            <button
              onClick={() => {
                if (activeSlide.ctaUrl?.startsWith("#")) {
                  onNavigateTab(activeSlide.ctaUrl.replace("#", ""))
                }
              }}
              className="px-5 py-2 text-xs font-bold text-white cursor-pointer hover:opacity-90"
              style={{ backgroundColor: primaryColor, borderRadius: btnRadius }}
            >
              {activeSlide.ctaText}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {showArrows && list.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIdx((c) => (c - 1 + list.length) % list.length)
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIdx((c) => (c + 1) % list.length)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && list.length > 1 && (
        <div className="absolute bottom-3 right-6 z-30 flex items-center gap-1.5">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                setIdx(i)
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === idx % list.length ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SocialIconsList({
  socialLinks,
  compact = false,
  mutedColor,
}: {
  socialLinks?: FestivalWebsiteConfig["socialLinks"]
  compact?: boolean
  mutedColor?: string
}) {
  if (!socialLinks) return null
  const boxCls = compact
    ? "h-7 w-7 rounded-lg border border-white/10 flex items-center justify-center transition-all"
    : "h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center transition-all"
  const iconCls = compact ? "h-3.5 w-3.5 fill-current" : "h-4 w-4 fill-current"

  return (
    <div className="flex items-center gap-2 flex-wrap" style={compact ? { color: mutedColor } : undefined}>
      {socialLinks.instagram && (
        <a
          href={socialLinks.instagram}
          target="_blank"
          rel="noreferrer"
          className={`${boxCls} hover:bg-pink-600 hover:text-white`}
          title="Instagram"
        >
          <svg className={iconCls} viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      )}
      {socialLinks.youtube && (
        <a
          href={socialLinks.youtube}
          target="_blank"
          rel="noreferrer"
          className={`${boxCls} hover:bg-red-600 hover:text-white`}
          title="YouTube"
        >
          <svg className={iconCls} viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
      )}
      {socialLinks.whatsapp && (
        <a
          href={socialLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className={`${boxCls} hover:bg-emerald-600 hover:text-white`}
          title="WhatsApp"
        >
          <svg className={iconCls} viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      )}
      {socialLinks.facebook && (
        <a
          href={socialLinks.facebook}
          target="_blank"
          rel="noreferrer"
          className={`${boxCls} hover:bg-blue-600 hover:text-white`}
          title="Facebook"
        >
          <svg className={iconCls} viewBox="0 0 24 24">
            <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
          </svg>
        </a>
      )}
      {socialLinks.twitter && (
        <a
          href={socialLinks.twitter}
          target="_blank"
          rel="noreferrer"
          className={`${boxCls} hover:bg-black hover:text-white`}
          title="Twitter / X"
        >
          <svg className={iconCls} viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      )}
    </div>
  )
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
  selectedSectionId = null,
  onSelectSection,
  forcedTab,
  onTabChange,
}: FestivalSiteRendererProps) {
  const config = normalizeWebsiteConfig(incomingConfig, festival)

  const palette = config.globalDesign!.palette
  const typo = config.globalDesign!.typography
  const shape = config.globalDesign!.shape
  const motion = config.motionStudio!
  const hdr = config.headerConfig!
  const isLight = palette.themeMode === "light"

  const [internalTab, setInternalTab] = useState<
    "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news"
  >("overview")
  const activeTab = forcedTab ?? internalTab
  const setActiveTab = (t: "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news") => {
    setInternalTab(t)
    onTabChange?.(t)
  }
  const [search, setSearch] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)
  const [playingVideoModal, setPlayingVideoModal] = useState<VideoItem | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<string>("All")
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>("All")
  const [activeVideoId, setActiveVideoId] = useState<string>(config.videoStudio?.videos?.[0]?.id || "")
  const [showPopup, setShowPopup] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [bgSliderTick, setBgSliderTick] = useState(0)

  // Background slider global tick for any section using background.type === "slider"
  useEffect(() => {
    const timer = setInterval(() => setBgSliderTick((t) => t + 1), 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (config.popupBuilder?.enabled && !isEditorMode) {
      const timer = setTimeout(() => setShowPopup(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [config.popupBuilder?.enabled, isEditorMode])

  useEffect(() => {
    if (isEditorMode) return
    let lastY = window.scrollY
    const handleScroll = () => {
      const currY = window.scrollY
      setIsScrolled(currY > 40)
      if (hdr.scrollEffect === "hide_on_scroll") {
        setHeaderHidden(currY > lastY && currY > 120)
      } else {
        setHeaderHidden(false)
      }
      lastY = currY

      if (motion.scrollProgressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        setScrollProgress(docHeight > 0 ? Math.min(100, (currY / docHeight) * 100) : 0)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [motion.scrollProgressBar, hdr.scrollEffect, isEditorMode])

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

  // Dynamic Google Fonts Loader
  const googleFontsList = Array.from(
    new Set([typo.headingFont, typo.bodyFont, typo.malayalamFont, typo.arabicFont].filter(Boolean))
  )
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`)
    .join("&")

  // Style helpers
  const radiusVal = shape.borderRadius || "16px"
  const btnRadius =
    shape.buttonShape === "sharp"
      ? "0px"
      : shape.buttonShape === "pill"
      ? "9999px"
      : shape.buttonShape === "brutal"
      ? "0px"
      : "12px"

  // Dynamic Browser Tab Favicon Updater
  useEffect(() => {
    if (config.faviconUrl && typeof document !== "undefined") {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
      if (!link) {
        link = document.createElement("link")
        link.rel = "shortcut icon"
        document.getElementsByTagName("head")[0].appendChild(link)
      }
      link.href = config.faviconUrl
    }
  }, [config.faviconUrl])

  // Dynamic Button Hover Classes (Configurable interactive hover styles)
  const btnHoverEffect =
    motion.buttonHoverEffect ||
    (motion.defaultHover === "glow" ? "glow" : motion.defaultHover === "lift" ? "lift" : "glow")
  const btnHoverClass = motion.reducedMotion
    ? ""
    : btnHoverEffect === "glow"
    ? "transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95"
    : btnHoverEffect === "lift"
    ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
    : btnHoverEffect === "scale"
    ? "transition-all duration-300 hover:scale-105 active:scale-95"
    : btnHoverEffect === "shimmer"
    ? "transition-all duration-300 hover:brightness-125 active:scale-95"
    : btnHoverEffect === "subtle"
    ? "transition-all duration-200 hover:opacity-90 active:scale-95"
    : "transition-colors duration-200"

  // Dynamic Card Hover Classes
  const cardHoverEffect =
    motion.cardHoverEffect ||
    (motion.defaultHover === "lift"
      ? "lift_shadow"
      : motion.defaultHover === "glow"
      ? "border_glow"
      : motion.defaultHover === "scale"
      ? "scale_up"
      : "lift_shadow")
  const cardHoverClass = motion.reducedMotion
    ? ""
    : cardHoverEffect === "lift_shadow"
    ? "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    : cardHoverEffect === "border_glow"
    ? "transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:border-indigo-500/60"
    : cardHoverEffect === "scale_up"
    ? "transition-all duration-300 hover:scale-[1.02]"
    : cardHoverEffect === "neon_glow"
    ? "transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/30 hover:border-fuchsia-400"
    : ""

  const cardClass = [
    "overflow-hidden break-words min-w-0 max-w-full box-border",
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
    cardHoverClass,
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

  const headingSizeClass =
    typo.headingSize === "compact"
      ? "text-xl @2xl:text-3xl @4xl:text-4xl"
      : typo.headingSize === "standard"
      ? "text-2xl @2xl:text-4xl @4xl:text-5xl"
      : typo.headingSize === "large"
      ? "text-2xl @2xl:text-5xl @4xl:text-6xl"
      : "text-3xl @2xl:text-5xl @4xl:text-7xl"

  const letterSpacingVal =
    typo.letterSpacing === "tighter"
      ? "-0.04em"
      : typo.letterSpacing === "wide"
      ? "0.05em"
      : typo.letterSpacing === "wider"
      ? "0.1em"
      : "0em"

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
            {config.seoAndAdvanced.maintenanceMessage || "We are updating live schedules & scores. Back shortly!"}
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
    config.heroSubtitle || "Track live scores, stage schedules, house points, and instant result announcements."

  const galleryItems = config.gallery || []
  const albums = ["All", ...Array.from(new Set(galleryItems.map((g) => g.album || g.category || "Event")))]
  const filteredGallery =
    selectedAlbum === "All"
      ? galleryItems
      : galleryItems.filter((g) => (g.album || g.category || "Event") === selectedAlbum)

  const videos = config.videoStudio?.videos || []
  const currentVideo = videos.find((v) => v.id === activeVideoId) || videos[0]
  const videoCategories = ["All", ...Array.from(new Set(videos.map((v) => v.category || "Stage").filter(Boolean)))]
  const filteredVideos =
    selectedVideoCategory === "All"
      ? videos
      : videos.filter((v) => (v.category || "Stage") === selectedVideoCategory)
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

  // Section Container Engine (Background Studio + Layout + Effects + Shape Dividers)
  const renderSectionContainer = (section: BuilderSection, innerContent: React.ReactNode, isEdgeToEdge = false) => {
    const bg = section.background || { type: "inherit" }
    const lay = section.layout || { widthMode: isEdgeToEdge ? "full" : "boxed", paddingY: "normal" }
    const eff = section.effects || {
      entrance: section.animation || "inherit",
      hover: "inherit",
      topDivider: "none",
      bottomDivider: "none",
    }

    const isSelected = isEditorMode && selectedSectionId === section.id

    const pyClass =
      lay.paddingY === "compact"
        ? "py-4"
        : lay.paddingY === "spacious"
        ? "py-14"
        : lay.paddingY === "heroic"
        ? "py-12 @2xl:py-24"
        : "py-8 @2xl:py-10"

    const enterClass =
      motion.reducedMotion || eff.entrance === "none"
        ? ""
        : eff.entrance === "zoom_in"
        ? "fespro-enter-zoom"
        : "fespro-enter-fadeup"

    // Resolve background color / gradient
    let sectionStyle: React.CSSProperties = {
      opacity: eff.opacity !== undefined ? eff.opacity / 100 : 1,
      minHeight: lay.minHeight && lay.minHeight !== "auto" ? lay.minHeight : undefined,
      borderRadius: lay.borderRadius && lay.borderRadius !== "inherit" ? lay.borderRadius : undefined,
    }

    if (bg.type === "solid" && bg.solidColor) {
      sectionStyle.backgroundColor = bg.solidColor
    } else if (bg.type === "gradient") {
      sectionStyle.background = `linear-gradient(${bg.gradientAngle ?? palette.gradientAngle}deg, ${
        bg.gradientFrom || `${palette.primary}40`
      }, ${bg.gradientTo || palette.background})`
    } else if (bg.type === "glass") {
      sectionStyle.backgroundColor = `${palette.surface}88`
      sectionStyle.backdropFilter = `blur(${eff.backdropBlur ?? 16}px)`
    } else if (bg.type === "pattern") {
      sectionStyle.backgroundImage =
        bg.patternType === "grid"
          ? `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`
          : `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)`
      sectionStyle.backgroundSize = bg.patternType === "grid" ? "28px 28px" : "20px 20px"
    } else if (section.bgOverride) {
      sectionStyle.backgroundColor = section.bgOverride
    }

    const activeBgSliderUrl =
      bg.type === "slider" && bg.sliderImages && bg.sliderImages.length > 0
        ? bg.sliderImages[bgSliderTick % bg.sliderImages.length]
        : null

    return (
      <section
        key={section.id}
        onClick={() => isEditorMode && onSelectSection?.(section.id)}
        style={sectionStyle}
        className={`relative overflow-hidden transition-all ${enterClass} ${
          lay.sticky ? "sticky top-16 z-20" : ""
        } ${
          section.visibility === "desktop"
            ? "hidden @3xl:block"
            : section.visibility === "mobile"
            ? "block @3xl:hidden"
            : ""
        } ${
          isEditorMode
            ? `cursor-pointer ${
                isSelected
                  ? "ring-2 ring-indigo-500 ring-inset"
                  : "hover:ring-1 hover:ring-indigo-400/40"
              }`
            : ""
        }`}
      >
        {/* Background Media Layer: Static Image or Animated GIF */}
        {(bg.type === "image" || bg.type === "gif") && bg.imageUrl && (
          <div
            className={`absolute inset-0 z-0 pointer-events-none ${
              bg.bgAnimation === "ken_burns" ? "fespro-ken-burns" : bg.bgAnimation === "zoom" ? "scale-105" : ""
            }`}
            style={{
              backgroundImage: `url("${bg.imageUrl}")`,
              backgroundPosition: bg.imagePosition || "center",
              backgroundSize: bg.imageSize || "cover",
              backgroundRepeat: bg.imageRepeat || "no-repeat",
              backgroundAttachment: bg.attachment || "scroll",
            }}
          />
        )}

        {/* Background Media Layer: Background Image Slider */}
        {activeBgSliderUrl && (
          <img
            src={activeBgSliderUrl}
            alt="Section background"
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700"
          />
        )}

        {/* Background Media Layer: Loop Video */}
        {bg.type === "video" && bg.videoUrl && (
          <video
            src={bg.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* Color Overlay Layer */}
        {(bg.type === "image" || bg.type === "gif" || bg.type === "video" || bg.type === "slider" || config.bannerUrl) &&
          (bg.overlayOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundColor: bg.overlayColor || palette.background,
                opacity: (bg.overlayOpacity ?? 50) / 100,
              }}
            />
          )}

        {/* SVG Shape Divider Top */}
        <ShapeDividerSvg type={eff.topDivider || "none"} position="top" color={palette.background} />

        {/* Editor Section Indicator */}
        {isEditorMode && (
          <div className="absolute top-2 right-3 z-30 px-2 py-0.5 rounded bg-indigo-600/90 text-white text-[9px] font-bold uppercase tracking-wider pointer-events-none">
            {section.label}
          </div>
        )}

        {/* Content Container */}
        <div
          className={`relative z-10 min-w-0 ${
            lay.widthMode === "full" && isEdgeToEdge ? "w-full" : `${containerMaxW} mx-auto px-4 @2xl:px-6`
          } ${pyClass}`}
        >
          {innerContent}
        </div>

        {/* SVG Shape Divider Bottom */}
        <ShapeDividerSvg type={eff.bottomDivider || "none"} position="bottom" color={palette.background} />
      </section>
    )
  }

  // Seamless URL / Anchor / Tab Click Handler
  const handleCtaClick = (
    url?: string,
    defaultTab: "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news" = "results"
  ) => {
    if (!url || !url.trim()) {
      setActiveTab(defaultTab)
      return
    }
    const clean = url.trim()
    if (clean.startsWith("#")) {
      const target = clean.replace(/^#/, "").toLowerCase()
      if (["overview", "results", "schedule", "leaderboard", "gallery", "videos", "news"].includes(target)) {
        setActiveTab(target as any)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      const el = document.getElementById(target)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
        return
      }
    } else if (clean.startsWith("http://") || clean.startsWith("https://")) {
      window.open(clean, "_blank", "noopener,noreferrer")
      return
    } else if (clean.startsWith("/")) {
      window.location.href = clean
      return
    }
    setActiveTab(defaultTab)
  }

  const displayResults = results

  const displayTeamPoints = teamPoints

  // Render Individual Widget / Section Content
  const renderSectionWidget = (section: BuilderSection) => {
    if (!section.enabled) return null

    switch (section.type) {
      case "hero": {
        const heroSection = section.background?.imageUrl
          ? section
          : {
              ...section,
              background: {
                ...section.background,
                type: config.bannerUrl ? "image" : section.background?.type || "gradient",
                imageUrl: config.bannerUrl || section.background?.imageUrl,
                videoUrl: config.heroConfig?.bgVideoUrl || section.background?.videoUrl,
                overlayOpacity: section.background?.overlayOpacity ?? Math.round((config.heroConfig?.overlayOpacity ?? 0.65) * 100),
              } as any,
            }

        return renderSectionContainer(
          heroSection,
          <div className={`space-y-5 @2xl:space-y-6 min-w-0 ${config.heroConfig?.alignment === "left" ? "text-left" : "text-center"}`}>
            {config.heroConfig?.badgeText && (
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[11px] @2xl:text-xs font-medium border max-w-full"
                style={{
                  borderRadius: btnRadius,
                  backgroundColor: `${palette.primary}20`,
                  borderColor: `${palette.primary}50`,
                  color: isLight ? palette.primary : palette.secondary,
                }}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: palette.accent }} />
                <span className="break-words">{config.heroConfig.badgeText}</span>
              </div>
            )}

            {/* Hero Main Headline (Text, Logo Image, or Animated GIF) */}
            {(() => {
              const displayType = config.heroConfig?.titleDisplayType || "text_only"
              const heroMediaUrl = config.heroConfig?.heroLogoUrl || config.logoUrl || config.wordmarkUrl
              const heroMediaWidth = config.heroConfig?.heroLogoWidth || 420
              const heroMediaHeight = config.heroConfig?.heroLogoHeight || 160
              const hasMedia = displayType !== "text_only" && Boolean(heroMediaUrl)

              const renderGraphic = () => (
                <div className={`relative inline-block my-2 ${config.heroConfig?.alignment === "left" ? "" : "mx-auto"}`}>
                  {config.heroConfig?.heroLogoGlow !== false && (
                    <div
                      className="absolute -inset-4 sm:-inset-6 rounded-3xl blur-2xl opacity-40 animate-pulse pointer-events-none"
                      style={{ backgroundColor: palette.primary }}
                    />
                  )}
                  <img
                    src={heroMediaUrl}
                    alt={heroTitle || festivalName}
                    style={{
                      maxHeight: `${heroMediaHeight}px`,
                      maxWidth: `${heroMediaWidth}px`,
                    }}
                    className="relative z-10 w-auto h-auto object-contain mx-auto drop-shadow-2xl"
                  />
                </div>
              )

              const renderTextHeading = () => (
                <h1
                  className={`${headingSizeClass} tracking-tight leading-tight break-words`}
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
              )

              if ((displayType === "logo_only" || displayType === "gif_or_image") && hasMedia) {
                return renderGraphic()
              }

              if ((displayType === "logo_and_text" || displayType === "gif_and_text") && hasMedia) {
                return (
                  <div className="space-y-3">
                    {renderGraphic()}
                    {renderTextHeading()}
                  </div>
                )
              }

              return renderTextHeading()
            })()}

            <p
              className={`text-sm @2xl:text-lg max-w-2xl leading-relaxed break-words ${
                config.heroConfig?.alignment === "left" ? "" : "mx-auto"
              }`}
              style={{ color: palette.mutedText }}
            >
              {heroSubtitle}
            </p>

            <div
              className={`flex flex-wrap items-center gap-3 pt-2 ${
                config.heroConfig?.alignment === "left" ? "justify-start" : "justify-center"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const t = config.heroConfig?.primaryCtaTarget
                  if (t === "custom" || config.heroConfig?.primaryCtaUrl) {
                    handleCtaClick(config.heroConfig?.primaryCtaUrl, (t as any) || "results")
                  } else {
                    setActiveTab((t as any) || "results")
                  }
                }}
                className={`px-6 py-3 font-bold text-sm text-white shadow-lg cursor-pointer ${btnHoverClass}`}
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
                onClick={(e) => {
                  e.stopPropagation()
                  const t = config.heroConfig?.secondaryCtaTarget
                  if (t === "custom" || config.heroConfig?.secondaryCtaUrl) {
                    handleCtaClick(config.heroConfig?.secondaryCtaUrl, (t as any) || "leaderboard")
                  } else {
                    setActiveTab((t as any) || "leaderboard")
                  }
                }}
                className={`px-6 py-3 font-bold text-sm border cursor-pointer ${btnHoverClass}`}
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
        )
      }

      // ── BETWEEN-SECTION CREATIVE COMPONENTS ──
      case "marquee":
        return renderSectionContainer(
          section,
          <div className="overflow-hidden whitespace-nowrap py-1">
            <div
              className="inline-block fespro-marquee text-xs @2xl:text-sm font-black tracking-wide text-white"
              style={{ animationDuration: `${section.settings?.speedSeconds || 22}s` }}
            >
              {section.settings?.text || "LIVE SCORES RUNNING NOW • CHECK STAGE SCHEDULES & WINNERS •"}
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {section.settings?.text || "LIVE SCORES RUNNING NOW • CHECK STAGE SCHEDULES & WINNERS •"}
            </div>
          </div>,
          true
        )

      case "image_banner":
      case "gif_banner":
        return renderSectionContainer(
          section,
          <div className="relative overflow-hidden shadow-2xl border border-white/10" style={{ borderRadius: radiusVal }}>
            <img
              src={
                section.settings?.mediaUrl ||
                (section.type === "gif_banner"
                  ? "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
                  : "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80")
              }
              alt={section.settings?.title || "Festival Banner"}
              className="w-full max-h-[380px] object-cover"
            />
            {(section.settings?.title || section.settings?.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                {section.settings?.title && <h3 className="text-xl sm:text-3xl font-black">{section.settings.title}</h3>}
                {section.settings?.subtitle && <p className="text-xs sm:text-sm text-slate-200 mt-1">{section.settings.subtitle}</p>}
              </div>
            )}
          </div>
        )

      case "slider_banner":
        return renderSectionContainer(
          section,
          <AdvancedSliderWidget
            slides={section.settings?.slides || []}
            autoplay={section.settings?.autoplay !== false}
            intervalMs={section.settings?.intervalMs || 4500}
            transition={section.settings?.transition || "fade"}
            showArrows={section.settings?.showArrows !== false}
            showDots={section.settings?.showDots !== false}
            radiusVal={radiusVal}
            btnRadius={btnRadius}
            primaryColor={palette.primary}
            onNavigateTab={setActiveTab}
          />
        )

      case "video_banner": {
        const vidUrl = section.settings?.videoUrl || "https://www.youtube.com/embed/live_stream"
        const emb = resolveVideoEmbed({ id: "vb", title: "Banner", platform: vidUrl.endsWith(".mp4") ? "mp4" : "youtube", url: vidUrl })
        return renderSectionContainer(
          section,
          <div className={`overflow-hidden aspect-video max-h-[420px] ${cardClass}`} style={{ borderRadius: radiusVal }}>
            {emb.kind === "mp4" ? (
              <video src={emb.src} autoPlay loop muted playsInline controls className="w-full h-full object-cover" />
            ) : (
              <iframe src={emb.src} title="Video Banner" className="w-full h-full border-0" allowFullScreen />
            )}
          </div>
        )
      }

      case "announcement_bar":
        return renderSectionContainer(
          section,
          <div
            className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border"
            style={{
              backgroundColor: `${palette.accent}18`,
              borderColor: `${palette.accent}50`,
              borderRadius: radiusVal,
            }}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 shrink-0" style={{ color: palette.accent }} />
              <span className="text-xs sm:text-sm font-bold">
                {section.settings?.text || "Important Festival Notice: Reporting desks open at 08:30 AM sharp!"}
              </span>
            </div>
            {section.settings?.ctaText && (
              <button
                onClick={() => handleCtaClick(section.settings?.ctaUrl, "schedule")}
                className="px-3.5 py-1.5 text-xs font-bold text-white shrink-0 cursor-pointer"
                style={{ backgroundColor: palette.primary, borderRadius: btnRadius }}
              >
                {section.settings.ctaText}
              </button>
            )}
          </div>
        )

      case "promo_banner":
        return renderSectionContainer(
          section,
          <div
            className={`grid grid-cols-1 @2xl:grid-cols-2 overflow-hidden min-w-0 ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
          >
            <img
              src={
                section.settings?.imageUrl ||
                "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80"
              }
              alt="Promo"
              className="w-full h-56 @2xl:h-full object-cover"
            />
            <div className="p-5 @2xl:p-8 flex flex-col justify-center space-y-3 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider break-words" style={{ color: palette.accent }}>
                {section.settings?.badge || "Featured Program"}
              </span>
              <h3 className="text-xl @2xl:text-2xl font-black break-words" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                {section.settings?.title || "Cultural Evening & Prize Night"}
              </h3>
              <p className="text-xs leading-relaxed break-words" style={{ color: palette.mutedText }}>
                {section.settings?.description ||
                  "Join us for the grand finale cultural performances and overall championship trophy ceremony."}
              </p>
              <div>
                <button
                  onClick={() => handleCtaClick(section.settings?.ctaUrl, "results")}
                  className="px-4 py-2 text-xs font-bold text-white cursor-pointer"
                  style={{ backgroundColor: palette.primary, borderRadius: btnRadius }}
                >
                  {section.settings?.ctaText || "Explore Live Scores"}
                </button>
              </div>
            </div>
          </div>
        )

      case "logo_carousel":
        return renderSectionContainer(
          section,
          <div className="space-y-3 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: palette.mutedText }}>
              {section.settings?.title || "Official Festival Partners & Sponsors"}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-2 opacity-80">
              {(section.settings?.logos || ["MAIN CAMPUS", "ARTS COUNCIL", "YOUTH WING", "ALUMNI TRUST", "MEDIA PARTNER"]).map(
                (name: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-lg border text-xs font-black tracking-wider"
                    style={{
                      backgroundColor: palette.surface,
                      borderColor: `${palette.primary}30`,
                      color: palette.text,
                    }}
                  >
                    {name}
                  </div>
                )
              )}
            </div>
          </div>
        )

      case "testimonial_slider":
        return renderSectionContainer(
          section,
          <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-4">
            {(section.settings?.quotes || [
              { name: "Chief Jury Member", quote: "Incredible organization and transparent live score updates!" },
              { name: "Campus Dean", quote: "Real-time schedules kept every stage running strictly on time." },
              { name: "Arts Secretary", quote: "A wonderful celebration of youth talent and creativity." },
            ]).map((q: any, i: number) => (
              <div
                key={i}
                className={`p-5 space-y-2 min-w-0 overflow-hidden ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
              >
                <p className="text-xs italic leading-relaxed break-words" style={{ color: palette.mutedText }}>
                  "{q.quote}"
                </p>
                <div className="text-xs font-black break-words" style={{ color: palette.accent }}>
                  — {q.name}
                </div>
              </div>
            ))}
          </div>
        )

      case "shape_divider":
        return renderSectionContainer(
          section,
          <div className="py-4 flex items-center justify-center">
            <div className="h-1 w-24 rounded-full" style={{ backgroundColor: palette.accent }} />
          </div>
        )

      // ── STANDARD DYNAMIC FESTIVAL WIDGETS ──
      case "countdown":
        return renderSectionContainer(
          section,
          <div
            className={`p-4 @2xl:p-8 text-center space-y-4 overflow-hidden min-w-0 ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
          >
            <div className="text-xs font-black uppercase tracking-widest break-words" style={{ color: palette.accent }}>
              {section.settings?.title || config.heroConfig?.countdownTitle || "Festival Countdown"}
            </div>
            <div className="grid grid-cols-2 @lg:grid-cols-4 gap-2.5 @2xl:gap-3 max-w-md mx-auto">
              {[
                { val: countdown.days, label: "Days" },
                { val: countdown.hours, label: "Hours" },
                { val: countdown.minutes, label: "Mins" },
                { val: countdown.seconds, label: "Secs" },
              ].map((u) => (
                <div
                  key={u.label}
                  className="p-2.5 @2xl:p-3 border min-w-0 overflow-hidden flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: palette.background,
                    borderRadius: radiusVal,
                    borderColor: `${palette.primary}30`,
                  }}
                >
                  <div className="text-2xl @2xl:text-4xl font-black tabular-nums leading-none" style={{ color: palette.text }}>
                    {String(u.val).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] font-bold uppercase mt-1.5 tracking-wider truncate max-w-full" style={{ color: palette.mutedText }}>
                    {u.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "stats":
        return renderSectionContainer(
          section,
          <div className="grid grid-cols-2 @3xl:grid-cols-4 gap-3 @2xl:gap-4">
            {[
              { label: "Published Results", value: results.length, sub: "Verified scores", color: palette.primary },
              { label: "Competitions", value: stats.competitionsCount, sub: "On & off-stage items", color: palette.secondary },
              { label: "Participants", value: stats.participantsCount, sub: "Registered candidates", color: palette.accent },
              { label: "Festival Stages", value: stats.stagesCount || 1, sub: "Active stage consoles", color: "#10B981" },
            ].map((s) => (
              <div
                key={s.label}
                className={`p-4 @2xl:p-5 min-w-0 overflow-hidden ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
              >
                <div className="text-[10px] @2xl:text-[11px] font-bold uppercase tracking-wide break-words leading-snug" style={{ color: palette.mutedText }}>
                  {s.label}
                </div>
                <div className="text-2xl @2xl:text-3xl font-black mt-1.5 tabular-nums truncate" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[11px] @2xl:text-xs mt-1 break-words leading-snug" style={{ color: palette.mutedText }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        )

      case "leaderboard":
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg @2xl:text-xl font-black flex items-center gap-2 min-w-0 break-words" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                <Award className="h-5 w-5 shrink-0" style={{ color: palette.accent }} />
                <span>House Championship Standings</span>
              </h2>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                style={{ color: palette.secondary }}
              >
                Full Standings <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {displayTeamPoints.length === 0 ? (
              <div
                className={`p-8 text-center text-xs ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
              >
                Standings will update live as competitions conclude.
              </div>
            ) : (
              <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4">
                {displayTeamPoints.slice(0, section.settings?.maxItems || 6).map((t: any, i: number) => (
                  <div
                    key={t.id || i}
                    className={`p-4 flex items-center justify-between gap-3 min-w-0 overflow-hidden ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0"
                        style={{ backgroundColor: i === 0 ? "#D97706" : i === 1 ? "#64748B" : palette.primary }}
                      >
                        #{t.rank || i + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{t.team_name || `House ${i + 1}`}</h4>
                        <p className="text-[11px] truncate" style={{ color: palette.mutedText }}>
                          Published house score
                        </p>
                      </div>
                    </div>
                    <div className="text-lg @2xl:text-xl font-black shrink-0 tabular-nums" style={{ color: palette.accent }}>
                      {t.total_points || 0} <span className="text-[10px] font-bold">PTS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "results":
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-2">
              <h2 className="text-lg @2xl:text-xl font-black flex items-center gap-2 min-w-0 break-words" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                <Trophy className="h-5 w-5 shrink-0" style={{ color: palette.accent }} />
                <span>Latest Published Results</span>
              </h2>
              <button
                onClick={() => setActiveTab("results")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer w-fit"
                style={{ color: palette.secondary }}
              >
                Search All Results <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {displayResults.length === 0 ? (
              <div
                className={`p-8 text-center text-xs ${cardClass}`}
                style={{ backgroundColor: palette.surface, borderRadius: radiusVal, color: palette.mutedText }}
              >
                No published results yet. Live scores appear automatically once verified.
              </div>
            ) : (
              <div className="grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3 gap-4">
                {displayResults.slice(0, section.settings?.maxItems || 6).map((r: any, idx: number) => (
                  <div
                    key={r.id || idx}
                    className={`p-4 flex items-center justify-between gap-3 min-w-0 overflow-hidden ${cardClass}`}
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
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
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
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                <Video className="h-5 w-5 text-rose-500" />
                <span>Festival Videos &amp; Telecasts</span>
              </h2>
              <button
                onClick={() => setActiveTab("videos")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: palette.secondary }}
              >
                Open Video Gallery <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {videos.length === 0 ? (
              <div className={`p-8 text-center space-y-2 ${cardClass}`} style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}>
                <Video className="h-8 w-8 mx-auto" style={{ color: palette.mutedText }} />
                <p className="text-xs" style={{ color: palette.mutedText }}>No videos added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setPlayingVideoModal(v)}
                    className={`group relative overflow-hidden cursor-pointer aspect-video ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <img
                      src={resolveVideoThumb(v)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-white text-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                        <Play className="h-5 w-5 fill-slate-900 ml-0.5 text-slate-900" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case "gallery":
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg @2xl:text-xl font-black flex items-center gap-2 min-w-0" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                <ImageIcon className="h-5 w-5 shrink-0" style={{ color: palette.secondary }} />
                <span className="truncate">Photo Gallery Showcase</span>
              </h2>
              <button
                onClick={() => setActiveTab("gallery")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                style={{ color: palette.secondary }}
              >
                Explore All Photos <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-3">
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
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-9 h-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "news":
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg @2xl:text-xl font-black flex items-center gap-2 min-w-0" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                <Newspaper className="h-5 w-5 shrink-0" style={{ color: palette.accent }} />
                <span className="truncate">Official Bulletins &amp; News</span>
              </h2>
              <button
                onClick={() => setActiveTab("news")}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                style={{ color: palette.secondary }}
              >
                All Notices <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-4">
              {newsItems.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`p-5 space-y-2 min-w-0 overflow-hidden ${cardClass}`}
                  style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0"
                      style={{ backgroundColor: `${palette.primary}25`, color: palette.secondary }}
                    >
                      {n.badge || "News"}
                    </span>
                    <span className="truncate" style={{ color: palette.mutedText }}>{n.date}</span>
                  </div>
                  <h4 className="font-bold text-sm break-words">{n.title}</h4>
                  <p className="text-xs line-clamp-2 break-words" style={{ color: palette.mutedText }}>
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case "team":
        return renderSectionContainer(
          section,
          <div className="space-y-4">
            <h2 className="text-lg @2xl:text-xl font-black flex items-center gap-2" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
              <Users className="h-5 w-5 shrink-0" style={{ color: palette.secondary }} />
              <span>{section.settings?.title || "Organizing Committee"}</span>
            </h2>
            <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-4">
              {(config.teamMembers || []).map((m) => (
                <div
                  key={m.id}
                  className={`p-5 flex items-center gap-3.5 min-w-0 overflow-hidden ${cardClass}`}
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
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{m.name}</h4>
                    <p className="text-xs font-semibold truncate" style={{ color: palette.accent }}>
                      {m.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "contact":
        return renderSectionContainer(
          section,
          <div
            className={`p-5 @2xl:p-6 grid grid-cols-1 @2xl:grid-cols-3 gap-4 min-w-0 overflow-hidden ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
          >
            <div className="flex items-start gap-3 min-w-0">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: palette.accent }} />
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase" style={{ color: palette.mutedText }}>
                  Festival Campus
                </div>
                <div className="text-sm font-bold mt-0.5 break-words">{config.venueCampus || "Main Auditorium"}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 min-w-0">
              <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: palette.secondary }} />
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase" style={{ color: palette.mutedText }}>
                  Helpdesk Helpline
                </div>
                <div className="text-sm font-bold mt-0.5 break-words">{config.helpdeskPhone}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 min-w-0">
              <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: palette.primary }} />
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase" style={{ color: palette.mutedText }}>
                  Official Email
                </div>
                <div className="text-sm font-bold mt-0.5 break-all">{config.helpdeskEmail}</div>
              </div>
            </div>
          </div>
        )

      case "heading_banner":
        return renderSectionContainer(
          section,
          <div className="text-center space-y-2 py-2">
            <h2 className="text-2xl sm:text-4xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
              {section.settings?.heading || "Featured Festival Highlight"}
            </h2>
            <p className="text-sm" style={{ color: palette.mutedText }}>
              {section.settings?.subheading || "Real-time cultural competitions and announcements."}
            </p>
          </div>
        )

      case "divider":
        return renderSectionContainer(
          section,
          <hr style={{ borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)" }} />
        )

      case "custom_html":
        return renderSectionContainer(
          section,
          <div
            className={`p-4 ${cardClass}`}
            style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
            dangerouslySetInnerHTML={{
              __html: section.settings?.html || "<div class='text-center text-xs'>Custom HTML Embed</div>",
            }}
          />
        )

      default:
        return null
    }
  }

  // Header Background Styling Resolver
  const headerHeightClass =
    hdr.scrollEffect === "shrink" && isScrolled
      ? "h-14"
      : hdr.height === "compact"
      ? "h-14"
      : hdr.height === "tall"
      ? "h-24"
      : "h-16 sm:h-20"

  const headerStyleObj: React.CSSProperties = {
    borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
  }

  if (hdr.bgType === "solid" && hdr.bgColor) {
    headerStyleObj.backgroundColor = hdr.bgColor
  } else if (hdr.bgType === "gradient") {
    headerStyleObj.background = `linear-gradient(90deg, ${hdr.gradientFrom || palette.primary}, ${hdr.gradientTo || palette.secondary})`
  } else if (hdr.bgType === "transparent" && !isScrolled) {
    headerStyleObj.backgroundColor = "transparent"
  } else if (hdr.style === "solid") {
    headerStyleObj.backgroundColor = palette.surface
  } else {
    headerStyleObj.backgroundColor = isScrolled && hdr.scrollEffect === "bg_change" ? palette.surface : `${palette.background}e6`
    headerStyleObj.backdropFilter = "blur(14px)"
  }

  return (
    <div
      className="@container min-h-screen flex flex-col relative selection:bg-indigo-500/30"
      style={{
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: `"${typo.bodyFont}", "${typo.malayalamFont}", "${typo.arabicFont}", sans-serif`,
      }}
    >
      {/* Dynamic Google Fonts */}
      {googleFontsList && (
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${googleFontsList}&display=swap`} />
      )}
      {typo.customFontUrl && typo.customFontName && (
        <style>{`@font-face { font-family: "${typo.customFontName}"; src: url("${typo.customFontUrl}"); }`}</style>
      )}
      <style>{`
        @keyframes fesproMarquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        @keyframes fesproKenBurns { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes fesproFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fesproZoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .fespro-marquee { animation: fesproMarquee linear infinite; }
        .fespro-ken-burns { animation: fesproKenBurns 18s ease-in-out infinite; }
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

      {/* ── WHITE-LABELED HEADER DESIGN STUDIO ── */}
      <header
        className={`${hdr.sticky !== false && !isEditorMode ? "sticky top-0" : "relative"} z-40 border-b overflow-hidden transition-all duration-300 ${
          headerHidden ? "-translate-y-full" : "translate-y-0"
        }`}
        style={headerStyleObj}
      >
        {/* Header Image / GIF Background */}
        {(hdr.bgType === "image" || hdr.bgType === "gif") && hdr.bgMediaUrl && (
          <img
            src={hdr.bgMediaUrl}
            alt="Header BG"
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
        )}
        {/* Header Video Background */}
        {hdr.bgType === "video" && hdr.bgMediaUrl && (
          <video
            src={hdr.bgMediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
        )}
        {/* Header Overlay */}
        {(hdr.bgType === "image" || hdr.bgType === "gif" || hdr.bgType === "video") && (
          <div
            className="absolute inset-0 bg-slate-950 z-0 pointer-events-none"
            style={{ opacity: (hdr.overlayOpacity ?? 50) / 100 }}
          />
        )}

        <div
          className={`relative z-10 ${containerMaxW} mx-auto px-4 sm:px-6 ${headerHeightClass} flex items-center justify-between gap-4 transition-all duration-300 ${
            hdr.logoPosition === "right" ? "flex-row-reverse" : ""
          }`}
        >
          {/* Logo & Brand Block */}
          {(() => {
            const logoMode = hdr.logoMode || "logo_and_name"
            const showLogoImg = (logoMode === "logo_and_name" || logoMode === "logo_and_wordmark") && !!config.logoUrl
            const showWordmark = (logoMode === "wordmark_only" || logoMode === "logo_and_wordmark") && !!config.wordmarkUrl
            const showName = logoMode === "logo_and_name" || logoMode === "name_only" || (!config.wordmarkUrl && !config.logoUrl)

            return (
              <button
                onClick={() => {
                  setActiveTab("overview")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className={`flex items-center gap-3 text-left cursor-pointer min-w-0 ${
                  hdr.logoPosition === "center" ? "lg:order-2" : ""
                }`}
              >
                {showLogoImg && (
                  <img
                    src={config.logoUrl}
                    alt={festivalName}
                    className="h-9 sm:h-10 w-auto max-w-[120px] object-contain shrink-0"
                  />
                )}
                {showWordmark ? (
                  <img
                    src={config.wordmarkUrl}
                    alt={heroTitle || festivalName}
                    className="h-8 sm:h-10 w-auto max-w-[240px] object-contain"
                  />
                ) : showName ? (
                  <div className="min-w-0">
                    <div
                      className="text-base sm:text-lg font-black tracking-tight leading-tight truncate"
                      style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}
                    >
                      {heroTitle}
                    </div>
                    {hdr.tagline?.trim() ? (
                      <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate" style={{ color: palette.accent }}>
                        {hdr.tagline}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </button>
            )
          })()}

          {/* Navigation Links */}
          {(() => {
            const navWeightClass =
              hdr.navFontWeight === "semibold"
                ? "font-semibold"
                : hdr.navFontWeight === "medium"
                ? "font-medium"
                : hdr.navFontWeight === "normal"
                ? "font-normal"
                : "font-light" // default light variant requested by user

            return (
              <nav className={`hidden lg:flex items-center gap-2 xl:gap-3 ${hdr.logoPosition === "center" ? "lg:order-1" : ""}`}>
                {navTabs.map((t) => {
                  const Icon = t.icon
                  const isActive = activeTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs xl:text-[13px] ${navWeightClass} tracking-wide transition-all cursor-pointer border-b-2`}
                      style={{
                        borderBottomColor: isActive ? palette.primary : "transparent",
                        color: isActive
                          ? isLight
                            ? palette.primary
                            : "#FFFFFF"
                          : palette.mutedText,
                      }}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "opacity-100" : "opacity-60"}`} />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </nav>
            )
          })()}

          {/* Right Section: Optional Social Icons, Live Badge, CTA Button, Console Login */}
          <div className={`hidden sm:flex items-center gap-3 ${hdr.logoPosition === "center" ? "lg:order-3" : ""}`}>
            {hdr.showSocialIcons && (
              <SocialIconsList socialLinks={config.socialLinks} compact mutedColor={palette.mutedText} />
            )}
            {hdr.showLiveBadge === true && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </div>
            )}
            {hdr.ctaText && (
              <button
                onClick={() => handleCtaClick(hdr.ctaUrl, "results")}
                className="px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                style={{ backgroundColor: palette.accent, borderRadius: btnRadius }}
              >
                {hdr.ctaText}
              </button>
            )}
            {hdr.showConsoleLogin === true && (
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
            className="relative z-20 lg:hidden border-t px-4 py-3 space-y-1.5"
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
          <div>{(config.sections || []).map((section) => renderSectionWidget(section))}</div>
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
                  : `grid gap-4 ${
                      config.galleryStudio?.columnsMobile === 2 ? "grid-cols-2" : "grid-cols-1"
                    } sm:grid-cols-2 ${
                      config.galleryStudio?.columnsDesktop === 4
                        ? "lg:grid-cols-4"
                        : config.galleryStudio?.columnsDesktop === 2
                        ? "lg:grid-cols-2"
                        : "lg:grid-cols-3"
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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-11 h-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standalone Video Gallery Page (Matching Gallery Grid Style, No Text Overlays) */}
        {activeTab === "videos" && (
          <div className={`${containerMaxW} mx-auto px-4 sm:px-6 py-10 space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                  Festival Videos &amp; Telecasts
                </h2>
                <p className="text-xs mt-1" style={{ color: palette.mutedText }}>
                  Live stage broadcasts, performance highlights &amp; official reels
                </p>
              </div>
              {videoCategories.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {videoCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedVideoCategory(cat)}
                      className="px-3 py-1.5 text-xs font-bold cursor-pointer transition-all"
                      style={{
                        borderRadius: btnRadius,
                        backgroundColor: selectedVideoCategory === cat ? palette.primary : palette.surface,
                        color: selectedVideoCategory === cat ? "#FFFFFF" : palette.mutedText,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredVideos.length === 0 ? (
              <div className={`p-12 text-center space-y-3 ${cardClass}`} style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}>
                <Video className="h-10 w-10 mx-auto" style={{ color: palette.mutedText }} />
                <p className="text-xs font-bold" style={{ color: palette.mutedText }}>No videos uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setPlayingVideoModal(v)}
                    className={`group relative overflow-hidden cursor-pointer aspect-video ${cardClass}`}
                    style={{ backgroundColor: palette.surface, borderRadius: radiusVal }}
                  >
                    <img
                      src={resolveVideoThumb(v)}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white text-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                        <Play className="h-6 w-6 fill-slate-900 ml-1 text-slate-900" />
                      </div>
                    </div>
                  </div>
                ))}
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
              {/* Configurable Footer Logo & Wordmark Brand Presentation */}
              {(() => {
                const ftr = config.footerConfig || {}
                const mode = ftr.logoMode || "use_header_logo"
                if (mode === "hidden") return null

                const footerTitle = ftr.customTitle?.trim() || heroTitle
                const logoH = ftr.logoHeight || 36

                let showLogo = false
                let logoSrc = ""
                let showWordmark = false
                let wordmarkSrc = ""
                let showTextName = true
                let showInitialBadge = false

                if (mode === "use_header_logo") {
                  const hdrMode = hdr.logoMode || "logo_and_name"
                  if (hdrMode === "wordmark_only" && config.wordmarkUrl) {
                    showWordmark = true
                    wordmarkSrc = config.wordmarkUrl
                    showTextName = false
                  } else if (hdrMode === "logo_and_wordmark" && (config.logoUrl || config.wordmarkUrl)) {
                    showLogo = Boolean(config.logoUrl)
                    logoSrc = config.logoUrl || ""
                    showWordmark = Boolean(config.wordmarkUrl)
                    wordmarkSrc = config.wordmarkUrl || ""
                    showTextName = false
                  } else if (hdrMode === "logo_and_name" && config.logoUrl) {
                    showLogo = true
                    logoSrc = config.logoUrl
                    showTextName = true
                  } else if (hdrMode === "name_only") {
                    showTextName = true
                  } else if (config.logoUrl) {
                    showLogo = true
                    logoSrc = config.logoUrl
                  } else {
                    showInitialBadge = true
                  }
                } else if (mode === "custom_logo") {
                  logoSrc = ftr.customLogoUrl || config.logoUrl || ""
                  showLogo = Boolean(logoSrc)
                  showTextName = true
                  if (!showLogo) showInitialBadge = true
                } else if (mode === "wordmark_only") {
                  wordmarkSrc = ftr.customWordmarkUrl || config.wordmarkUrl || ""
                  showWordmark = Boolean(wordmarkSrc)
                  showTextName = !showWordmark
                } else if (mode === "logo_and_wordmark") {
                  logoSrc = ftr.customLogoUrl || config.logoUrl || ""
                  wordmarkSrc = ftr.customWordmarkUrl || config.wordmarkUrl || ""
                  showLogo = Boolean(logoSrc)
                  showWordmark = Boolean(wordmarkSrc)
                  showTextName = !showWordmark
                } else if (mode === "badge_and_name") {
                  showInitialBadge = true
                  showTextName = true
                } else if (mode === "name_only") {
                  showTextName = true
                }

                return (
                  <div className="flex items-center gap-3 flex-wrap">
                    {showLogo && logoSrc && (
                      <img
                        src={logoSrc}
                        alt={footerTitle}
                        style={{ height: `${logoH}px` }}
                        className="w-auto max-w-[140px] object-contain shrink-0"
                      />
                    )}
                    {showWordmark && wordmarkSrc ? (
                      <img
                        src={wordmarkSrc}
                        alt={footerTitle}
                        style={{ height: `${logoH}px` }}
                        className="w-auto max-w-[220px] object-contain"
                      />
                    ) : showInitialBadge ? (
                      <div
                        className="rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
                        style={{
                          height: `${logoH}px`,
                          width: `${logoH}px`,
                          backgroundColor: palette.primary,
                        }}
                      >
                        {footerTitle.slice(0, 2).toUpperCase()}
                      </div>
                    ) : null}
                    {showTextName && (
                      <span className="font-black text-lg tracking-tight" style={{ fontFamily: `"${typo.headingFont}", sans-serif` }}>
                        {footerTitle}
                      </span>
                    )}
                  </div>
                )
              })()}

              <p className="text-xs leading-relaxed" style={{ color: palette.mutedText }}>
                {config.footerConfig?.customTagline?.trim() || heroSubtitle}
              </p>

              {config.footerConfig?.showContactInfo !== false && (
                <div className="text-xs space-y-1 pt-1" style={{ color: palette.mutedText }}>
                  {config.venueCampus && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: palette.accent }} />
                      <span>{config.venueCampus}</span>
                    </div>
                  )}
                  {config.helpdeskPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: palette.secondary }} />
                      <span>{config.helpdeskPhone}</span>
                    </div>
                  )}
                  {config.helpdeskEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: palette.primary }} />
                      <span>{config.helpdeskEmail}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {config.footerConfig?.showQuickLinks !== false && (
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
            )}

            {config.footerConfig?.showSocialIcons !== false && (
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
          )}
          </div>

          <div
            className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
            style={{ borderColor: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)", color: palette.mutedText }}
          >
            <p>{config.footerConfig?.copyrightText || `© ${new Date().getFullYear()} ${heroTitle}. All rights reserved.`}</p>
            <div className="flex items-center gap-4">
              {config.footerConfig?.showStaffLogin !== false && (
                <Link href="/login" className="hover:underline">Staff Login</Link>
              )}
              {config.footerConfig?.showStaffLogin !== false && config.footerConfig?.showBackToTop !== false && (
                <span>•</span>
              )}
              {config.footerConfig?.showBackToTop !== false && (
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:underline cursor-pointer">
                  Back to top ↑
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* ── LIGHTBOX MODAL ── */}
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
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                <button onClick={() => setLightboxImage(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img src={lightboxImage.url} alt={lightboxImage.title} className="w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* ── VIDEO LIGHTBOX MODAL ── */}
      {playingVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPlayingVideoModal(null)}
        >
          <div className="max-w-4xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-white">
              <h4 className="font-bold text-sm truncate pr-2">{playingVideoModal.title || "Festival Video"}</h4>
              <button
                onClick={() => setPlayingVideoModal(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Close video"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
              {(() => {
                const emb = resolveVideoEmbed(playingVideoModal)
                return emb.kind === "mp4" ? (
                  <video src={emb.src} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <iframe
                    src={emb.src ? `${emb.src}?autoplay=1` : ""}
                    title={playingVideoModal.title || "Festival Video"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── POPUP ANNOUNCEMENT MODAL ── */}
      {showPopup && config.popupBuilder?.enabled && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="max-w-md w-full p-6 space-y-4 border shadow-2xl relative"
            style={{ backgroundColor: palette.surface, borderColor: palette.primary, borderRadius: radiusVal }}
          >
            <button onClick={() => setShowPopup(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
            {config.popupBuilder.imageUrl && (
              <img src={config.popupBuilder.imageUrl} alt={config.popupBuilder.title} className="w-full h-40 object-cover rounded-xl" />
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
