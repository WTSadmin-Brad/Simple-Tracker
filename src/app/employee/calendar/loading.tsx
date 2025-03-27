/**
 * Employee Calendar Page Loading UI
 * 
 * Displayed during server-side streaming while the page is loading.
 * Uses the CalendarSkeleton component for consistency across loading states.
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import CalendarSkeleton from '@/components/feature/calendar/calendar-skeleton';

export default function CalendarLoading() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Work Calendar</h1>
      <CalendarSkeleton />
    </div>
  );
}
