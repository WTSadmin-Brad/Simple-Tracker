/**
 * Export Controls Component
 * 
 * Client component for configuring and triggering data exports.
 * Provides options for selecting export type, date range, and format.
 */

'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button.client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.client';
import { Label } from '@/components/ui/label.client';
import { Calendar } from '@/components/ui/calendar.client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.client';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExportType = 'tickets' | 'workdays';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportConfig {
  type: ExportType;
  startDate: Date | null;
  endDate: Date | null;
  format: ExportFormat;
}

interface ExportControlsProps {
  onExport: (config: ExportConfig) => Promise<void>;
  isLoading?: boolean;
}

export default function ExportControls({ onExport, isLoading = false }: ExportControlsProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    type: 'tickets',
    startDate: null,
    endDate: null,
    format: 'csv'
  });

  const handleTypeChange = useCallback((value: ExportType) => {
    setExportConfig(prev => ({ ...prev, type: value }));
  }, []);

  const handleFormatChange = useCallback((value: ExportFormat) => {
    setExportConfig(prev => ({ ...prev, format: value }));
  }, []);

  const handleStartDateChange = useCallback((date: Date | null) => {
    setExportConfig(prev => ({ ...prev, startDate: date }));
  }, []);

  const handleEndDateChange = useCallback((date: Date | null) => {
    setExportConfig(prev => ({ ...prev, endDate: date }));
  }, []);

  const handleExport = useCallback(async () => {
    await onExport(exportConfig);
  }, [onExport, exportConfig]);

  const isExportDisabled = !exportConfig.startDate || !exportConfig.endDate || isLoading;
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Export Configuration</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Export Type</h4>
          <RadioGroup 
            value={exportConfig.type} 
            onValueChange={(value) => handleTypeChange(value as ExportType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tickets" id="tickets" />
              <Label htmlFor="tickets">Tickets</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="workdays" id="workdays" />
              <Label htmlFor="workdays">Workdays</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Date Range</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <Label htmlFor="start-date" className="mb-1 block">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exportConfig.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exportConfig.startDate ? (
                      format(exportConfig.startDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={exportConfig.startDate || undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="end-date" className="mb-1 block">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !exportConfig.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {exportConfig.endDate ? (
                      format(exportConfig.endDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={exportConfig.endDate || undefined}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => 
                      exportConfig.startDate ? date < exportConfig.startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Export Format</h4>
          <RadioGroup 
            value={exportConfig.format}
            onValueChange={(value) => handleFormatChange(value as ExportFormat)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel">Excel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf">PDF</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button 
          className="w-full sm:w-auto"
          onClick={handleExport}
          disabled={isExportDisabled}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-current rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Export'
          )}
        </Button>
      </div>
    </Card>
  );
}
