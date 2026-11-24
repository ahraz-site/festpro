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
  const [selectedThemeId, setSelectedThemeId] = useState("editorial")

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
  ]

  const handleSelectTheme = (theme: ThemeOption) => {
    setSelectedThemeId(theme.id)
    toast.success(`Applied theme "${theme.name}" to festival public portal!`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs">
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
            href={`/festivals/fest`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live Site
          </a>
        </div>
      </div>

      {/* ── THEME SELECTOR INTRO (Screenshot 11) ── */}
      <div className="space-y-1">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Choose a theme
        </h2>
        <p className="text-xs text-slate-500">
          Each theme starts with pages for your fest, live standings, and results. You can change anything later.
        </p>
      </div>

      {/* ── 6 THEMES GRID (Screenshot 11) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const isSelected = selectedThemeId === theme.id
          return (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme)}
              className={`rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-white"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {/* Theme Mockup Visual Header */}
              <div
                className="h-44 p-5 flex flex-col justify-between relative border-b border-slate-100"
                style={{ backgroundColor: theme.bg }}
              >
                {/* Top dots & selected checkmark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {theme.dots.map((dot, i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: dot }}
                      />
                    ))}
                  </div>

                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
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
    </div>
  )
}
