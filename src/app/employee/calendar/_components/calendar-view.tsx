/**
 * CalendarView.tsx
 * Server component for the employee calendar view
 * 
 * Enhanced with better responsive layout:
 * - Improved container sizing for all screen sizes
 * - Better component spacing and arrangement
 * - Optimized layout for mobile, tablet, and desktop displays
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { Suspense } from 'react';
import CalendarNavigation from './calendar-navigation.client';
import CalendarFilters from './calendar-filters.client';
import CalendarContent from './calendar-content.client';
import CalendarSearch from './calendar-search.client';
import DayDetailSheet from './day-detail-sheet.client';
import CalendarSkeleton from '@/components/feature/calendar/calendar-skeleton';

/**
 * Calendar view component for employee workday management
 * Displays a monthly calendar with workday information and allows
 * employees to log and edit their workdays
 */
export default function CalendarView() {
  return (
    <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">My Calendar</h1>
        
        {/* Help text for medium and large screens */}
        <p className="hidden md:block text-sm text-muted-foreground">
          Tap a day to log work or submit tickets
        </p>
      </div>
      
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
          <div className="bg-card rounded-md border border-border p-2 sm:p-3 md:p-4">
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
    </div>
  );
}
