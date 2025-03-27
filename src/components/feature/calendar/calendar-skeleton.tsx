/**
 * Calendar Skeleton Component
 * 
 * Skeleton loader component for the calendar view that displays while data is loading.
 * Provides visual placeholders with loading animations to maintain layout consistency
 * and improve perceived performance.
 * 
 * Features:
 * - Accessible loading indicators with proper ARIA attributes
 * - Responsive design that maintains the calendar grid structure
 * - Visual placeholders for navigation, filters, and calendar days
 * - Consistent with the application's design system
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { Skeleton } from "@/components/ui/skeleton";

// Day headers for the calendar
const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Skeleton loader for the calendar that displays while data is loading
 */
function CalendarSkeleton() {
  return (
    <div 
      aria-busy="true" 
      aria-label="Loading calendar view" 
      className="space-y-4"
    >
      {/* Navigation skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
        <Skeleton className="w-32 h-8 rounded" />
      </div>
      
      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Skeleton className="w-16 h-8 rounded-full" />
        <Skeleton className="w-20 h-8 rounded-full" />
        <Skeleton className="w-24 h-8 rounded-full" />
        <Skeleton className="w-28 h-8 rounded-full" />
      </div>
      
      {/* Calendar grid skeleton */}
      <div className="bg-card rounded-md border border-border p-4">
        <div className="grid grid-cols-7 gap-1 sm:gap-2" role="grid">
          {/* Day headers */}
          {WEEKDAY_HEADERS.map((day) => (
            <div 
              key={day} 
              className="text-center font-medium py-2 text-muted-foreground"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days skeleton */}
          {Array(35).fill(0).map((_, i) => (
            <div 
              key={i}
              className="aspect-square p-1 border rounded-md"
              role="gridcell"
            >
              <div className="h-full w-full flex flex-col">
                <Skeleton className="w-6 h-6 rounded-full" />
                
                {/* Random ticket indicators for some cells */}
                {Math.random() > 0.7 && (
                  <div className="mt-auto self-end flex gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="w-2 h-2 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarSkeleton;
