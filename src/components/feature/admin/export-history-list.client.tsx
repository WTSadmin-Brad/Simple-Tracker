/**
 * Export History List Component
 * 
 * Client component for displaying past data exports.
 * Shows export history with download options.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button.client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.client';
import { FileDownIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export interface ExportHistoryItem {
  id: string;
  createdAt: Date;
  type: 'tickets' | 'workdays';
  format: 'csv' | 'excel' | 'pdf';
  startDate: Date;
  endDate: Date;
  size: string;
  url: string;
}

interface ExportHistoryListProps {
  historyItems?: ExportHistoryItem[];
  isLoading?: boolean;
  onDownload: (exportId: string) => Promise<void>;
}

export default function ExportHistoryList({ 
  historyItems = [], 
  isLoading = false, 
  onDownload 
}: ExportHistoryListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const handleDownload = useCallback(async (exportId: string) => {
    setDownloadingId(exportId);
    try {
      await onDownload(exportId);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingId(null);
    }
  }, [onDownload]);

  const formatDateRange = useCallback((startDate: Date, endDate: Date) => {
    return `${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`;
  }, []);

  const formatType = useCallback((type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }, []);

  const formatFileSize = useCallback((size: string) => {
    return size;
  }, []);

  // Memoize the content to avoid unnecessary re-renders
  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (historyItems.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">No export history available</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{format(item.createdAt, 'MMM d, yyyy h:mm a')}</TableCell>
                <TableCell>{formatType(item.type)}</TableCell>
                <TableCell>{item.format.toUpperCase()}</TableCell>
                <TableCell>{formatDateRange(item.startDate, item.endDate)}</TableCell>
                <TableCell>{formatFileSize(item.size)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(item.id)}
                    disabled={downloadingId === item.id}
                    className="flex items-center gap-1"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDownIcon className="h-4 w-4" />
                    )}
                    <span>Download</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [historyItems, isLoading, downloadingId, handleDownload, formatDateRange, formatType, formatFileSize]);

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Export History</h3>
      {content}
    </Card>
  );
}
