"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Trophy, Calendar, MapPin, Radio, Users, Award,
  Globe, Sparkles, Clock, Search, Loader2, Video,
  Image as ImageIcon, Newspaper, Play, Phone, Mail,
  ExternalLink, ChevronRight, Menu, X, ArrowUpRight
} from "lucide-react"
import {
  getPublicResults,
  getPublicTeamPoints,
  getPublicChampionship,
  getPublicFestivalInfo
} from "@/lib/actions/certificate"

export default function PublicFestivalPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [festival, setFestival] = useState<any>(null)
  const [festivalName, setFestivalName] = useState<string>("Festival Portal")
  const [activeTab, setActiveTab] = useState<
    "overview" | "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "news"
  >("overview")
  const [results, setResults] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [championship, setChampionship] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (festivalId) {
      const cleanName = festivalId
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
      setFestivalName(cleanName.includes("Fest") ? cleanName : `${cleanName} Festival`)

      getPublicFestivalInfo(festivalId)
        .then((fRes) => {
          if (fRes.data) {
            setFestival(fRes.data)
            if (fRes.data.name) setFestivalName(fRes.data.name)
          }

          const fest = fRes.data
          if (fest) {
            const slug =
              fest.short_name?.toLowerCase() ||
              fest.code?.toLowerCase() ||
              (fest.name ? fest.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "")
            if (slug && typeof window !== "undefined") {
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(festivalId)
              const host = window.location.hostname
              if (host.includes("ahraz.site") && isUuid) {
                window.location.replace(`https://${slug}.ahraz.site`)
              }
            }
          }
        })
        .catch(() => {})

      Promise.all([
        getPublicResults(festivalId),
        getPublicTeamPoints(festivalId),
        getPublicChampionship(festivalId),
      ])
        .then(([rRes, tRes, cRes]) => {
          setResults(rRes.data || [])
          setTeamPoints(tRes.data || [])
          setChampionship(cRes.data || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [festivalId])

  // Custom Website Builder Configuration from settings
  const customSettings = festival?.settings?.[0] || festival?.settings || {}
  const customFields = (customSettings?.custom_fields as any) || {}
  const webConfig = customFields.website_config || {}

  const heroTitle = webConfig.heroTitle || festivalName
  const heroSubtitle =
    webConfig.heroSubtitle ||
    festival?.description ||
    "Track live scores, stage schedules, house points, and instant result announcements."
  const venueCampus = webConfig.venueCampus || "Main Auditorium Campus"
  const helpdeskPhone = webConfig.helpdeskPhone || "+91 98765 43210"
  const helpdeskEmail = webConfig.helpdeskEmail || "contact@festportal.com"

  const socialLinks = {
    instagram: webConfig.socialLinks?.instagram || "https://instagram.com",
    youtube: webConfig.socialLinks?.youtube || "https://youtube.com",
    facebook: webConfig.socialLinks?.facebook || "https://facebook.com",
    whatsapp: webConfig.socialLinks?.whatsapp || "https://wa.me/919876543210",
    twitter: webConfig.socialLinks?.twitter || "https://x.com",
  }

  const galleryItems = webConfig.gallery || [
    { id: "g1", title: "Inauguration Ceremony", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", category: "Ceremony" },
    { id: "g2", title: "Classical Dance Stage", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80", category: "Stage" },
    { id: "g3", title: "Light Music Band", url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80", category: "Music" },
    { id: "g4", title: "Auditorium Crowd", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", category: "Crowd" },
  ]

  const newsItems = webConfig.news || [
    { id: "n1", title: "Grand Inauguration Ceremony Begins at Main Stage", date: "Today, 09:00 AM", content: "The cultural fest has been officially inaugurated by the dignitaries. Stage 1 programs are now live.", badge: "Live" },
    { id: "n2", title: "Stage 2 Schedule Updated for Afternoon Competitions", date: "Today, 11:30 AM", content: "Classical solo performances will commence at 02:00 PM on Stage 2. All participants are requested to report 30 minutes prior.", badge: "Schedule" },
  ]

  const liveStreamEmbed = webConfig.liveStreamUrl || "https://www.youtube.com/embed/live_stream?channel=default"

  const filteredResults = results.filter(
    (r) =>
      !search ||
      r.participant?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.participant?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.competition?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const navTabs = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "results", label: `Live Results (${results.length})`, icon: Trophy },
    { id: "schedule", label: "Stage Schedules", icon: Clock },
    { id: "leaderboard", label: `House Standings (${teamPoints.length})`, icon: Award },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "videos", label: "Videos & Live", icon: Video },
    { id: "news", label: "News & Bulletins", icon: Newspaper },
  ]

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* ── 1. FESTIVAL HEADER (100% White-Labeled, No SaaS Navbar) ── */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          {/* Festival Logo / Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
            {festival?.logo_url ? (
              <img
                src={festival.logo_url}
                alt={festivalName}
                className="h-10 w-10 rounded-xl object-cover border border-slate-700 shadow-md"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30">
                {festivalName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                Official Festival Portal
              </span>
              <h1 className="text-lg font-black text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {festivalName}
              </h1>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navTabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Action: Live Badge & Console Login */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all shadow-sm"
            >
              Console Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2">
            {navTabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id as any)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              )
            })}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Festival
              </span>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
              >
                Console Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO BANNER SECTION ── */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-8 overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Official Festival Portal • Real-Time Scoring</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {heroTitle}
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            {heroSubtitle}
          </p>

          {/* Quick Stat Pills */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-2 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Event Portal Live</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{venueCampus}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <Users className="h-4 w-4 text-amber-400" />
              <span>{teamPoints.length > 0 ? `${teamPoints.length} Houses Competing` : "All Teams Participating"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MAIN CONTENT TABS / PAGES ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 w-full space-y-8 flex-1">
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab("results")}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Results</span>
                  <Trophy className="h-6 w-6 text-amber-400" />
                </div>
                <div className="text-4xl font-black font-mono text-white">{results.length || "Live"}</div>
                <p className="text-xs text-slate-400 flex items-center gap-1 text-indigo-400 font-bold">
                  View Results <ChevronRight className="h-3 w-3" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("schedule")}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Stages</span>
                  <Radio className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-4xl font-black font-mono text-white">Stage Monitoring</div>
                <p className="text-xs text-slate-400 flex items-center gap-1 text-emerald-400 font-bold">
                  Check Schedule <ChevronRight className="h-3 w-3" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("leaderboard")}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">House Standings</span>
                  <Award className="h-6 w-6 text-red-400" />
                </div>
                <div className="text-4xl font-black font-mono text-red-400">{teamPoints.length || "Teams"}</div>
                <p className="text-xs text-slate-400 flex items-center gap-1 text-red-400 font-bold">
                  Leaderboard <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </div>

            {/* Quick Live Preview Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest News / Announcements preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-indigo-400" />
                    Latest Bulletins &amp; News
                  </h3>
                  <button onClick={() => setActiveTab("news")} className="text-xs font-bold text-indigo-400 hover:underline">
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {newsItems.slice(0, 2).map((n: any) => (
                    <div key={n.id} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">{n.badge || "Update"}</span>
                        <span className="text-slate-400 font-medium">{n.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Highlight preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                    Festival Gallery
                  </h3>
                  <button onClick={() => setActiveTab("gallery")} className="text-xs font-bold text-emerald-400 hover:underline">
                    View Photos →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {galleryItems.slice(0, 2).map((g: any) => (
                    <div key={g.id} className="group relative rounded-xl overflow-hidden aspect-video border border-slate-800">
                      <img src={g.url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] font-bold text-white truncate">{g.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Results */}
        {activeTab === "results" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Live Published Results</h2>
                <p className="text-xs text-slate-400 mt-0.5">Instant marks &amp; ranking published by judging panel</p>
              </div>
              <div className="relative w-full sm:w-72">
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
                  <div key={i} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:border-slate-700 transition-all">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {res.competition?.name || "Competition"}
                      </span>
                      <h3 className="text-base font-extrabold text-white">
                        {res.participant?.first_name} {res.participant?.last_name || ""}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {res.team?.name || "Participant Team"} • Chest: {res.participant?.chest_number || "—"}
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black rounded-xl">
                      {res.grade || `Rank #${res.rank || i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                <Trophy className="h-10 w-10 mx-auto text-slate-600" />
                <p className="font-semibold text-sm">No results published yet.</p>
                <p className="text-xs text-slate-500">Official results will update here in real-time as programs conclude.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Schedule */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Stage Schedules &amp; Timetable</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time stage program line-up across auditoriums</p>
            </div>
            <div className="space-y-3">
              {[
                { time: "09:30 AM", event: "Light Music (Male)", stage: "Stage 01 (Main Auditorium)", status: "Ongoing" },
                { time: "10:45 AM", event: "Classical Dance (Single)", stage: "Stage 02 (Open Air Theatre)", status: "Next Up" },
                { time: "11:30 AM", event: "Elocution (English)", stage: "Stage 03 (Seminar Hall)", status: "Scheduled" },
                { time: "01:30 PM", event: "Group Song (Indian)", stage: "Stage 01 (Main Auditorium)", status: "Scheduled" },
                { time: "03:00 PM", event: "Mime & Skit", stage: "Stage 02 (Open Air Theatre)", status: "Scheduled" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-indigo-400 text-sm">{item.time}</span>
                    <div>
                      <h3 className="font-bold text-white text-sm">{item.event}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.stage}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    item.status === "Ongoing" ? "bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30" : "bg-slate-800 text-slate-300"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">House Standings &amp; Points</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live overall championship points tally</p>
            </div>
            {teamPoints.length > 0 ? (
              <div className="space-y-3">
                {teamPoints.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-center justify-between">
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
                  { rank: 1, house: "Red House", points: 420, color: "border-red-500/40 text-red-400" },
                  { rank: 2, house: "Blue House", points: 395, color: "border-blue-500/40 text-blue-400" },
                  { rank: 3, house: "Green House", points: 340, color: "border-emerald-500/40 text-emerald-400" },
                  { rank: 4, house: "Yellow House", points: 310, color: "border-amber-500/40 text-amber-400" },
                ].map((item) => (
                  <div key={item.rank} className={`bg-slate-900 border ${item.color} p-4.5 rounded-2xl flex items-center justify-between`}>
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

        {/* Tab 5: Gallery */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Festival Photo Gallery</h2>
              <p className="text-xs text-slate-400 mt-0.5">Captures and highlights from across festival stages</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleryItems.map((g: any) => (
                <div key={g.id} className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800 bg-slate-900">
                  <img src={g.url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{g.category || "Event"}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{g.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Videos & Live Stream */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Live Stream &amp; Videos</h2>
              <p className="text-xs text-slate-400 mt-0.5">Watch live performances and stage recordings</p>
            </div>

            {/* Video Player */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-video shadow-2xl relative">
              <iframe
                src={liveStreamEmbed}
                title="Festival Live Stream"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tab 7: News & Bulletins */}
        {activeTab === "news" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Official Bulletins &amp; News</h2>
              <p className="text-xs text-slate-400 mt-0.5">Official notices, schedule updates, and circulars</p>
            </div>
            <div className="space-y-4">
              {newsItems.map((n: any) => (
                <div key={n.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {n.badge || "Bulletin"}
                    </span>
                    <span className="text-slate-400 font-medium">{n.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{n.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── 4. FESTIVAL FOOTER (100% White-Labeled with Social Media Icons) ── */}
      <footer className="border-t border-slate-800 bg-slate-900/90 py-12 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Festival Intro */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {festivalName.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-lg font-black text-white">{festivalName}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official Cultural &amp; Arts Festival Management Portal. Track real-time results, house standings, and stage schedules.
              </p>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Festival Hub</h4>
              <button onClick={() => setActiveTab("overview")} className="block text-slate-400 hover:text-white transition-colors">Overview</button>
              <button onClick={() => setActiveTab("results")} className="block text-slate-400 hover:text-white transition-colors">Live Results</button>
              <button onClick={() => setActiveTab("schedule")} className="block text-slate-400 hover:text-white transition-colors">Stage Timetable</button>
              <button onClick={() => setActiveTab("leaderboard")} className="block text-slate-400 hover:text-white transition-colors">House Standings</button>
              <button onClick={() => setActiveTab("gallery")} className="block text-slate-400 hover:text-white transition-colors">Photo Gallery</button>
            </div>

            {/* Helpdesk & Campus */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Helpdesk &amp; Venue</h4>
              <p className="text-slate-400 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{venueCampus}</span>
              </p>
              <p className="text-slate-400 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>{helpdeskPhone}</span>
              </p>
              <p className="text-slate-400 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>{helpdeskEmail}</span>
              </p>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Connect With Us</h4>
              <p className="text-xs text-slate-400">Follow official handles for live highlights and stories.</p>
              <div className="flex items-center gap-2.5 pt-1">
                {/* Instagram */}
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-pink-600 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Instagram"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-red-600 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
                  title="YouTube"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-emerald-600 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
                  title="WhatsApp"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-blue-600 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Facebook"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-black border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Twitter / X"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {festivalName}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-slate-300 transition-colors">Staff Login</Link>
              <span>•</span>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-slate-300 transition-colors">
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
