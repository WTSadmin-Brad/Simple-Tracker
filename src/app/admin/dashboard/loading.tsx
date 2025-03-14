/**
 * Admin Dashboard Page Loading UI
 * Displayed during streaming while the page is loading
 */

export default function DashboardLoading() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Skeleton for metric cards */}
        {Array(3).fill(0).map((_, i) => (
          <div key={`metric-${i}`} className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Skeleton for chart cards */}
        {Array(2).fill(0).map((_, i) => (
          <div key={`chart-${i}`} className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-40 bg-gray-200 rounded mb-2"></div>
            <div className="flex justify-between">
              {Array(5).fill(0).map((_, j) => (
                <div key={`legend-${j}`} className="h-3 bg-gray-200 rounded w-12"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={`activity-${i}`} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
