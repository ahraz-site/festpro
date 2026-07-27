"use client"

import { useState } from "react"
import {
  BookOpen, Search, Sparkles, Server, Shield, Trophy, Users,
  CheckCircle2, ArrowRight, Layers, FileText, Lock, AlertTriangle, HelpCircle,
  Video, Play, Terminal, ChevronRight, Activity, Cpu, Globe, LifeBuoy,
  MessageSquare, Compass, Award, ExternalLink, Zap, RefreshCw, Bookmark, Home
} from "lucide-react"

// ────────────────────────────────────────────
// BILINGUAL 40 SYSTEM MODULES DATA
// ────────────────────────────────────────────

const SYSTEM_MODULES_40 = [
  { num: "01", en: "Getting Started", ml: "ആരംഭിക്കാം (Getting Started)", descEn: "15-minute onboarding tutorial, account setup, system requirements.", descMl: "15 മിനിറ്റ് തുടക്കക്കാർക്കുള്ള ട്യൂട്ടോറിയൽ, അക്കൗണ്ട് സജ്ജീകരണം, സിസ്റ്റം ആവശ്യകതകൾ." },
  { num: "02", name: "02 Organization", en: "Organization Guide", ml: "ഓർഗനൈസേഷൻ ഗൈഡ്", descEn: "Multi-tenant architecture, custom domains, branding, SMTP gateway, RBAC.", descMl: "മൾട്ടി-ടെനന്റ് ഘടന, കസ്റ്റം ഡൊമെയ്ൻ, ബ്രാൻഡിംഗ്, SMTP, അംഗങ്ങളുടെ അധികാരം." },
  { num: "03", en: "Festival Management", ml: "ഫെസ്റ്റിവൽ മാനേജ്‌മെന്റ്", descEn: "Festival creation, dates, settings, rules, stage infrastructure, lifecycle.", descMl: "ഫെസ്റ്റിവൽ നിർമ്മാണം, തീയതികൾ, സെറ്റിംഗ്സുകൾ, നിയമങ്ങൾ, സ്റ്റേജ് ഘടന." },
  { num: "04", en: "Competition Registry", ml: "മത്സര ഇനങ്ങൾ (Competition)", descEn: "Item registry, solo vs group rules, time limits, chest number mode.", descMl: "മത്സര ഇനങ്ങൾ, സിംഗിൾ/ഗ്രൂപ്പ് നിയമങ്ങൾ, സമയം, ചെസ്റ്റ് നമ്പർ മോഡ്." },
  { num: "05", en: "Participant Enrollment", ml: "മത്സരാർത്ഥികൾ (Participants)", descEn: "Bulk CSV candidate import, eligibility validation, QR ID badge generator.", descMl: "CSV വഴി രജിസ്ട്രേഷൻ, യോഗ്യതാ പരിശോധന, ക്യുആർ ഐഡി കാർഡ് ജനറേറ്റർ." },
  { num: "06", en: "Stage Schedule Builder", ml: "സ്റ്റേജ് ഷെഡ്യൂൾ (Schedule)", descEn: "Drag-and-drop timeline builder, candidate collision alert engine.", descMl: "ഡ്രാഗ് ആൻഡ് ഡ്രോപ്പ് ടൈംലൈൻ, ഒരേസമയം രണ്ടു സ്റ്റേജിൽ വരുന്ന സമയം കണ്ടെത്തൽ." },
  { num: "07", en: "Judge Console", ml: "ഡിജിറ്റൽ ജഡ്ജ് കോൺസോൾ", descEn: "Double-blind evaluation, Code Letter PIN console, offline IndexedDB sync.", descMl: "കോഡ് ലെറ്റർ ജഡ്ജിംഗ്, പിൻ നമ്പറുള്ള ഡിജിറ്റൽ ടാബ്‌ലെറ്റ് സ്കോറിംഗ്." },
  { num: "08", en: "Results & Tabulation", ml: "ഫലപ്രഖ്യാപനവും ടാബുലേഷനും", descEn: "Mark verification, grade point calculator, tie-breaker resolution, publishing.", descMl: "മാർക്ക് എന്റ്രി, ഗ്രേഡ് പോയിന്റ് കാൽക്കുലേറ്റർ, തത്സമയ ഫലപ്രഖ്യാപനം." },
  { num: "09", en: "E-Certificate Generator", ml: "ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റുകൾ", descEn: "Digital PDF E-certificate builder, QR verification lookup portal.", descMl: "ഡിജിറ്റൽ PDF സർട്ടിഫിക്കറ്റ് ഡിസൈനർ, വ്യാജമല്ലാത്ത QR പരിശോധന." },
  { num: "10", en: "Finance & Receipts", ml: "ധനകാര്യവും രസീതുകളും", descEn: "Registration fees, payment receipts, sponsor pledges, budget tracking.", descMl: "രജിസ്ട്രേഷൻ ഫീസ്, പണമടച്ച രസീതുകൾ, സ്പോൺസർ കണക്കുകൾ." },
  { num: "11", en: "Volunteer Management", ml: "വോളണ്ടിയർ ഡ്യൂട്ടികൾ", descEn: "Shift rosters, checkpoint duty attendance, scanner badge management.", descMl: "വോളണ്ടിയർ ഷിഫ്റ്റുകൾ, ചെക്ക്‌പോയിന്റ് ക്യുആർ ഹാജർ പട്ടി." },
  { num: "12", en: "Help Desk Support", ml: "ഹെൽപ്പ് ഡെസ്ക് (Support)", descEn: "Incident tickets, query escalation, live participant support desk.", descMl: "പരാതിപരിഹാര ഡെസ്ക്, സംശയ നിവാരണം, ലൈവ് ഹെൽപ്പ്." },
  { num: "13", en: "Inventory Assets", ml: "ഇൻവെന്ററി & സ്റ്റേജ് സാമഗ്രികൾ", descEn: "Audio/visual equipment tracking, microphone & trophy stock audit.", descMl: "മൈക്ക്, സൗണ്ട് സിസ്റ്റം, ട്രോഫികൾ എന്നിവയുടെ സ്റ്റോക്ക് മാനേജ്‌മെന്റ്." },
  { num: "14", en: "Accommodation Hostel", ml: "താമസം (Accommodation)", descEn: "Hostel room allocation, occupancy tracking, participant check-in.", descMl: "മത്സരാർത്ഥികളുടെ മുറി വിതരണം, ഹോസ്റ്റൽ ചെക്കിൻ." },
  { num: "15", en: "Food Catering Coupons", ml: "ഭക്ഷണ കൂപ്പണുകൾ (Food)", descEn: "Dining hall QR coupon verification, meal count logging, diet reports.", descMl: "ഭക്ഷണ ഹാൾ ക്യുആർ പരിശോധന, ഭക്ഷണ കൂപ്പൺ വാലിഡേഷൻ." },
  { num: "16", en: "Medical First Aid", ml: "മെഡിക്കൽ & പ്രഥമശുശ്രൂഷ", descEn: "Emergency incident logging, candidate medical pause procedure.", descMl: "അടിയന്തിര വൈദ്യസഹായം, പ്രഥമശുശ്രൂഷ ലോഗുകൾ." },
  { num: "17", en: "Notifications Gateway", ml: "അറിയിപ്പുകൾ (Notifications)", descEn: "SMS alerts, email broadcasts, automated mobile push notifications.", descMl: "എസ്എംഎസ്, ഇമെയിൽ, മെസ്സേജ് നോട്ടിഫിക്കേഷനുകൾ." },
  { num: "18", en: "Public Event Website", ml: "പൊതുജന പോർട്ടൽ (Public Site)", descEn: "Public portal /festivals/[id], live stage LED tickers /live.", descMl: "പൊതുജനങ്ങൾക്കുള്ള ലൈവ് വെബ്‌സൈറ്റും എൽഇഡി സ്ക്രീനും." },
  { num: "19", en: "Mobile App PWA", ml: "മൊബൈൽ ആപ്പ് (Mobile App)", descEn: "Native / PWA app for Stage Managers, Security Checkpoints, Judges.", descMl: "സ്റ്റേജ് മാനേജർമാർക്കും ജഡ്ജിമാർക്കുമുള്ള മൊബൈൽ ആപ്പ്." },
  { num: "20", en: "SaaS Tenant Subscriptions", ml: "SaaS വരിസംഖ്യ (Subscriptions)", descEn: "Subscription plans, tenant quotas, white-label custom domain manager.", descMl: "സബ്‌സ്‌ക്രിപ്‌ഷൻ പ്ലാനുകളും ക്വാട്ടകളും." },
  { num: "21", en: "AI Schedule Optimizer", ml: "AI അസിസ്റ്റന്റും ഒപ്റ്റിമൈസറും", descEn: "AI Copilot, candidate conflict predictor, schedule optimizer.", descMl: "AI ഷെഡ്യൂൾ ഒപ്റ്റിമൈസർ, സമയതടസ്സങ്ങൾ മുൻകൂട്ടി കണ്ടെത്തൽ." },
  { num: "22", en: "Real-Time Analytics", ml: "തത്സമയ വിശകലനം (Analytics)", descEn: "Stage throughput metrics, judge scoring curve charts, team progress.", descMl: "സ്റ്റേജ് പ്രോഗ്രസ് ഗ്രാഫുകളും ജഡ്ജിംഗ് അനലിറ്റിക്‌സും." },
  { num: "23", en: "REST API & Webhooks", ml: "REST API & ഡെവലപ്പർ ടൂളുകൾ", descEn: "REST API v2 reference, Webhook events, SDK key scope manager.", descMl: "ഡെവലപ്പർമാർക്കുള്ള REST API, വെബ്‌ഹുക്കുകൾ." },
  { num: "24", en: "Security & OWASP", ml: "സുരക്ഷ (Security & RLS)", descEn: "Supabase RLS policies, IP whitelisting, audit logs, OWASP compliance.", descMl: "സുരക്ഷിതമായ ഡാറ്റാ പോളിസികളും ഐപി നിയന്ത്രണങ്ങളും." },
  { num: "25", en: "PostgreSQL Database Backup", ml: "ഡാറ്റാ ബാക്കപ്പ് (Backup)", descEn: "Automated PostgreSQL snapshots, point-in-time (PITR) disaster recovery.", descMl: "ഓട്ടോമേറ്റഡ് ദിനംപ്രതിയുള്ള ഡാറ്റാ ബാക്കപ്പ്." },
  { num: "26", en: "Telemetry Monitoring", ml: "സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണം", descEn: "WebSocket telemetry, server response latency, incident alerts.", descMl: "വെബ്‌സോക്കറ്റ് ലൈവ് ഹെൽത്ത് മോണിറ്ററിംഗ്." },
  { num: "27", en: "Localization & i18n", ml: "ഭാഷാ സഹായം (Localization)", descEn: "English & Anek Malayalam translation packs, regional settings.", descMl: "ഇംഗ്ലീഷ് & അനെക് മലയാളം ഭാഷാ സെറ്റിംഗുകൾ." },
  { num: "28", en: "Documents PDF Engine", ml: "ഔദ്യോഗിക ഡോക്യുമെന്റുകൾ", descEn: "Server-side PDF generator for Tabulation Sheets, Call Sheets, ID Badging.", descMl: "സ്കോർ ഷീറ്റുകൾ, കാൾ ഷീറ്റുകൾ, PDF പ്രിന്റൗട്ടുകൾ." },
  { num: "29", en: "DevOps Deployments", ml: "DevOps & എഡ്ജ് നെറ്റ്വർക്ക്", descEn: "CI/CD pipelines, Docker container registries, Vercel edge deployment.", descMl: "CI/CD പൈപ്പ്‌ലൈനുകളും എഡ്ജ് നെറ്റ്‌വർക്കുകളും." },
  { num: "30", en: "Troubleshooting Guide", ml: "തടസ്സപരിഹാരം (Troubleshooting)", descEn: "Diagnostic flowcharts, error code lookup, emergency override keys.", descMl: "പ്രശ്നപരിഹാര വഴികളും എറർ കോഡുകളും." },
  { num: "31", en: "Frequently Asked Questions", ml: "ചോദ്യോത്തരങ്ങൾ (FAQ)", descEn: "Frequently asked questions across registration, scoring, and publishing.", descMl: "സാധാരണയായി ചോദിക്കുന്ന സംശയങ്ങളും ഉത്തരങ്ങളും." },
  { num: "32", en: "Administrator Master Manual", ml: "അഡ്മിനിസ്ട്രേറ്റർ ഗൈഡ്", descEn: "Operational manual for Organization Owners and Festival Directors.", descMl: "ഓർഗനൈസേഷൻ ഉടമകൾക്കും ഡയറക്ടർമാർക്കുമുള്ള ഗൈഡ്." },
  { num: "33", en: "Judge Tablet Scoring Manual", ml: "ജഡ്ജസ് ഗൈഡ് (Judge Manual)", descEn: "Digital tablet scoring manual and criterion evaluation rules.", descMl: "ഡിജിറ്റൽ ടാബ്‌ലെറ്റിൽ മാർക്കിടുന്നതിനുള്ള ലളിതമായ ഗൈഡ്." },
  { num: "34", en: "Volunteer Field Guide", ml: "വോളണ്ടിയർ ഗൈഡ്", descEn: "Field duty guide, Call-room ushering, Badge scanning protocols.", descMl: "വോളണ്ടിയർമാർക്കുള്ള ഗ്രൗണ്ട് ഡ്യൂട്ടി ഗൈഡ്." },
  { num: "35", en: "Finance Treasurer Manual", ml: "ട്രഷറർ & ഫിനാൻസ് ഗൈഡ്", descEn: "Collecting registration fees, issuing digital receipts, reconciliation.", descMl: "ഫീസ് പിരിവും കണക്കെഴുത്തും ഡിജിറ്റൽ ഗൈഡ്." },
  { num: "36", en: "Reception Front Desk Guide", ml: "ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ ഗൈഡ്", descEn: "Participant registration desk, lost ID badge re-issuance.", descMl: "മത്സരാർത്ഥികളുടെ വരവും പുതിയ കാർഡ് നൽകലും." },
  { num: "37", en: "Medical First-Aid Protocol", ml: "മെഡിക്കൽ ടീം പ്രോട്ടോക്കോൾ", descEn: "Emergency medical hold procedure for stage performances.", descMl: "അടിയന്തിര വൈദ്യസഹായ പ്രോട്ടോക്കോൾ." },
  { num: "38", en: "Inventory Storekeeper Manual", ml: "സ്റ്റോർകീപ്പർ ഗൈഡ്", descEn: "Barcode scanning for stage mics, props, trophies, badges.", descMl: "സാധനങ്ങൾ നൽകലും തിരികെ വാങ്ങലും ലോഗ്." },
  { num: "39", en: "Video Tutorial Scripts", ml: "വീഡിയോ ട്യൂട്ടോറിയൽ സ്ക്രിപ്റ്റുകൾ", descEn: "2-minute video tutorial scripts for staff onboarding.", descMl: "2 മിനിറ്റ് പരിശീലന വീഡിയോ സ്ക്രിപ്റ്റുകൾ." },
  { num: "40", name: "40 Help Center Portal", en: "FestPro In-App Help Center", ml: "ഹെൽപ്പ് സെന്റർ പോർട്ടൽ", descEn: "Embedded searchable docs portal at /dashboard/platform/docs.", descMl: "ആപ്പിനുള്ളിലെ സമ്പൂർണ്ണ ഹെൽപ്പ് സെന്റർ പോർട്ടൽ." },
]

