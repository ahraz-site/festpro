"use client"

import { useState } from "react"
import {
  BookOpen, Search, Sparkles, Server, Shield, Trophy, Users,
  CheckCircle2, ArrowRight, Layers, FileText, Lock, AlertTriangle, HelpCircle,
  Video, Play, Terminal, ChevronRight, Activity, Cpu, Globe, LifeBuoy,
  MessageSquare, Compass, Award, ExternalLink, Zap, RefreshCw, Bookmark
} from "lucide-react"

// ────────────────────────────────────────────
// MASTER HELP CENTER NAVIGATION TREE & MODULES
// ────────────────────────────────────────────

const HELP_CENTER_SECTIONS = [
  {
    category: "🚀 Onboarding & Quick Start",
    items: [
      { id: "getting-started", title: "Welcome & 15-Minute Trial Guide", icon: Zap },
      { id: "learning-paths", title: "Role-Based Learning Paths", icon: Compass },
      { id: "tour-simulator", title: "Interactive Tour Simulator", icon: Play },
    ],
  },
  {
    category: "📚 Core Operations Manuals (40 Modules)",
    items: [
      { id: "mod-01-09", title: "01-09 Core Event Engine & Judge Console", icon: Trophy },
      { id: "mod-10-16", title: "10-16 Logistics, Food, Hostel & Medical", icon: Layers },
      { id: "mod-17-30", title: "17-30 Platform, REST APIs, Security & DevOps", icon: Server },
      { id: "mod-31-40", title: "31-40 Role Guides, Video Scripts & FAQ", icon: HelpCircle },
    ],
  },
  {
    category: "🎓 Specialized Role Guides",
    items: [
      { id: "role-admin", title: "Organization & Festival Admin Guide", icon: Shield },
      { id: "role-judge", title: "Digital Judge Tablet Scoring Guide", icon: Award },
      { id: "role-volunteer", title: "Volunteer Stage Checkin Guide", icon: Users },
      { id: "role-finance", title: "Finance, Receipts & Budget Guide", icon: FileText },
      { id: "role-developer", title: "Developer API & Webhooks Guide", icon: Terminal },
    ],
  },
  {
    category: "🎬 Media & AI Assistance",
    items: [
      { id: "video-tutorials", title: "Video Tutorial Scripts & Demos", icon: Video },
      { id: "ai-assistant", title: "FestPro AI Copilot Assistant", icon: Sparkles },
      { id: "troubleshooting", title: "Master Troubleshooting & Error Codes", icon: AlertTriangle },
      { id: "system-status", title: "System Status & SLA Telemetry", icon: Activity },
    ],
  },
]

