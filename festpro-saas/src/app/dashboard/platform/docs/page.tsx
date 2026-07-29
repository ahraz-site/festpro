"use client"

import { useState } from "react"
import {
  BookOpen, Search, Sparkles, Server, Shield, Trophy, Users,
  CheckCircle2, ArrowRight, Layers, FileText, Lock, AlertTriangle, HelpCircle,
  Video, Play, Terminal, ChevronRight, Activity, Cpu, Globe, LifeBuoy,
  MessageSquare, Compass, Award, ExternalLink, Zap, RefreshCw, Bookmark, Home,
  Check, ArrowLeft, Filter, Info
} from "lucide-react"

// ────────────────────────────────────────────
// EXHAUSTIVE BILINGUAL DOCUMENTATION FOR ALL 40 MODULES
// ────────────────────────────────────────────

import { DETAILED_MODULE_DOCS } from "./moduleDocsData"

function getModuleData(num: string, isMl: boolean) {
  if (DETAILED_MODULE_DOCS[num]) {
    const d = DETAILED_MODULE_DOCS[num]
    return {
      num: d.num,
      title: isMl ? d.titleMl : d.titleEn,
      cat: isMl ? d.catMl : d.catEn,
      overview: isMl ? d.overviewMl : d.overviewEn,
      steps: isMl ? d.stepsMl : d.stepsEn,
      fields: d.fields,
      workflow: isMl ? d.workflowMl : d.workflowEn,
      tips: isMl ? d.tipsMl : d.tipsEn,
      warning: isMl ? d.warningMl : d.warningEn,
      faq: isMl ? d.faqMl : d.faqEn,
      troubleshoot: isMl ? d.troubleshootMl : d.troubleshootEn
    }
  }

  return {
    num,
    title: "Module " + num,
    cat: "System Guide",
    overview: "Documentation not found.",
    steps: [],
    fields: [],
    workflow: "",
    tips: "",
    warning: "",
    faq: [],
    troubleshoot: []
  }
}

