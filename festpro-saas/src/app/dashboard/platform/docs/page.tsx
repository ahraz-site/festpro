"use client"

import { useState } from "react"
import {
  BookOpen, Server, Settings, Shield, Trophy, Users,
  CheckCircle2, ArrowRight, Layers, FileText, Lock, Sparkles, AlertTriangle, HelpCircle
} from "lucide-react"

export default function EnterpriseDocsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-xs text-indigo-200">
          <BookOpen className="h-4 w-4 text-indigo-300" /> FestPro Enterprise Help Center v2.4.0
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Official Documentation & User Manual
        </h1>
        <p className="text-indigo-200 text-sm sm:text-base max-w-3xl leading-relaxed">
          Comprehensive step-by-step documentation for Organization Owners, Festival Directors, Stage Managers, Tabulators, and Judges.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
          {[
            { id: "getting-started", label: "🚀 Getting Started (15-Min Guide)" },
            { id: "org-guide", label: "🏢 Organization Admin Guide" },
            { id: "festival-guide", label: "🎪 Festival Management Guide" },
            { id: "overview", label: "System Overview" },
            { id: "roles", label: "RBAC & Permissions" },
            { id: "setup", label: "Organization & Festival Setup" },
            { id: "judging", label: "Digital Judge Console" },
            { id: "tabulation", label: "Tabulation & Grade Points" },
            { id: "faq", label: "FAQ & Troubleshooting" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-900 shadow-md scale-105"
                  : "bg-white/10 text-indigo-200 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-8">
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Server className="h-6 w-6 text-indigo-600" /> Executive Architecture & System Overview
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                FestPro is an enterprise-grade multi-tenant platform built for zero-paperwork festival operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Multi-Tenant Isolation</h3>
                <p className="text-xs text-slate-600">Strict Supabase RLS policies guarantee data boundary between institutions.</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                <Lock className="h-6 w-6 text-purple-600" />
                <h3 className="font-bold text-slate-900">Double-Blind Evaluation</h3>
                <p className="text-xs text-slate-600">Randomized Code Letters hide candidate identities from judges for 100% bias-free scoring.</p>
              </div>

              <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2">
                <Sparkles className="h-6 w-6 text-pink-600" />
                <h3 className="font-bold text-slate-900">0ms Real-Time Leaderboard</h3>
                <p className="text-xs text-slate-600">WebSocket state synchronization streams live team points directly to stage LED screens.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Users className="h-6 w-6 text-indigo-600" /> Role-Based Access Control (RBAC)
              </h2>
              <p className="text-sm text-slate-500 mt-1">Enforced permissions across organization and festival operational scopes.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Role</th>
                    <th className="p-3">Scope</th>
                    <th className="p-3">Key Capabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-indigo-600">Organization Owner</td>
                    <td className="p-3">Organization Level</td>
                    <td className="p-3 text-slate-600">Full system control, billing, custom domain binding, inviting admins.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Festival Director</td>
                    <td className="p-3">Festival Level</td>
                    <td className="p-3 text-slate-600">Stage scheduling, program creation, judge key allocation, results approval.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Stage Manager</td>
                    <td className="p-3">Stage Specific</td>
                    <td className="p-3 text-slate-600">Call-room checkin, QR scanning, program start/stop execution.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Judge</td>
                    <td className="p-3">Program PIN Access</td>
                    <td className="p-3 text-slate-600">Single-blind candidate scoring via Digital Judge Console.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "setup" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Settings className="h-6 w-6 text-indigo-600" /> Organization & Festival Setup Workflow
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { step: "Step 1", title: "Create Organization & Teams", desc: "Set up houses (Red House, Blue House) with unique color hex codes and house managers." },
                { step: "Step 2", title: "Configure Categories & Programs", desc: "Add age divisions (Sub-Junior, Senior) and competitions (Solo Song, Group Dance)." },
                { step: "Step 3", title: "Enroll Participants & Print QR Passes", desc: "Upload candidate list via CSV and generate batch 8-per-page printable ID cards." },
                { step: "Step 4", title: "Stage Scheduling", desc: "Drag and drop programs onto venue timelines with automatic collision detection." },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-xs h-fit shrink-0">{s.step}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "judging" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-indigo-600" /> Digital Judge Console
              </h2>
            </div>
            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
              <h4 className="font-bold text-indigo-900 text-sm">How Double-Blind Evaluation Works</h4>
              <p className="text-xs text-indigo-800 leading-relaxed">
                When a program starts, FestPro automatically maps candidate Chest Numbers to randomized Code Letters (e.g. Chest 102 → Letter K). Judges evaluate strictly by Code Letter on digital tablets.
              </p>
            </div>
          </div>
        )}

        {activeTab === "tabulation" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Layers className="h-6 w-6 text-indigo-600" /> Tabulation & Grade Point Standard
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="p-3">Percentage Score</th>
                    <th className="p-3">Grade Awarded</th>
                    <th className="p-3">Single Item Points</th>
                    <th className="p-3">Group Item Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr><td className="p-3">80% – 100%</td><td className="p-3 font-bold text-indigo-600">A Grade</td><td className="p-3">5 Points</td><td className="p-3">10 Points</td></tr>
                  <tr><td className="p-3">70% – 79%</td><td className="p-3 font-bold text-slate-800">B Grade</td><td className="p-3">3 Points</td><td className="p-3">6 Points</td></tr>
                  <tr><td className="p-3">60% – 69%</td><td className="p-3 font-bold text-slate-600">C Grade</td><td className="p-3">1 Point</td><td className="p-3">2 Points</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-indigo-600" /> FAQ & Troubleshooting
              </h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Q: What if internet drops during a stage event?</h4>
                <p className="text-xs text-slate-600">FestPro Judge Console uses Service Worker local storage to store offline marks. Once connection returns, marks auto-sync to Supabase instantly.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
