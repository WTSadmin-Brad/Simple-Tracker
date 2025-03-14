/**
 * CalendarView.tsx
 * Server component for the employee calendar view
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { Suspense } from 'react';
import CalendarNavigation from './CalendarNavigation.client';
import CalendarFilters from './CalendarFilters.client';
import CalendarContent from './CalendarContent.client';
import DayDetailSheet from './DayDetailSheet.client';
import CalendarSkeleton from '@/components/feature/calendar/CalendarSkeleton';

/**
 * Calendar view component for employee workday management
 * Displays a monthly calendar with workday information and allows
 * employees to log and edit their workdays
 */
export default function CalendarView() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">My Calendar</h1>
      
      <Suspense fallback={<CalendarSkeleton />}>
        <div className="space-y-4">
          {/* Calendar Navigation */}
          <CalendarNavigation />
          
          {/* Calendar Filters */}
          <CalendarFilters />
          
          {/* Calendar Content */}
          <CalendarContent />
          
          {/* Day Detail Sheet */}
          <DayDetailSheet />
        </div>
      </Suspense>
    </div>
  );
}
