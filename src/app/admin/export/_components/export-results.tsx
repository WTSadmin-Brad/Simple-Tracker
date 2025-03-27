/**
 * ExportResults Component
 * 
 * Displays the results of generated exports with download links
 * and metadata about each export
 */

'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Trash2, 
  FileClock, 
  FileSpreadsheet, 
  FileText,
  FileJson,
  RefreshCw 
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Export result interface
export interface ExportResult {
  id: string;
  type: 'tickets' | 'workdays';
  format: 'csv' | 'excel' | 'json';
  url: string;
  filename: string;
  createdAt: string;
  expiresAt: string;
  recordCount: number;
  status: 'completed' | 'processing' | 'error';
  errorMessage?: string;
}

interface ExportResultsProps {
  exports: ExportResult[];
  isLoading: boolean;
  onDeleteExport: (id: string) => Promise<void>;
  onRefreshList: () => Promise<void>;
}

export function ExportResults({
  exports,
  isLoading,
  onDeleteExport,
  onRefreshList
}: ExportResultsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportToDelete, setExportToDelete] = useState<string | null>(null);
  const [isDeletingExport, setIsDeletingExport] = useState(false);
  
  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshList();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!exportToDelete) return;
    
    setIsDeletingExport(true);
    try {
      await onDeleteExport(exportToDelete);
      setExportToDelete(null);
    } finally {
      setIsDeletingExport(false);
    }
  };
  
  // Helper to format date with fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper for relative time formatting
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return '';
    }
  };
  
  // Helper to render the type icon
  const renderFormatIcon = (format: ExportResult['format']) => {
    switch (format) {
      case 'csv':
        return <FileText size={16} className="text-green-500" />;
      case 'excel':
        return <FileSpreadsheet size={16} className="text-blue-500" />;
      case 'json':
        return <FileJson size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };
  
  // Calculate if an export is about to expire (less than 3 hours)
  const isNearExpiry = (expiresAt: string) => {
    try {
      const expiry = new Date(expiresAt);
      const now = new Date();
      const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours < 3 && diffHours > 0;
    } catch (e) {
      return false;
    }
  };
  
  // Calculate if an export is expired
  const isExpired = (expiresAt: string) => {
    try {
      const expiry = new Date(expiresAt);
      const now = new Date();
      return expiry < now;
    } catch (e) {
      return false;
    }
  };
  
  // Generate an array of skeleton rows for loading state
  const skeletonRows = Array.from({ length: 3 }, (_, i) => i);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Exports</CardTitle>
          <CardDescription>
            Manage and download your generated export files
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Export File</TableHead>
                <TableHead className="w-[150px]">Created</TableHead>
                <TableHead className="w-[150px]">Expires</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 float-right" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : exports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Exports Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Use the export form to generate new data exports
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Export File</TableHead>
                <TableHead className="w-[150px]">Created</TableHead>
                <TableHead className="w-[150px]">Expires</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exports.map((exportItem) => {
                const nearExpiry = isNearExpiry(exportItem.expiresAt);
                const expired = isExpired(exportItem.expiresAt);
                
                return (
                  <TableRow 
                    key={exportItem.id}
                    className={expired ? 'opacity-50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {renderFormatIcon(exportItem.format)}
                        <span className="uppercase text-xs font-medium">
                          {exportItem.format}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{exportItem.filename}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {exportItem.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {exportItem.recordCount} records
                          </span>
                        </div>
                        
                        {exportItem.status === 'error' && (
                          <Alert variant="destructive" className="mt-2 py-2">
                            <AlertTitle className="text-xs">Export Failed</AlertTitle>
                            <AlertDescription className="text-xs">
                              {exportItem.errorMessage || 'An unknown error occurred'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{formatDate(exportItem.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive">
                          Expired
                        </Badge>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm">{formatDate(exportItem.expiresAt)}</span>
                          {nearExpiry && (
                            <span className="text-xs text-destructive">
                              Expires {formatRelativeTime(exportItem.expiresAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={exportItem.status !== 'completed' || expired}
                          asChild={exportItem.status === 'completed' && !expired}
                        >
                          {exportItem.status === 'completed' && !expired ? (
                            <a 
                              href={exportItem.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              download={exportItem.filename}
                            >
                              <Download size={16} />
                              <span className="sr-only">Download</span>
                            </a>
                          ) : (
                            <span>
                              <Download size={16} />
                              <span className="sr-only">Download</span>
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExportToDelete(exportItem.id)}
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!exportToDelete} 
        onOpenChange={(open) => !open && setExportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Export</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this export and revoke access to the file.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingExport}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeletingExport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingExport ? 'Deleting...' : 'Delete Export'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
