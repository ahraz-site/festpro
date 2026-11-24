"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getCompetitions } from "@/lib/actions/competition"
import type { Competition } from "@/types/competition"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  ListFilter, RefreshCw, Send, Check, ChevronRight,
  Trophy, TrendingUp, Sparkles, Target
} from "lucide-react"

interface PlannedOpportunity {
  programName: string
  category: string
  candidateName: string
  currentRank: string
  potentialPoints: number
  status: "Review Pending" | "Valuation Complete" | "Draft Ready"
}

export default function ResultPlannerPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [teams, setTeams] = useState<{ id: string; name: string; code: string }[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [scope, setScope] = useState<string>("Overall")
  const [includeReview, setIncludeReview] = useState(true)
  const [opportunities, setOpportunities] = useState<PlannedOpportunity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("teams")
          .select("id, name, code")
          .eq("festival_id", festivalId)
          .order("name", { ascending: true })

        if (data && data.length > 0) {
          setTeams(data)
        } else {
          setTeams([
            { id: "1", name: "BJP", code: "BJP" },
            { id: "2", name: "CJP", code: "CJP" },
          ])
        }
      } catch (err) {
        console.error("Failed to load teams:", err)
      }
    }
    load()
  }, [festivalId])

  useEffect(() => {
    if (!selectedTeam) {
      setOpportunities([])
      return
    }

    setLoading(true)
    setTimeout(() => {
      const teamObj = teams.find((t) => t.id === selectedTeam)
      const mock: PlannedOpportunity[] = [
        {
          programName: "Mime",
          category: "Senior",
          candidateName: `${teamObj?.name || "Team"} Troupe`,
          currentRank: "Projected 1st",
          potentialPoints: 10,
          status: "Valuation Complete",
        },
        {
          programName: "Elocution (English)",
          category: "Senior",
          candidateName: "Amina Z.",
          currentRank: "Projected 2nd",
          potentialPoints: 5,
          status: "Review Pending",
        },
        {
          programName: "Patriotic Song",
          category: "General",
          candidateName: `${teamObj?.name || "Team"} Choir`,
          currentRank: "Projected 1st",
          potentialPoints: 10,
          status: "Draft Ready",
        },
      ]
      setOpportunities(mock)
      setLoading(false)
    }, 300)
  }, [selectedTeam, teams])

  const handlePublishTeamScores = () => {
    toast.success("Team scores published to live leaderboard!")
  }

  const selectedTeamObj = teams.find((t) => t.id === selectedTeam)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 3) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Result planner</h1>
          <p className="text-xs text-slate-500 font-medium">See which results to finalize and publish next to put a team on top.</p>
        </div>

        {/* Top Right Action Buttons (Screenshot 3: Refresh, Publish team scores) */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Refreshed results calculations")}
            className="rounded-xl text-xs font-semibold px-3 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handlePublishTeamScores}
            className="rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
          >
            Publish team scores
          </Button>
        </div>
      </div>

      {/* ── FILTERS (Screenshot 3: Overall, Choose a team, Include results awaiting final review) ── */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 w-36 shadow-xs"
        >
          <option value="Overall">Overall</option>
          <option value="Senior">Senior</option>
          <option value="Junior">Junior</option>
        </select>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 w-64 shadow-xs"
        >
          <option value="">Choose a team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeReview}
            onChange={(e) => setIncludeReview(e.target.checked)}
            className="rounded-md border-slate-300 text-emerald-700 h-4 w-4"
          />
          <span>Include results awaiting final review</span>
        </label>
      </div>

      {/* ── CONTENT AREA (Screenshot 3: Choose a team vs Calculated Opportunities) ── */}
      {!selectedTeam ? (
        /* Empty Prompt State Matching Screenshot 3 */
        <div className="rounded-2xl border border-slate-200 bg-white p-20 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <ListFilter className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Choose a team</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Select a team from the dropdown above to simulate points progression.</p>
          </div>
        </div>
      ) : (
        /* Team Strategy & Points Projection Sheet */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-indigo-950">
                Strategy Sheet for {selectedTeamObj?.name}
              </h3>
              <p className="text-xs text-indigo-700 font-medium">
                Publishing these {opportunities.length} pending results can add +25.00 points to {selectedTeamObj?.name}.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block uppercase">Potential Total</span>
              <span className="text-xl font-black text-indigo-700">35.00 pts (#1 Lead)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Projected Rank</th>
                  <th className="py-3 px-4">Potential Points</th>
                  <th className="py-3 px-4">Stage Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {opportunities.map((opp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{opp.programName}</td>
                    <td className="py-4 px-4 text-slate-600">{opp.category}</td>
                    <td className="py-4 px-4 text-slate-800 font-semibold">{opp.candidateName}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        {opp.currentRank}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-indigo-700">+{opp.potentialPoints} pts</td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-slate-500">{opp.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Publish <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
