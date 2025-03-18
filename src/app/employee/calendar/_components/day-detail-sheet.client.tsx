/**
 * day-detail-sheet.client.tsx
 * Bottom sheet for day details with workday info
 * 
 * Enhanced with better responsive layout:
 * - Improved spacing and content organization
 * - Better touch targets for all interactive elements
 * - Optimized mobile and tablet display
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { WorkdayType } from '@/types/workday';
import useCalendarStore from '@/stores/calendarStore';
import { Calendar, Briefcase, Hash, AlertTriangle } from 'lucide-react';

/**
 * Bottom sheet component for displaying day details with workday information
 * and ticket summary if available. Enhanced with better responsive design.
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
  
  // Get work type label
  const getWorkTypeLabel = (type: WorkdayType): string => {
    switch (type) {
      case 'full': return 'Full Day';
      case 'half': return 'Half Day';
      case 'off': return 'Off Day';
      default: return '';
    }
  };

  return (
    <Sheet open={isDetailSheetOpen} onOpenChange={setDetailSheetOpen}>
      <SheetContent className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <SheetTitle>{formattedDate}</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Workday Information Section - Enhanced layout */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Workday Information</h3>
            </div>
            
            {selectedWorkday ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobsite:</span>
                    <span className="text-sm font-medium">{selectedWorkday.jobsiteName}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Work Type:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['full', 'half', 'off'] as WorkdayType[]).map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            className={`h-10 touch-target ${editableWorkType === type ? getWorkTypeColor(type) : ''}`}
                            onClick={() => setEditableWorkType(type)}
                          >
                            {getWorkTypeLabel(type)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Work Type:</span>
                      <Badge className={`text-sm font-medium px-3 py-1 ${getWorkTypeColor(selectedWorkday.workType)}`}>
                        {getWorkTypeLabel(selectedWorkday.workType)}
                      </Badge>
                    </div>
                  )}
                  
                  {!canEdit && !isEditing && (
                    <div className="mt-2 flex items-start gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-xs">
                        Edit window has expired (7-day limit)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <span className="text-sm text-muted-foreground">Work Type:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['full', 'half', 'off'] as WorkdayType[]).map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            className={`h-10 touch-target ${editableWorkType === type ? getWorkTypeColor(type) : ''}`}
                            onClick={() => setEditableWorkType(type)}
                          >
                            {getWorkTypeLabel(type)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        No workday logged for this date
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Ticket Summary Section - Enhanced layout */}
          {hasTickets && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Tickets Summary</h3>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Tickets:</span>
                    <Badge variant="outline" className="font-medium">
                      {selectedWorkday?.ticketSummary?.totalTickets}
                    </Badge>
                  </div>
                  
                  {selectedWorkday?.ticketSummary?.truckInfo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Truck:</span>
                      <span className="text-sm font-medium">{selectedWorkday.ticketSummary.truckInfo}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-3">Categories:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedWorkday?.ticketSummary?.categories.map((category) => (
                        <div key={category.name} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-xs">{category.name}:</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        {/* Action Buttons - Fixed at bottom with better touch targets */}
        <SheetFooter className="flex flex-col gap-2 p-4 sm:p-6 border-t">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                className="w-full h-11 touch-target"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Workday'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                className="w-full h-11 touch-target"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {selectedWorkday ? (
                <>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      onClick={handleEdit} 
                      className="w-full h-11 touch-target"
                    >
                      Edit Workday
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  onClick={handleEdit} 
                  className="w-full h-11 touch-target"
                >
                  Log Workday
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={handleClose} 
                className="w-full h-11 touch-target"
              >
                Close
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default DayDetailSheet;
