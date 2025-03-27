'use client';

/**
 * Example component that demonstrates the use of workday query hooks
 * Shows a monthly calendar with workdays
 */

import { useState } from 'react';
import { useGetMonthWorkdays } from '@/hooks/queries/useWorkdayQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WorkdayCalendarExample() {
  const [date, setDate] = useState(new Date());
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Using the new query hook
  const { 
    data: workdays, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetMonthWorkdays(year, month);
  
  // Navigation
  const previousMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    setDate(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    setDate(newDate);
  };
  
  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  
  // Create calendar days
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Fill in leading empty days
  const leadingEmptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  
  // Combine for the final calendar
  const calendarCells = [...leadingEmptyDays, ...calendarDays];
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workday Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workday Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <p className="text-red-500">Error loading calendar: {error?.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Map workdays to a lookup dictionary for easy access
  const workdayMap = (workdays || []).reduce((acc, workday) => {
    const workdayDate = new Date(workday.date);
    const day = workdayDate.getDate();
    acc[day] = workday;
    return acc;
  }, {} as Record<number, any>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>
          {date.toLocaleString('default', { month: 'long' })} {year}
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day} 
              className="text-center font-medium text-sm p-2"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((day, index) => {
            if (day === null) {
              return (
                <div 
                  key={`empty-${index}`} 
                  className="h-16 p-2 bg-gray-50 rounded-md"
                ></div>
              );
            }
            
            const workday = workdayMap[day];
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === date.getMonth() &&
                           new Date().getFullYear() === date.getFullYear();
            
            return (
              <div 
                key={`day-${day}`} 
                className={`h-16 p-2 ${isToday ? 'bg-blue-50 border-blue-200 border' : 'bg-white border'} rounded-md flex flex-col`}
              >
                <div className="text-right text-sm font-medium">{day}</div>
                {workday && (
                  <div className={`mt-auto text-xs rounded-full px-2 py-1 text-center ${
                    workday.workType === 'full' ? 'bg-green-100 text-green-800' : 
                    workday.workType === 'half' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {workday.workType === 'full' ? 'Full day' : 
                     workday.workType === 'half' ? 'Half day' : 'Off'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
