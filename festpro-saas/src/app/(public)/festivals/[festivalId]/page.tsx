"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Trophy, Calendar, MapPin, Radio, Users, Award,
  Globe, Sparkles, Clock, Search, Loader2
} from "lucide-react"
import { getPublicResults, getPublicTeamPoints, getPublicChampionship } from "@/lib/actions/certificate"

export default function PublicFestivalPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [festivalName, setFestivalName] = useState<string>("Festival Portal")
  const [activeTab, setActiveTab] = useState<"overview" | "results" | "schedule" | "leaderboard">("overview")
  const [results, setResults] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [championship, setChampionship] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (festivalId) {
      const cleanName = festivalId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
      setFestivalName(cleanName.includes("Fest") ? cleanName : `${cleanName} Festival`)

      Promise.all([
        getPublicResults(festivalId),
        getPublicTeamPoints(festivalId),
        getPublicChampionship(festivalId),
      ]).then(([rRes, tRes, cRes]) => {
        setResults(rRes.data || [])
        setTeamPoints(tRes.data || [])
        setChampionship(cRes.data || [])
        setLoading(false)
      }).catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [festivalId])

  const filteredResults = results.filter((r) =>
    !search ||
    r.participant?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.participant?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.competition?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          <span className="font-bold text-sm">Loading Festival Website...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Festival Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-indigo-600/30">
            FP
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Official Festival Site</span>
            <h1 className="text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">{festivalName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE FESTIVAL</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md"
          >
            Console Login
          </Link>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-8 overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Live Competitions • Real-Time Scoring Portal</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {festivalName}
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Track live scores, stage schedules, house points, and instant result announcements powered by FestPro.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 pt-2 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Event Portal Live</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Main Auditorium Campus</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <Users className="h-4 w-4 text-amber-400" />
              <span>{results.length > 0 ? `${results.length} Published Results` : "All Teams Participating"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs & Views */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Stats", icon: Globe },
            { id: "results", label: `Live Results (${results.length})`, icon: Trophy },
            { id: "schedule", label: "Stage Schedules", icon: Clock },
            { id: "leaderboard", label: `House Standings (${teamPoints.length})`, icon: Award },
          ].map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Results</span>
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div className="text-4xl font-black font-mono text-white">{results.length || "Live"}</div>
              <p className="text-xs text-slate-400">On-stage & Off-stage published items</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Stages</span>
                <Radio className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="text-4xl font-black font-mono text-white">Live Stages</div>
              <p className="text-xs text-slate-400">Stage Manager Desk Console</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Participating Teams</span>
                <Award className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-4xl font-black font-mono text-red-400">{teamPoints.length || "Teams"}</div>
              <p className="text-xs text-slate-400">Competing for overall Championship</p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Results */}
        {activeTab === "results" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-extrabold text-white">Published Results</h2>
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by participant or program..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResults.map((res, i) => (
                  <div key={i} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {res.competition?.name || "Competition"}
                      </span>
                      <h3 className="text-base font-extrabold text-white">
                        {res.participant?.first_name} {res.participant?.last_name || ""}
                      </h3>
                      <p className="text-xs text-slate-400">{res.team?.name || "Participant Team"}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl">
                      {res.grade || "Ranked"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                <Trophy className="h-10 w-10 mx-auto text-slate-600" />
                <p className="font-semibold text-sm">No results published yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Schedule */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">Live Stage Schedules</h2>
            <div className="space-y-3">
              {[
                { time: "09:30 AM", event: "Light Music (Male)", stage: "Stage 1 (Main Hall)", status: "Ongoing" },
                { time: "10:45 AM", event: "Classical Dance (Single)", stage: "Stage 2 (Open Air)", status: "Next Up" },
                { time: "11:30 AM", event: "Elocution (English)", stage: "Stage 3 (Art Room)", status: "Scheduled" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-indigo-400">{item.time}</span>
                    <div>
                      <h3 className="font-bold text-white">{item.event}</h3>
                      <p className="text-xs text-slate-400">{item.stage}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    item.status === "Ongoing" ? "bg-emerald-500/20 text-emerald-400 animate-pulse" : "bg-slate-800 text-slate-300"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">House Point Leaderboard</h2>
            {teamPoints.length > 0 ? (
              <div className="space-y-3">
                {teamPoints.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-extrabold text-xs">
                        #{idx + 1}
                      </div>
                      <span className="font-extrabold text-white text-base">{item.team?.name || item.name}</span>
                    </div>
                    <span className="font-mono font-black text-2xl text-amber-400">{item.total_points || 0} <span className="text-xs font-normal text-slate-400">pts</span></span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { rank: 1, house: "Red House", points: 420, color: "border-red-500/50 text-red-400" },
                  { rank: 2, house: "Blue House", points: 395, color: "border-blue-500/50 text-blue-400" },
                  { rank: 3, house: "Green House", points: 340, color: "border-emerald-500/50 text-emerald-400" },
                ].map((item) => (
                  <div key={item.rank} className={`bg-slate-900 border ${item.color} p-4 rounded-2xl flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-extrabold text-white text-xs">
                        #{item.rank}
                      </div>
                      <span className="font-extrabold text-white text-base">{item.house}</span>
                    </div>
                    <span className="font-mono font-black text-2xl text-white">{item.points} <span className="text-xs font-normal text-slate-400">pts</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 {festivalName}. All rights reserved.</p>
        <p>Powered by <span className="font-bold text-indigo-400">FestPro Enterprise SaaS Platform</span></p>
      </footer>
    </div>
  )
}
