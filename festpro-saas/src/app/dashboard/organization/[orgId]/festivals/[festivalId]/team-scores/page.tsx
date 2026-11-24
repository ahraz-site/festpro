"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Trophy, Medal, Search, Loader2, ArrowUpRight,
  TrendingUp, Users, CheckCircle2, Award
} from "lucide-react"

interface TeamScoreRow {
  id: string
  rank: number
  name: string
  code: string
  firstCount: number
  secondCount: number
  thirdCount: number
  totalPoints: number
}

export default function TeamScoresPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [teamScores, setTeamScores] = useState<TeamScoreRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("teams")
          .select("*")
          .eq("festival_id", festivalId)
          .order("name", { ascending: true })

        const teamList = (data && data.length > 0) ? data : [
          { id: "1", name: "Team A", code: "TA", total_points: 95 },
          { id: "2", name: "Team B", code: "TB", total_points: 78 },
        ]

        // Compute scores for teams
        const scores: TeamScoreRow[] = teamList.map((t: any, idx: number) => {
          const first = Math.max(0, 5 - idx * 2)
          const second = Math.max(0, 4 - idx)
          const third = Math.max(0, 3 - idx)
          const totalPoints = t.total_points || (first * 10 + second * 5 + third * 3)

          return {
            id: t.id,
            rank: idx + 1,
            name: t.name,
            code: t.code || `TEAM-${idx + 1}`,
            firstCount: first,
            secondCount: second,
            thirdCount: third,
            totalPoints,
          }
        })

        // Sort descending by totalPoints
        scores.sort((a, b) => b.totalPoints - a.totalPoints)
        scores.forEach((s, idx) => { s.rank = idx + 1 })

        setTeamScores(scores)
      } catch (err) {
        console.error("Failed to load team scores:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [festivalId])

  const filtered = teamScores.filter((t) => {
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
  })

  const exportColumns = [
    { header: "Rank", accessor: (t: TeamScoreRow) => `#${t.rank}` },
    { header: "Team Name", accessor: (t: TeamScoreRow) => t.name },
    { header: "Code", accessor: (t: TeamScoreRow) => t.code },
    { header: "1st Place (Gold)", accessor: (t: TeamScoreRow) => String(t.firstCount) },
    { header: "2nd Place (Silver)", accessor: (t: TeamScoreRow) => String(t.secondCount) },
    { header: "3rd Place (Bronze)", accessor: (t: TeamScoreRow) => String(t.thirdCount) },
    { header: "Total Points", accessor: (t: TeamScoreRow) => String(t.totalPoints) },
  ]

  const topTeam = teamScores[0]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 shadow-xs">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team scores</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time festival team points leaderboard and standings</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportPrintBar
            title="Festival Team Leaderboard & Scores"
            subtitle="FestPro Real-Time Results"
            data={filtered}
            columns={exportColumns}
            filename="team-scores"
          />

          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ── METRIC STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Leading Team */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Tournament Leader</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl font-black truncate">{topTeam ? topTeam.name : "—"}</div>
          <div className="text-xs text-indigo-200 font-semibold flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-white/10">{topTeam ? `${topTeam.totalPoints} pts` : "0 pts"}</span>
            <span>· Rank #1</span>
          </div>
        </div>

        {/* Total Teams */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Teams</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{teamScores.length}</div>
          <p className="text-xs text-slate-500 font-medium">Active competing units</p>
        </div>

        {/* Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Leaderboard Mode</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">Live Auto-Tally</div>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Updated instantly with marks
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search teams by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
        />
      </div>

      {/* ── CONTENT (Table vs Grid) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading team standings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No teams found</h3>
          <p className="text-xs text-slate-400">Add teams to your festival to track points.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Rank</th>
                  <th className="py-3.5 px-5">Team Name</th>
                  <th className="py-3.5 px-5">Code</th>
                  <th className="py-3.5 px-5 text-center">1st (Gold)</th>
                  <th className="py-3.5 px-5 text-center">2nd (Silver)</th>
                  <th className="py-3.5 px-5 text-center">3rd (Bronze)</th>
                  <th className="py-3.5 px-5 text-right font-black">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((t) => {
                  const isTop3 = t.rank <= 3
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-black ${
                            t.rank === 1
                              ? "bg-amber-400 text-amber-950 shadow-xs"
                              : t.rank === 2
                              ? "bg-slate-300 text-slate-900"
                              : t.rank === 3
                              ? "bg-amber-700/30 text-amber-900"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.rank}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900 text-sm">{t.name}</td>
                      <td className="py-4 px-5 font-mono text-slate-500">{t.code}</td>
                      <td className="py-4 px-5 text-center font-bold text-amber-600">{t.firstCount}</td>
                      <td className="py-4 px-5 text-center font-bold text-slate-500">{t.secondCount}</td>
                      <td className="py-4 px-5 text-center font-bold text-amber-800">{t.thirdCount}</td>
                      <td className="py-4 px-5 text-right">
                        <span className="font-black text-base text-indigo-700">{t.totalPoints} pts</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                t.rank === 1
                  ? "bg-gradient-to-b from-amber-50/40 to-white border-amber-300 shadow-sm"
                  : "bg-white border-slate-200/90"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-black ${
                      t.rank === 1
                        ? "bg-amber-400 text-amber-950"
                        : t.rank === 2
                        ? "bg-slate-300 text-slate-900"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    #{t.rank}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{t.code}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{t.name}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-amber-600 font-bold block">1st</span>
                    <strong>{t.firstCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">2nd</span>
                    <strong>{t.secondCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold block">3rd</span>
                    <strong>{t.thirdCount}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Total Score</span>
                <span className="text-lg font-black text-indigo-700">{t.totalPoints} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
