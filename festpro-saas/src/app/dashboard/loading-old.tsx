export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-72 bg-gray-100 rounded-md"></div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-8 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-3 w-40 bg-gray-100 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="h-5 w-36 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-100 rounded-xl"></div>
                <div className="space-y-1">
                  <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-24 bg-gray-100 rounded-md"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
