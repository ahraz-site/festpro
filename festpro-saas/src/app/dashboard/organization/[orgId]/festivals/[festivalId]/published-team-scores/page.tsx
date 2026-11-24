"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { toast } from "sonner"
import {
  BarChart2, FileImage, Download, Share2,
  Clock, Check, ExternalLink, Printer
} from "lucide-react"

interface PublishedScoreItem {
  rank: number
  team: string
  score: number
  category?: string
}

export default function PublishedTeamScoresPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [activeTab, setActiveTab] = useState<"Overall" | "General" | "Junior" | "Senior">("Overall")
  const [scores, setScores] = useState<PublishedScoreItem[]>([])
  const [publishedTime, setPublishedTime] = useState<string>("Today, 5:22 PM")

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("teams")
          .select("name, total_points")
          .eq("festival_id", festivalId)
          .order("total_points", { ascending: false })

        if (data && data.length > 0) {
          const list: PublishedScoreItem[] = data.map((t: any, idx: number) => ({
            rank: idx + 1,
            team: t.name,
            score: Number(t.total_points || 0),
          }))
          setScores(list)
        } else {
          setScores([
            { rank: 1, team: "BJP", score: 10 },
            { rank: 2, team: "CJP", score: 9 },
          ])
        }
      } catch (err) {
        console.error("Failed to load published scores:", err)
      }
    }
    load()
  }, [festivalId])

  const handleDownloadPoster = () => {
    window.print()
  }

  const exportColumns = [
    { header: "#", accessor: (s: PublishedScoreItem) => String(s.rank) },
    { header: "Team", accessor: (s: PublishedScoreItem) => s.team },
    { header: "Score", accessor: (s: PublishedScoreItem) => String(s.score) },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 4) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Published team scores</h1>
          </div>
        </div>

        {/* Top Right Action Button (Screenshot 4: Poster button) */}
        <div className="flex items-center gap-2">
          <ExportPrintBar
            title="Official Published Team Scores"
            subtitle="FestPro Festival Standings"
            data={scores}
            columns={exportColumns}
            filename="published-team-scores"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPoster}
            className="rounded-xl text-xs font-semibold px-4 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <FileImage className="h-4 w-4 mr-1.5 text-slate-500" />
            Poster
          </Button>
        </div>
      </div>

      {/* ── PILL FILTER TABS (Screenshot 4: Overall, General, Junior, Senior) ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(["Overall", "General", "Junior", "Senior"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TWO-COLUMN SECTION (Screenshot 4: After results card + Scores table) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* Left Status Card (Screenshot 4) */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <h3 className="text-sm font-black text-slate-900">After 1 results</h3>
          <p className="text-xs text-slate-400 font-medium">{publishedTime} · On the website</p>
        </div>

        {/* Right Standings Table (Screenshot 4: #, Team, Score) */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-6 w-20">#</th>
                <th className="py-3 px-6">Team</th>
                <th className="py-3 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {scores.map((row) => (
                <tr key={row.team} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 text-slate-900 font-black text-sm">{row.rank}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 text-sm">{row.team}</td>
                  <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                    {row.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
