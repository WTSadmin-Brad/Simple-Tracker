/**
 * Employee Calendar Page
 * Displays workday calendar for the employee
 */

import { Suspense } from 'react';
import CalendarView from './_components/calendar-view';

export default function CalendarPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Work Calendar</h1>
      
      <Suspense fallback={<div>Loading calendar...</div>}>
        <CalendarView />
      </Suspense>
    </div>
  );
}
