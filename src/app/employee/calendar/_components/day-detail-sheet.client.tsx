'use client';

/**
 * Day Detail Sheet Component (Client Component)
 * 
 * Bottom sheet for viewing and editing workday information.
 * Opens when a user selects a day in the calendar.
 * 
 * Features:
 * - Display workday details (jobsite, work type)
 * - Edit workday information
 * - View ticket summaries if available
 * - Responsive layout for all device sizes
 * - Fully accessible controls and information
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { WorkdayType } from '@/types/workday';
import { Calendar, Briefcase, Hash, AlertTriangle, Loader2 } from 'lucide-react';
import { getWorkTypeLabel, getWorkTypeBadgeColor } from '@/lib/helpers/workdayHelpers';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';
import { useCalendarDetailSheet, useCalendarWorkdayActions } from '@/stores/calendarStore';

/**
 * Props for the Day Detail Sheet component
 */
interface DayDetailSheetProps {
  /** Optional onSave callback function */
  onSave?: () => void;
  /** Optional onClose callback function */
  onClose?: () => void;
}

/**
 * Bottom sheet component for displaying and editing workday information
 */
export function DayDetailSheet({
  onSave,
  onClose
}: DayDetailSheetProps = {}) {
  const { 
    selectedDate, 
    selectedWorkday, 
    isDetailSheetOpen, 
    setDetailSheetOpen
  } = useCalendarDetailSheet();

  const {
    isDateEditable,
    createWorkday,
    updateWorkday,
    isLoading
  } = useCalendarWorkdayActions();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableWorkType, setEditableWorkType] = useState<WorkdayType | undefined>(undefined);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Reset editing state when selected date changes
  useEffect(() => {
    setIsEditing(false);
    setEditableWorkType(selectedWorkday?.workType);
    setSaveError(null);
  }, [selectedWorkday]);
  
  const handleClose = () => {
    setDetailSheetOpen(false);
    setIsEditing(false);
    setSaveError(null);
    if (onClose) onClose();
  };
  
  const handleSave = async () => {
    if (!selectedDate) return;
    setSaveError(null);
    
    try {
      const date = parseISO(selectedDate);
      
      if (selectedWorkday) {
        // Update existing workday
        await updateWorkday(selectedWorkday.id, {
          workType: editableWorkType || 'full'
        });
      } else {
        // Create new workday
        await createWorkday({
          date: format(date, DATE_FORMATS.API_DATE),
          jobsite: 'jobsite-1', // Default jobsite for now
          jobsiteName: 'Main Construction Site',
          workType: editableWorkType || 'full'
        });
      }
      
      setIsEditing(false);
      if (onSave) onSave();
    } catch (error) {
      console.error("Error saving workday:", error);
      setSaveError("Failed to save workday data. Please try again.");
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditableWorkType(selectedWorkday?.workType);
    setSaveError(null);
  };
  
  if (!selectedDate) return null;
  
  const date = parseISO(selectedDate);
  const formattedDate = format(date, DATE_FORMATS.FULL_DATE);
  const hasTickets = selectedWorkday?.ticketSummary && selectedWorkday.ticketSummary.totalTickets > 0;
  const canEdit = isDateEditable(date);

  return (
    <Sheet open={isDetailSheetOpen} onOpenChange={setDetailSheetOpen}>
      <SheetContent className="sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <SheetTitle>{formattedDate}</SheetTitle>
          </div>
        </SheetHeader>
        
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          aria-live="polite"
        >
          {/* Error message display */}
          {saveError && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-4 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{saveError}</p>
            </div>
          )}
          
          {/* Workday Information Section - Enhanced layout */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium" id="workday-info-heading">Workday Information</h3>
            </div>
            
            {selectedWorkday ? (
              <Card aria-labelledby="workday-info-heading">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobsite:</span>
                    <span className="text-sm font-medium">{selectedWorkday.jobsiteName}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground" id="worktype-selection">Work Type:</span>
                      <div 
                        className="grid grid-cols-3 gap-2" 
                        role="radiogroup" 
                        aria-labelledby="worktype-selection"
                      >
                        {(['full', 'half', 'off'] as WorkdayType[]).map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            type="button"
                            role="radio"
                            aria-checked={editableWorkType === type}
                            className={`h-10 touch-target ${editableWorkType === type ? getWorkTypeBadgeColor(type) : ''}`}
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
                      <Badge className={`text-sm font-medium px-3 py-1 ${getWorkTypeBadgeColor(selectedWorkday.workType)}`}>
                        {getWorkTypeLabel(selectedWorkday.workType)}
                      </Badge>
                    </div>
                  )}
                  
                  {!canEdit && !isEditing && (
                    <div className="mt-2 flex items-start gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <p className="text-xs">
                        Edit window has expired (7-day limit)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card aria-labelledby="workday-info-heading">
                <CardContent className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <span className="text-sm text-muted-foreground" id="worktype-selection">Work Type:</span>
                      <div 
                        className="grid grid-cols-3 gap-2"
                        role="radiogroup"
                        aria-labelledby="worktype-selection"
                      >
                        {(['full', 'half', 'off'] as WorkdayType[]).map((type) => (
                          <Button
                            key={type}
                            variant="outline"
                            type="button"
                            role="radio"
                            aria-checked={editableWorkType === type}
                            className={`h-10 touch-target ${editableWorkType === type ? getWorkTypeBadgeColor(type) : ''}`}
                            onClick={() => setEditableWorkType(type)}
                          >
                            {getWorkTypeLabel(type)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
                <h3 className="text-sm font-medium" id="tickets-heading">Tickets Summary</h3>
              </div>
              
              <Card aria-labelledby="tickets-heading">
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
                    <h4 className="text-xs font-medium text-muted-foreground mb-3" id="categories-heading">Categories:</h4>
                    <div 
                      className="grid grid-cols-2 gap-2"
                      aria-labelledby="categories-heading"
                    >
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
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : 'Save Workday'}
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