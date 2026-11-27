"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Printer, Download, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

function escapeCsvCell(val: unknown): string {
  const s = String(val ?? "")
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function FestivalReportsPrintoutsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [teams, setTeams] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [resultItems, setResultItems] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [customFields, setCustomFields] = useState<any>({})

  // Report Form State
  const [reportType, setReportType] = useState("participant_list")
  const [fileType, setFileType] = useState<"PDF" | "Excel">("PDF")
  const [programScope, setProgramScope] = useState("all_permitted")
  const [selectedTeam, setSelectedTeam] = useState("all_permitted")
  const [selectedCategory, setSelectedCategory] = useState("all_permitted")
  const [selectedProgram, setSelectedProgram] = useState("all_permitted")
  const [sortBy, setSortBy] = useState("chest_number")
  const [sortOrder, setSortOrder] = useState("ascending")
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`/api/festival/${festivalId}/workspace?scope=reports`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        setTeams(Array.isArray(data?.teams) ? data.teams : [])
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
        setCompetitions(Array.isArray(data?.competitions) ? data.competitions : [])
        setParticipants(Array.isArray(data?.participants) ? data.participants : [])
        setRegistrations(Array.isArray(data?.registrations) ? data.registrations : [])
        setSchedules(Array.isArray(data?.schedules) ? data.schedules : [])
        setResultItems(Array.isArray(data?.resultItems) ? data.resultItems : [])
        setTeamPoints(Array.isArray(data?.teamPoints) ? data.teamPoints : [])
        setCustomFields(data?.customFields || {})
      })
      .catch((err) => console.error("Failed to load reports data:", err))
    return () => {
      active = false
    }
  }, [festivalId])

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
    if (fileType === "PDF") {
      window.print()
      return
    }

    setDownloading(true)
    try {
      const partById = new Map(participants.map((p: any) => [p.id, p]))
      const compById = new Map(competitions.map((c: any) => [c.id, c]))

      const matchesFilters = (team?: string, category?: string, compId?: string) => {
        if (selectedTeam !== "all_permitted" && String(team || "").toLowerCase() !== selectedTeam.toLowerCase()) {
          return false
        }
        if (selectedCategory !== "all_permitted" && String(category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
        if (selectedProgram !== "all_permitted" && compId !== selectedProgram) {
          return false
        }
        return true
      }

      let headers: string[] = []
      let rows: string[][] = []

      if (reportType === "participant_list") {
        headers = ["Chest #", "Name", "Team", "Category", "Program"]
        if (registrations.length > 0 && selectedProgram !== "all_permitted") {
          rows = registrations
            .map((r: any) => {
              const p = partById.get(r.participant_id)
              const comp = compById.get(r.competition_id)
              const name = p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() : ""
              const team = p?.unit || ""
              const cat = p?.division || comp?.category?.name || ""
              return { chest: p?.chest_number || r.chest_number || "", name, team, cat, compId: r.competition_id, compName: comp?.name || "" }
            })
            .filter((x) => x.name && matchesFilters(x.team, x.cat, x.compId))
            .map((x) => [x.chest, x.name, x.team, x.cat, x.compName])
        } else {
          rows = participants
            .filter((p: any) => matchesFilters(p.unit, p.division, undefined))
            .map((p: any) => [
              p.chest_number || "",
              `${p.first_name || ""} ${p.last_name || ""}`.trim(),
              p.unit || "",
              p.division || "",
              registrations
                .filter((r: any) => r.participant_id === p.id)
                .map((r: any) => compById.get(r.competition_id)?.name)
                .filter(Boolean)
                .join("; ") || "—",
            ])
        }
      } else if (reportType === "team_points") {
        headers = ["Rank", "Team", "Code", "Total Points"]
        const tpByTeamId = new Map(teamPoints.map((tp: any) => [tp.entity_id, Number(tp.total_points || 0)]))
        rows = teams
          .filter((t: any) => selectedTeam === "all_permitted" || t.name.toLowerCase() === selectedTeam.toLowerCase() || (t.code || "").toLowerCase() === selectedTeam.toLowerCase())
          .map((t: any) => ({ name: t.name, code: t.code || "", pts: tpByTeamId.get(t.id) ?? Number(t.total_points || 0) }))
          .sort((a, b) => b.pts - a.pts)
          .map((t, idx) => [String(idx + 1), t.name, t.code, String(t.pts)])
      } else if (reportType === "schedule_summary") {
        headers = ["Program", "Stage / Venue", "Start Time", "Status"]
        rows = schedules.map((s: any) => [
          compById.get(s.competition_id)?.name || s.title || "Program",
          s.stage_name || s.venue || "—",
          s.start_time ? new Date(s.start_time).toLocaleString() : "—",
          s.status || "scheduled",
        ])
      } else if (reportType === "judge_scores" || reportType === "prizes_list") {
        headers = ["Rank", "Chest #", "Participant", "Team", "Program", "Total Score", "Grade"]
        rows = resultItems
          .map((item: any) => {
            const p = partById.get(item.participant_id)
            const comp = compById.get(item.competition_id)
            const team = p?.unit || ""
            const cat = p?.division || comp?.category?.name || ""
            return { item, p, comp, team, cat }
          })
          .filter((x) => matchesFilters(x.team, x.cat, x.item.competition_id))
          .map((x) => [
            String(x.item.rank || ""),
            x.p?.chest_number || x.item.chest_number || "",
            x.p ? `${x.p.first_name || ""} ${x.p.last_name || ""}`.trim() : "",
            x.team,
            x.comp?.name || "",
            String(x.item.total_score ?? ""),
            x.item.grade || "",
          ])
      } else if (reportType === "code_letters") {
        headers = ["Program", "Chest #", "Participant", "Code Letter", "Reported"]
        const cl = (customFields?.code_letters || {}) as Record<string, any[]>
        Object.entries(cl).forEach(([compId, entries]) => {
          const comp = compById.get(compId)
          ;(entries || []).forEach((e: any) => {
            const p = partById.get(e.id)
            if (!matchesFilters(p?.unit, p?.division, compId)) return
            rows.push([
              comp?.name || compId,
              p?.chest_number || "",
              p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() : e.id,
              e.codeLetter || "",
              e.isReported ? "Yes" : "No",
            ])
          })
        })
      }

      if (rows.length === 0) {
        toast.info("No records match the current report filters.")
        return
      }

      if (sortOrder === "descending") {
        rows.reverse()
      }

      const csvLines = [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))]
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${reportType}_report.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Exported ${rows.length} record(s) to CSV!`)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs">
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
                {teams.map((t: any) => (
                  <option key={t.id} value={t.code || t.name}>{t.name}</option>
                ))}
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
                {categories.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
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
                {competitions.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/60 flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
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
            className="w-full rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs h-10"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Preparing file..." : "Download report"}
          </Button>
        </div>
      </div>
    </div>
  )
}
