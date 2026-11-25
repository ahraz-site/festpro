"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react"

export default function FesProStudioErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const orgId = params?.orgId as string | undefined
  const festivalId = params?.festivalId as string | undefined

  useEffect(() => {
    console.error("FesPro Studio boundary error:", error)
  }, [error])

  const dashboardUrl = orgId && festivalId
    ? `/dashboard/organization/${orgId}/festivals/${festivalId}`
    : orgId
    ? `/dashboard/organization/${orgId}`
    : "/dashboard"

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 selection:bg-indigo-600">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold">
            Studio Recovery
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            FesPro Studio couldn't load this session
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            A temporary network or server event occurred while publishing or rendering the website builder. Your previous saved configuration is safe in the database.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 text-left max-h-24 overflow-y-auto break-all">
            <span className="text-rose-400 font-bold">Error:</span> {error.message}
            {error.digest && <div className="text-[10px] text-slate-500 mt-1">Digest: {error.digest}</div>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Studio</span>
          </button>

          <Link
            href={dashboardUrl}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
