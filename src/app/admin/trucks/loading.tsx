/**
 * Admin Trucks Management Page Loading UI
 * Displayed during streaming while the page is loading
 */

export default function TrucksLoading() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Truck Management</h1>
      
      {/* Skeleton for filter bar */}
      <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="ml-auto h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      {/* Skeleton for data table */}
      <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={`header-${i}`} className="h-5 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Table rows */}
        {Array(6).fill(0).map((_, i) => (
          <div key={`row-${i}`} className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, j) => (
                <div key={`cell-${i}-${j}`} className="h-5 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Table footer */}
        <div className="bg-gray-50 p-4 flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="flex gap-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={`page-${i}`} className="h-8 w-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
