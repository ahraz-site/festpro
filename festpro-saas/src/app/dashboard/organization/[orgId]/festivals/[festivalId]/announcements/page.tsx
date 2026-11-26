"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Megaphone,
  Volume2,
  VolumeX,
  Bell,
  Radio,
  Trophy,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Sliders,
  Tv,
} from "lucide-react"
import { toast } from "sonner"
import { getFestivalStages } from "@/lib/actions/festival"
import { getCompetitions } from "@/lib/actions/competition"
import type { FestivalStage } from "@/types/festival"

interface LiveResultAnnouncement {
  id: string
  programName: string
  category: string
  stageName: string
  isAnnounced: boolean
  publishedAt: string
  firstPlace: { name: string; chestNumber: string; team: string; points: number }
  secondPlace?: { name: string; chestNumber: string; team: string; points: number }
  thirdPlace?: { name: string; chestNumber: string; team: string; points: number }
}

const DEMO_LIVE_RESULTS: LiveResultAnnouncement[] = [
  {
    id: "res-1",
    programName: "Madh Song",
    category: "Senior",
    stageName: "Stage 1",
    isAnnounced: false,
    publishedAt: "Just now",
    firstPlace: { name: "Shamil V", chestNumber: "102", team: "Team Alpha (Emerald)", points: 10 },
    secondPlace: { name: "Rashid K", chestNumber: "106", team: "Team Beta (Sapphire)", points: 5 },
    thirdPlace: { name: "Ruhaib M", chestNumber: "114", team: "Team Gamma (Ruby)", points: 3 },
  },
  {
    id: "res-2",
    programName: "Classical Solo Dance (Bharatanatyam)",
    category: "Senior",
    stageName: "Stage 1",
    isAnnounced: true,
    publishedAt: "15 mins ago",
    firstPlace: { name: "Aysha Fathima", chestNumber: "101", team: "Team Alpha (Emerald)", points: 10 },
    secondPlace: { name: "Nihala M", chestNumber: "105", team: "Team Beta (Sapphire)", points: 5 },
  },
]

