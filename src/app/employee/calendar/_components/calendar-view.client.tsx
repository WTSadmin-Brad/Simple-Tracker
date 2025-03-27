'use client';

/**
 * Calendar View Component (Client Component)
 * 
 * Main container component for the employee calendar interface.
 * Assembles and orchestrates all calendar-related components:
 * - Calendar navigation controls for month/year selection 
 * - Search functionality for finding specific dates or events
 * - Filter controls for workday types and ticket status
 * - Calendar content grid with day cells
 * - Day detail sheet for viewing and editing workday information
 * 
 * Provides a responsive layout optimized for mobile, tablet, and desktop displays.
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { Suspense, ErrorBoundary } from 'react';
import { AlertTriangle } from 'lucide-react';
import CalendarNavigation from './calendar-navigation.client';
import CalendarFilters from './calendar-filters.client';
import CalendarContent from './calendar-content.client';
import CalendarSearch from './calendar-search.client';
import DayDetailSheet from './day-detail-sheet.client';
import CalendarSkeleton from '@/components/feature/calendar/calendar-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Props for the Calendar View component
 */
interface CalendarViewProps {
  className?: string;
  title?: string;
}

/**
 * Error fallback component for calendar errors
 */
function CalendarError({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription>
        Error loading calendar: {error.message}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Calendar view component for employee workday management
 * Displays a monthly calendar with workday information and allows
 * employees to log and edit their workdays
 */
export function CalendarView({
  className = "",
  title = "My Calendar"
}: CalendarViewProps) {
  return (
    <div className={`container max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        
        {/* Help text for medium and large screens */}
        <p className="hidden md:block text-sm text-muted-foreground">
          Tap a day to log work or submit tickets
        </p>
      </div>
      
      <ErrorBoundary FallbackComponent={CalendarError}>
        <Suspense fallback={<CalendarSkeleton />}>
          <div className="space-y-3 sm:space-y-4">
            {/* Calendar Navigation and Search - responsive layout */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 order-2 md:order-1">
                <CalendarNavigation />
              </div>
              <div className="w-full md:w-72 order-1 md:order-2">
                <CalendarSearch />
              </div>
            </div>
            
            {/* Calendar Filters with enhanced responsive design */}
            <CalendarFilters />
            
            {/* Calendar Content with improved responsive grid */}
            <div 
              className="bg-card rounded-md border border-border p-2 sm:p-3 md:p-4"
              aria-label="Monthly calendar grid"
            >
              <CalendarContent />
            </div>
            
            {/* Info text for small screens */}
            <p className="block md:hidden text-center text-sm text-muted-foreground">
              Tap any day to view details or log work
            </p>
            
            {/* Day Detail Sheet */}
            <DayDetailSheet />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default CalendarView;