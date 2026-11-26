export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-3.5 w-72 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between"
          >
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 space-y-3"
          >
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            <div className="space-y-1.5 pt-3">
              <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/50 rounded" />
              <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
