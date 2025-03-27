/**
 * Employee Calendar Page
 * 
 * Displays the work calendar interface for employees to:
 * - View their scheduled workdays
 * - Log time and work types
 * - Associate tickets with specific days
 * - Navigate between months and filter views
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { Suspense } from 'react';
import { CalendarView } from './_components/calendar-view.client';
import CalendarSkeleton from '@/components/feature/calendar/calendar-skeleton';

export default function CalendarPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Work Calendar</h1>
      
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarView />
      </Suspense>
    </div>
  );
}
