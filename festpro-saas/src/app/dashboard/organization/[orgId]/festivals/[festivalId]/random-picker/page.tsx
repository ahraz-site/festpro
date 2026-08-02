"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dices, RefreshCw, History, Trash2, Sparkles } from "lucide-react"

export default function SubjectPickerPage() {
  const params = useParams()
  const [maxNumber, setMaxNumber] = useState<number>(100)
  const [minNumber, setMinNumber] = useState<number>(1)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState<boolean>(false)
  const [history, setHistory] = useState<number[]>([])
  const [preventDuplicates, setPreventDuplicates] = useState<boolean>(true)

  const handlePickSubject = () => {
    if (minNumber >= maxNumber) {
      alert("Highest number must be greater than starting number.")
      return
    }

    setIsRolling(true)

    // Calculate available numbers if avoiding duplicates
    let available: number[] = []
    for (let i = minNumber; i <= maxNumber; i++) {
      if (!preventDuplicates || !history.includes(i)) {
        available.push(i)
      }
    }

    if (available.length === 0) {
      alert("All numbers in this range have already been picked!")
      setIsRolling(false)
      return
    }

    // Number rolling animation effect
    let count = 0
    const interval = setInterval(() => {
      const tempNum = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
      setCurrentNumber(tempNum)
      count++
      if (count >= 15) {
        clearInterval(interval)
        const finalPicked = available[Math.floor(Math.random() * available.length)]
        setCurrentNumber(finalPicked)
        setHistory((prev) => [finalPicked, ...prev])
        setIsRolling(false)
      }
    }, 50)
  }

  const handleResetHistory = () => {
    setHistory([])
    setCurrentNumber(null)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Dices className="h-6 w-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Subject Picker</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Randomly pick a subject or topic number for stage selection during competitions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls & Pick Column */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border-slate-200/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Range Settings</CardTitle>
              <CardDescription>Configure the number range for selection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Starting Number</label>
                  <Input
                    type="number"
                    value={minNumber}
                    onChange={(e) => setMinNumber(Number(e.target.value))}
                    min={1}
                    className="font-mono text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Highest Number</label>
                  <Input
                    type="number"
                    value={maxNumber}
                    onChange={(e) => setMaxNumber(Number(e.target.value))}
                    min={minNumber + 1}
                    className="font-mono text-base font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="noDupes"
                  checked={preventDuplicates}
                  onChange={(e) => setPreventDuplicates(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="noDupes" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
                  Prevent picking duplicate numbers until reset
                </label>
              </div>

              <Button
                onClick={handlePickSubject}
                disabled={isRolling}
                className="w-full py-6 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isRolling ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Picking Subject...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Pick Subject</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Random Result Card */}
          <Card className="border-slate-200 shadow-md bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Dices className="h-48 w-48 text-white" />
            </div>
            <CardContent className="p-8 text-center space-y-4">
              <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">
                Random Selection Output
              </span>
              <div className="py-6">
                {currentNumber !== null ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300 font-medium">Your random number is:</p>
                    <div className="text-6xl sm:text-8xl font-extrabold font-mono text-emerald-400 drop-shadow-lg tracking-tight animate-bounce-short">
                      {currentNumber}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-slate-400">
                    <p className="text-base font-semibold">Click &quot;Pick Subject&quot; to draw a random topic number.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Column */}
        <div className="md:col-span-5 space-y-6">
          <Card className="border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  <span>Drawn History</span>
                </CardTitle>
                <CardDescription className="text-xs">Previously picked numbers</CardDescription>
              </div>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetHistory}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {history.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-[350px] overflow-y-auto p-1">
                  {history.map((num, idx) => (
                    <div
                      key={idx}
                      className={`h-12 w-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg border transition-all ${
                        idx === 0
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-sm scale-105"
                          : "bg-slate-50 text-slate-800 border-slate-200"
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-center text-slate-400 text-xs italic">
                  No numbers drawn yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
