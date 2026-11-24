"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Type, Plus, Trash2, CheckCircle, Upload, Search,
  Sparkles, X, Globe, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FontItem {
  id: string
  name: string
  family: string
  category: "Malayalam" | "Serif" | "Sans" | "Display"
  isCustom?: boolean
}

export default function FestivalFontsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // State (Screenshot 10)
  const [previewText, setPreviewText] = useState("FestPro")
  const [fonts, setFonts] = useState<FontItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newFontName, setNewFontName] = useState("")
  const [selectedPreset, setSelectedPreset] = useState("Noto Sans Malayalam")

  const presetFonts = [
    { name: "Noto Sans Malayalam", category: "Malayalam" as const },
    { name: "Manjari", category: "Malayalam" as const },
    { name: "Gayathri", category: "Malayalam" as const },
    { name: "Chilanka", category: "Malayalam" as const },
    { name: "Playfair Display", category: "Serif" as const },
    { name: "Inter", category: "Sans" as const },
    { name: "Manrope", category: "Sans" as const },
    { name: "Plus Jakarta Sans", category: "Sans" as const },
  ]

  const handleAddPreset = (presetName: string, category: any) => {
    if (fonts.some(f => f.name === presetName)) {
      toast.info("Font is already in your festival library.")
      return
    }

    const newFont: FontItem = {
      id: Date.now().toString(),
      name: presetName,
      family: presetName,
      category,
    }

    setFonts([...fonts, newFont])
    setShowAddModal(false)
    toast.success(`Font "${presetName}" enabled for certificates, posters, and web!`)
  }

  const handleCustomUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFontName.trim()) return

    const newFont: FontItem = {
      id: Date.now().toString(),
      name: newFontName,
      family: newFontName,
      category: "Display",
      isCustom: true,
    }

    setFonts([...fonts, newFont])
    setShowAddModal(false)
    setNewFontName("")
    toast.success(`Custom font "${newFontName}" uploaded and registered!`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      {/* ── HEADER (Screenshot 10) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fonts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Use your own fonts on the website, posters, ID cards, and certificates.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add font
        </Button>
      </div>

      {/* ── MAIN CARD (Screenshot 10) ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-xs font-semibold text-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Your fonts
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {fonts.length} of 24
            </span>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <label className="text-[11px] text-slate-500">Preview text</label>
            <Input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="h-9 text-xs font-bold bg-white"
            />
          </div>
        </div>

        {/* Fonts Display Grid or Empty State */}
        {fonts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {fonts.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{f.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {f.category}
                  </span>
                </div>

                <div className="py-3 px-2 border-y border-slate-200/60 bg-white rounded">
                  <p
                    className="text-2xl text-slate-900 truncate"
                    style={{ fontFamily: f.family }}
                  >
                    {previewText || "FestPro"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Ready in Canvas
                  </span>
                  <button
                    onClick={() => setFonts(fonts.filter(item => item.id !== f.id))}
                    className="text-[11px] text-slate-400 hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No fonts</h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Add a font to use it in your designs.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(true)}
              className="mt-2 rounded-xl text-xs font-bold border-slate-200 h-8"
            >
              <Plus className="h-3 w-3 mr-1" /> Add from Presets or File
            </Button>
          </div>
        )}
      </div>

      {/* ── ADD FONT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Add Typography / Font</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Recommended Presets */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Popular Regional & Web Fonts
              </span>
              <div className="grid grid-cols-2 gap-2">
                {presetFonts.map((pf) => (
                  <button
                    key={pf.name}
                    type="button"
                    onClick={() => handleAddPreset(pf.name, pf.category)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 text-left transition-all group"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 block truncate">
                      {pf.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {pf.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Upload Custom Font (.woff2, .ttf)
              </span>

              <form onSubmit={handleCustomUpload} className="space-y-3 text-xs">
                <Input
                  placeholder="Font display name (e.g. MyBrand Font)"
                  value={newFontName}
                  onChange={(e) => setNewFontName(e.target.value)}
                  className="h-9 text-xs font-bold"
                />

                <input
                  type="file"
                  accept=".woff2, .woff, .ttf, .otf"
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                    Register Font
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
