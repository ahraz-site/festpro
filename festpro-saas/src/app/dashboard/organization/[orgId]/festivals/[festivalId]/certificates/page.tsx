"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Award, Eye, EyeOff, Plus, Download, Printer, CheckCircle,
  FileText, QrCode, Sparkles, ChevronDown, Move, Layers,
  Trash2, RefreshCw, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TextElement {
  id: string
  label: string
  text: string
  visible: boolean
  font: string
  x: number
  y: number
  width: number
  height: number
  color: string
  size: number
  alignment: "Center" | "Left" | "Right"
  bold: boolean
  oneLine: boolean
}

export default function FestivalCertificatesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // Template Form State (Screenshots 3, 4, 5)
  const [templateName, setTemplateName] = useState("Winner certificate 2026")
  const [certType, setCertType] = useState("registered_participation")
  const [pageSize, setPageSize] = useState("a4_landscape")
  const [certTitle, setCertTitle] = useState("CERTIFICATE")
  const [introText, setIntroText] = useState("This certificate is presented to")

  // Selected Text Element Controls (Screenshot 4)
  const [selectedElementKey, setSelectedElementKey] = useState("place")
  const [elements, setElements] = useState<Record<string, TextElement>>({
    place: {
      id: "place",
      label: "Place",
      text: "1st place",
      visible: true,
      font: "Noto Sans Malayalam",
      x: 30,
      y: 153.6,
      width: 237,
      height: 9,
      color: "#1E293B",
      size: 13,
      alignment: "Center",
      bold: true,
      oneLine: true,
    },
    name: {
      id: "name",
      label: "Participant name",
      text: "Amina Rahman Mohammed",
      visible: true,
      font: "Playfair Display",
      x: 30,
      y: 110,
      width: 237,
      height: 14,
      color: "#0F172A",
      size: 24,
      alignment: "Center",
      bold: true,
      oneLine: true,
    },
    program: {
      id: "program",
      label: "Program",
      text: "English Speech",
      visible: true,
      font: "Noto Sans Malayalam",
      x: 30,
      y: 138,
      width: 237,
      height: 10,
      color: "#334155",
      size: 15,
      alignment: "Center",
      bold: true,
      oneLine: true,
    },
    festName: {
      id: "festName",
      label: "Fest name",
      text: "FestPro Cultural Fest 2026",
      visible: true,
      font: "Inter",
      x: 30,
      y: 80,
      width: 237,
      height: 8,
      color: "#64748B",
      size: 11,
      alignment: "Center",
      bold: false,
      oneLine: true,
    },
  })

  // QR Code Settings (Screenshot 5)
  const [showQrCode, setShowQrCode] = useState(true)
  const [qrX, setQrX] = useState(269)
  const [qrY, setQrY] = useState(182)
  const [qrSize, setQrSize] = useState(20)

  // Issuing & Recipients State (Screenshot 5 & 6)
  const [selectedIssueTemplate, setSelectedIssueTemplate] = useState("winner_2026")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [checkedRecipients, setCheckedRecipients] = useState<any[] | null>(null)
  const [checkingRecipients, setCheckingRecipients] = useState(false)

  const activeElement = elements[selectedElementKey] || elements.place

  const updateActiveElement = (updates: Partial<TextElement>) => {
    setElements(prev => ({
      ...prev,
      [selectedElementKey]: {
        ...prev[selectedElementKey],
        ...updates,
      },
    }))
  }

  const handleCreateTemplate = () => {
    toast.success(`Template "${templateName}" created successfully!`)
  }

  const handleCheckRecipients = () => {
    setCheckingRecipients(true)
    setTimeout(() => {
      setCheckingRecipients(false)
      setCheckedRecipients([
        { id: "1", name: "Amina Rahman Mohammed", chest: "SNR-101", team: "Blue Falcons", program: "English Speech", rank: "1st Place" },
        { id: "2", name: "Zuhair Abdullah", chest: "SNR-108", team: "Red Eagles", program: "English Speech", rank: "2nd Place" },
        { id: "3", name: "Fathima Nihala", chest: "SNR-115", team: "Golden Hawks", program: "English Speech", rank: "3rd Place" },
      ])
      toast.success("Verified 3 recipient records ready for issuing!")
    }, 600)
  }

  const handleIssueCertificates = () => {
    toast.success("Certificates issued with verified cryptographic QR hashes!")
    setTimeout(() => {
      window.print()
    }, 400)
  }

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-sans pb-16">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Certificates
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create templates and issue checked certificate batches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="rounded-xl text-xs font-bold border-slate-200 text-slate-700 h-9"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Preview
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9 shadow-xs"
          >
            Create template
          </Button>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN DESIGN LAYOUT (Screenshots 3-6) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: TEMPLATE CONTROLS & ISSUING (5 cols) ── */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. New Certificate Template Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <h2 className="text-sm font-black text-slate-900">New certificate template</h2>
              <p className="text-[11px] text-slate-500 font-normal">
                An issued template keeps its background and layout.
              </p>
            </div>

            {/* Template Name */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Template name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="h-9 text-xs font-bold"
              />
            </div>

            {/* Certificate Type */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Certificate type</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="registered_participation">Registered participation</option>
                <option value="winner">Winner / Prize</option>
                <option value="merit">Merit / Grade A</option>
                <option value="committee">Organizing Committee</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Page</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="a4_landscape">A4 landscape</option>
                <option value="a4_portrait">A4 portrait</option>
              </select>
            </div>

            {/* Title & Intro text */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Title</label>
              <Input
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                className="h-9 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Intro text</label>
              <Input
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                className="h-9 text-xs font-normal"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold border-slate-200 h-9"
            >
              Use background text layout
            </Button>

            {/* Text Element Customizer (Screenshot 4) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 mr-2">
                  <label className="text-[11px] text-slate-500">Text element</label>
                  <select
                    value={selectedElementKey}
                    onChange={(e) => setSelectedElementKey(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                  >
                    <option value="place">Place</option>
                    <option value="name">Participant name</option>
                    <option value="program">Program</option>
                    <option value="festName">Fest name</option>
                  </select>
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => updateActiveElement({ visible: !activeElement.visible })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                  >
                    {activeElement.visible ? <Eye className="h-3.5 w-3.5 text-slate-700" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                    <span>Visible</span>
                  </button>
                </div>
              </div>

              {/* Font Picker */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Font</label>
                <select
                  value={activeElement.font}
                  onChange={(e) => updateActiveElement({ font: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  <option value="Noto Sans Malayalam">Noto Sans Malayalam</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Inter">Inter (Sans-serif)</option>
                  <option value="Manrope">Manrope</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              {/* X / Y Coordinates (mm) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">X (mm)</label>
                  <Input
                    type="number"
                    value={activeElement.x}
                    onChange={(e) => updateActiveElement({ x: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Y (mm)</label>
                  <Input
                    type="number"
                    value={activeElement.y}
                    onChange={(e) => updateActiveElement({ y: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Width / Height (mm) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Width (mm)</label>
                  <Input
                    type="number"
                    value={activeElement.width}
                    onChange={(e) => updateActiveElement({ width: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Height (mm)</label>
                  <Input
                    type="number"
                    value={activeElement.height}
                    onChange={(e) => updateActiveElement({ height: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Color & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeElement.color}
                      onChange={(e) => updateActiveElement({ color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <span className="font-mono text-xs">{activeElement.color}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Size (pt)</label>
                  <Input
                    type="number"
                    value={activeElement.size}
                    onChange={(e) => updateActiveElement({ size: parseInt(e.target.value) || 12 })}
                    className="h-8 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Alignment</label>
                <select
                  value={activeElement.alignment}
                  onChange={(e) => updateActiveElement({ alignment: e.target.value as any })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  <option value="Center">Center</option>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                </select>
              </div>

              {/* Checkboxes: Bold & One line */}
              <div className="flex items-center gap-5 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={activeElement.bold}
                    onChange={(e) => updateActiveElement({ bold: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600 rounded"
                  />
                  <span>Bold</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={activeElement.oneLine}
                    onChange={(e) => updateActiveElement({ oneLine: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600 rounded"
                  />
                  <span>One line</span>
                </label>
              </div>
            </div>

            {/* QR Code Section (Screenshot 5) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={showQrCode}
                  onChange={(e) => setShowQrCode(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600 rounded"
                />
                <span>Show QR code</span>
              </label>

              {showQrCode && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">QR X (mm)</label>
                    <Input
                      type="number"
                      value={qrX}
                      onChange={(e) => setQrX(parseInt(e.target.value) || 0)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">QR Y (mm)</label>
                    <Input
                      type="number"
                      value={qrY}
                      onChange={(e) => setQrY(parseInt(e.target.value) || 0)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">QR size (mm)</label>
                    <Input
                      type="number"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value) || 20)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background Upload */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <label className="text-[11px] text-slate-500">Background (optional)</label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 hover:file:bg-slate-100 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">PNG or JPEG, up to 5 MB.</span>
            </div>

            <Button
              type="button"
              onClick={handleCreateTemplate}
              className="w-full rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-10 shadow-xs"
            >
              Create template
            </Button>
          </div>

          {/* 2. Issue Certificates Card (Screenshot 5 & 6) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5 text-xs font-semibold text-slate-700">
            <div>
              <h2 className="text-sm font-black text-slate-900">Issue certificates</h2>
              <p className="text-[11px] text-slate-500 font-normal">
                Check the recipients before you create fixed records.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Template</label>
              <select
                value={selectedIssueTemplate}
                onChange={(e) => setSelectedIssueTemplate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="winner_2026">Winner certificate 2026</option>
                <option value="participation_general">General Participation 2026</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="all">All teams</option>
                <option value="blue">Blue Falcons</option>
                <option value="red">Red Eagles</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Participant category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="all">All categories</option>
                <option value="senior">Senior</option>
                <option value="junior">Junior</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleCheckRecipients}
              disabled={checkingRecipients}
              className="w-full rounded-xl text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-50 h-9"
            >
              {checkingRecipients ? <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />}
              Check recipients
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: TEMPLATE PREVIEW & CHECKED RECIPIENTS (7 cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Template Live Canvas */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Template preview</h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Drag fields to move them. Drag the blue corner to resize.
                </p>
              </div>
            </div>

            {/* Certificate Landscape Canvas */}
            <div className="w-full aspect-[1.414/1] bg-gradient-to-tr from-amber-50/40 via-white to-amber-50/30 rounded-xl border border-slate-300 p-8 flex flex-col justify-between relative shadow-sm overflow-hidden">
              {/* Ornate Frame Border */}
              <div className="absolute inset-3 border-2 border-amber-300/60 rounded-lg pointer-events-none" />
              <div className="absolute inset-4 border border-dashed border-amber-200/60 rounded pointer-events-none" />

              {/* Title Header */}
              <div className="text-center space-y-1 relative z-10 pt-4">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
                  {certTitle}
                </h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {elements.festName?.text || "Fest Name"}
                </p>
              </div>

              {/* Recipient Content */}
              <div className="text-center space-y-3 relative z-10 my-auto">
                <p className="text-xs text-slate-500 italic">
                  {introText}
                </p>
                <h2
                  className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
                  style={{ fontFamily: activeElement.font === "Playfair Display" ? "serif" : "inherit" }}
                >
                  {elements.name?.text || "Participant Name"}
                </h2>
                <p className="text-xs text-slate-600">
                  for achieving 1st place in
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {elements.program?.text || "Program Name"}
                </p>

                {/* 1st Place with Interactive Bounding Box (Screenshot 3 & 4) */}
                <div className="inline-block relative">
                  <div className="px-6 py-1.5 border-2 border-blue-600 bg-white/90 rounded text-xs font-bold text-slate-900 shadow-xs relative">
                    {elements.place?.text || "1st place"}
                    {/* Corner Resize Handles */}
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-600 border border-white" />
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-600 border border-white" />
                  </div>
                </div>
              </div>

              {/* Footer Serial & QR */}
              <div className="flex items-end justify-between relative z-10 text-[9px] font-mono text-slate-400">
                <span>FEST-2026-000001</span>

                {showQrCode && (
                  <div className="p-1.5 bg-white border border-slate-300 rounded shadow-2xs">
                    <QrCode className="h-10 w-10 text-slate-900" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checked Recipients Table (Screenshot 6) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Checked recipients</h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  The issue action uses a fresh server check.
                </p>
              </div>
            </div>

            {checkedRecipients ? (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Chest</th>
                        <th className="px-3 py-2">Participant</th>
                        <th className="px-3 py-2">Team</th>
                        <th className="px-3 py-2">Program</th>
                        <th className="px-3 py-2">Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {checkedRecipients.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-mono font-bold">{rec.chest}</td>
                          <td className="px-3 py-2 font-bold">{rec.name}</td>
                          <td className="px-3 py-2">{rec.team}</td>
                          <td className="px-3 py-2">{rec.program}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              {rec.rank}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleIssueCertificates}
                    className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-5 h-10"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Issue & Generate Certificates ({checkedRecipients.length})
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 font-normal text-xs">
                Select filters on the left and click "Check recipients".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