export default function FestProProductHelpCenter() {
  const [lang, setLang] = useState<"en" | "ml">("en")
  const [activeItem, setActiveItem] = useState("getting-started")
  const [searchQuery, setSearchQuery] = useState("")

  // AI Copilot state
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  const isMl = lang === "ml"

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return

    setAiThinking(true)
    setAiAnswer(null)

    setTimeout(() => {
      setAiThinking(false)
      setAiAnswer(
        isMl
          ? `[FestPro AI Copilot]: FestPro-യിൽ ജഡ്ജിംഗ് സമ്പൂർണ്ണമായും പഷ്പക്ഷമായിരിക്കാൻ കോഡ് ലെറ്റർ സിസ്റ്റം (Double-Blind Evaluation) ഉപയോഗിക്കുന്നു. മത്സരം ആരംഭിക്കുമ്പോൾ ചെസ്റ്റ് നമ്പറുകൾക്ക് പകരം ക്രമമില്ലാത്ത അക്ഷരങ്ങൾ (ഉദാഹരണത്തിന്: Chest 102 → Letter K) ജഡ്ജിയുടെ ടാബ്‌ലെറ്റിൽ കാണിക്കും. മാർക്കുകൾ നൽകി സബ്മിറ്റ് ചെയ്ത ഉടൻ സിസ്റ്റം സ്വയം ഈ മാർക്കുകൾ ശരിയായ മത്സരാർത്ഥിയുടെ അക്കൗണ്ടിലേക്ക് മാറ്റുന്നതാണ്.`
          : `[FestPro AI Copilot]: FestPro handles double-blind evaluation by generating randomized Code Letters (e.g. Chest 102 → Letter K) when a program starts. Judges score candidates on digital tablets using these Code Letters. Once submitted, the Tabulation Engine maps marks back to candidate identities for 100% impartial judging.`
      )
    }, 800)
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col ${isMl ? "font-anek" : "font-sans"}`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              FP
            </div>
            <div>
              <h1 className={`text-base text-white flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                {isMl ? "FestPro ഒഫീഷ്യൽ എന്റർപ്രൈസ് ഹെൽപ്പ് സെന്റർ" : "FestPro Official Enterprise Help Center"}
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono border border-indigo-400/30">v2.4.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isMl ? "സമ്പൂർണ്ണ സിസ്റ്റം ഡോക്യുമെന്റേഷൻ, പഠനവഴികൾ & AI അസിസ്റ്റന്റ്" : "Complete Product Documentation, Learning Paths & AI Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-full border border-slate-700">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  lang === "en" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-3 py-1 text-xs font-bold rounded-full font-anek transition-all ${
                  lang === "ml" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                മലയാളം
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={isMl ? "തിരയുക (Search 40 modules)..." : "Search 40 modules & guides..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Sidebar + Main Viewer */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6">
        {/* Left Navigation Tree */}
        <aside className="w-full md:w-72 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">
              {isMl ? "ഹെൽപ്പ് സെന്റർ നാവിഗേഷൻ" : "Help Center Navigation"}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-indigo-600 px-2 py-1 bg-indigo-50/60 rounded-md">
                  {isMl ? "🚀 തുടക്കക്കാർക്കുള്ള ഗൈഡ്" : "🚀 Onboarding & Quick Start"}
                </h3>
                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => setActiveItem("getting-started")}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeItem === "getting-started" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="h-4 w-4 shrink-0" />
                      <span>{isMl ? "15-മിനിറ്റ് ക്വിക്ക് സ്റ്റാർട്ട്" : "15-Minute Trial Guide"}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-indigo-600 px-2 py-1 bg-indigo-50/60 rounded-md">
                  {isMl ? "📚 40 സമ്പൂർണ്ണ സിസ്റ്റം മോഡ്യൂളുകൾ" : "📚 Core Operations Manuals (40 Modules)"}
                </h3>
                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => setActiveItem("all-modules")}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeItem === "all-modules" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 shrink-0" />
                      <span>{isMl ? "40 മോഡ്യൂളുകളുടെ ലിസ്റ്റ്" : "All 40 Modules List"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Telemetry Badge */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {isMl ? "സിസ്റ്റം ഹെൽത്ത് സ്റ്റാറ്റസ്" : "FestPro System Status"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Active</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isMl ? "വെബ്‌സോക്കറ്റ് ക്ലസ്റ്ററുകൾ: 0ms വൈകൽ | സുരക്ഷ: RLS Active" : "WebSocket Clusters: 0ms Latency | RLS Security Enforcement: Active"}
            </p>
          </div>
        </aside>

        {/* Right Main Viewer */}
        <main className="flex-1 space-y-6">
          {/* AI Copilot Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-300 animate-spin-slow" />
              <h2 className={`text-base text-white ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                {isMl ? "FestPro AI Copilot അസിസ്റ്റന്റിനോട് ചോദിക്കാം" : "Ask FestPro AI Copilot Assistant"}
              </h2>
            </div>
            <form onSubmit={handleAiAsk} className="flex gap-2">
              <input
                type="text"
                placeholder={isMl ? "ചോദ്യം ചോദിക്കൂ... e.g. 'ജഡ്ജിംഗ് കോഡ് ലെറ്റർ എങ്ങനെ പ്രവർത്തിക്കും?'" : "Ask any question e.g. 'How does double-blind evaluation work?'"}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                type="submit"
                disabled={aiThinking}
                className={`px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer ${isMl ? "font-anek" : "font-sans"}`}
              >
                {aiThinking ? (isMl ? "ചിന്തിക്കുന്നു..." : "Thinking...") : (isMl ? "ചോദിക്കൂ" : "Ask AI")}
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
                    {isMl ? "തുടക്കക്കാർക്കുള്ള ഗൈഡ്" : "Onboarding Module"}
                  </span>
                  <h2 className={`text-2xl text-slate-900 mt-2 ${isMl ? "font-anek font-bold" : "font-heading font-extrabold"}`}>
                    {isMl ? "സ്വയം പഠിച്ച് 15 മിനിറ്റിൽ കലോത്സവം തുടങ്ങാം!" : "Welcome & 15-Minute Trial Guide"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMl ? "മുൻ പരിചയമില്ലാതെ തന്നെ FestPro വഴി നിങ്ങളുടെ ആദ്യ ഇവന്റ് സുഗമമായി നടത്താം." : "Complete beginner onboarding manual for running your first event without chaos."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 0-3</span>
                    <h4 className={`text-slate-900 text-sm ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>{isMl ? "1. ഹൗസുകൾ ചേർക്കുക" : "1. Add Teams / Houses"}</h4>
                    <p className="text-xs text-slate-600">
                      {isMl ? "/teams പേജിൽ പോയി റെഡ് ഹൗസ്, ബ്ലൂ ഹൗസ് എന്നിവ ചേർക്കുക." : "Navigate to /teams and add Red House (#EF4444) and Blue House (#3B82F6)."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 3-6</span>
                    <h4 className={`text-slate-900 text-sm ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>{isMl ? "2. മത്സരം ഉണ്ടാക്കുക" : "2. Register Program"}</h4>
                    <p className="text-xs text-slate-600">
                      {isMl ? "/competitions പേജിൽ പോയി 'ലളിതഗാനം (സീനിയർ)' നിർമ്മിക്കുക." : "Navigate to /competitions and add Light Music (Solo) under Senior Male."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 6-9</span>
                    <h4 className={`text-slate-900 text-sm ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>{isMl ? "3. മത്സരാർത്ഥികളും കാർഡും" : "3. Enroll Candidates & Print Badges"}</h4>
                    <p className="text-xs text-slate-600">
                      {isMl ? "/participants വഴി മത്സരാർത്ഥികളെ ചേർത്ത് QR ഐഡി ബാഡ്ജ് പ്രിന്റ് ചെയ്യാം." : "Navigate to /participants and import candidate list via CSV or manual entry."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">Min 9-15</span>
                    <h4 className={`text-slate-900 text-sm ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>{isMl ? "4. ജഡ്ജിംഗ് കോൺസോൾ" : "4. Score & Publish Results"}</h4>
                    <p className="text-xs text-slate-600">
                      {isMl ? "/results/grades പേജ് വഴി മാർക്കിട്ട് റിസൾട്ട് പ്രസിദ്ധീകരിക്കൂ." : "Enter marks on Judge Console /results/grades and click Approve & Publish."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 40 Modules List Display */}
            {activeItem === "all-modules" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className={`text-2xl text-slate-900 ${isMl ? "font-anek font-bold" : "font-heading font-extrabold"}`}>
                    {isMl ? "40 സമ്പൂർണ്ണ സിസ്റ്റം മോഡ്യൂളുകൾ" : "FestPro Master Systems Documentation (40 Modules)"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMl ? "എല്ലാ സിസ്റ്റം മോഡ്യൂളുകളുടെയും മലയാളത്തിലുള്ള ഗൈഡ് താഴെ കാണാം." : "Explore all system modules covering registration, stage scheduling, judge consoles, and APIs."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SYSTEM_MODULES_40.map((m) => (
                    <div key={m.num} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1 hover:border-indigo-400 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-bold text-[10px]">Module {m.num}</span>
                      </div>
                      <h4 className={`text-slate-900 text-sm mt-1 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>{isMl ? m.ml : (m.en || m.name)}</h4>
                      <p className="text-xs text-slate-600">{isMl ? m.descMl : m.descEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
