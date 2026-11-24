"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  LayoutTemplate, Plus, Search, Sparkles, Image as ImageIcon,
  Edit, Trash2, Check, Download, Eye, X, Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PosterTemplate {
  id: string
  name: string
  dimensions: string
  aspectRatio: string
  bgStyle: string
  type: string
}

export default function FestivalPosterTemplatesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [search, setSearch] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newDimensions, setNewDimensions] = useState("1080 × 1350 px")

  const [templates, setTemplates] = useState<PosterTemplate[]>([
    {
      id: "1",
      name: "Starter Result Poster",
      dimensions: "1080 × 1350 px",
      aspectRatio: "4/5",
      type: "Result poster",
      bgStyle: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
    },
    {
      id: "2",
      name: "Team scores",
      dimensions: "1123 × 1602 px",
      aspectRatio: "3/4",
      type: "Leaderboard poster",
      bgStyle: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #291002 100%)",
    },
    {
      id: "3",
      name: "Result poster",
      dimensions: "1080 × 1350 px",
      aspectRatio: "4/5",
      type: "Modern Gradient",
      bgStyle: "linear-gradient(135deg, #1E3A8A 0%, #065F46 50%, #10B981 100%)",
    },
  ])

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTemplateName.trim()) return

    const created: PosterTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      dimensions: newDimensions,
      aspectRatio: "4/5",
      type: "Custom",
      bgStyle: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    }

    setTemplates([...templates, created])
    setShowCreateModal(false)
    setNewTemplateName("")
    toast.success("Poster template created!")
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* ── HEADER (Screenshot 8) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Poster templates
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Design and generate official social media announcements and result posters.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create Template
        </Button>
      </div>

      {/* ── METRIC CARD (Screenshot 8: Total Templates 3) ── */}
      <div className="w-full max-w-xs p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Total Templates
        </span>
        <span className="text-3xl font-black text-slate-900 mt-1 block">
          {templates.length}
        </span>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-10 rounded-xl border-slate-200 text-xs font-medium bg-white"
        />
      </div>

      {/* ── TEMPLATES GRID (Screenshot 8) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Visual Canvas Thumbnail */}
            <div
              className="w-full h-80 relative p-6 flex flex-col justify-between overflow-hidden"
              style={{ background: tmpl.bgStyle }}
            >
              {/* Ornate Inner Border for template 2 */}
              {tmpl.id === "2" && (
                <div className="absolute inset-3 border-2 border-amber-500/50 rounded-lg pointer-events-none" />
              )}

              {/* Watermark badge */}
              <div className="relative z-10 self-start px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                {tmpl.type}
              </div>

              {/* Sample Content */}
              <div className="relative z-10 text-center space-y-1">
                <span className="text-xs font-bold text-white/80 block uppercase tracking-widest">
                  FestPro Results
                </span>
                <span className="text-lg font-black text-white block">
                  {tmpl.name}
                </span>
              </div>

              <div className="relative z-10 text-right">
                <span className="font-mono text-[10px] text-white/60">
                  {tmpl.dimensions}
                </span>
              </div>
            </div>

            {/* Template Info Card */}
            <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{tmpl.name}</h3>
                <span className="font-mono text-[11px] text-slate-400 block">{tmpl.dimensions}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Opened ${tmpl.name} designer`)}
                  className="rounded-xl text-xs font-semibold h-8"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CREATE MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Create Poster Template</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Template Name</label>
                <Input
                  required
                  placeholder="e.g. Daily Standings Story"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Dimensions</label>
                <select
                  value={newDimensions}
                  onChange={(e) => setNewDimensions(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="1080 × 1350 px">Instagram Portrait (1080 × 1350 px)</option>
                  <option value="1080 × 1920 px">Instagram Story / Reel (1080 × 1920 px)</option>
                  <option value="1200 × 630 px">Facebook / Twitter Banner (1200 × 630 px)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
