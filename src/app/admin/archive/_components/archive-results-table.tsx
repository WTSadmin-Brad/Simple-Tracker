/**
 * ArchiveResultsTable Component
 * 
 * Displays search results from the archive in a paginated table
 * with options to view details and restore items
 */

'use client';

import { useState } from 'react';
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
  Eye, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  FileClock, 
  FileText 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArchiveItem } from '@/lib/schemas/archiveSchemas';
import { formatDistanceToNow, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ArchiveResultsTableProps {
  items: ArchiveItem[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onViewDetails: (item: ArchiveItem) => void;
  onRestoreItem: (item: ArchiveItem) => void;
}

export function ArchiveResultsTable({
  items,
  isLoading,
  pagination,
  onPageChange,
  onViewDetails,
  onRestoreItem
}: ArchiveResultsTableProps) {
  const { page, pageSize, total, totalPages } = pagination;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);
  
  // Generate an array of skeleton rows for loading state
  const skeletonRows = Array.from({ length: pageSize }, (_, i) => i);
  
  // Helper to render the type icon
  const renderTypeIcon = (type: ArchiveItem['type']) => {
    switch (type) {
      case 'ticket':
        return <FileText size={16} className="text-blue-500" />;
      case 'workday':
        return <FileClock size={16} className="text-green-500" />;
      case 'image':
        return <ImageIcon size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };
  
  // Helper to format date with fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Type</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="w-[150px]">Original Date</TableHead>
            <TableHead className="w-[150px]">Archived Date</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            skeletonRows.map((index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
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
            ))
          ) : items.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No archived items found
              </TableCell>
            </TableRow>
          ) : (
            // Results
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                          {renderTypeIcon(item.type)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{item.type}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground">
                      ID: {item.id.substring(0, 8)}
                    </span>
                    {item.metadata?.jobsite && (
                      <Badge variant="outline" className="mt-1 w-fit">
                        {item.metadata.jobsite}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(item.date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(item.archivedAt)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.archivedAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(item)}
                    >
                      <Eye size={16} />
                      <span className="sr-only">View details</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRestoreItem(item)}
                    >
                      <RotateCcw size={16} />
                      <span className="sr-only">Restore item</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination controls */}
      {!isLoading && totalPages > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
              <span className="sr-only">Next page</span>
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
