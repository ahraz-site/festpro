"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getFestivalDashboardData } from "@/lib/actions/festival"
import { COMPETITION_UNITS, type CompetitionUnitType } from "@/config/festival-modules"
import type { FestivalDashboardData } from "@/types/festival"
import {
  Users, Trophy, Settings, LayoutGrid, Bookmark,
  Radio, Award, FileText, Globe, Clock,
  CheckCircle2, Medal, Calendar, UserPlus,
  PlusCircle, Sparkles, Tv, ChevronDown, ChevronUp
} from "lucide-react"

export default function FestivalOperationsDashboard() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [data, setData] = useState<FestivalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  useEffect(() => {
    async function load() {
      const result = await getFestivalDashboardData(festivalId)
      setData(result)
      setLoading(false)
    }
    load()
  }, [festivalId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium">Loading festival operations dashboard...</p>
      </div>
    )
  }

  if (!data || !data.festival) {
    return (
      <div className="text-center py-16 text-slate-600 space-y-4">
        <h2 className="text-xl font-bold">Festival Workspace Not Found</h2>
        <p className="text-sm text-slate-500">The requested festival could not be loaded or you don&apos;t have access.</p>
        <Link
          href={`/dashboard/organization/${orgId}/festivals`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
        >
          Back to Festivals
        </Link>
      </div>
    )
  }

  const { festival, settings, statistics, leaderboard = [], upcomingProgrammes = [], activeStages = [] } = data
  const unitKey = (settings?.terminology?.unit || "groups") as CompetitionUnitType
  const unitConfig = COMPETITION_UNITS[unitKey] || COMPETITION_UNITS.groups
  const unitPlural = unitConfig.plural

  const stats = statistics as any
  const totalTeams = stats?.total_teams || 0
  const totalParticipants = stats?.total_participants || 0
  const totalPrograms = stats?.total_competitions || 0
  const totalStages = stats?.total_stages || 0
  const resultsPublished = stats?.total_results_published || 0

  // Progress computation
  const hasTeams = totalTeams > 0 || unitKey === "individual"
  const hasParticipants = totalParticipants > 0
  const hasPrograms = totalPrograms > 0
  const hasStages = totalStages > 0
  const completedSteps = [hasTeams, hasParticipants, hasPrograms, hasStages].filter(Boolean).length
  const setupPercent = Math.round((completedSteps / 4) * 100)

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. FESTIVAL HEADER & STATUS BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {festival.short_name?.slice(0, 3).toUpperCase() || festival.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{festival.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {festival.status || "Active"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Structure: {unitPlural}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-medium">
              {festival.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {festival.start_date} {festival.end_date ? `to ${festival.end_date}` : ""}
                </span>
              )}
              {festival.venue_name && (
                <span className="flex items-center gap-1">
                  <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
                  {festival.venue_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/festivals/${festivalId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
          >
            <Globe className="h-3.5 w-3.5 text-indigo-600" /> Public Portal
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/settings`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
          >
            <Settings className="h-3.5 w-3.5" /> Fest Settings
          </Link>
        </div>
      </div>

      {/* 2. OPERATIONAL QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants`}
          className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">Participants</span>
            <Bookmark className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalParticipants}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Enrolled candidates</p>
        </Link>

        {unitKey !== "individual" && (
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`}
            className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold text-slate-600 truncate">{unitPlural}</span>
              <Users className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalTeams}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Active competing units</p>
          </Link>
        )}

        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`}
          className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">Programmes</span>
            <Trophy className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPrograms}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Competitions listed</p>
        </Link>

        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/registrations`}
          className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">Registrations</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalParticipants > 0 ? "Active" : "Ready"}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Candidate entries</p>
        </Link>

        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
          className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">Stages / Venues</span>
            <LayoutGrid className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStages}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active stage venues</p>
        </Link>

        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results`}
          className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold text-slate-600 truncate">Results</span>
            <Award className="h-4 w-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">{resultsPublished}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Items published</p>
        </Link>
      </div>

      {/* 3. OPERATIONAL QUICK ACTIONS BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Operations Control</h3>
          </div>
          <span className="text-xs text-slate-400">Direct shortcuts for desk operators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-indigo-400 group-hover:text-white shrink-0" />
            <span className="truncate">+ Participant</span>
          </Link>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-purple-400 group-hover:text-white shrink-0" />
            <span className="truncate">+ Programme</span>
          </Link>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/registrations`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <Bookmark className="h-4 w-4 text-emerald-400 group-hover:text-white shrink-0" />
            <span className="truncate">Register</span>
          </Link>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <Clock className="h-4 w-4 text-amber-400 group-hover:text-white shrink-0" />
            <span className="truncate">Schedule</span>
          </Link>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/publish`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <FileText className="h-4 w-4 text-blue-400 group-hover:text-white shrink-0" />
            <span className="truncate">Mark Entry</span>
          </Link>

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
          >
            <Award className="h-4 w-4 text-rose-400 group-hover:text-white shrink-0" />
            <span className="truncate">Publish Results</span>
          </Link>
        </div>
      </div>

      {/* 4. MAIN OPERATIONAL WORKSPACE (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: LIVE STAGES & UPCOMING PROGRAMMES */}
        <div className="space-y-6">
          {/* Live Stage Monitoring Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-900">Live Stage Monitoring</h3>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/organization/${orgId}/festivals/${festivalId}/live/display`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Tv className="h-3 w-3" /> Live Screen
                </Link>
                <Link
                  href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                >
                  All Stages
                </Link>
              </div>
            </div>

            <div className="pt-3 space-y-2.5">
              {activeStages.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <LayoutGrid className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  No stages configured yet.
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      + Add Festival Stage
                    </Link>
                  </div>
                </div>
              ) : (
                activeStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {stage.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{stage.name}</h4>
                        <p className="text-[11px] text-slate-500">{stage.venueName || "Main Ground"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {stage.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Scheduled Programmes Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Upcoming Programmes</h3>
              </div>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                Full Schedule →
              </Link>
            </div>

            <div className="pt-3 space-y-2">
              {upcomingProgrammes.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  No programmes scheduled yet.
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      + Create First Schedule
                    </Link>
                  </div>
                </div>
              ) : (
                upcomingProgrammes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {item.code && (
                          <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {item.code}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.stageName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 block">
                        {item.time || "Scheduled"}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">{item.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LEADERBOARD & SETUP CHECKLIST */}
        <div className="space-y-6">
          {/* Group / Team Leaderboard Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900">{unitPlural} Leaderboard</h3>
              </div>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/team-points`}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                Points Table →
              </Link>
            </div>

            <div className="pt-3 space-y-2.5">
              {leaderboard.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <Trophy className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  No {unitPlural.toLowerCase()} points recorded yet.
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Configure {unitPlural}
                    </Link>
                  </div>
                </div>
              ) : (
                leaderboard.slice(0, 5).map((team, idx) => {
                  const rank = team.rank || idx + 1
                  const isGold = rank === 1
                  const isSilver = rank === 2
                  const isBronze = rank === 3

                  return (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            isGold
                              ? "bg-amber-400 text-amber-950 shadow-xs"
                              : isSilver
                              ? "bg-slate-300 text-slate-800"
                              : isBronze
                              ? "bg-amber-700 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {rank}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{team.name}</h4>
                          {team.code && (
                            <span className="text-[10px] font-mono text-slate-400">{team.code}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-indigo-600 block leading-tight">
                          {team.points} <span className="text-[10px] font-medium text-slate-400">pts</span>
                        </span>
                        {(team.gold || 0) + (team.silver || 0) + (team.bronze || 0) > 0 && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            🥇{team.gold || 0} 🥈{team.silver || 0} 🥉{team.bronze || 0}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Collapsible Setup Checklist */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Festival Readiness Checklist</h3>
                  <p className="text-[11px] text-slate-500">{completedSteps} of 4 core phases configured ({setupPercent}%)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${setupPercent}%` }} />
                </div>
                {showSetupGuide ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </div>
            </div>

            {showSetupGuide && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className={hasTeams ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}>
                    1. Competition {unitPlural} ({totalTeams})
                  </span>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className={hasParticipants ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}>
                    2. Enrolled Participants ({totalParticipants})
                  </span>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className={hasPrograms ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}>
                    3. Programme Catalog ({totalPrograms})
                  </span>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className={hasStages ? "text-emerald-700 font-bold" : "text-slate-600 font-medium"}>
                    4. Stages & Venues ({totalStages})
                  </span>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
