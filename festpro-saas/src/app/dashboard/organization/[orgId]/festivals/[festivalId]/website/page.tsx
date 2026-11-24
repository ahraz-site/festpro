"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Globe, ExternalLink, Sparkles, Check, CheckCircle2,
  Palette, Layout, Smartphone, Eye, ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeOption {
  id: string
  name: string
  description: string
  dots: string[]
  bg: string
  textColor: string
  accentColor: string
  serif?: boolean
}

export default function FestivalWebsiteThemesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // State (Screenshot 11)
  const [selectedThemeId, setSelectedThemeId] = useState("gazette")

  const themes: ThemeOption[] = [
    {
      id: "editorial",
      name: "Editorial.",
      description: "Dark, bold serif headlines with red and yellow accents.",
      dots: ["#EF4444", "#F59E0B", "#10B981"],
      bg: "#0F172A",
      textColor: "#FFFFFF",
      accentColor: "#EF4444",
      serif: true,
    },
    {
      id: "classic",
      name: "Classic.",
      description: "Ivory and navy with elegant serif type and gold details.",
      dots: ["#1E3A8A", "#D97706", "#64748B"],
      bg: "#FBFBF9",
      textColor: "#1E3A8A",
      accentColor: "#D97706",
      serif: true,
    },
    {
      id: "carnival",
      name: "Carnival.",
      description: "Bright, playful, and rounded for lively fests.",
      dots: ["#EC4899", "#F59E0B", "#F43F5E"],
      bg: "#FFFDF5",
      textColor: "#0F172A",
      accentColor: "#EC4899",
      serif: false,
    },
    {
      id: "minimal",
      name: "Minimal.",
      description: "Clean Swiss layout with strong type and one bright accent.",
      dots: ["#EF4444", "#0F172A", "#E2E8F0"],
      bg: "#FFFFFF",
      textColor: "#0F172A",
      accentColor: "#EF4444",
      serif: false,
    },
    {
      id: "heritage",
      name: "Heritage.",
      description: "Warm earth tones, arches, and a cultural feel.",
      dots: ["#92400E", "#047857", "#D97706"],
      bg: "#F5EBE1",
      textColor: "#78350F",
      accentColor: "#92400E",
      serif: true,
    },
    {
      id: "midnight",
      name: "MIDNIGHT.",
      description: "Deep navy with neon glow for live scoreboards.",
      dots: ["#38BDF8", "#818CF8", "#0284C7"],
      bg: "#090D16",
      textColor: "#FFFFFF",
      accentColor: "#38BDF8",
      serif: false,
    },
    {
      id: "noor",
      name: "Noor.",
      description: "Emerald and gold with geometric patterns and arches.",
      dots: ["#F59E0B", "#10B981", "#064E3B"],
      bg: "#062A20",
      textColor: "#FDF6B2",
      accentColor: "#F59E0B",
      serif: true,
    },
    {
      id: "poster",
      name: "POSTER.",
      description: "Loud yellow, heavy borders, and hard shadows.",
      dots: ["#000000", "#EF4444", "#FFFFFF"],
      bg: "#FACC15",
      textColor: "#000000",
      accentColor: "#000000",
      serif: false,
    },
    {
      id: "bloom",
      name: "Bloom.",
      description: "Soft pastels and friendly curves for school fests.",
      dots: ["#EC4899", "#A855F7", "#FCE7F3"],
      bg: "#FFF5F7",
      textColor: "#831843",
      accentColor: "#EC4899",
      serif: true,
    },
    {
      id: "arena",
      name: "ARENA.",
      description: "Sports scoreboard with lime highlights and bold caps.",
      dots: ["#EF4444", "#F59E0B", "#84CC16"],
      bg: "#111827",
      textColor: "#FFFFFF",
      accentColor: "#84CC16",
      serif: false,
    },
    {
      id: "gazette",
      name: "Gazette.",
      description: "Newspaper front page with serif headlines and rules.",
      dots: ["#111827", "#DC2626", "#F3F4F6"],
      bg: "#F4EFE6",
      textColor: "#1C1917",
      accentColor: "#111827",
      serif: true,
    },
  ]

  const selectedTheme = themes.find((t) => t.id === selectedThemeId) || themes[0]

  const handleSelectTheme = (theme: ThemeOption) => {
    setSelectedThemeId(theme.id)
    toast.success(`Selected theme "${theme.name}"`)
  }

  const handleApplyTheme = () => {
    toast.success(`Theme "${selectedTheme.name}" activated for festival website!`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-28">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Website
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Public festival portal themes, layout builder, and live standings site.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/page-builder`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Layout className="h-3.5 w-3.5 text-slate-500" />
            Open Page Builder
          </Link>
          <a
            href={`/f/${festivalId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live Site
          </a>
        </div>
      </div>

      {/* ── THEME SELECTOR INTRO ── */}
      <div className="space-y-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Choose a theme
        </h2>
        <p className="text-xs text-slate-500">
          Each theme starts with pages for your fest, live standings, and results. You can change anything later.
        </p>
      </div>

      {/* ── 11 THEMES GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const isSelected = selectedThemeId === theme.id
          return (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme)}
              className={`rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-white shadow-indigo-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {/* Theme Mockup Visual Header */}
              <div
                className="h-44 p-5 flex flex-col justify-between relative border-b border-slate-100 transition-transform duration-200"
                style={{ backgroundColor: theme.bg }}
              >
                {/* Top dots & selected checkmark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {theme.dots.map((dot, i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: dot }}
                      />
                    ))}
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md animate-in fade-in zoom-in-75 duration-150">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Main Theme Typography Brand */}
                <div>
                  <h3
                    className={`text-3xl font-black tracking-tight ${theme.serif ? "font-serif" : "font-sans"}`}
                    style={{ color: theme.textColor }}
                  >
                    {theme.name}
                  </h3>
                </div>
              </div>

              {/* Theme Description Footer */}
              <div className="p-4 bg-white">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── BOTTOM FLOATING ACTION BAR (Screenshot 10) ── */}
      <div className="fixed bottom-6 right-8 z-40">
        <button
          onClick={handleApplyTheme}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Start with {selectedTheme.name.replace(/\.$/, "")}
        </button>
      </div>
    </div>
  )
}
