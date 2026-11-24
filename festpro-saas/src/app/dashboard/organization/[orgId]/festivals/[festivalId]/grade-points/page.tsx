"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Award, Plus, Trash2, RotateCcw, Save, Check,
  SlidersHorizontal, Sparkles
} from "lucide-react"

interface GradeRule {
  id: string
  grade: string
  minMark: number
  points: number
  ruleFor: string
  appliesTo: string
}

export default function GradePointsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const initialRules: GradeRule[] = [
    { id: "1", grade: "A+", minMark: 90, points: 10, ruleFor: "Default", appliesTo: "All other programs" },
    { id: "2", grade: "A", minMark: 80, points: 8, ruleFor: "Default", appliesTo: "All other programs" },
    { id: "3", grade: "B", minMark: 70, points: 6, ruleFor: "Default", appliesTo: "All other programs" },
    { id: "4", grade: "C", minMark: 50, points: 4, ruleFor: "Default", appliesTo: "All other programs" },
  ]

  const [rules, setRules] = useState<GradeRule[]>(initialRules)
  const [saving, setSaving] = useState(false)

  const handleUpdate = (id: string, field: keyof GradeRule, val: any) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    )
  }

  const handleDelete = (id: string) => {
    if (rules.length <= 1) {
      toast.error("At least one grade rule must remain")
      return
    }
    setRules((prev) => prev.filter((r) => r.id !== id))
    toast.success("Rule removed")
  }

  const handleAddRule = () => {
    const newRule: GradeRule = {
      id: "rule-" + Date.now(),
      grade: "B+",
      minMark: 75,
      points: 7,
      ruleFor: "Default",
      appliesTo: "All other programs",
    }
    setRules((prev) => [...prev, newRule])
    toast.success("Added new grade rule")
  }

  const handleReset = () => {
    setRules(initialRules)
    toast.success("Rules reset to defaults")
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Grade rules saved successfully!")
    }, 500)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── CARD (Screenshot 7: Current rules) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        {/* Header inside card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Current rules</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Program rules apply first. Participant-count rules and then default rules are fallbacks.
              </p>
            </div>
          </div>

          {/* + add rule button (Screenshot 7) */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddRule}
            className="rounded-xl text-xs font-semibold px-3.5 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add rule
          </Button>
        </div>

        {/* ── RULES LIST (Exact fields from Screenshot 7) ── */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors items-center"
            >
              {/* 1. Grade */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grade</label>
                <Input
                  value={rule.grade}
                  onChange={(e) => handleUpdate(rule.id, "grade", e.target.value)}
                  className="h-10 rounded-xl border-slate-200 font-bold text-xs"
                />
              </div>

              {/* 2. Minimum mark */}
              <div className="sm:col-span-3 space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Minimum mark</label>
                <Input
                  type="number"
                  value={rule.minMark}
                  onChange={(e) => handleUpdate(rule.id, "minMark", parseInt(e.target.value) || 0)}
                  className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
                />
              </div>

              {/* 3. Points */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Points</label>
                <Input
                  type="number"
                  value={rule.points}
                  onChange={(e) => handleUpdate(rule.id, "points", parseInt(e.target.value) || 0)}
                  className="h-10 rounded-xl border-slate-200 text-xs font-semibold"
                />
              </div>

              {/* 4. Rule for */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rule for</label>
                <select
                  value={rule.ruleFor}
                  onChange={(e) => handleUpdate(rule.id, "ruleFor", e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="Default">Default</option>
                  <option value="Group Events">Group Events</option>
                  <option value="Solo Events">Solo Events</option>
                </select>
              </div>

              {/* 5. Applies to */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applies to</label>
                <div className="h-10 px-3 flex items-center text-xs text-slate-600 font-medium">
                  {rule.appliesTo}
                </div>
              </div>

              {/* 6. Delete Action */}
              <div className="sm:col-span-1 flex justify-end items-end pt-5">
                <button
                  type="button"
                  onClick={() => handleDelete(rule.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── BOTTOM ACTIONS (Screenshot 7: programs count, Reset, Save rules) ── */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-medium">
            5 programs use these rules.
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="rounded-xl text-xs font-semibold px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-5"
            >
              {saving ? "Saving..." : "Save rules"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
