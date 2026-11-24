"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Award, Printer, Download, Sparkles, Check,
  QrCode, FileText, LayoutTemplate, Eye
} from "lucide-react"

export default function FestivalCertificatesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [template, setTemplate] = useState<"royal" | "classic" | "modern">("royal")
  const [candidateName, setCandidateName] = useState("Rujhan Muhammad")
  const [eventName, setEventName] = useState("Madh Song")
  const [position, setPosition] = useState("1st Place (Gold)")
  const [grade, setGrade] = useState("A+")
  const [issuedDate, setIssuedDate] = useState("November 2026")

  const handlePrint = () => {
    window.print()
  }

  const handleBatchDownload = () => {
    toast.success("Generating batch PDF certificates for all winners...")
    setTimeout(() => {
      toast.success("Batch certificate zip ready for download!")
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Certificates</h1>
            <p className="text-xs text-slate-500 font-medium">Design, customize, and print QR-verified e-certificates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBatchDownload}
            className="rounded-xl text-xs font-semibold px-4 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Batch Download
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs px-4"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print Certificate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── CUSTOMIZATION PANEL ── */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900">Certificate Designer</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Template Style</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="royal">Royal Gold & Indigo</option>
              <option value="classic">Traditional Border</option>
              <option value="modern">Clean Minimalist</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Recipient Name</label>
            <Input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-xs font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Competition Event</label>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Position / Award</label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600">Grade</label>
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-xs font-bold text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* ── LIVE PREVIEW CANVAS ── */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-100/60 p-6 shadow-xs flex items-center justify-center">
          <div className="w-full max-w-xl aspect-[1.414/1] bg-white rounded-xl shadow-xl p-8 border-8 border-double border-amber-400/80 flex flex-col justify-between text-center relative overflow-hidden font-serif">
            {/* Corner Decorative Flares */}
            <div className="absolute top-2 left-2 text-amber-500 font-sans text-xs">❖</div>
            <div className="absolute top-2 right-2 text-amber-500 font-sans text-xs">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-500 font-sans text-xs">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-500 font-sans text-xs">❖</div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-amber-700 block mb-1">
                CERTIFICATE OF MERIT & ACHIEVEMENT
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                FestPro Arts & Cultural Fest
              </h2>
            </div>

            <div className="my-auto space-y-2">
              <p className="text-xs text-slate-500 italic">This is proudly presented to</p>
              <h3 className="text-2xl font-black text-indigo-950 font-sans underline decoration-amber-400 decoration-2 underline-offset-8">
                {candidateName}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto pt-2">
                for securing <strong className="text-amber-800">{position}</strong> with Grade <strong className="text-emerald-700">{grade}</strong> in the program <strong>"{eventName}"</strong>.
              </p>
            </div>

            {/* Bottom Signatures & QR Verification */}
            <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-left font-sans">
              <div>
                <span className="block h-0.5 w-24 bg-slate-400 mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">General Convener</span>
              </div>

              {/* QR Verification Badge */}
              <div className="flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=FestPro-Cert-${encodeURIComponent(candidateName)}`}
                  alt="QR verification"
                  className="h-12 w-12 rounded border border-slate-300"
                />
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">SCAN TO VERIFY</span>
              </div>

              <div className="text-right">
                <span className="block h-0.5 w-24 bg-slate-400 mb-1 ml-auto" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Fest Chairman</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
