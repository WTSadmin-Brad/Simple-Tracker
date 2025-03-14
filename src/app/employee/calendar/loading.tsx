/**
 * Employee Calendar Page Loading UI
 * Displayed during streaming while the page is loading
 */

export default function CalendarLoading() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Work Calendar</h1>
      
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
        <div className="flex gap-2 mb-4">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