export default function AnnouncerDeskPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [stages, setStages] = useState<FestivalStage[]>([])
  const [selectedStage, setSelectedStage] = useState<string>("Stage 1")
  const [callType, setCallType] = useState<"Call 1" | "Call 2" | "Final Call">("Call 1")
  const [chestNumber, setChestNumber] = useState("105")
  const [contestantName, setContestantName] = useState("Muhammed Sinan")
  const [teamName, setTeamName] = useState("Team Alpha")
  const [programName, setProgramName] = useState("Madh Song")

  // Live Results for Mic Announcement
  const [liveResults, setLiveResults] = useState<LiveResultAnnouncement[]>(DEMO_LIVE_RESULTS)
  const [customNotice, setCustomNotice] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [recentBroadcasts, setRecentBroadcasts] = useState<
    Array<{ id: string; text: string; time: string; stage: string; type: string }>
  >([
    {
      id: "b1",
      text: "Call 1: Chest #102 reported to Stage 1 for Madh Song",
      time: "10:30 AM",
      stage: "Stage 1",
      type: "cue",
    },
    {
      id: "b2",
      text: "Stage 2 schedule running on time. Next: Light Music Solo",
      time: "10:15 AM",
      stage: "Stage 2",
      type: "notice",
    },
  ])

  useEffect(() => {
    async function init() {
      try {
        const sRes = await getFestivalStages(festivalId)
        if (Array.isArray(sRes) && sRes.length > 0) {
          setStages(sRes as FestivalStage[])
          setSelectedStage(sRes[0].name)
        }
      } catch {}
    }
    if (festivalId) init()
  }, [festivalId])

  // Web Audio API Gong / Chime Sound
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioCtx.currentTime

      // First pleasant note (A4 - 440Hz)
      const osc1 = audioCtx.createOscillator()
      const gain1 = audioCtx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(587.33, now) // D5
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
      osc1.connect(gain1)
      gain1.connect(audioCtx.destination)
      osc1.start(now)
      osc1.stop(now + 1.2)

      // Second note harmonizer (F#5 - 739.99Hz)
      const osc2 = audioCtx.createOscillator()
      const gain2 = audioCtx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(880, now + 0.15) // A5
      gain2.gain.setValueAtTime(0.25, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
      osc2.connect(gain2)
      gain2.connect(audioCtx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 1.5)

      toast.info("Attention Chime Sounded!", { icon: "🔔" })
    } catch {
      toast.info("Chime tone triggered")
    }
  }

  const generatedScriptEn = `${selectedStage}, ${callType}: Chest Number ${chestNumber || "___"}, ${
    contestantName ? `${contestantName} from ${teamName}` : "Participant"
  } for ${programName}. Please report to ${selectedStage} immediately.`

  const generatedScriptMl = `${selectedStage}, ${callType}: ചെസ്റ്റ് നമ്പർ ${chestNumber || "___"}, ${
    contestantName ? `${contestantName} (${teamName})` : "മത്സരാർത്ഥി"
  } - ${programName} മത്സരത്തിനായി ${selectedStage}-ലേക്ക് ഉടൻ പ്രവേശിക്കുക.`

  const handleBroadcastCall = () => {
    playChime()
    const newEntry = {
      id: `bc_${Date.now()}`,
      text: `${callType}: Chest #${chestNumber} (${contestantName}) for ${programName} on ${selectedStage}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stage: selectedStage,
      type: "cue",
    }
    setRecentBroadcasts((prev) => [newEntry, ...prev])
    toast.success(`Broadcasted ${callType} for Chest #${chestNumber} to ${selectedStage}!`)
  }

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customNotice.trim()) return
    playChime()
    const newEntry = {
      id: `bc_${Date.now()}`,
      text: customNotice.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stage: selectedStage,
      type: isEmergency ? "emergency" : "notice",
    }
    setRecentBroadcasts((prev) => [newEntry, ...prev])
    toast.success("Stage notice broadcasted!")
    setCustomNotice("")
  }

  const toggleAnnouncedResult = (id: string) => {
    setLiveResults((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const next = !r.isAnnounced
        toast.success(next ? `Marked "${r.programName}" as Announced!` : "Marked as pending")
        return { ...r, isAnnounced: next }
      })
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>Master of Ceremonies (MC) &amp; Public Address Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Announcer Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage contestant call scripts, live winner announcements on mic, chime gongs, and display bulletins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Attention Gong Button */}
          <button
            onClick={playChime}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span>Sound Chime Bell</span>
          </button>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stage-desk`}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Tv className="h-4 w-4 text-purple-400" />
            <span>Stage Desk</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: LIVE MIC CALL PROMPT GENERATOR ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Live Stage Call Cue
                  </h2>
                  <p className="text-xs text-slate-500">Read on mic when summoning next candidate</p>
                </div>
              </div>

              {/* Call Type Pill */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {(["Call 1", "Call 2", "Final Call"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCallType(t)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      callType === t
                        ? t === "Final Call"
                          ? "bg-red-500 text-white shadow-xs"
                          : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage, Chest #, Name Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="Stage 1">Stage 1 (Main Auditorium)</option>
                  <option value="Stage 2">Stage 2 (Seminar Hall)</option>
                  <option value="Stage 3">Stage 3 (Open Air Theatre)</option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Chest Number</label>
                <input
                  type="text"
                  value={chestNumber}
                  onChange={(e) => setChestNumber(e.target.value)}
                  placeholder="e.g. 105"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono font-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Candidate &amp; Team</label>
                <input
                  type="text"
                  value={contestantName}
                  onChange={(e) => setContestantName(e.target.value)}
                  placeholder="Contestant name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Competition</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. Madh Song"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Teleprompter Cards for Announcer */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Mic Prompts (Read Clearly)
              </span>

              {/* English Script */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                  <span>English Prompt</span>
                  <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">
                    {callType}
                  </span>
                </div>
                <p className="text-sm font-bold leading-relaxed">{generatedScriptEn}</p>
              </div>

              {/* Malayalam Script */}
              <div className="p-4 rounded-2xl bg-[#08151f] text-slate-100 space-y-1.5 border border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#00c9a7]">
                  <span>Malayalam Prompt (മലയാളം)</span>
                  <span className="bg-[#00a389]/20 px-2 py-0.5 rounded text-[#00c9a7]">
                    {callType}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed">{generatedScriptMl}</p>
              </div>
            </div>

            {/* Broadcast & Gong Trigger */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={playChime}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="h-4 w-4 text-amber-500" />
                <span>Test Sound</span>
              </button>

              <button
                onClick={handleBroadcastCall}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Volume2 className="h-4 w-4" />
                <span>Announce {callType} on Stage Desk</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: LIVE RESULTS FLASH & BROADCAST TICKER ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* LIVE RESULTS FLASH CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Live Results Flash
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Official Winners
              </span>
            </div>

            <div className="space-y-4">
              {liveResults.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    r.isAnnounced
                      ? "border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 opacity-70"
                      : "border-amber-400/50 bg-amber-50/20 dark:bg-amber-500/10 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {r.programName}
                      </h3>
                      <span className="text-[10px] text-slate-500">
                        {r.category} · {r.stageName} · {r.publishedAt}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleAnnouncedResult(r.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        r.isAnnounced
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                      }`}
                    >
                      {r.isAnnounced ? "Announced ✓" : "Mark Announced"}
                    </button>
                  </div>

                  {/* 1st, 2nd, 3rd Winner breakdown to read */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/70 dark:bg-[#0c131d]/70">
                      <span className="font-black text-amber-600 dark:text-amber-400">1st Place:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        #{r.firstPlace.chestNumber} - {r.firstPlace.name} ({r.firstPlace.team})
                      </span>
                    </div>
                    {r.secondPlace && (
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/70 dark:bg-[#0c131d]/70">
                        <span className="font-black text-slate-500 dark:text-slate-400">2nd Place:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          #{r.secondPlace.chestNumber} - {r.secondPlace.name} ({r.secondPlace.team})
                        </span>
                      </div>
                    )}
                    {r.thirdPlace && (
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/70 dark:bg-[#0c131d]/70">
                        <span className="font-black text-amber-700 dark:text-amber-600">3rd Place:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          #{r.thirdPlace.chestNumber} - {r.thirdPlace.name} ({r.thirdPlace.team})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK TICKER BULLETIN SENDER */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-purple-500" />
              <span>Broadcast Screen Bulletin</span>
            </h3>

            <form onSubmit={handleBroadcastNotice} className="space-y-3">
              <textarea
                value={customNotice}
                onChange={(e) => setCustomNotice(e.target.value)}
                placeholder="Type emergency alert, lunch break, or lost & found notice..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-red-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="accent-red-600"
                  />
                  <span>Urgent Flash</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
                >
                  Post to Screens
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
