/**
 * ExportForm Component
 * 
 * Provides a form interface for configuring data exports
 * with options for selecting data type, date range, and format
 */

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Download, 
  FileType, 
  CalendarIcon, 
  Loader2, 
  FileSpreadsheet 
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Form schema validation
const exportFormSchema = z.object({
  type: z.enum(['tickets', 'workdays'], {
    required_error: 'Please select a data type to export',
  }),
  dateFrom: z.date({
    required_error: 'Start date is required',
  }),
  dateTo: z.date({
    required_error: 'End date is required',
  }).refine(
    (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), 
    { message: 'End date cannot be in the past' }
  ),
  format: z.enum(['csv', 'excel', 'json'], {
    required_error: 'Please select an export format',
  }),
  includeImages: z.boolean().optional(),
  includeNotes: z.boolean().optional(),
  includeSummary: z.boolean().optional(),
}).refine(
  (data) => data.dateTo >= data.dateFrom, 
  {
    message: 'End date must be after start date',
    path: ['dateTo'],
  }
);

type ExportFormValues = z.infer<typeof exportFormSchema>;

// Default form values
const defaultValues: Partial<ExportFormValues> = {
  type: 'tickets',
  format: 'csv',
  dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
  dateTo: new Date(),
  includeImages: false,
  includeNotes: true,
  includeSummary: true,
};

interface ExportFormProps {
  onExport: (data: ExportFormValues) => Promise<void>;
}

export function ExportForm({ onExport }: ExportFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues,
  });
  
  // Watch the type field to show conditional options
  const dataType = form.watch('type');
  
  // Handle form submission
  const handleSubmit = async (values: ExportFormValues) => {
    try {
      setIsSubmitting(true);
      await onExport(values);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Configure your export settings. Exports are generated as downloadable files.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Data Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Type</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data to export" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tickets">Tickets</SelectItem>
                      <SelectItem value="workdays">Workdays</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of data you want to export
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isSubmitting}
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* End Date */}
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            disabled={isSubmitting}
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date > new Date() || 
                            (form.getValues().dateFrom && date < form.getValues().dateFrom)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Format Selection */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the file format for your export
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Additional Options</h3>
              
              {/* Include Images (for tickets only) */}
              {dataType === 'tickets' && (
                <FormField
                  control={form.control}
                  name="includeImages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Images</FormLabel>
                        <FormDescription>
                          Include links to ticket images (increases file size)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              {/* Include Notes */}
              <FormField
                control={form.control}
                name="includeNotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Include Notes</FormLabel>
                      <FormDescription>
                        Include text notes in the export
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Include Summary (for workdays only) */}
              {dataType === 'workdays' && (
                <FormField
                  control={form.control}
                  name="includeSummary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Summary</FormLabel>
                        <FormDescription>
                          Add summary with total hours and other statistics
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Export...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Export
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-muted/50 flex flex-col space-y-2 items-start text-xs text-muted-foreground">
        <p>Exports expire after 24 hours and are securely stored.</p>
        <p>Large exports may take several minutes to generate.</p>
      </CardFooter>
    </Card>
  );
}
