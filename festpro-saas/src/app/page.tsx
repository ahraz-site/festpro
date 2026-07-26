"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, Play, CheckCircle2, Eye, Sparkles, Layers, ShieldCheck, Trophy, Users, Award, Radio, Globe2, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function EditorialLandingPage() {
  const [lang, setLang] = useState<"en" | "ml">("en")

  // Interactive Live Demo State for Hero Section
  const [programs, setPrograms] = useState([
    { id: 1, titleEn: "Solo Song", titleMl: "ലളിതഗാനം (സോളോ)", categoryEn: "Junior", categoryMl: "ജൂനിയർ", stageEn: "Main stage", stageMl: "മെയിൻ സ്റ്റേജ്", status: "Reporting", nextActionEn: "Start program", nextActionMl: "സ്റ്റാർട്ട് ചെയ്യുക" },
    { id: 2, titleEn: "Group Dance", titleMl: "സംഘനൃത്തം", categoryEn: "Senior", categoryMl: "സീനിയർ", stageEn: "Auditorium", stageMl: "ഓഡിറ്റോറിയം", status: "Started", nextActionEn: "Finish program", nextActionMl: "പൂർത്തിയാക്കുക" },
    { id: 3, titleEn: "Poetry Recitation", titleMl: "കവിതാലാപനം", categoryEn: "General", categoryMl: "ജനറൽ", stageEn: "Room 2", stageMl: "റൂം 2", status: "Scoring", nextActionEn: "Review & Publish", nextActionMl: "റിവ്യൂ & പബ്ലിഷ്" },
  ])

  const handleNextAction = (id: number) => {
    setPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id === id) {
          if (prog.status === "Reporting") {
            toast.success(lang === "en" ? `${prog.titleEn} started on ${prog.stageEn}!` : `${prog.titleMl} മത്സരം ആരംഭിച്ചു!`)
            return { ...prog, status: "Started", nextActionEn: "Finish program", nextActionMl: "പൂർത്തിയാക്കുക" }
          } else if (prog.status === "Started") {
            toast.info(lang === "en" ? `${prog.titleEn} completed. Sent to Judges!` : `${prog.titleMl} പൂർത്തിയായി. ജഡ്ജുമിരിലേക്ക് അയച്ചു!`)
            return { ...prog, status: "Scoring", nextActionEn: "Review & Publish", nextActionMl: "റിവ്യൂ & പബ്ലിഷ്" }
          } else if (prog.status === "Scoring") {
            toast.success(lang === "en" ? `🎉 ${prog.titleEn} results published live!` : `🎉 ${prog.titleMl} ഫലം തത്സമയം പബ്ലിഷ് ചെയ്തു!`)
            return { ...prog, status: "Published", nextActionEn: "Published 🟢", nextActionMl: "പ്രസിദ്ധീകരിച്ചു 🟢" }
          }
        }
        return prog;
      })
    )
  }

  const isMl = lang === "ml"

  return (
    <div className={`min-h-screen bg-[#FAFAF4] text-[#182925] ${isMl ? "font-anek" : "font-sans"} selection:bg-[#132E29] selection:text-white transition-colors duration-300`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAF4]/90 backdrop-blur-md border-b border-[#EBEADF]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#132E29] text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#132E29] font-newsreader italic">FestPro</span>
              <span className="text-[10px] tracking-wider font-semibold text-[#5C6B66] uppercase -mt-1">Arts & Cultural Suite</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#42524E]">
            <a href="#overview" className="hover:text-[#132E29] transition-colors">{isMl ? "വിവരങ്ങൾ" : "Overview"}</a>
            <a href="#how-it-works" className="hover:text-[#132E29] transition-colors">{isMl ? "എങ്ങനെ പ്രവർത്തിക്കുന്നു" : "How it Works"}</a>
            <a href="#roles" className="hover:text-[#132E29] transition-colors">{isMl ? "റോളുകൾ" : "Roles"}</a>
            <a href="#enterprise" className="hover:text-[#132E29] transition-colors">{isMl ? "സ്ഥാപനങ്ങൾക്കായി" : "Enterprise"}</a>
          </nav>

          {/* Action & Language Toggle */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#EFECE1] p-1 rounded-full border border-[#DFDCCE]">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  lang === "en" ? "bg-[#132E29] text-white shadow-xs" : "text-[#5C6B66] hover:text-[#132E29]"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-3 py-1 text-xs font-semibold rounded-full font-anek transition-all ${
                  lang === "ml" ? "bg-[#132E29] text-white shadow-xs" : "text-[#5C6B66] hover:text-[#132E29]"
                }`}
              >
                മലയാളം
              </button>
            </div>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-sm font-semibold text-[#132E29] hover:text-[#000] px-3 py-2"
            >
              {isMl ? "Sign In" : "Sign In"}
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#132E29] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1C453E] transition-all shadow-sm group"
            >
              <span>{isMl ? "ഫെസ്റ്റ് ആരംഭിക്കൂ" : "Create your fest"}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE1] border border-[#DFDCCE] text-xs font-semibold tracking-wider text-[#132E29] uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#132E29]" />
                <span>{isMl ? "സ്‌കൂൾ & കോളേജ് കലോത്സവ സോഫ്റ്റ്‌വെയർ" : "SCHOOL ARTS AND CULTURAL FEST SOFTWARE"}</span>
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-normal text-[#132E29] leading-[1.12] tracking-tight ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl
                  ? "സ്പ്രെഡ്‌ഷീറ്റുകളും സ്കോർ ഷീറ്റുകളും ഇല്ലാതെ നിങ്ങളുടെ കലോത്സവം വേഗത്തിൽ നടത്താം."
                  : "Run your fest without chasing spreadsheets, score sheets, and stage updates."}
              </h1>

              <p className="text-lg sm:text-xl text-[#5C6B66] font-normal leading-relaxed max-w-xl">
                {isMl
                  ? "വിദ്യാർത്ഥികളെയും മത്സരങ്ങളെയും സജ്ജമാക്കി, ലൈവ് സ്റ്റേജ് അപ്‌ഡേറ്റുകളും ജഡ്ജിമാർ നൽകുന്ന സ്കോറുകളും തത്സമയം കാണാം."
                  : "Set up participants and programs, keep stages moving, collect judges' marks, and publish approved results in one place."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#132E29] px-7 py-3.5 text-base font-semibold text-white hover:bg-[#1C453E] transition-all shadow-md group"
                >
                  <span>{isMl ? "നിങ്ങളുടെ ഫെസ്റ്റ് തുടങ്ങൂ" : "Create your fest"}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full bg-[#EFECE1] hover:bg-[#E7E3D4] border border-[#DFDCCE] px-7 py-3.5 text-base font-semibold text-[#132E29] transition-all group"
                >
                  <span>{isMl ? "FestPro എങ്ങനെ പ്രവർത്തിക്കുന്നു" : "See what FestPro does"}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>

              <p className="text-xs text-[#7A8A85] font-medium pt-1">
                {isMl
                  ? "✓ 20 മത്സരാർത്ഥികൾ, 2 ടീമുകൾ, 5 മത്സരങ്ങൾ, 1 വേദി വരെ സൗജന്യമായി ഉപയോഗിക്കാം."
                  : "Evaluation is free for up to 20 participants, 2 teams, 5 programs, and 1 stage."}
              </p>
            </div>

            {/* Right Interactive Mock Browser Window (Festize Style Live Preview) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-[#E7E5D9] transition-all hover:shadow-[0_20px_50px_rgba(19,46,41,0.08)]">
                {/* Browser Top Navigation Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EEE4]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                    <span className="ml-2 text-xs font-mono font-semibold text-[#7A8A85]">festpro.live/control-room</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F5F4EC] px-3 py-1 rounded-full text-xs font-bold text-[#132E29]">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>LIVE</span>
                  </div>
                </div>

                {/* Subtitle inside mock */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-semibold text-[#7A8A85] uppercase tracking-wider">Control room</span>
                    <h3 className={`text-xl font-semibold text-[#132E29] ${isMl ? "font-anek" : "font-newsreader"}`}>
                      {isMl ? "ലൈവ് മത്സരങ്ങൾ (Live Programs)" : "Live programs"}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFECE1] text-[#132E29]">All stages</span>
                </div>

                {/* Live Programs Interactive Table */}
                <div className="space-y-3">
                  {programs.map((prog) => {
                    const statusBg =
                      prog.status === "Reporting" ? "bg-[#FEF9C3] text-[#854D0E]" :
                      prog.status === "Started" ? "bg-[#DCFCE7] text-[#166534]" :
                      prog.status === "Scoring" ? "bg-[#E0E7FF] text-[#3730A3]" :
                      "bg-[#FCE7F3] text-[#831843]"

                    return (
                      <div key={prog.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAFAF4] border border-[#EBEADF] hover:border-[#D5D3C5] transition-all">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-[#132E29]">
                            {isMl ? prog.titleMl : prog.titleEn}
                          </p>
                          <p className="text-xs text-[#7A8A85]">
                            {isMl ? prog.categoryMl : prog.categoryEn}
                          </p>
                        </div>

                        <div className="text-xs font-medium text-[#42524E]">
                          {isMl ? prog.stageMl : prog.stageEn}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBg}`}>
                            {prog.status}
                          </span>

                          <button
                            onClick={() => handleNextAction(prog.id)}
                            disabled={prog.status === "Published"}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              prog.status === "Published"
                                ? "bg-emerald-100 text-emerald-800 cursor-default"
                                : "bg-[#132E29] text-white hover:bg-[#1C453E] active:scale-95 cursor-pointer shadow-2xs"
                            }`}
                          >
                            {isMl ? prog.nextActionMl : prog.nextActionEn}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Subtext inside mock footer */}
                <p className="mt-4 text-center text-xs text-[#7A8A85]">
                  {isMl ? "ഓരോരുത്തർക്കും അവർ ചെയ്യേണ്ട വിവരങ്ങൾ വ്യക്തമായി കാണാൻ സാധിക്കും." : "Each person sees what they need to do next."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: FROM ENTRIES TO RESULTS */}
      <section id="how-it-works" className="py-20 bg-[#F4F3EA] border-t border-b border-[#E5E3D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#7A8A85] uppercase">
                {isMl ? "എൻട്രികൾ മുതൽ ഫലപ്രഖ്യാപനം വരെ" : "FROM ENTRIES TO RESULTS"}
              </span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "എല്ലാവരും ഒരൊറ്റ പ്ലാറ്റ്‌ഫോമിൽ ഒന്നിച്ച് പ്രവർത്തിക്കുന്നു." : "Everyone works from the same fest."}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#5C6B66] max-w-md">
              {isMl
                ? "കലോത്സവ വിവരങ്ങൾ ഒരിക്കൽ നൽകുക, പരിപാടികൾ തത്സമയം നിരീക്ഷിക്കുക, റിസൾട്ടുകൾ ലൈവായി പ്രസിദ്ധീകരിക്കുക."
                : "Add the fest details once, follow each program on event day, and publish results when they are ready."}
            </p>
          </div>

          {/* 3 Column Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAFAF4] p-8 rounded-2xl border border-[#E7E5D9] space-y-4 hover:shadow-lg transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#EFECE1] flex items-center justify-center text-[#132E29]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className={`text-2xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "ഒരിക്കൽ വിവരങ്ങൾ നൽകുക" : "Enter details once"}
              </h3>
              <p className="text-sm text-[#5C6B66] leading-relaxed">
                {isMl
                  ? "ടീമുകൾ, മത്സരാർത്ഥികൾ, സ്റ്റേജുകൾ, ഷെഡ്യൂളുകൾ എന്നിവ ഒറ്റ കോൺസോളിൽ നിയന്ത്രിക്കാം."
                  : "Add teams, participants, categories, programs, stages, schedules, and staff without maintaining a separate sheet for each job."}
              </p>
            </div>

            <div className="bg-[#FAFAF4] p-8 rounded-2xl border border-[#E7E5D9] space-y-4 hover:shadow-lg transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#EFECE1] flex items-center justify-center text-[#132E29]">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className={`text-2xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "നടക്കുന്ന കാര്യങ്ങൾ തത്സമയം അറിയാം" : "Know what is happening"}
              </h3>
              <p className="text-sm text-[#5C6B66] leading-relaxed">
                {isMl
                  ? "ഏതൊക്കെ വിദ്യാർത്ഥികൾ റിപ്പോർട്ട് ചെയ്തു, ഏത് പരിപാടിയാണ് സ്റ്റേജിൽ നടക്കുന്നത് എന്ന് നേരിട്ട് അറിയാം."
                  : "See who has reported, which program is on stage, and what is ready for judging without calling every stage."}
              </p>
            </div>

            <div className="bg-[#FAFAF4] p-8 rounded-2xl border border-[#E7E5D9] space-y-4 hover:shadow-lg transition-all">
              <div className="h-10 w-10 rounded-xl bg-[#EFECE1] flex items-center justify-center text-[#132E29]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className={`text-2xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "കൃത്യതയോടെ ഫലപ്രഖ്യാപനം നടത്താം" : "Publish with confidence"}
              </h3>
              <p className="text-sm text-[#5C6B66] leading-relaxed">
                {isMl
                  ? "ജഡ്ജുമാരുടെ മാർക്കുകൾ വെരിഫൈ ചെയ്ത് അപ്പ്രൂവ് ചെയ്ത റിസൾട്ടുകൾ മാത്രം തത്സമയം പബ്ലിഷ് ചെയ്യാം."
                  : "Judges enter marks, organizers check and finalize the result, and only approved results appear on the public fest page."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: BUILT FOR EACH JOB */}
      <section id="roles" className="py-20 bg-[#FAFAF4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#7A8A85] uppercase">
                {isMl ? "ഓരോ ഉത്തരവാദിത്തത്തിനും അനുയോജ്യം" : "BUILT FOR EACH JOB"}
              </span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "ഓരോരുത്തർക്കും വ്യക്തമായ പ്രവർത്തന മേഖല." : "Give each person a clear place to work."}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#5C6B66] max-w-md">
              {isMl
                ? "കോർഡിനേറ്റർമാർ, ടീം മാനേജർമാർ, സ്റ്റേജ് സ്റ്റാഫ്, ജഡ്ജിമാർ, രക്ഷിതാക്കൾ എന്നിവർക്ക് ആവശ്യമായ അപ്‌ഡേറ്റുകൾ."
                : "Coordinators, team managers, stage staff, judges, and families each see what matters to them."}
            </p>
          </div>

          {/* 3 Column Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F4F3EA] p-8 rounded-2xl border border-[#E7E5D9] space-y-4">
              <h3 className={`text-2xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "കോർഡിനേറ്റർമാർക്ക് സമ്പൂർണ്ണ നിയന്ത്രണം" : "Coordinators stay in control"}
              </h3>
              <p className="text-sm text-[#5C6B66] leading-relaxed">
                {isMl
                  ? "കലോത്സവം തയ്യാറാക്കുക, ടീം അസൈൻ ചെയ്യുക, പരിപാടികളുടെ പോക്ക് നിരീക്ഷിക്കുക, ഫലപ്രഖ്യാപനം നിയന്ത്രിക്കുക."
                  : "Prepare the fest, assign the team, watch programs move, check results, and decide when to publish."}
              </p>
            </div>

            <div className="bg-[#F4F3EA] p-8 rounded-2xl border border-[#E7E5D9] space-y-4">
              <h3 className={`text-2xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "സ്റ്റാഫുകൾക്ക് സ്വന്തം ഉത്തരവാദിത്തം" : "Staff focus on their job"}
              </h3>
              <p className="text-sm text-[#5C6B66] leading-relaxed">
                {isMl
                  ? "ടീം മാനേജർമാർ വിദ്യാർത്ഥികളെയും, സ്റ്റേജ് മാനേജർമാർ പരിപാടികളെയും, ജഡ്ജുമാർ മാർക്കിംഗും കൈകാര്യം ചെയ്യുന്നു."
                  : "Team managers handle their participants, stage managers run their programs, and judges score their assignments."}
              </p>
            </div>

            <div className="bg-[#F4F3EA] p-8 rounded-2xl border border-[#E7E5D9] space-y-4">
              <h3 className={`text-2xl font-normal text-[#132E29] ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl ? "രക്ഷിതാക്കൾക്കും പ്രേക്ഷകർക്കും തത്സമയം" : "Families follow one fest page"}
              </h3>
              <p className="text-sm text-[#5C6B66] leading-relaxed">
                {isMl
                  ? "ടൈംടേബിളുകൾ, പോയിന്റ് നില, തത്സമയ ഫലങ്ങൾ എന്നിവ കാണാൻ ഒരൊറ്റ വെബ് പേജ്."
                  : "Share one address for schedules, announcements, published results, team scores, and event updates."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: ONE SCHOOL OR MANY */}
      <section id="enterprise" className="py-20 bg-[#F4F3EA] border-t border-[#E5E3D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold tracking-widest text-[#7A8A85] uppercase">
                {isMl ? "സ്‌കൂൾ തലം മുതൽ ബഹുതല ഫെസ്റ്റിവലുകൾ വരെ" : "ONE SCHOOL OR MANY"}
              </span>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-normal text-[#132E29] leading-tight ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl
                  ? "ഒരു സ്‌കൂൾ കലോത്സവം — അല്ലെങ്കിൽ വിവിധ തലങ്ങളിലെ ഫെസ്റ്റുകൾ ഏകോപിപ്പിക്കാം."
                  : "Run one school fest — or coordinate separate fests across levels."}
              </h2>
              <p className="text-sm sm:text-base text-[#5C6B66]">
                {isMl
                  ? "സ്‌കൂളുകൾക്ക് സ്വതന്ത്രമായും സബ് ജില്ലാ/റവന്യൂ ജില്ലാ തലങ്ങൾക്ക് സംയോജിതമായും നടത്താം."
                  : "A school can run independently. A larger organization can connect school, zone, division, and district fests using the names it already uses."}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-[#132E29] font-medium">
                  <div className="h-5 w-5 rounded-full bg-[#132E29] text-white flex items-center justify-center text-xs mt-0.5">✓</div>
                  <span>{isMl ? "സിംഗിൾ സ്‌കൂൾ ഫെസ്റ്റിവലുകൾക്ക് മിനിറ്റുകൾക്കുള്ളിൽ സെറ്റപ്പ്" : "Nothing extra to configure for a single school fest"}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#132E29] font-medium">
                  <div className="h-5 w-5 rounded-full bg-[#132E29] text-white flex items-center justify-center text-xs mt-0.5">✓</div>
                  <span>{isMl ? "നിങ്ങളുടെ കലോത്സവ ഘടനയ്‌ക്കനുയോജ്യമായ സോൺ/സബ്‌സോൺ പേരുകൾ" : "School, zone, division, and district names that match your event"}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#132E29] font-medium">
                  <div className="h-5 w-5 rounded-full bg-[#132E29] text-white flex items-center justify-center text-xs mt-0.5">✓</div>
                  <span>{isMl ? "അതാത് കോർഡിനേറ്റർമാർക്ക് അവർക്ക് അസൈൻ ചെയ്ത ഫെസ്റ്റുകൾ മാത്രം" : "Coordinators see only the fests they manage"}</span>
                </div>
              </div>
            </div>

            {/* Right Mockup Tree */}
            <div className="lg:col-span-6 bg-[#FAFAF4] p-6 sm:p-8 rounded-2xl border border-[#E7E5D9] shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[#7A8A85] uppercase border-b border-[#EFECE1] pb-3">
                  <span>Organization Tree</span>
                  <span className="px-2.5 py-1 bg-[#132E29] text-white rounded-full text-[10px]">3 active fests</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E7E5D9] space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#7A8A85]">Organization</span>
                  <p className={`text-lg font-semibold text-[#132E29] ${isMl ? "font-anek" : "font-newsreader"}`}>
                    North Arts Council
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-[#132E29]/20">
                  <div className="p-3.5 rounded-xl bg-white border border-[#E7E5D9] flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#132E29] text-white font-bold flex items-center justify-center text-xs">C</div>
                    <div>
                      <p className="font-semibold text-xs text-[#132E29]">Central Zone</p>
                      <p className="text-[10px] text-[#7A8A85]">Unit Fest</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#E7E5D9] flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#132E29] text-white font-bold flex items-center justify-center text-xs">W</div>
                    <div>
                      <p className="font-semibold text-xs text-[#132E29]">West Zone</p>
                      <p className="text-[10px] text-[#7A8A85]">Unit Fest</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Dark CTA Banner Card (Matching Screenshot 5) */}
      <section className="py-16 bg-[#FAFAF4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#132E29] p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">
                {isMl ? "ഉടൻ ആരംഭിക്കൂ" : "START SMALL"}
              </span>

              <h2 className={`text-3xl sm:text-5xl lg:text-6xl font-normal leading-tight text-white ${isMl ? "font-anek font-bold" : "font-newsreader"}`}>
                {isMl
                  ? "നിങ്ങളുടെ ഫെസ്റ്റിവൽ പേജ് ഉണ്ടാക്കി ഇന്നുതന്നെ ഫലപ്രഖ്യാപനം വരെ ടെസ്റ്റ് ചെയ്തു നോക്കൂ."
                  : "Create your fest and try it from setup to published result."}
              </h2>

              <p className="text-base sm:text-lg text-emerald-100/80 font-normal leading-relaxed">
                {isMl
                  ? "ഫെസ്റ്റിവൽ പേര് തിരഞ്ഞെടുക്കുക, 20 മത്സരാർത്ഥികൾ, 2 ടീമുകൾ, 5 മത്സരങ്ങൾ എന്നിവ സൗജന്യമായി ട്രൈ ചെയ്യൂ."
                  : "Choose a fest name and web address, then add up to 20 participants, 2 teams, 5 programs, and 1 stage."}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#132E29] hover:bg-emerald-50 transition-all shadow-md group"
                >
                  <span>{isMl ? "നിങ്ങളുടെ ഫെസ്റ്റ് തുടങ്ങൂ" : "Create your fest"}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-[#1A3D37] hover:bg-[#204841] px-8 py-4 text-base font-semibold text-white transition-all group"
                >
                  <span>{isMl ? "ലോഗിൻ ചെയ്യുക" : "Talk to FestPro"}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <p className="text-xs text-emerald-200/60 pt-2 font-medium">
                {isMl ? "✓ സൗജന്യ പ്ലാൻ എപ്പോഴും ലഭ്യമാണ്." : "Evaluation is permanently free within its limits."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="py-12 bg-[#F4F3EA] border-t border-[#E5E3D5] text-xs text-[#7A8A85]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#132E29] text-white text-xs font-bold">F</div>
            <span className="font-semibold text-[#132E29]">FestPro SaaS</span>
            <span>— Arts & Cultural Festival Suite</span>
          </div>
          <p>© {new Date().getFullYear()} FestPro Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
