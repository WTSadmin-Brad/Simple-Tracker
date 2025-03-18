/**
 * CalendarSkeleton.tsx
 * Skeleton loader component for the calendar view
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for the calendar that displays while data is loading
 * Shows a placeholder grid with loading animations
 */
function CalendarSkeleton() {
  return (
    <div>
      {/* Navigation skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
        <Skeleton className="w-16 h-8 rounded" />
      </div>
      
      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Skeleton className="w-16 h-6 rounded" />
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="w-24 h-6 rounded" />
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium py-2 text-gray-400 dark:text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days skeleton */}
        {Array(35).fill(0).map((_, i) => (
          <div 
            key={i}
            className="aspect-square p-1 border rounded-md"
          >
            <div className="h-full w-full flex flex-col">
              <Skeleton className="w-4 h-4 rounded" />
              
              {/* Random ticket indicators for some cells */}
              {Math.random() > 0.7 && (
                <div className="mt-auto self-end">
                  <Skeleton className="w-2 h-2 rounded-full mr-1 mb-1" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarSkeleton;
