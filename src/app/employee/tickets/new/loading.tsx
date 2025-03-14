/**
 * New Ticket Submission Page Loading UI
 * Displayed during streaming while the page is loading
 */

export default function NewTicketLoading() {
  return (
    <div className="container py-6">
      <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse mb-6"></div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border p-6">
        {/* Wizard progress skeleton */}
        <div className="flex justify-between items-center mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse mt-2"></div>
            </div>
          ))}
        </div>
        
        {/* Wizard content skeleton */}
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        {/* Wizard navigation skeleton */}
        <div className="flex justify-between mt-8">
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
