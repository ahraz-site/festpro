"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Trophy, Calendar, MapPin, Radio, Users, Award,
  Globe, Shield, ChevronRight, Sparkles, CheckCircle2, Clock
} from "lucide-react"

export default function PublicFestivalPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [festivalName, setFestivalName] = useState<string>("FestPro Annual Youth Festival 2026")
  const [activeTab, setActiveTab] = useState<"overview" | "results" | "schedule" | "leaderboard">("overview")

  useEffect(() => {
    // Format slug/id to clean name if dynamic ID is passed
    if (festivalId) {
      const cleanName = festivalId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
      setFestivalName(cleanName.includes("Fest") ? cleanName : `${cleanName} Festival`)
    }
    setLoading(false)
  }, [festivalId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-indigo-400 animate-spin" />
          <span className="font-bold">Loading Festival Website...</span>
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
      <section className="relative py-20 px-4 sm:px-8 overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>54 Competitions • 6 Live Stages • Real-Time Scoring</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {festivalName}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            Track live scores, stage schedules, house points, and instant result announcements powered by FestPro.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Oct 15 - Oct 18, 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Main Campus Auditorium</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <Users className="h-4 w-4 text-amber-400" />
              <span>2,500+ Participants</span>
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
            { id: "results", label: "Live Results", icon: Trophy },
            { id: "schedule", label: "Stage Schedules", icon: Clock },
            { id: "leaderboard", label: "House Standings", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Programs</span>
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div className="text-4xl font-black font-mono text-white">54</div>
              <p className="text-xs text-slate-400">On Stage & Off Stage Competitions</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Stages</span>
                <Radio className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="text-4xl font-black font-mono text-white">6 Stages</div>
              <p className="text-xs text-slate-400">Live Stage Desk Managed</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Leading House</span>
                <Award className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-4xl font-black font-mono text-red-400">Red House</div>
              <p className="text-xs text-slate-400">420 Points (1st Rank)</p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Results */}
        {activeTab === "results" && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">Published Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Light Music (Solo)", winner: "Rahul V", house: "Red House", grade: "A Grade" },
                { title: "Classical Dance (Single)", winner: "Ananya Nair", house: "Blue House", grade: "A Grade" },
                { title: "Elocution (English)", winner: "Fathima S", house: "Green House", grade: "A Grade" },
                { title: "Group Song", winner: "Yellow House Team", house: "Yellow House", grade: "A Grade" },
              ].map((res, i) => (
                <div key={i} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{res.title}</span>
                    <h3 className="text-base font-extrabold text-white">{res.winner}</h3>
                    <p className="text-xs text-slate-400">{res.house}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl">
                    {res.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Schedule */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">Live Stage Schedules</h2>
            <div className="space-y-3">
              {[
                { time: "09:30 AM", event: "Classical Dance", stage: "Stage 1 (Main Hall)", status: "Ongoing" },
                { time: "10:45 AM", event: "Light Music Boys", stage: "Stage 2 (Open Air)", status: "Next Up" },
                { time: "11:30 AM", event: "Pencil Drawing", stage: "Stage 3 (Art Room)", status: "Scheduled" },
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
            <div className="space-y-3">
              {[
                { rank: 1, house: "Red House", points: 420, color: "border-red-500 text-red-400" },
                { rank: 2, house: "Blue House", points: 395, color: "border-blue-500 text-blue-400" },
                { rank: 3, house: "Green House", points: 340, color: "border-emerald-500 text-emerald-400" },
                { rank: 4, house: "Yellow House", points: 310, color: "border-amber-500 text-amber-400" },
              ].map((item) => (
                <div key={item.rank} className={`bg-slate-900 border-2 ${item.color} p-4 rounded-2xl flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-extrabold text-white">
                      #{item.rank}
                    </div>
                    <span className="font-extrabold text-white text-base">{item.house}</span>
                  </div>
                  <span className="font-mono font-black text-2xl text-white">{item.points} <span className="text-xs font-normal text-slate-400">pts</span></span>
                </div>
              ))}
            </div>
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
