"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Search, Smartphone, Tablet, Monitor, Maximize2,
  Trash2, MoveUp, MoveDown, Save, Eye, Layers, Plus,
  Trophy, Clock, MapPin, Share2, Sparkles, LayoutTemplate,
  Calendar, Heading, Radio
} from "lucide-react"

export interface PageBlock {
  id: string
  type: string
  title: string
  description: string
  category: "essentials" | "live_fest"
  settings: {
    heading?: string
    subheading?: string
    showLogo?: boolean
    showTimer?: boolean
    targetDate?: string
    accentColor?: string
    layoutStyle?: string
  }
}

const AVAILABLE_BLOCKS: Omit<PageBlock, "id">[] = [
  {
    type: "header",
    title: "Header",
    description: "Fest logo, name, and tagline",
    category: "essentials",
    settings: {
      heading: "FestPro Annual Youth Festival 2026",
      subheading: "Where Talent Meets Excellence",
      showLogo: true,
    },
  },
  {
    type: "hero",
    title: "Hero",
    description: "Full-width hero section with background",
    category: "essentials",
    settings: {
      heading: "State Youth Cultural Festival",
      subheading: "Join 5,000+ Participants across 54 Competitions & 6 Stages",
      accentColor: "#4F46E5",
    },
  },
  {
    type: "countdown",
    title: "Countdown",
    description: "Countdown timer to event",
    category: "essentials",
    settings: {
      heading: "Grand Event Begins In",
      targetDate: "2026-10-15T09:00",
    },
  },
  {
    type: "social",
    title: "Social Links",
    description: "Social media links with icons",
    category: "essentials",
    settings: {
      heading: "Connect With Us",
    },
  },
  {
    type: "contact",
    title: "Contact Info",
    description: "Venue and contact details",
    category: "essentials",
    settings: {
      heading: "Event Location & Desk",
      subheading: "Main Auditorium Campus, Central Ground",
    },
  },
  {
    type: "results",
    title: "Results",
    description: "Published program results",
    category: "live_fest",
    settings: {
      heading: "Live Program Results",
      layoutStyle: "cards",
    },
  },
  {
    type: "leaderboard",
    title: "Live Leaderboard",
    description: "Team points and overall standings",
    category: "live_fest",
    settings: {
      heading: "House Point Standings",
    },
  },
  {
    type: "schedule",
    title: "Stage Schedules",
    description: "Real-time stage timetable & venues",
    category: "live_fest",
    settings: {
      heading: "Stage Timetable",
    },
  },
]

