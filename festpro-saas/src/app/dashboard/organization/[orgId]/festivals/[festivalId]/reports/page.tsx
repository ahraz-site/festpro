"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Printer, FileText, Download, CheckCircle, ShieldCheck,
  FileSpreadsheet, ArrowUpDown, ChevronDown, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FestivalReportsPrintoutsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // Report Form State (Screenshot 7)
  const [reportType, setReportType] = useState("participant_list")
  const [fileType, setFileType] = useState<"PDF" | "Excel">("PDF")
  const [programScope, setProgramScope] = useState("all_permitted")
  const [selectedTeam, setSelectedTeam] = useState("all_permitted")
  const [selectedCategory, setSelectedCategory] = useState("all_permitted")
  const [selectedProgram, setSelectedProgram] = useState("all_permitted")
  const [sortBy, setSortBy] = useState("chest_number")
  const [sortOrder, setSortOrder] = useState("ascending")
  const [downloading, setDownloading] = useState(false)

  const reportDescriptions: Record<string, string> = {
    participant_list: "Participants grouped by category and program.",
    team_points: "Official team score sheet with category breakdowns and standings.",
    schedule_summary: "Complete program timeline arranged by stage, date, and slot.",
    judge_scores: "Comprehensive judge evaluations and criteria breakdown.",
    code_letters: "Official secret lot and code letters registry for judges.",
    prizes_list: "List of winners, prizes, medals, and monetary awards.",
  }

  const reportNames: Record<string, string> = {
    participant_list: "Program participant list",
    team_points: "Team point sheet",
    schedule_summary: "Schedule summary",
    judge_scores: "Judge score sheets",
    code_letters: "Code letters sheet",
    prizes_list: "Prize list",
  }

  const handleDownload = () => {
    setDownloading(true)
    toast.info(`Generating ${fileType} for ${reportNames[reportType]}...`)

    setTimeout(() => {
      setDownloading(false)
      if (fileType === "PDF") {
        window.print()
      } else {
        // Download sample CSV
        const csvContent = "data:text/csv;charset=utf-8,Chest,Name,Team,Category,Program,Status\nSNR-101,Amina Rahman,Blue Falcons,Senior,English Speech,1st Place\nSNR-108,Zuhair Abdullah,Red Eagles,Senior,English Speech,2nd Place"
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `${reportType}_report.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Excel/CSV export downloaded successfully!")
      }
    }, 700)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs">
          <Printer className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Reports & printouts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export and download official festival reports, score sheets, and participant rosters.
          </p>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT (Screenshot 7) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ── LEFT CARD: BUILD A REPORT (8 cols) ── */}
        <div className="md:col-span-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-xs font-semibold text-slate-700">
          <div>
            <h2 className="text-sm font-black text-slate-900">Build a report</h2>
            <p className="text-[11px] text-slate-500 font-normal">
              Select the report and the records to include.
            </p>
          </div>

          {/* Report Type & File Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 space-y-1">
              <label className="text-[11px] text-slate-500">Report</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="participant_list">Program participant list</option>
                <option value="team_points">Team point sheet</option>
                <option value="schedule_summary">Schedule summary</option>
                <option value="judge_scores">Judge score sheets</option>
                <option value="code_letters">Code letters sheet</option>
                <option value="prizes_list">Prize list</option>
              </select>
              <p className="text-[11px] text-slate-400 font-normal pt-0.5">
                {reportDescriptions[reportType]}
              </p>
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] text-slate-500">File type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel (.csv)</option>
              </select>
            </div>
          </div>

          {/* Programs Scope */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500">Programs</label>
            <select
              value={programScope}
              onChange={(e) => setProgramScope(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
            >
              <option value="all_permitted">All permitted programs</option>
              <option value="stage_programs">Stage programs only</option>
              <option value="offstage_programs">Off-stage programs only</option>
            </select>
          </div>

          {/* Team / Category / Program Filters 3-Column */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="all_permitted">All permitted</option>
                <option value="blue">Blue Falcons</option>
                <option value="red">Red Eagles</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="all_permitted">All permitted</option>
                <option value="senior">Senior</option>
                <option value="junior">Junior</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="all_permitted">All permitted</option>
                <option value="madh_song">Madh Song</option>
                <option value="english_speech">English Speech</option>
              </select>
            </div>
          </div>

          {/* Arrange / Sorting */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Arrange
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="chest_number">Chest number</option>
                  <option value="name">Participant name</option>
                  <option value="team">Team name</option>
                  <option value="rank">Rank / Score</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT CARD: DOWNLOAD & SUMMARY CHECKLIST (4 cols) ── */}
        <div className="md:col-span-4 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
          <div>
            <h2 className="text-sm font-black text-slate-900">Download</h2>
            <p className="text-[11px] text-slate-500 font-normal">
              Your current access always limits this report.
            </p>
          </div>

          {/* Access Policy Callout */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-tight font-medium">
              &quot;All&quot; includes only records that you can access.
            </p>
          </div>

          {/* Specs Checklist */}
          <div className="space-y-2 py-1 text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Report</span>
              <span className="font-bold text-slate-800 text-right">{reportNames[reportType]}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">File type</span>
              <span className="font-bold text-indigo-700">{fileType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Programs</span>
              <span className="font-semibold text-slate-800">{programScope === "all_permitted" ? "All permitted programs" : programScope}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Team</span>
              <span className="font-semibold text-slate-800">{selectedTeam === "all_permitted" ? "All permitted" : selectedTeam}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Category</span>
              <span className="font-semibold text-slate-800">{selectedCategory === "all_permitted" ? "All permitted" : selectedCategory}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Sort</span>
              <span className="font-semibold text-slate-800 capitalize">{sortBy.replace("_", " ")}, {sortOrder}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs h-10"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Preparing file..." : "Download report"}
          </Button>
        </div>
      </div>
    </div>
  )
}