const SYSTEM_MODULES_40 = [
  { num: "01", name: "Getting Started", desc: "15-minute onboarding tutorial, account setup, system requirements." },
  { num: "02", name: "Organization", desc: "Multi-tenant architecture, custom domains, branding, SMTP gateway, RBAC." },
  { num: "03", name: "Festival", desc: "Festival creation, dates, settings, rules, stage infrastructure, lifecycle." },
  { num: "04", name: "Competition", desc: "Item registry, solo vs group rules, time limits, chest number mode." },
  { num: "05", name: "Participant", desc: "Bulk CSV candidate import, eligibility validation, QR ID badge generator." },
  { num: "06", name: "Schedule", desc: "Drag-and-drop timeline builder, candidate collision alert engine." },
  { num: "07", name: "Judge", desc: "Double-blind evaluation, Code Letter PIN console, offline IndexedDB sync." },
  { num: "08", name: "Result", desc: "Mark verification, grade point calculator, tie-breaker resolution, publishing." },
  { num: "09", name: "Certificate", desc: "Digital PDF E-certificate builder, QR anti-fraud verification portal." },
  { num: "10", name: "Finance", desc: "Registration fees, payment receipts, sponsor pledges, budget tracking." },
  { num: "11", name: "Volunteer", desc: "Shift rosters, checkpoint duty attendance, scanner badge management." },
  { num: "12", name: "Help Desk", desc: "Incident tickets, query escalation, live participant support desk." },
  { num: "13", name: "Inventory", desc: "Audio/visual equipment tracking, microphone & trophy stock audit." },
  { num: "14", name: "Accommodation", desc: "Hostel room allocation, occupancy tracking, participant check-in." },
  { num: "15", name: "Food", desc: "Dining hall QR coupon verification, meal count logging, diet reports." },
  { num: "16", name: "Medical", desc: "Emergency incident logging, candidate medical pause procedure." },
  { num: "17", name: "Notifications", desc: "SMS alerts, email broadcasts, automated mobile push notifications." },
  { num: "18", name: "Public Website", desc: "Public portal /festivals/[id], live stage LED tickers /live." },
  { num: "19", name: "Mobile App", desc: "Native / PWA app for Stage Managers, Security Checkpoints, Judges." },
  { num: "20", name: "SaaS", desc: "Subscription plans, tenant quotas, white-label custom domain manager." },
  { num: "21", name: "AI", desc: "AI Copilot, candidate conflict predictor, schedule optimizer." },
  { num: "22", name: "Analytics", desc: "Stage throughput metrics, judge scoring curve charts, team progress." },
  { num: "23", name: "API", desc: "REST API v2 reference, Webhook events, SDK key scope manager." },
  { num: "24", name: "Security", desc: "Supabase RLS policies, IP whitelisting, audit logs, OWASP compliance." },
  { num: "25", name: "Backup", desc: "Automated PostgreSQL snapshots, point-in-time (PITR) disaster recovery." },
  { num: "26", name: "Monitoring", desc: "WebSocket telemetry, server response latency, incident alerts." },
  { num: "27", name: "Localization", desc: "English & Anek Malayalam translation packs, regional settings." },
  { num: "28", name: "Documents", desc: "Server-side PDF generator for Tabulation Sheets, Call Sheets, ID Badges." },
  { num: "29", name: "DevOps", desc: "CI/CD pipelines, Docker container registries, Vercel edge deployment." },
  { num: "30", name: "Troubleshooting", desc: "Diagnostic flowcharts, error code lookup, emergency override keys." },
  { num: "31", name: "FAQ", desc: "Frequently asked questions across registration, scoring, and publishing." },
  { num: "32", name: "Administrator Guide", desc: "Operational manual for Organization Owners and Festival Directors." },
  { num: "33", name: "Judge Guide", desc: "Digital tablet scoring manual and criterion evaluation rules." },
  { num: "34", name: "Volunteer Guide", desc: "Field duty guide, Call-room ushering, Badge scanning protocols." },
  { num: "35", name: "Finance Guide", desc: "Collecting registration fees, issuing digital receipts, reconciliation." },
  { num: "36", name: "Reception Guide", desc: "Front-desk participant verification, lost ID badge re-issuance." },
  { num: "37", name: "Medical Guide", desc: "Emergency medical hold procedure for stage performances." },
  { num: "38", name: "Inventory Guide", desc: "Barcode scanning for stage mics, props, trophies, badges." },
  { num: "39", name: "Video Tutorial Scripts", desc: "2-minute video tutorial scripts for staff onboarding." },
  { num: "40", name: "In-App Help Center", desc: "Embedded searchable docs portal at /dashboard/platform/docs." },
]

