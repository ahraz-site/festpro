"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  CreditCard, Eye, EyeOff, Plus, Trash2, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, Link2, ZoomIn, ZoomOut,
  Download, Printer, CheckCircle, FileText, QrCode, Sparkles,
  ChevronDown, ChevronRight, Settings2, ShieldCheck, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CardField {
  id: string
  label: string
  key: "chestNumber" | "name" | "team" | "qrCode" | "category" | "custom"
  visible: boolean
  x: number // mm
  y: number // mm
  fontSize: number
  fontWeight: string
  color: string
}

export default function IdCardDesignerPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const orgId = params.orgId as string

  // Step state (Screenshot: 1 Card setup, 2 Design, 3 Sheet preview)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2)
  const [selectedDesign, setSelectedDesign] = useState("Main design")
  const [isSaved, setIsSaved] = useState(true)

  // Layout settings (Screenshot left column)
  const [cardSize, setCardSize] = useState("id1") // standard ID-1 85.6 x 53.98 mm
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [paperSize, setPaperSize] = useState("a4_portrait")
  const [previewLongest, setPreviewLongest] = useState(false)
  const [zoom, setZoom] = useState(100)

  // Print Setup (Screenshot right column)
  const [marginMm, setMarginMm] = useState(10)
  const [gapMm, setGapMm] = useState(4)
  const [cropMarks, setCropMarks] = useState(true)
  const [startTeamOnNewPage, setStartTeamOnNewPage] = useState(true)
  const [participantQrCode, setParticipantQrCode] = useState(true)

  // Card Fields (Screenshot card fields list)
  const [fields, setFields] = useState<CardField[]>([
    { id: "1", label: "Chest number", key: "chestNumber", visible: true, x: 12, y: 14, fontSize: 32, fontWeight: "font-black", color: "#0F172A" },
    { id: "2", label: "Name", key: "name", visible: true, x: 12, y: 44, fontSize: 16, fontWeight: "font-bold", color: "#1E293B" },
    { id: "3", label: "Team", key: "team", visible: true, x: 12, y: 52, fontSize: 18, fontWeight: "font-bold", color: "#334155" },
    { id: "4", label: "QR code", key: "qrCode", visible: true, x: 42, y: 64, fontSize: 12, fontWeight: "font-normal", color: "#000000" },
  ])

  const [selectedFieldId, setSelectedFieldId] = useState<string>("1")
  const [isStyleOpen, setIsStyleOpen] = useState(false)

  // Demo participant data
  const sampleData = previewLongest
    ? {
        chest: "BL999",
        name: "Muhammad Zainul Abideen Al-Baqir",
        team: "Blue Falcons Super Champions",
        category: "Senior Category",
      }
    : {
        chest: "BL001",
        name: "Muhammad Zainul Abideen",
        team: "Blue Falcons",
        category: "Senior",
      }

  const toggleFieldVisibility = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, visible: !f.visible } : f))
    setIsSaved(false)
  }

  const handleAddField = () => {
    const newField: CardField = {
      id: Date.now().toString(),
      label: `Field ${fields.length + 1}`,
      key: "custom",
      visible: true,
      x: 12,
      y: 60,
      fontSize: 14,
      fontWeight: "font-semibold",
      color: "#1E293B",
    }
    setFields([...fields, newField])
    setSelectedFieldId(newField.id)
    setIsSaved(false)
    toast.success("Field added to ID card layout")
  }

  const handleSave = () => {
    setIsSaved(true)
    toast.success("ID card design saved successfully!")
  }

  const handleExportCards = () => {
    toast.info("Generating A4 print sheets with crop marks...")
    setTimeout(() => {
      window.print()
    }, 400)
  }

  const handleDownloadTestSheet = () => {
    toast.success("Downloading test sheet with crop marks...")
    setTimeout(() => {
      window.print()
    }, 400)
  }

  const selectedField = fields.find(f => f.id === selectedFieldId)

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-sans pb-16">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ID card designer
          </h1>
          <div className="relative">
            <select
              value={selectedDesign}
              onChange={(e) => setSelectedDesign(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 appearance-none cursor-pointer hover:border-slate-300"
            >
              <option value="Main design">Main design</option>
              <option value="Volunteers pass">Volunteers pass</option>
              <option value="Judges ID badge">Judges ID badge</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Saved</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            className="rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs px-4 h-9"
          >
            Save design
          </Button>
        </div>
      </div>

      {/* ── 3-STEP WIZARD PROGRESS BAR (Screenshot Reference) ── */}
      <div className="flex items-center justify-center gap-8 text-xs font-bold py-1">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 transition-colors ${
            currentStep === 1 ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] ${
            currentStep === 1 ? "bg-emerald-700 text-white" : "border border-slate-300 text-slate-500"
          }`}>
            1
          </span>
          <span>Card setup</span>
        </button>

        <div className="w-12 h-0.5 bg-slate-200" />

        <button
          onClick={() => setCurrentStep(2)}
          className={`flex items-center gap-2 transition-colors ${
            currentStep === 2 ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] ${
            currentStep === 2 ? "bg-emerald-700 text-white" : "border border-slate-300 text-slate-500"
          }`}>
            2
          </span>
          <span>Design</span>
        </button>

        <div className="w-12 h-0.5 bg-slate-200" />

        <button
          onClick={() => setCurrentStep(3)}
          className={`flex items-center gap-2 transition-colors ${
            currentStep === 3 ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] ${
            currentStep === 3 ? "bg-emerald-700 text-white" : "border border-slate-300 text-slate-500"
          }`}>
            3
          </span>
          <span>Sheet preview</span>
        </button>
      </div>

      {/* ── MAIN WORKSPACE 3-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT COLUMN: SETUP & FIELDS (4 cols) ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
            {/* Standard ID Format */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Card Size
              </label>
              <select
                value={cardSize}
                onChange={(e) => setCardSize(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="id1">Standard ID-1 · 85.6 × 53.98 mm</option>
                <option value="cr80">CR-80 Badge · 86 × 54 mm</option>
                <option value="lanyard">Large Lanyard · 100 × 70 mm</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation("portrait")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    orientation === "portrait"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="w-5 h-7 border-2 border-current rounded-xs mb-1" />
                  <span className="text-[11px]">Portrait</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation("landscape")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    orientation === "landscape"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="w-7 h-5 border-2 border-current rounded-xs mb-1" />
                  <span className="text-[11px]">Landscape</span>
                </button>
              </div>
            </div>

            {/* Paper Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Paper
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="a4_portrait">A4 portrait · 210 × 297 mm</option>
                <option value="a4_landscape">A4 landscape · 297 × 210 mm</option>
                <option value="single_card">Single Card Direct Thermal</option>
              </select>
            </div>

            {/* Template Specs Card */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-12 rounded border border-amber-300 bg-gradient-to-b from-amber-100 to-amber-200/50 flex items-center justify-center text-[10px] text-amber-800 font-black">
                  ID
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Check template size</span>
                  <span className="text-[10px] text-slate-500 block">736 × 993 px</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Recommended with 3 mm bleed: 708 × 1082 px
              </p>
            </div>

            {/* Card Fields List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Card fields
                </span>
                <span className="text-[10px] text-slate-400">Select to edit</span>
              </div>

              <div className="space-y-1.5">
                {fields.map((field) => {
                  const isSelected = selectedFieldId === field.id
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/40 text-slate-900 font-bold"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 font-mono text-[11px]">T</span>
                        <span className="truncate">{field.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFieldVisibility(field.id)
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title={field.visible ? "Hide field" : "Show field"}
                        >
                          {field.visible ? <Eye className="h-3.5 w-3.5 text-slate-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-300" />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddField}
                className="w-full rounded-xl text-xs font-bold border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 text-slate-700 h-9"
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                Add field
              </Button>
            </div>

            {/* Style & Position Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStyleOpen(!isStyleOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 py-1"
              >
                <span>Style and position</span>
                {isStyleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {isStyleOpen && selectedField && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Font size</span>
                    <input
                      type="number"
                      value={selectedField.fontSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 12
                        setFields(prev => prev.map(f => f.id === selectedField.id ? { ...f, fontSize: val } : f))
                        setIsSaved(false)
                      }}
                      className="w-16 h-7 px-2 text-right border rounded bg-white font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Color</span>
                    <input
                      type="color"
                      value={selectedField.color}
                      onChange={(e) => {
                        setFields(prev => prev.map(f => f.id === selectedField.id ? { ...f, color: e.target.value } : f))
                        setIsSaved(false)
                      }}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CENTER COLUMN: INTERACTIVE DESIGN CANVAS (6 cols) ── */}
        <div className="lg:col-span-5 space-y-3">
          {/* Canvas Toolbar (Screenshot reference) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Undo">
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Redo">
                <Redo2 className="h-3.5 w-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-slate-200 mx-1" />
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center gap-1 text-[11px] font-semibold" title="Align">
                <AlignCenter className="h-3.5 w-3.5" /> Align
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Link fields">
                <Link2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-xs">
                <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 text-slate-400 hover:text-slate-700">
                  <ZoomOut className="h-3 w-3" />
                </button>
                <span>{zoom}%</span>
                <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 text-slate-400 hover:text-slate-700">
                  <ZoomIn className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={() => setPreviewLongest(!previewLongest)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  previewLongest
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Eye className="h-3 w-3" /> Preview longest data
              </button>
            </div>
          </div>

          {/* Interactive Card Canvas with Millimeter Ruler */}
          <div className="p-6 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-col items-center justify-center min-h-[520px] overflow-hidden relative">
            {/* Top Millimeter Ruler */}
            <div className="w-[320px] mb-2 flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-300 pb-0.5">
              <span>0mm</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50mm</span>
            </div>

            {/* Live Rendered Card Canvas */}
            <div
              className="w-[320px] h-[480px] rounded-xl shadow-xl border border-amber-200/90 relative p-6 flex flex-col justify-between overflow-hidden transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100})`,
                background: "linear-gradient(145deg, #FEFCE8 0%, #FFFBEB 45%, #FEF3C7 100%)",
              }}
            >
              {/* Subtle Ornamental Background Wave Pattern */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-amber-300/60 rounded-lg pointer-events-none" />

              {/* Top Chest Number */}
              <div className="relative z-10 pt-4">
                {fields.find(f => f.key === "chestNumber")?.visible && (
                  <div
                    onClick={() => setSelectedFieldId("1")}
                    className={`inline-block px-3 py-1 rounded-lg border-2 transition-all cursor-move ${
                      selectedFieldId === "1"
                        ? "border-blue-600 bg-white/80 shadow-xs"
                        : "border-transparent hover:border-blue-300"
                    }`}
                  >
                    <span className="font-mono text-3xl font-black text-slate-900 tracking-wider">
                      {sampleData.chest}
                    </span>
                  </div>
                )}
              </div>

              {/* Center Participant Name & Team */}
              <div className="relative z-10 space-y-1.5 my-auto">
                {fields.find(f => f.key === "name")?.visible && (
                  <div
                    onClick={() => setSelectedFieldId("2")}
                    className={`px-2 py-1 rounded-md border-2 transition-all cursor-move ${
                      selectedFieldId === "2"
                        ? "border-blue-600 bg-white/80 shadow-xs"
                        : "border-transparent hover:border-blue-300"
                    }`}
                  >
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      {sampleData.name}
                    </h2>
                  </div>
                )}

                {fields.find(f => f.key === "team")?.visible && (
                  <div
                    onClick={() => setSelectedFieldId("3")}
                    className={`px-2 py-1 rounded-md border-2 transition-all cursor-move ${
                      selectedFieldId === "3"
                        ? "border-blue-600 bg-white/80 shadow-xs"
                        : "border-transparent hover:border-blue-300"
                    }`}
                  >
                    <span className="text-base font-bold text-slate-700">
                      {sampleData.team}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom QR Code Block */}
              <div className="relative z-10 flex justify-end pb-3">
                {fields.find(f => f.key === "qrCode")?.visible && participantQrCode && (
                  <div
                    onClick={() => setSelectedFieldId("4")}
                    className={`p-2 rounded-xl bg-white border-2 shadow-xs cursor-move transition-all ${
                      selectedFieldId === "4" ? "border-blue-600" : "border-slate-200"
                    }`}
                  >
                    <QrCode className="h-16 w-16 text-slate-900" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: PRINT SETUP & SHEET PREVIEW (4 cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <h2 className="text-sm font-black text-slate-900">Print setup</h2>
            </div>

            {/* Margins & Gaps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Margin</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={marginMm}
                    onChange={(e) => setMarginMm(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs font-bold pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">mm</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Gap</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={gapMm}
                    onChange={(e) => setGapMm(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs font-bold pr-8"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-mono">mm</span>
                </div>
              </div>
            </div>

            {/* Print Toggles (Screenshot Reference) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span>Crop marks</span>
                <input
                  type="checkbox"
                  checked={cropMarks}
                  onChange={(e) => setCropMarks(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Start each team on a new page</span>
                <input
                  type="checkbox"
                  checked={startTeamOnNewPage}
                  onChange={(e) => setStartTeamOnNewPage(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span>Participant QR code</span>
                <input
                  type="checkbox"
                  checked={participantQrCode}
                  onChange={(e) => setParticipantQrCode(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* A4 Sheet Preview (9 cards per sheet) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Sheet preview (A4)</span>
                <span className="text-[10px] font-mono text-slate-400">210 × 297 mm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                {/* 3x3 Miniature Card Grid on A4 Sheet */}
                <div className="w-48 h-64 bg-white border border-slate-300 shadow-sm p-2 grid grid-cols-3 gap-1 rounded-xs relative">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-amber-200/80 bg-amber-50/50 rounded-2xs flex flex-col justify-between p-1 text-[5px] leading-none overflow-hidden"
                    >
                      <span className="font-mono font-bold text-slate-800">BL00{i + 1}</span>
                      <div className="h-0.5 w-full bg-slate-200 rounded" />
                      <div className="self-end">
                        <QrCode className="h-2 w-2 text-slate-800" />
                      </div>
                    </div>
                  ))}
                  {cropMarks && (
                    <div className="absolute inset-0 pointer-events-none border border-dashed border-slate-400/40" />
                  )}
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                <p className="font-medium text-slate-700">A4 portrait · 9 cards per sheet · 1 page</p>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  <span>All fields are in the safe area</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  <span>QR code is ready to print</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTestSheet}
                className="w-full rounded-xl text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 h-9"
              >
                <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                Download test sheet
              </Button>

              <Button
                type="button"
                onClick={handleExportCards}
                className="w-full rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs h-10"
              >
                <Printer className="h-4 w-4 mr-2" />
                Export cards
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
