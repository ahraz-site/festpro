"use client"

import React from "react"
import { LayoutGrid, List } from "lucide-react"

export type ViewMode = "table" | "grid"

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export function ViewToggle({ mode, onChange, className = "" }: ViewToggleProps) {
  return (
    <div className={`inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 ${className}`}>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          mode === "table"
            ? "bg-white text-indigo-700 shadow-xs font-bold"
            : "text-slate-500 hover:text-slate-900"
        }`}
        title="Line / Table View"
      >
        <List className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Line view</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          mode === "grid"
            ? "bg-white text-indigo-700 shadow-xs font-bold"
            : "text-slate-500 hover:text-slate-900"
        }`}
        title="Grid / Cards View"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Grid view</span>
      </button>
    </div>
  )
}