export default function PageBuilderPage() {
  const [activeBlocks, setActiveBlocks] = useState<PageBlock[]>([
    {
      id: "header-1",
      type: "header",
      title: "Header",
      description: "Fest logo, name, and tagline",
      category: "essentials",
      settings: {
        heading: "FestPro 2026",
        subheading: "Official Cultural & Arts Festival Portal",
        showLogo: true,
      },
    },
    {
      id: "hero-1",
      type: "hero",
      title: "Hero Section",
      description: "Full-width hero section",
      category: "essentials",
      settings: {
        heading: "Welcome to FestPro 2026",
        subheading: "Experience the grandest cultural celebration with live scoring.",
      },
    },
    {
      id: "results-1",
      type: "results",
      title: "Published Results",
      description: "Published program results",
      category: "live_fest",
      settings: {
        heading: "Published Results",
      },
    },
  ])

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("header-1")
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("mobile")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [festTimePreview, setFestTimePreview] = useState<string>("")
  const [saving, setSaving] = useState(false)

  const selectedBlock = activeBlocks.find((b) => b.id === selectedBlockId)

  const handleAddBlock = (template: Omit<PageBlock, "id">) => {
    const newBlock: PageBlock = {
      ...template,
      id: `${template.type}-${Date.now()}`,
    }
    setActiveBlocks((prev) => [...prev, newBlock])
    setSelectedBlockId(newBlock.id)
    toast.success(`Added ${template.title} block`)
  }

  const handleRemoveBlock = (id: string) => {
    setActiveBlocks((prev) => prev.filter((b) => b.id !== id))
    if (selectedBlockId === id) {
      setSelectedBlockId(null)
    }
    toast.info("Block removed")
  }

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...activeBlocks]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return

    const temp = newBlocks[index]
    newBlocks[index] = newBlocks[targetIndex]
    newBlocks[targetIndex] = temp

    setActiveBlocks(newBlocks)
  }

  const handleUpdateSelectedSettings = (key: string, value: any) => {
    if (!selectedBlockId) return
    setActiveBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlockId
          ? { ...b, settings: { ...b.settings, [key]: value } }
          : b
      )
    )
  }

  const handleSavePageLayout = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Public Page Layout saved successfully!")
    }, 600)
  }

  const filteredBlocks = AVAILABLE_BLOCKS.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <LayoutTemplate className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">FestPro Page Builder</span>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Public Page Builder</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSavePageLayout}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl shadow-sm flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Publish Page Layout"}</span>
          </Button>
        </div>
      </div>

      {/* 3-Column Studio Grid Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Add Blocks Panel */}
        <div className="col-span-3 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Add blocks</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Essentials Category */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Essentials</span>
              <div className="space-y-2.5">
                {filteredBlocks
                  .filter((b) => b.category === "essentials")
                  .map((b) => (
                    <div
                      key={b.type}
                      onClick={() => handleAddBlock(b)}
                      className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition-all group flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Heading className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">{b.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{b.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
              </div>
            </div>

            {/* Live Fest Category */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live Fest</span>
              <div className="space-y-2.5">
                {filteredBlocks
                  .filter((b) => b.category === "live_fest")
                  .map((b) => (
                    <div
                      key={b.type}
                      onClick={() => handleAddBlock(b)}
                      className="p-3.5 bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer transition-all group flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">{b.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{b.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-slate-400 group-hover:text-purple-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Device Preview & Canvas */}
        <div className="col-span-6 bg-slate-200/80 flex flex-col items-center overflow-hidden p-4 space-y-4">
          {/* Layout Controls Bar */}
          <div className="bg-white border border-slate-300/80 rounded-2xl px-4 py-2 flex items-center justify-between w-full shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Preview at fest time:</span>
              <Input
                type="datetime-local"
                value={festTimePreview}
                onChange={(e) => setFestTimePreview(e.target.value)}
                className="h-8 text-xs font-mono w-44 bg-slate-50"
              />
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceMode === "desktop" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDeviceMode("tablet")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceMode === "tablet" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Tablet className="h-3.5 w-3.5" /> Tablet
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  deviceMode === "mobile" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile (375px)
              </button>
            </div>
          </div>

          {/* Interactive Mobile / Device Simulator Frame */}
          <div className="flex-1 w-full flex justify-center items-center overflow-y-auto">
            <div
              className={`bg-white rounded-3xl border-4 border-slate-800 shadow-2xl overflow-y-auto transition-all relative duration-300 ${
                deviceMode === "mobile"
                  ? "w-[375px] h-[640px]"
                  : deviceMode === "tablet"
                  ? "w-[580px] h-[680px]"
                  : "w-full max-w-2xl h-[680px]"
              }`}
            >
              {/* Device Header Bar */}
              <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-20 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span className="font-bold">festpro.live/public</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span>LIVE</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Render Selected Blocks in Order */}
              <div className="divide-y divide-slate-100 p-2 space-y-2">
                {activeBlocks.map((block, idx) => {
                  const isSelected = selectedBlockId === block.id
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`group relative rounded-2xl p-4 transition-all cursor-pointer border-2 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-600/20"
                          : "border-slate-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      {/* Block Controls overlay */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-2xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveBlock(idx, "up")
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMoveBlock(idx, "down")
                          }}
                          disabled={idx === activeBlocks.length - 1}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveBlock(block.id)
                          }}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Mock Render based on block type */}
                      {block.type === "header" && (
                        <div className="text-center space-y-2 py-3">
                          {block.settings.showLogo && (
                            <div className="h-10 w-10 mx-auto rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                              FP
                            </div>
                          )}
                          <h3 className="font-extrabold text-slate-900 text-base">{block.settings.heading}</h3>
                          <p className="text-xs text-slate-500 font-medium">{block.settings.subheading}</p>
                        </div>
                      )}

                      {block.type === "hero" && (
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-xl text-center space-y-2">
                          <h2 className="font-extrabold text-lg">{block.settings.heading}</h2>
                          <p className="text-xs text-indigo-200">{block.settings.subheading}</p>
                          <div className="pt-2">
                            <span className="inline-block px-4 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-bold shadow-xs">
                              Explore Programs
                            </span>
                          </div>
                        </div>
                      )}

                      {block.type === "results" && (
                        <div className="space-y-3 py-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-900">{block.settings.heading}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Updated Live</span>
                          </div>
                          <div className="bg-blue-600 text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Published Results</span>
                              <div className="text-2xl font-black font-mono">24 Programs</div>
                            </div>
                            <Trophy className="h-8 w-8 text-amber-300" />
                          </div>
                        </div>
                      )}

                      {block.type === "countdown" && (
                        <div className="bg-slate-900 text-white p-4 rounded-xl text-center space-y-2">
                          <span className="text-xs font-bold text-indigo-400">{block.settings.heading}</span>
                          <div className="flex justify-center gap-3 font-mono font-bold text-lg text-emerald-400">
                            <span>02d</span> : <span>14h</span> : <span>36m</span>
                          </div>
                        </div>
                      )}

                      {block.type === "contact" && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                            {block.settings.heading}
                          </span>
                          <p className="text-slate-500 pl-5">{block.settings.subheading}</p>
                        </div>
                      )}

                      {block.type === "leaderboard" && (
                        <div className="space-y-2">
                          <span className="font-bold text-xs text-slate-900">{block.settings.heading}</span>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between p-2 rounded-lg bg-red-50 text-red-800 font-bold">
                              <span>Red House</span>
                              <span>420 pts</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-lg bg-blue-50 text-blue-800 font-bold">
                              <span>Blue House</span>
                              <span>395 pts</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "social" && (
                        <div className="text-center py-2 space-y-2">
                          <span className="text-xs font-bold text-slate-700">{block.settings.heading}</span>
                          <div className="flex justify-center gap-3">
                            <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">FB</div>
                            <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">IG</div>
                            <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">YT</div>
                          </div>
                        </div>
                      )}

                      {block.type === "schedule" && (
                        <div className="space-y-2 text-xs">
                          <span className="font-bold text-slate-900">{block.settings.heading}</span>
                          <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex justify-between">
                            <span className="font-semibold text-slate-800">Light Music (Male)</span>
                            <span className="text-indigo-600 font-bold">Stage 1</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Block Settings Inspector */}
        <div className="col-span-3 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Block settings</h2>
            <p className="text-xs text-slate-500">Configure parameters for selected block.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {selectedBlock ? (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">{selectedBlock.type}</span>
                    <h3 className="text-sm font-bold text-slate-900">{selectedBlock.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBlock(selectedBlock.id)}
                    className="text-red-600 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4 pt-2">
                  {"heading" in selectedBlock.settings && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Heading Text</label>
                      <Input
                        value={selectedBlock.settings.heading || ""}
                        onChange={(e) => handleUpdateSelectedSettings("heading", e.target.value)}
                        className="text-xs rounded-xl"
                      />
                    </div>
                  )}

                  {"subheading" in selectedBlock.settings && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Subheading / Description</label>
                      <Input
                        value={selectedBlock.settings.subheading || ""}
                        onChange={(e) => handleUpdateSelectedSettings("subheading", e.target.value)}
                        className="text-xs rounded-xl"
                      />
                    </div>
                  )}

                  {"showLogo" in selectedBlock.settings && (
                    <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <label className="text-xs font-bold text-slate-700 cursor-pointer" htmlFor="toggleLogo">
                        Display Fest Logo
                      </label>
                      <input
                        type="checkbox"
                        id="toggleLogo"
                        checked={selectedBlock.settings.showLogo}
                        onChange={(e) => handleUpdateSelectedSettings("showLogo", e.target.checked)}
                        className="h-4 w-4 rounded text-indigo-600"
                      />
                    </div>
                  )}

                  {"targetDate" in selectedBlock.settings && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Countdown Target Date</label>
                      <Input
                        type="datetime-local"
                        value={selectedBlock.settings.targetDate || ""}
                        onChange={(e) => handleUpdateSelectedSettings("targetDate", e.target.value)}
                        className="text-xs rounded-xl font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2 p-6">
                <Layers className="h-10 w-10 text-slate-300" />
                <p className="text-xs font-semibold">Select a block from the preview canvas to edit its properties.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
