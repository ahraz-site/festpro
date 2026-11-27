"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Megaphone,
  Volume2,
  Bell,
  Radio,
  Trophy,
  Send,
  RefreshCw,
  Tv,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import type { FestivalStage } from "@/types/festival"
import type { Competition } from "@/types/competition"

interface LiveResultAnnouncement {
  id: string
  competitionId: string
  programName: string
  category: string
  isAnnounced: boolean
  publishedAt: string
  winners: Array<{
    rank: number
    name: string
    chestNumber: string
    team: string
    score: number
  }>
}

export default function AnnouncerDeskPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [participants, setParticipants] = useState<any[]>([])

  const [selectedStage, setSelectedStage] = useState<string>("")
  const [callType, setCallType] = useState<"Call 1" | "Call 2" | "Final Call">("Call 1")
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("")
  const [chestNumber, setChestNumber] = useState("")
  const [contestantName, setContestantName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [programName, setProgramName] = useState("")

  const [liveResults, setLiveResults] = useState<LiveResultAnnouncement[]>([])
  const [customNotice, setCustomNotice] = useState("")
  const [isEmergency, setIsEmergency] = useState(false)
  const [recentBroadcasts, setRecentBroadcasts] = useState<
    Array<{ id: string; text: string; time: string; stage: string; type: string }>
  >([])

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/workspace?scope=announcer`, {
        cache: "no-store",
      })
      if (!res.ok) return
      const json = await res.json()

      const stgs: FestivalStage[] = json.stages || []
      const comps: Competition[] = json.competitions || []
      const parts: any[] = json.participants || []
      const results: any[] = json.resultItems || []
      const announcedMap: Record<string, boolean> = json.customFields?.announced_results || {}
      const broadcasts: any[] = json.customFields?.announcer_broadcasts || []

      setStages(stgs)
      setCompetitions(comps)
      setParticipants(parts)
      setRecentBroadcasts(broadcasts)

      if (stgs[0] && !selectedStage) setSelectedStage(stgs[0].name)
      if (comps[0] && !programName) setProgramName(comps[0].name)

      // Group real live/published results by competition
      const byComp = new Map<string, LiveResultAnnouncement>()
      for (const item of results) {
        if (item.status !== "live" && item.status !== "published") continue
        const compId = item.competition_id
        if (!byComp.has(compId)) {
          byComp.set(compId, {
            id: compId,
            competitionId: compId,
            programName: item.competition?.name || "Competition",
            category: item.participant?.division || "General",
            isAnnounced: !!announcedMap[compId],
            publishedAt: item.published_at
              ? new Date(item.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Published",
            winners: [],
          })
        }
        const entry = byComp.get(compId)!
        const pName = item.participant
          ? `${item.participant.first_name || ""} ${item.participant.last_name || ""}`.trim()
          : "Contestant"
        entry.winners.push({
          rank: item.rank || entry.winners.length + 1,
          name: pName,
          chestNumber: item.participant?.chest_number || "-",
          team: item.participant?.unit || "",
          score: Number(item.final_score || item.total_score || 0),
        })
      }

      const grouped = Array.from(byComp.values()).map((g) => ({
        ...g,
        winners: g.winners.sort((a, b) => a.rank - b.rank).slice(0, 3),
      }))
      setLiveResults(grouped)
    } catch (err) {
      console.error("Announcer workspace load error:", err)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    if (festivalId) loadWorkspace()
  }, [festivalId, loadWorkspace])

  const handleSelectParticipant = (pid: string) => {
    setSelectedParticipantId(pid)
    const p = participants.find((item) => item.id === pid)
    if (p) {
      setChestNumber(p.chest_number || "")
      setContestantName(`${p.first_name || ""} ${p.last_name || ""}`.trim())
      setTeamName(p.unit || "")
    }
  }

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioCtx.currentTime

      const osc1 = audioCtx.createOscillator()
      const gain1 = audioCtx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(587.33, now)
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
      osc1.connect(gain1)
      gain1.connect(audioCtx.destination)
      osc1.start(now)
      osc1.stop(now + 1.2)

      const osc2 = audioCtx.createOscillator()
      const gain2 = audioCtx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(880, now + 0.15)
      gain2.gain.setValueAtTime(0.25, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
      osc2.connect(gain2)
      gain2.connect(audioCtx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 1.5)

      toast.info("Attention Chime Sounded!")
    } catch {
      toast.info("Chime tone triggered")
    }
  }

  const stageLabel = selectedStage || "Main Stage"
  const progLabel = programName || "the competition"

  const generatedScriptEn = `${stageLabel}, ${callType}: Chest Number ${chestNumber || "___"}, ${
    contestantName ? `${contestantName}${teamName ? ` from ${teamName}` : ""}` : "Contestant"
  } for ${progLabel}. Please report to ${stageLabel} immediately.`

  const generatedScriptMl = `${stageLabel}, ${callType}: ചെസ്റ്റ് നമ്പർ ${chestNumber || "___"}, ${
    contestantName ? `${contestantName}${teamName ? ` (${teamName})` : ""}` : "മത്സരാർത്ഥി"
  } - ${progLabel} മത്സരത്തിനായി ${stageLabel}-ലേക്ക് ഉടൻ പ്രവേശിക്കുക.`

  const handleBroadcastCall = async () => {
    playChime()
    const summaryText = `${callType}: Chest #${chestNumber || "-"} (${contestantName || "Participant"}) for ${progLabel} on ${stageLabel}`
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_announcement",
          payload: { text: summaryText, stage: stageLabel, type: "cue" },
        }),
      })
      const json = await res.json()
      if (json.entry) setRecentBroadcasts((prev) => [json.entry, ...prev])
      toast.success(`Broadcasted ${callType} to ${stageLabel}!`)
    } catch {
      toast.error("Failed to save broadcast log")
    }
  }

  const handleBroadcastNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customNotice.trim()) return
    playChime()
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_announcement",
          payload: {
            text: customNotice.trim(),
            stage: stageLabel,
            type: isEmergency ? "emergency" : "notice",
            isEmergency,
          },
        }),
      })
      const json = await res.json()
      if (json.entry) setRecentBroadcasts((prev) => [json.entry, ...prev])
      toast.success("Stage notice published!")
      setCustomNotice("")
    } catch {
      toast.error("Failed to post notice")
    }
  }

  const toggleAnnouncedResult = async (compId: string) => {
    const target = liveResults.find((r) => r.id === compId)
    const next = !target?.isAnnounced
    setLiveResults((prev) =>
      prev.map((r) => (r.id === compId ? { ...r, isAnnounced: next } : r))
    )
    try {
      await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_result_announced",
          payload: { competitionId: compId, isAnnounced: next },
        }),
      })
      toast.success(next ? `Marked "${target?.programName}" as Announced!` : "Marked as pending")
    } catch {}
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>Master of Ceremonies (MC) &amp; Public Address Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Announcer Console
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Stage contestant call scripts, live winner announcements on mic, chime gongs, and display bulletins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadWorkspace}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={playChime}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span>Sound Chime Bell</span>
          </button>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stage-desk`}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Tv className="h-4 w-4 text-indigo-400" />
            <span>Stage Desk</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: LIVE MIC CALL PROMPT GENERATOR ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Live Stage Call Cue
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Select a stage, program, and participant to read on mic</p>
                </div>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-bold">
                {(["Call 1", "Call 2", "Final Call"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCallType(t)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      callType === t
                        ? t === "Final Call"
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Participant Picker from Real DB */}
            {participants.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Quick Pick Registered Participant</label>
                <select
                  value={selectedParticipantId}
                  onChange={(e) => handleSelectParticipant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose a festival participant (auto-fills chest # &amp; team) --</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.chest_number || "-"} · {p.first_name} {p.last_name} {p.unit ? `(${p.unit})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stage, Chest #, Name, Program Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                >
                  {stages.length === 0 && <option value="">No stages configured</option>}
                  {stages.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Chest Number</label>
                <input
                  type="text"
                  value={chestNumber}
                  onChange={(e) => setChestNumber(e.target.value)}
                  placeholder="Enter chest number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-mono font-black focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Candidate Name</label>
                <input
                  type="text"
                  value={contestantName}
                  onChange={(e) => setContestantName(e.target.value)}
                  placeholder="Enter contestant name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Team / House</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Competition / Program</label>
                {competitions.length > 0 ? (
                  <select
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select program...</option>
                    {competitions.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({(c as any).category?.name || "General"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    placeholder="Enter competition name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>

            {/* Teleprompter Cards */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Mic Prompts (Read Clearly)
              </span>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-slate-900 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  <span>English Prompt</span>
                  <span className="bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-black">
                    {callType}
                  </span>
                </div>
                <p className="text-sm font-bold leading-relaxed text-slate-900">{generatedScriptEn}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-slate-900 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  <span>Malayalam Prompt (മലയാളം)</span>
                  <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-black">
                    {callType}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-slate-900">{generatedScriptMl}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={playChime}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Bell className="h-4 w-4 text-amber-500" />
                <span>Test Sound</span>
              </button>

              <button
                onClick={handleBroadcastCall}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <Volume2 className="h-4 w-4" />
                <span>Announce {callType} on Stage Desk</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: LIVE RESULTS FLASH & BROADCAST TICKER ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-black text-slate-900">
                  Live Results Flash
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Official Winners
              </span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Checking live results...</span>
              </div>
            ) : liveResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
                No verified results published yet. When results are published from Enter Marks or Judges Panel, official winners will flash here automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {liveResults.map((r) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      r.isAnnounced
                        ? "border-slate-200 bg-slate-50/80 opacity-75"
                        : "border-amber-300 bg-amber-50/40 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{r.programName}</h3>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {r.category} · {r.publishedAt}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleAnnouncedResult(r.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          r.isAnnounced
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        }`}
                      >
                        {r.isAnnounced ? "Announced ✓" : "Mark Announced"}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      {r.winners.map((w) => (
                        <div
                          key={`${r.id}-${w.rank}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60"
                        >
                          <span className="font-black text-amber-600">
                            {w.rank === 1 ? "1st Place:" : w.rank === 2 ? "2nd Place:" : "3rd Place:"}
                          </span>
                          <span className="font-bold text-slate-800">
                            #{w.chestNumber} - {w.name} {w.team ? `(${w.team})` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-600" />
              <span>Broadcast Screen Bulletin</span>
            </h3>

            <form onSubmit={handleBroadcastNotice} className="space-y-3">
              <textarea
                value={customNotice}
                onChange={(e) => setCustomNotice(e.target.value)}
                placeholder="Type announcement, lunch break notice, or stage update..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  Post to Screens
                </button>
              </div>
            </form>

            {recentBroadcasts.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2 max-h-44 overflow-y-auto">
                {recentBroadcasts.slice(0, 6).map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px]">
                    <div className="font-semibold text-slate-800">{b.text}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{b.stage} · {b.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
