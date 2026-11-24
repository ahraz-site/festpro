import { FestProFavicon } from "@/components/ui/logo"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />
        <div className="animate-pulse">
          <FestProFavicon size={48} className="shadow-md rounded-full" />
        </div>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Connecting to festival workspace...
        </p>
        <p className="text-[11px] text-slate-400">Loading real-time stage operations & data</p>
      </div>
    </div>
  )
}
