import { FestProFavicon } from "@/components/ui/logo"

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xs">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />
        <div className="animate-bounce" style={{ animationDuration: "1.6s" }}>
          <FestProFavicon size={56} className="shadow-lg rounded-full" />
        </div>
      </div>
      <p className="mt-4 text-xs font-bold text-slate-600 tracking-wider uppercase animate-pulse">
        Loading FesPro...
      </p>
    </div>
  )
}
