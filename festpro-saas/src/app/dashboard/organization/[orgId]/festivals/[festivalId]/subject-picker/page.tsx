"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Dices, Sparkles, RefreshCw, History,
  RotateCcw, Check, Trophy
} from "lucide-react"

export default function SubjectPickerPage() {
  const params = useParams()
  const [highestNumber, setHighestNumber] = useState<number>(100)
  const [currentPick, setCurrentPick] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [pickedHistory, setPickedHistory] = useState<number[]>([])

  const handlePickSubject = () => {
    if (!highestNumber || highestNumber < 1) {
      toast.error("Please enter a valid highest number greater than 0")
      return
    }

    const available: number[] = []
    for (let i = 1; i <= highestNumber; i++) {
      if (!pickedHistory.includes(i)) available.push(i)
    }

    if (available.length === 0) {
      toast.error(`All ${highestNumber} numbers have already been picked!`)
      return
    }

    setIsRolling(true)
    let rolls = 0
    const interval = setInterval(() => {
      const randomDisplay = Math.floor(Math.random() * highestNumber) + 1
      setCurrentPick(randomDisplay)
      rolls++

      if (rolls >= 18) {
        clearInterval(interval)
        const selected = available[Math.floor(Math.random() * available.length)]
        setCurrentPick(selected)
        setPickedHistory((prev) => [selected, ...prev])
        setIsRolling(false)
        toast.success(`Picked Subject #${selected}!`)
      }
    }, 60)
  }

  const handleReset = () => {
    if (!confirm("Are you sure you want to clear picked history?")) return
    setPickedHistory([])
    setCurrentPick(null)
    toast.success("History cleared")
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 7) ── */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
          <Dices className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subject picker</h1>
          <p className="text-xs text-slate-500 font-medium">Randomly pick a subject number for selection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── PICKER INPUT CARD (Screenshot 7) ── */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Highest number</label>
            <Input
              type="number"
              min={1}
              value={highestNumber}
              onChange={(e) => setHighestNumber(parseInt(e.target.value) || 0)}
              className="h-11 rounded-xl border-slate-200 text-sm font-bold"
            />
          </div>

          <Button
            size="lg"
            onClick={handlePickSubject}
            disabled={isRolling}
            className="w-full h-11 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
          >
            {isRolling ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Rolling numbers...
              </>
            ) : (
              "Pick subject"
            )}
          </Button>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Presets</span>
            <div className="flex flex-wrap gap-2">
              {[20, 50, 100, 150].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setHighestNumber(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    highestNumber === num
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Max {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BIG RESULT DISPLAY AREA ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[260px] space-y-4">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest block">
              {isRolling ? "SELECTING SUBJECT..." : currentPick ? "SELECTED SUBJECT NUMBER" : "READY TO ROLL"}
            </span>

            <div className="relative">
              <div
                className={`w-36 h-36 rounded-3xl flex items-center justify-center shadow-lg border transition-all transform ${
                  isRolling
                    ? "bg-indigo-600 text-white scale-105 animate-pulse"
                    : currentPick
                    ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white scale-100 border-emerald-400"
                    : "bg-slate-100 text-slate-300 border-slate-200"
                }`}
              >
                <span className="font-mono text-6xl font-black tracking-tight">
                  {currentPick !== null ? currentPick : "—"}
                </span>
              </div>
            </div>

            {currentPick && !isRolling && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                <span>Subject #{currentPick} officially assigned</span>
              </div>
            )}
          </div>

          {/* ── PICKED HISTORY ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Picked History ({pickedHistory.length} of {highestNumber})
                </h3>
              </div>

              {pickedHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="h-3 w-3" /> Clear history
                </button>
              )}
            </div>

            {pickedHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No subjects picked yet. Press "Pick subject" to begin.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pickedHistory.map((num, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs"
                  >
                    #{num}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
