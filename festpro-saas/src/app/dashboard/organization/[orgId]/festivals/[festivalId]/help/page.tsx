"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  HelpCircle, Search, ChevronRight, BookOpen, Sparkles,
  CheckCircle, Users, Trophy, Layers, Award, ShieldAlert
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface GuideItem {
  id: string
  titleMl: string
  titleEn: string
  contentMl: string
  contentEn: string
}

interface GuideSection {
  titleMl: string
  titleEn: string
  items: GuideItem[]
}

export default function FestivalHelpPage() {
  const params = useParams()
  const [lang, setLang] = useState<"ml" | "en">("ml")
  const [search, setSearch] = useState("")
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const sections: GuideSection[] = [
    {
      titleMl: "ഫെസ്റ്റ് ഒരുക്കുക",
      titleEn: "Fest Setup",
      items: [
        {
          id: "start",
          titleMl: "ഇവിടെ തുടങ്ങാം: ഫെസ്റ്റ് ക്രമത്തിൽ ഒരുക്കുക",
          titleEn: "Start here: Setting up your fest in order",
          contentMl: "ആദ്യം ടീമുകളും കാറ്റഗറികളും ചേർക്കുക. തുടർന്ന് മത്സരങ്ങളും അവ നടക്കുന്ന സ്റ്റേജുകളും നിശ്ചയിക്കുക. രജിസ്ട്രേഷൻ പൂർത്തിയായ ശേഷം ഷെഡ്യൂൾ പ്ലാൻ ചെയ്യാം.",
          contentEn: "First add teams and categories. Then configure programs and their stages. Once registrations are in, generate the live schedule.",
        },
        {
          id: "teams",
          titleMl: "ടീമുകൾ ചേർക്കുക, code prefix തിരഞ്ഞെടുക്കുക",
          titleEn: "Add teams and choose code prefixes",
          contentMl: "ഓരോ ടീമിനും ഒരു പേരും യുണീക്ക് കളറും കോഡ് പ്രിഫിക്സും (ഉദാ: BL, RD) നൽകുക. ഇത് പാർട്ടിസിപ്പന്റ്സ് നെഞ്ച് നമ്പറുകളിലും പോയിന്റ് ടേബിളിലും ഉപയോഗിക്കും.",
          contentEn: "Assign each team a name, distinct brand color, and a code prefix (e.g. BL, RD). This prefixes participant chest numbers and scoreboards.",
        },
        {
          id: "roles",
          titleMl: "ജഡ്ജസിനും ടീം മാനേജർമാർക്കും സ്വന്തം ലോഗിൻ നൽകുക",
          titleEn: "Invite judges and team managers with their own logins",
          contentMl: "People & access സെക്ഷനിൽ പോയി ജഡ്ജ്, സ്റ്റേജ് മാനേജർ, അല്ലെങ്കിൽ ടീം മാനേജർ റോളുകളിൽ ഇമെയിൽ അല്ലെങ്കിൽ മൊബൈൽ നമ്പർ വഴി ആക്സസ് നൽകാം.",
          contentEn: "Go to People & Access to send invites to judges, stage coordinators, and team leads with role-based dashboard permissions.",
        },
        {
          id: "permissions",
          titleMl: "ഓരോ റോളിനും എന്തൊക്കെ ചെയ്യാം",
          titleEn: "Permissions and capabilities for each role",
          contentMl: "ഓർഗനൈസർക്ക് മുഴുവൻ നിയന്ത്രണവും, ജഡ്ജസിന് മാർക്ക് നൽകാനും, അനൗൺസർക്ക് റിസൾട്ടുകൾ ലൈവ് ആക്കാനും മാത്രമേ അനുവാദമുള്ളൂ.",
          contentEn: "Organizers have complete control, judges evaluate performances, and announcers broadcast live published results.",
        },
        {
          id: "quota",
          titleMl: '"8 of 10" എന്ന പരിധി എന്താണ്, എങ്ങനെ കൂട്ടാം',
          titleEn: 'Understanding capacity limits (e.g. "8 of 10")',
          contentMl: "നിങ്ങളുടെ ഫെസ്റ്റ് ലൈസൻസിലുള്ള പാർട്ടിസിപ്പന്റ്, ടീം, സ്റ്റേജ് പരിധിയാണിത്. കൂടുതൽ വേണമെങ്കിൽ ലൈസൻസിങ് സെക്ഷനിൽ നിന്ന് ഉടൻ അപ്‌ഗ്രേഡ് ചെയ്യാം.",
          contentEn: "This shows your active tier quota for participants and stages. Upgrade via licensing whenever your festival expands.",
        },
        {
          id: "troubleshoot",
          titleMl: "ഒരാൾക്ക് ലോഗിൻ ചെയ്യാൻ പറ്റുന്നില്ലെങ്കിൽ",
          titleEn: "Troubleshooting staff or judge login issues",
          contentMl: "യൂസർ അവരുടെ ഇമെയിലോ പാസ്‌വേഡോ റീസെറ്റ് ചെയ്യാൻ പറയുക. അല്ലെങ്കിൽ People & Access-ൽ നിന്ന് റീ-ഇൻവൈറ്റ് അയക്കുക.",
          contentEn: "Direct them to the reset password link, or re-send their invitation token from People & Access.",
        },
        {
          id: "lang",
          titleMl: "ഫെസ്റ്റിന്റെ ഭാഷയും നിങ്ങളുടെ സ്വന്തം ഭാഷയും",
          titleEn: "Festival language and personalized interface",
          contentMl: "സർട്ടിഫിക്കറ്റുകളിലും ഔദ്യോഗിക റിപ്പോർട്ടുകളിലും മലയാളം, ഇംഗ്ലീഷ്, അല്ലെങ്കിൽ അറബിക് ഭാഷകൾ സെറ്റിംഗ്സിൽ നിന്ന് മാറ്റാവുന്നതാണ്.",
          contentEn: "Switch default system language and certificate fonts between Malayalam, English, and Arabic via Settings.",
        },
      ],
    },
    {
      titleMl: "കാറ്റഗറികളും പ്രോഗ്രാമുകളും",
      titleEn: "Categories & Programs",
      items: [
        {
          id: "common_cat",
          titleMl: "Common Category എന്താണ്?",
          titleEn: "What is a Common Category?",
          contentMl: "ജൂനിയർ, സീനിയർ വ്യത്യാസമില്ലാതെ എല്ലാ ഗ്രൂപ്പുകൾക്കും ഒരുമിച്ച് പങ്കെടുക്കാവുന്ന ജനറൽ മത്സരങ്ങൾക്കാണ് കോമൺ കാറ്റഗറി ഉപയോഗിക്കുന്നത്.",
          contentEn: "Common category is used for open events where participants from all age divisions compete together.",
        },
        {
          id: "scheduling",
          titleMl: "വേദി, സമയം, സ്റ്റേജ് ഷെഡ്യൂളിംഗ്",
          titleEn: "Venues, stages, and conflict-free scheduling",
          contentMl: "Scheduler ടൂൾ ഉപയോഗിച്ച് ഒരേ മത്സരാർത്ഥിക്ക് ഒരേ സമയം രണ്ട് വേദികളിൽ പ്രോഗ്രാം വരാത്തവിധം ഓട്ടോ-ഷെഡ്യൂൾ ചെയ്യാം.",
          contentEn: "Use the automated Scheduler to prevent participant time overlaps and clashes across different stages.",
        },
        {
          id: "code_letters",
          titleMl: "കോഡ് ലെറ്ററുകൾ ഓട്ടോ-അസൈൻ ചെയ്യൽ",
          titleEn: "Auto-assigning secret code letters",
          contentMl: "ജഡ്ജസ് പക്ഷപാതമില്ലാതെ മാർക്കിടാൻ ഓരോ മത്സരാർത്ഥിക്കും A, B, C രഹസ്യ കോഡുകൾ നൽകാം. ഇത് സ്റ്റേജ് ഡെസ്കിലും ലഭ്യമാകും.",
          contentEn: "Assign anonymous A-Z secret code letters to candidates to ensure blind and unbiased evaluation by judges.",
        },
      ],
    },
    {
      titleMl: "ലൈവ് മത്സരങ്ങളും റിസൾട്ടുകളും",
      titleEn: "Live Operations & Results",
      items: [
        {
          id: "scoring",
          titleMl: "ജഡ്ജ് മാർക്കുകൾ രേഖപ്പെടുത്തലും വേഗത്തിലുള്ള പബ്ലിഷിംഗും",
          titleEn: "Judge mark entry and instant result publishing",
          contentMl: "ഓരോ ജഡ്ജും നൽകിയ ക്രൈറ്റീരിയ മാർക്കുകൾ എന്റർ ചെയ്ത ഉടൻ തന്നെ ടോട്ടൽ സ്കോറും ഗ്രേഡും കണക്കാക്കി റിസൾട്ട് പബ്ലിഷ് ചെയ്യാം.",
          contentEn: "Enter multi-criteria judge marks to instantly compute aggregate scores, grades, and announce winners.",
        },
        {
          id: "leaderboard",
          titleMl: "പോയിന്റ് നിലയും പോസ്റ്റർ ജനറേഷനും",
          titleEn: "Team leaderboards and social media poster generation",
          contentMl: "ടീം പോയിന്റ് നില തത്സമയം അപ്‌ഡേറ്റ് ആവുകയും ഇൻസ്റ്റാഗ്രാം, ഫേസ്ബുക്ക് എന്നിവയ്ക്കായി HD പോസ്റ്ററുകൾ ഒറ്റ ക്ലിക്കിൽ ഡൗൺലോഡ് ചെയ്യാനും കഴിയും.",
          contentEn: "Standings update live with 0ms delay, and 1-click social media posters can be rendered for instant sharing.",
        },
        {
          id: "certs",
          titleMl: "QR-വെരിഫൈഡ് ഇ-സർട്ടിഫിക്കറ്റ് പ്രിന്റിംഗ്",
          titleEn: "QR-verified verifiable e-certificates",
          contentMl: "വിജയികൾക്ക് അവരുടെ ഫോൺ കാമറ കൊണ്ട് സ്കാൻ ചെയ്ത് ഒറിജിനാലിറ്റി പരിശോധിക്കാവുന്ന QR കോഡോട് കൂടിയ സർട്ടിഫിക്കറ്റുകൾ പ്രിന്റ് ചെയ്യാം.",
          contentEn: "Issue official certificates with tamper-proof QR verification hashes for participants and winners.",
        },
      ],
    },
  ]

  const matchesSearch = (item: GuideItem) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      item.titleMl.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.contentMl.toLowerCase().includes(q) ||
      item.contentEn.toLowerCase().includes(q)
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-16">
      {/* ── HEADER (Screenshot 6) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Help
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === "ml"
              ? "ഫെസ്റ്റ് നടത്തുന്ന ക്രമത്തിൽ തന്നെയാണ് ഗൈഡുകൾ നൽകിയിരിക്കുന്നത്. മുകളിൽ നിന്ന് തുടങ്ങുക."
              : "Guides follow the order you run a fest. Start from the top."}
          </p>
        </div>

        {/* Language Toggle (Screenshot 6: മലയാളം / English) */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setLang("ml")}
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "ml" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            മലയാളം
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-lg transition-all ${
              lang === "en" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* ── SEARCH BAR (Screenshot 6) ── */}
      <div className="relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <Input
          placeholder={lang === "ml" ? "സഹായങ്ങൾ തിരയുക..." : "Search guides..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-10 rounded-xl border-slate-200 text-xs font-medium bg-white"
        />
      </div>

      {/* ── GUIDES SECTIONS & ACCORDION (Screenshot 6) ── */}
      <div className="space-y-6">
        {sections.map((sec, idx) => {
          const visibleItems = sec.items.filter(matchesSearch)
          if (visibleItems.length === 0) return null

          return (
            <div key={idx} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                {lang === "ml" ? sec.titleMl : sec.titleEn}
              </h2>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
                {visibleItems.map((item) => {
                  const isOpen = activeItem === item.id
                  return (
                    <div key={item.id} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => setActiveItem(isOpen ? null : item.id)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-all text-xs font-semibold text-slate-800"
                      >
                        <span className="pr-4">{lang === "ml" ? item.titleMl : item.titleEn}</span>
                        <ChevronRight
                          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                            isOpen ? "rotate-90 text-emerald-700" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 font-normal leading-relaxed bg-slate-50/50 border-t border-slate-100 animate-in fade-in">
                          <p>{lang === "ml" ? item.contentMl : item.contentEn}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