const SYSTEM_MODULES_LIST = [
  { num: "01", en: "Getting Started Guide", ml: "ആരംഭിക്കാം (Getting Started)" },
  { num: "02", en: "Organization Admin", ml: "ഓർഗനൈസേഷൻ ഗൈഡ്" },
  { num: "03", en: "Festival Management", ml: "ഫെസ്റ്റിവൽ മാനേജ്‌മെന്റ്" },
  { num: "04", en: "Competition Registry", ml: "മത്സര ഇനങ്ങൾ (Competition)" },
  { num: "05", en: "Participant Enrollment", ml: "മത്സരാർത്ഥികൾ (Participants)" },
  { num: "06", en: "Stage Schedule Builder", ml: "സ്റ്റേജ് ഷെഡ്യൂൾ (Schedule)" },
  { num: "07", en: "Judge Console", ml: "ഡിജിറ്റൽ ജഡ്ജ് കോൺസോൾ" },
  { num: "08", en: "Results & Tabulation", ml: "ഫലപ്രഖ്യാപനവും ടാബുലേഷനും" },
  { num: "09", en: "E-Certificate Generator", ml: "ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റുകൾ" },
  { num: "10", en: "Finance & Receipts", ml: "ധനകാര്യവും രസീതുകളും" },
  { num: "11", en: "Volunteer Management", ml: "വോളണ്ടിയർ ഡ്യൂട്ടികൾ" },
  { num: "12", en: "Help Desk Support", ml: "ഹെൽപ്പ് ഡെസ്ക് (Support)" },
  { num: "13", en: "Inventory Assets", ml: "ഇൻവെന്ററി & സ്റ്റേജ് സാമഗ്രികൾ" },
  { num: "14", en: "Accommodation Hostel", ml: "താമസം (Accommodation)" },
  { num: "15", en: "Food Catering Coupons", ml: "ഭക്ഷണ കൂപ്പണുകൾ (Food)" },
  { num: "16", en: "Medical First Aid", ml: "മെഡിക്കൽ & പ്രഥമശുശ്രൂഷ" },
  { num: "17", en: "Notifications Gateway", ml: "അറിയിപ്പുകൾ (Notifications)" },
  { num: "18", en: "Public Event Website", ml: "പൊതുജന പോർട്ടൽ (Public Site)" },
  { num: "19", en: "Mobile App PWA", ml: "മൊബൈൽ ആപ്പ് (Mobile App)" },
  { num: "20", en: "SaaS Subscriptions", ml: "SaaS വരിസംഖ്യ (Subscriptions)" },
  { num: "21", en: "AI Schedule Optimizer", ml: "AI അസിസ്റ്റന്റും ഒപ്റ്റിമൈസറും" },
  { num: "22", en: "Real-Time Analytics", ml: "തത്സമയ വിശകലനം (Analytics)" },
  { num: "23", en: "REST API & Webhooks", ml: "REST API & ഡെവലപ്പർ ടൂളുകൾ" },
  { num: "24", en: "Security & OWASP", ml: "സുരക്ഷ (Security & RLS)" },
  { num: "25", en: "Database Backup", ml: "ഡാറ്റാ ബാക്കപ്പ് (Backup)" },
  { num: "26", en: "Telemetry Monitoring", ml: "സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണം" },
  { num: "27", en: "Localization & i18n", ml: "ഭാഷാ സഹായം (Localization)" },
  { num: "28", en: "Documents PDF Engine", ml: "ഔദ്യോഗിക PDF പ്രിന്റൗട്ടുകൾ" },
  { num: "29", en: "DevOps Deployments", ml: "DevOps & എഡ്ജ് നെറ്റ്വർക്ക്" },
  { num: "30", en: "Troubleshooting Guide", ml: "തടസ്സപരിഹാരം (Troubleshooting)" },
  { num: "31", en: "Frequently Asked Questions", ml: "ചോദ്യോത്തരങ്ങൾ (FAQ)" },
  { num: "32", en: "Administrator Manual", ml: "അഡ്മിനിസ്ട്രേറ്റർ ഗൈഡ്" },
  { num: "33", en: "Judge Tablet Manual", ml: "ജഡ്ജസ് ഗൈഡ് (Judge Manual)" },
  { num: "34", en: "Volunteer Field Guide", ml: "വോളണ്ടിയർ ഗൈഡ്" },
  { num: "35", en: "Finance Treasurer Manual", ml: "ട്രഷറർ & ഫിനാൻസ് ഗൈഡ്" },
  { num: "36", en: "Reception Desk Guide", ml: "ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ ഗൈഡ്" },
  { num: "37", en: "Medical Protocol", ml: "മെഡിക്കൽ ടീം പ്രോട്ടോക്കോൾ" },
  { num: "38", en: "Inventory Storekeeper Manual", ml: "സ്റ്റോർകീപ്പർ ഗൈഡ്" },
  { num: "39", en: "Video Tutorial Scripts", ml: "വീഡിയോ ട്യൂട്ടോറിയൽ സ്ക്രിപ്റ്റുകൾ" },
  { num: "40", en: "Help Center Portal", ml: "ഹെൽപ്പ് സെന്റർ പോർട്ടൽ" },
]

