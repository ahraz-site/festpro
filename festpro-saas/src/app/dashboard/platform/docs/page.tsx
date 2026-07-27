"use client"

import { useState } from "react"
import {
  BookOpen, Server, Settings, Shield, Trophy, Users,
  CheckCircle2, ArrowRight, Layers, FileText, Lock, Sparkles, AlertTriangle, HelpCircle,
  Search, ExternalLink, Calendar, HeartPulse, Utensils, Home, Package, Zap, Smartphone, Database, Cpu
} from "lucide-react"

const MODULES_40 = [
  { id: "01", name: "01 Getting Started", cat: "Core", desc: "15-minute quick-start tutorial, account registration, system requirements." },
  { id: "02", name: "02 Organization", cat: "Core", desc: "Multi-tenant setup, custom domains, branding, SMTP gateway, member RBAC." },
  { id: "03", name: "03 Festival", cat: "Core", desc: "Festival creation, settings, dates, rules, stage infrastructure, lifecycle control." },
  { id: "04", name: "04 Competition", cat: "Core", desc: "Item registry, single vs group rules, time limits, chest number allocation." },
  { id: "05", name: "05 Participant", cat: "Core", desc: "Bulk CSV enrollment, eligibility verification, QR ID card badge generator." },
  { id: "06", name: "06 Schedule", cat: "Core", desc: "Drag-and-drop timeline constructor, multi-stage collision alerts." },
  { id: "07", name: "07 Judge", cat: "Core", desc: "Double-blind evaluation, Code Letter PIN console, offline IndexedDB sync." },
  { id: "08", name: "08 Result", cat: "Core", desc: "Mark verification, grade point calculator, tie-breaker resolution, publishing." },
  { id: "09", name: "09 Certificate", cat: "Core", desc: "Digital PDF E-certificate template builder, QR verification lookup portal." },

  { id: "10", name: "10 Finance", cat: "Logistics", desc: "Registration fees, budget tracking, sponsor pledges, automated receipts." },
  { id: "11", name: "11 Volunteer", cat: "Logistics", desc: "Staff duty shifts, checkpoint attendance, volunteer badge management." },
  { id: "12", name: "12 Help Desk", cat: "Logistics", desc: "Incident ticket tracking, query escalation, live participant support." },
  { id: "13", name: "13 Inventory", cat: "Logistics", desc: "Audio/lighting equipment tracking, stage asset allocation, stock audit." },
  { id: "14", name: "14 Accommodation", cat: "Logistics", desc: "Hostel room allocations, participant check-in/checkout, occupancy tracking." },
  { id: "15", name: "15 Food", cat: "Logistics", desc: "Meal ticket QR verification, dining hall entry logs, diet count reporting." },
  { id: "16", name: "16 Medical", cat: "Logistics", desc: "Emergency incident logs, ambulance dispatch, candidate medical hold flags." },

  { id: "17", name: "17 Notifications", cat: "Platform", desc: "SMS alerts, email broadcasts, automated mobile push notifications." },
  { id: "18", name: "18 Public Website", cat: "Platform", desc: "Live event portal, stage schedules, team point leaderboards, photo gallery." },
  { id: "19", name: "19 Mobile App", cat: "Platform", desc: "Native/PWA offline app for Stage Managers, Judges, and Security Checkpoints." },
  { id: "20", name: "20 SaaS", cat: "Platform", desc: "Subscription plans, tenant quotas, white-label custom domain manager." },
  { id: "21", name: "21 AI", cat: "Platform", desc: "Automated schedule optimizer, candidate conflict predictor, AI Copilot." },
  { id: "22", name: "22 Analytics", cat: "Platform", desc: "Live stage throughput metrics, judge scoring curve charts, team progress." },
  { id: "23", name: "23 API", cat: "Platform", desc: "REST API reference, Webhook events, SDK integrations, API key scope manager." },
  { id: "24", name: "24 Security", cat: "Platform", desc: "Supabase RLS policies, IP whitelisting, audit logs, OWASP compliance." },
  { id: "25", name: "25 Backup", cat: "Platform", desc: "Automated PostgreSQL database snapshots, RTO/RPO disaster recovery." },
  { id: "26", name: "26 Monitoring", cat: "Platform", desc: "Real-time WebSocket health metrics, latency monitors, incident alerts." },
  { id: "27", name: "27 Localization", cat: "Platform", desc: "English & Anek Malayalam translation packs, regional settings." },
  { id: "28", name: "28 Documents", cat: "Platform", desc: "Official printables, tabulation sheets, program schedules, PDF exports." },
  { id: "29", name: "29 DevOps", cat: "Platform", desc: "CI/CD pipelines, Docker container registries, Vercel edge deployment." },
  { id: "30", name: "30 Troubleshooting", cat: "Platform", desc: "Diagnostic flowcharts, error code lookup, emergency override keys." },

  { id: "31", name: "31 FAQ", cat: "Guides", desc: "Frequently asked questions across registration, scoring, and publishing." },
  { id: "32", name: "32 Administrator Guide", cat: "Guides", desc: "Advanced platform administration, tenant onboarding, system parameters." },
  { id: "33", name: "33 Judge Guide", cat: "Guides", desc: "Step-by-step digital tablet scoring guide, criterion evaluation rules." },
  { id: "34", name: "34 Volunteer Guide", cat: "Guides", desc: "Shift duties, stage ushering, participant call-room check-in guide." },
  { id: "35", name: "35 Finance Guide", cat: "Guides", desc: "Collecting registration fees, issuing digital receipts, budget reconciliation." },
  { id: "36", name: "36 Reception Guide", cat: "Guides", desc: "Participant registration desk, badge issuance, lost ID card replacement." },
  { id: "37", name: "37 Medical Guide", cat: "Guides", desc: "Emergency first-aid protocols, candidate medical pause procedure." },
  { id: "38", name: "38 Inventory Guide", cat: "Guides", desc: "Issue/return of stage microphones, props, trophies, and badges." },
  { id: "39", name: "39 Video Tutorial Scripts", cat: "Guides", desc: "Step-by-step video scripts for training new staff and stage leads." },
  { id: "40", name: "40 In-App Help Center", cat: "Guides", desc: "Embedded searchable docs portal, command palette integrations." },
]

export default function EnterpriseDocsPage() {
  const [search, setSearch] = useState("")
  const [selectedCat, setSelectedCat] = useState("All")

  const filteredModules = MODULES_40.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCat === "All" || m.cat === selectedCat
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-xs text-indigo-200">
          <BookOpen className="h-4 w-4 text-indigo-300" /> FestPro Enterprise Help Center — Complete 40-Module Master Manual
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          System Documentation & Knowledge Base
        </h1>
        <p className="text-indigo-200 text-sm sm:text-base max-w-3xl leading-relaxed">
          Search all 40 official operational modules covering system architecture, role guides, logistics, judge consoles, and developer APIs.
        </p>

        {/* Search Bar & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
            <input
              type="text"
              placeholder="Search documentation by title, keyword, or module number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm font-semibold text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", "Core", "Logistics", "Platform", "Guides"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCat === cat
                    ? "bg-white text-indigo-900 shadow-md scale-105"
                    : "bg-white/10 text-indigo-200 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 40 Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all space-y-3 relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-100">
                Module {m.id}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                {m.cat}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
