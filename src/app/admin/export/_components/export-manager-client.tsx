/**
 * ExportManagerClient Component
 * 
 * Client component that integrates export functionality:
 * - Export form for creating new exports
 * - Export results list for managing and downloading exports
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ExportForm } from './export-form';
import { ExportResults, ExportResult } from './export-results';
import { z } from 'zod';

// Re-export types used by this component
export type { ExportResult } from './export-results';

export function ExportManagerClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [exports, setExports] = useState<ExportResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch exports on mount
  useEffect(() => {
    fetchExports();
  }, []);
  
  // Fetch exports from the API
  const fetchExports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/export/list');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch exports');
      }
      
      setExports(data.exports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching exports:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle creating a new export
  const handleCreateExport = async (formData: z.infer<typeof exportFormSchema>) => {
    try {
      // Format dates for API
      const apiData = {
        type: formData.type,
        format: formData.format,
        dateFrom: formData.dateFrom.toISOString().split('T')[0],
        dateTo: formData.dateTo.toISOString().split('T')[0],
        includeImages: formData.includeImages,
        includeNotes: formData.includeNotes,
        includeSummary: formData.includeSummary,
      };
      
      // Call the export API
      const response = await fetch(`/api/admin/export/${formData.type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Export creation failed');
      }
      
      // Show success toast
      toast({
        title: 'Export Created',
        description: `Your ${formData.type} export has been created and is ready for download.`,
        variant: 'default',
      });
      
      // Refresh exports list and switch to results tab
      await fetchExports();
      setActiveTab('results');
    } catch (err) {
      // Throw error to be handled by the form component
      throw err;
    }
  };
  
  // Handle deleting an export
  const handleDeleteExport = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/export/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete export');
      }
      
      // Show success toast
      toast({
        title: 'Export Deleted',
        description: 'The export has been successfully deleted.',
        variant: 'default',
      });
      
      // Refresh exports list
      await fetchExports();
    } catch (err) {
      // Show error toast
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Export</TabsTrigger>
          <TabsTrigger value="results">Export Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4 py-4">
          <ExportForm onExport={handleCreateExport} />
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <ExportResults
            exports={exports}
            isLoading={isLoading}
            onDeleteExport={handleDeleteExport}
            onRefreshList={fetchExports}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export form schema - duplicated from ExportForm to ensure type compatibility
const exportFormSchema = z.object({
  type: z.enum(['tickets', 'workdays']),
  dateFrom: z.date(),
  dateTo: z.date(),
  format: z.enum(['csv', 'excel', 'json']),
  includeImages: z.boolean().optional(),
  includeNotes: z.boolean().optional(),
  includeSummary: z.boolean().optional(),
});