export default function FestProProductHelpCenter() {
  const [activeItem, setActiveItem] = useState("getting-started")
  const [searchQuery, setSearchQuery] = useState("")

  // AI Copilot state
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return

    setAiThinking(true)
    setAiAnswer(null)

    setTimeout(() => {
      setAiThinking(false)
      setAiAnswer(
        `[FestPro AI Copilot]: FestPro handles double-blind evaluation by generating randomized Code Letters (e.g. Chest 102 → Letter K) when a program starts. Judges score candidates on digital tablets using these Code Letters. Once submitted, the Tabulation Engine maps marks back to candidate identities for 100% impartial judging.`
      )
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              FP
            </div>
            <div>
              <h1 className="font-bold text-base text-white flex items-center gap-2">
                FestPro Official Enterprise Help Center <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono border border-indigo-400/30">v2.4.0-Enterprise</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">Complete Product Documentation, Learning Paths & AI Assistant</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 40 modules & guides (Ctrl+K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content Layout: Sidebar + Main Viewer */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6">
        {/* Left Navigation Tree */}
        <aside className="w-full md:w-72 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">Help Center Navigation</h2>

            <div className="space-y-4">
              {HELP_CENTER_SECTIONS.map((sec) => (
                <div key={sec.category} className="space-y-1">
                  <h3 className="text-[11px] font-bold text-indigo-600 px-2 py-1 bg-indigo-50/60 rounded-md">{sec.category}</h3>
                  <div className="space-y-0.5 pt-1">
                    {sec.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeItem === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveItem(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                            <span className="truncate">{item.title}</span>
                          </div>
                          {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/80" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Telemetry Badge */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                FestPro System Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Operational</span>
            </div>
            <p className="text-[11px] text-slate-400">WebSocket Clusters: 0ms Latency | RLS Security Enforcement: Active</p>
          </div>
        </aside>

        {/* Right Main Viewer */}
        <main className="flex-1 space-y-6">
          {/* AI Copilot Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-300 animate-spin-slow" />
              <h2 className="text-base font-bold text-white">Ask FestPro AI Copilot Assistant</h2>
            </div>
            <form onSubmit={handleAiAsk} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask any question e.g. 'How does double-blind evaluation work?'"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                type="submit"
                disabled={aiThinking}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                {aiThinking ? "Thinking..." : "Ask AI"}
              </button>
            </form>

            {aiAnswer && (
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-xs text-indigo-100 leading-relaxed animate-in fade-in duration-200">
                {aiAnswer}
              </div>
            )}
          </div>

          {/* Active Section Content Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            {activeItem === "getting-started" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-4">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                    Onboarding Module
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Welcome & 15-Minute Trial Guide</h2>
                  <p className="text-xs text-slate-500 mt-1">Complete beginner onboarding manual for running your first event without chaos.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 0-3</span>
                    <h4 className="font-bold text-slate-900 text-sm">Add Teams / Houses</h4>
                    <p className="text-xs text-slate-600">Navigate to /teams and add Red House (#EF4444) and Blue House (#3B82F6).</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 3-6</span>
                    <h4 className="font-bold text-slate-900 text-sm">Register Program</h4>
                    <p className="text-xs text-slate-600">Navigate to /competitions and add Light Music (Solo) under Senior Male.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 6-9</span>
                    <h4 className="font-bold text-slate-900 text-sm">Enroll Candidates & Print Badges</h4>
                    <p className="text-xs text-slate-600">Navigate to /participants and import candidate list via CSV or manual entry.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 9-15</span>
                    <h4 className="font-bold text-slate-900 text-sm">Score & Publish Results</h4>
                    <p className="text-xs text-slate-600">Enter marks on Judge Console /results/grades and click Approve & Publish.</p>
                  </div>
                </div>
              </div>
            )}

            {activeItem.startsWith("mod-") && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-extrabold text-slate-900">FestPro Master Systems Documentation (40 Modules)</h2>
                  <p className="text-xs text-slate-500 mt-1">Explore all system modules covering registration, stage scheduling, judge consoles, and APIs.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SYSTEM_MODULES_40.map((m) => (
                    <div key={m.num} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1 hover:border-indigo-400 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-bold text-[10px]">Module {m.num}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{m.name}</h4>
                      <p className="text-xs text-slate-600">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional tab fallbacks */}
            {activeItem === "learning-paths" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Role-Based Learning Paths</h3>
                <p className="text-xs text-slate-600">Select your operational role for tailored step-by-step guidance:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-bold text-sm text-slate-900">Festival Director</h4>
                    <p className="text-xs text-slate-600">Master scheduling, judge keys, and publishing.</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                    <Award className="h-5 w-5 text-purple-600" />
                    <h4 className="font-bold text-sm text-slate-900">Evaluator / Judge</h4>
                    <p className="text-xs text-slate-600">Digital tablet scoring and criterion rubrics.</p>
                  </div>
                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl space-y-1">
                    <Users className="h-5 w-5 text-pink-600" />
                    <h4 className="font-bold text-sm text-slate-900">Stage Manager</h4>
                    <p className="text-xs text-slate-600">Call-room QR check-in and stage timing control.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
