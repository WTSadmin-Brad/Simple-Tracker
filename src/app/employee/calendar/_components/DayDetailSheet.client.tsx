/**
 * DayDetailSheet.client.tsx
 * Bottom sheet for day details with workday info
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { WorkdayType } from '@/types/workday';
import useCalendarStore from '@/stores/calendarStore';

/**
 * Bottom sheet component for displaying day details with workday information
 * and ticket summary if available
 */
export function DayDetailSheet() {
  const { 
    selectedDate, 
    selectedWorkday, 
    isDetailSheetOpen, 
    setDetailSheetOpen,
    isDateEditable,
    createWorkday,
    updateWorkday,
    isLoading
  } = useCalendarStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableWorkType, setEditableWorkType] = useState<WorkdayType | undefined>(undefined);
  
  // Reset editing state when selected date changes
  useEffect(() => {
    setIsEditing(false);
    setEditableWorkType(selectedWorkday?.workType);
  }, [selectedWorkday]);
  
  const handleClose = () => {
    setDetailSheetOpen(false);
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    if (!selectedDate) return;
    
    const date = new Date(selectedDate);
    
    if (selectedWorkday) {
      // Update existing workday
      await updateWorkday(selectedWorkday.id, {
        workType: editableWorkType || 'full'
      });
    } else {
      // Create new workday
      await createWorkday({
        date: format(date, 'yyyy-MM-dd'),
        jobsite: 'jobsite-1', // Default jobsite for now
        jobsiteName: 'Main Construction Site',
        workType: editableWorkType || 'full'
      });
    }
    
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditableWorkType(selectedWorkday?.workType);
  };
  
  if (!selectedDate) return null;
  
  const date = new Date(selectedDate);
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const hasTickets = selectedWorkday?.ticketSummary && selectedWorkday.ticketSummary.totalTickets > 0;
  const canEdit = isDateEditable(date);
  
  // Map work type to color for visual indication
  const getWorkTypeColor = (type?: WorkdayType) => {
    switch (type) {
      case 'full': return 'bg-green-100 text-green-800 border-green-200';
      case 'half': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Sheet open={isDetailSheetOpen} onOpenChange={setDetailSheetOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{formattedDate}</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Workday Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Workday Information
            </h3>
            
            {selectedWorkday ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Jobsite:</span>
                  <span className="text-sm font-medium">{selectedWorkday.jobsiteName}</span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Work Type:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['full', 'half', 'off'] as WorkdayType[]).map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          className={`${editableWorkType === type ? getWorkTypeColor(type) : ''}`}
                          onClick={() => setEditableWorkType(type)}
                        >
                          {type === 'full' ? 'Full Day' : 
                           type === 'half' ? 'Half Day' : 'Off Day'}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Work Type:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${getWorkTypeColor(selectedWorkday.workType)}`}>
                      {selectedWorkday.workType === 'full' ? 'Full Day' : 
                       selectedWorkday.workType === 'half' ? 'Half Day' : 'Off Day'}
                    </span>
                  </div>
                )}
                
                {!canEdit && !isEditing && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Edit window has expired (7-day limit)
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Work Type:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['full', 'half', 'off'] as WorkdayType[]).map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            className={`${editableWorkType === type ? getWorkTypeColor(type) : ''}`}
                            onClick={() => setEditableWorkType(type)}
                          >
                            {type === 'full' ? 'Full Day' : 
                             type === 'half' ? 'Half Day' : 'Off Day'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No workday logged for this date
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Ticket Summary Section (if available) */}
          {hasTickets && (
            <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-2">
                Tickets Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Tickets:</span>
                  <span className="text-sm font-medium">{selectedWorkday?.ticketSummary?.totalTickets}</span>
                </div>
                
                {selectedWorkday?.ticketSummary?.truckInfo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Truck:</span>
                    <span className="text-sm font-medium">{selectedWorkday.ticketSummary.truckInfo}</span>
                  </div>
                )}
                
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Categories:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedWorkday?.ticketSummary?.categories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span className="text-xs">{category.name}:</span>
                        <span className="text-xs font-medium">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Workday'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-full">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {selectedWorkday ? (
                  <>
                    {canEdit && (
                      <Button variant="outline" onClick={handleEdit} className="w-full">
                        Edit Workday
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={handleEdit} className="w-full">
                    Log Workday
                  </Button>
                )}
                
                <Button variant="ghost" onClick={handleClose} className="w-full">
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default DayDetailSheet;