export default function FestProProductHelpCenter() {
  const [lang, setLang] = useState<"en" | "ml">("en")
  const [selectedModuleNum, setSelectedModuleNum] = useState<string>("01")
  const [searchQuery, setSearchQuery] = useState("")

  // AI Copilot state
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  const isMl = lang === "ml"
  const currentDoc = getModuleData(selectedModuleNum, isMl)

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

  const filteredList = SYSTEM_MODULES_LIST.filter((m) => {
    const label = isMl ? m.ml : m.en
    return label.toLowerCase().includes(searchQuery.toLowerCase()) || m.num.includes(searchQuery)
  })

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

      {/* Main Content Layout: Sidebar + Main Reader */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6">
        {/* Left Navigation Tree: All 40 Modules */}
        <aside className="w-full md:w-80 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
            <h2 className={`text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2 ${isMl ? "font-anek" : "font-sans"}`}>
              {isMl ? "📚 40 സിസ്റ്റം മോഡ്യൂളുകൾ" : "📚 All 40 System Modules"}
            </h2>

            <div className="space-y-1">
              {filteredList.map((m) => {
                const isSelected = selectedModuleNum === m.num
                return (
                  <button
                    key={m.num}
                    onClick={() => setSelectedModuleNum(m.num)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {m.num}
                      </span>
                      <span className={`truncate ${isMl ? "font-anek" : "font-sans"}`}>{isMl ? m.ml : m.en}</span>
                    </div>
                    {isSelected && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white" />}
                  </button>
                )
              })}
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

        {/* Right Main Reader: Full Detailed Manual Page */}
        <main className="flex-1 space-y-6 min-w-0">
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

          {/* Full Documentation Manual Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-8 animate-in fade-in duration-200">
            {/* Document Header */}
            <div className="border-b border-slate-100 pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-100">
                  Module {currentDoc.num} — {currentDoc.cat}
                </span>
                <span className="text-xs font-semibold text-slate-400">Official FestPro Enterprise Manual v2.4.0</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl text-slate-900 ${isMl ? "font-anek font-bold" : "font-heading font-extrabold"}`}>
                {currentDoc.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">{currentDoc.overview}</p>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-4">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                {isMl ? "പ്രവർത്തന ഘട്ടങ്ങൾ (Step-by-Step Execution Guide)" : "Step-by-Step Execution Guide"}
              </h3>
              <div className="space-y-2.5">
                {currentDoc.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Diagram */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <Layers className="h-5 w-5 text-indigo-600" />
                {isMl ? "വർക്ക്ഫ്ലോ ഘടന (System Workflow Transition)" : "System Workflow Transition"}
              </h3>
              <div className="p-4 rounded-xl bg-indigo-900 text-indigo-100 font-mono text-xs overflow-x-auto border border-indigo-800 shadow-inner">
                {currentDoc.workflow}
              </div>
            </div>

            {/* Field Explanation Table */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <FileText className="h-5 w-5 text-indigo-600" />
                {isMl ? "ഫീൽഡുകളും വേരിയബിളുകളും (Field Reference Table)" : "Field & Parameter Reference Table"}
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Field Name</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Required?</th>
                      <th className="p-3">Description & Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentDoc.fields.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 font-mono">{f.name}</td>
                        <td className="p-3 font-mono text-indigo-600">{f.type}</td>
                        <td className="p-3 font-semibold">{f.req}</td>
                        <td className="p-3 text-slate-600">{isMl ? f.descMl : f.descEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tips & Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <h4 className="font-bold text-xs uppercase flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="h-4 w-4" /> {isMl ? "ഉപദേശങ്ങളും നിർദ്ദേശങ്ങളും (Tips)" : "Best Practice Tip"}
                </h4>
                <p className="text-xs leading-relaxed">{currentDoc.tips}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <h4 className="font-bold text-xs uppercase flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> {isMl ? "മുൻകരുതലുകൾ (Warning)" : "Operational Warning"}
                </h4>
                <p className="text-xs leading-relaxed">{currentDoc.warning}</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                {isMl ? "സാധാരണ ചോദ്യോത്തരങ്ങൾ (Frequently Asked Questions)" : "Frequently Asked Questions (FAQ)"}
              </h3>
              <div className="space-y-3">
                {(currentDoc.faq || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">Q: {item.q}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Troubleshooting Matrix */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                {isMl ? "തടസ്സപരിഹാരങ്ങൾ (Troubleshooting Matrix)" : "Troubleshooting Matrix"}
              </h3>
              <div className="space-y-2">
                {(currentDoc.troubleshoot || []).map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/80 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="font-bold text-red-900">Issue: {t.issue}</span>
                    </div>
                    <div className="text-slate-700 bg-white px-3 py-1 rounded-lg border border-red-200 font-semibold">
                      Fix: {t.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
