/**
 * Archive Results Table Component
 * 
 * Client component for displaying archived items search results.
 * Shows archived tickets and data with restore options.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.client';
import { Button } from '@/components/ui/button.client';
import { Pagination } from '@/components/ui/pagination.client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { RestoreIcon, EyeIcon, Loader2 } from 'lucide-react';

export interface ArchiveItem {
  id: string;
  type: 'ticket' | 'workday';
  archivedAt: Date;
  originalDate: Date;
  details: string;
}

interface ArchiveResultsTableProps {
  items?: ArchiveItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  onItemSelect: (itemId: string, itemType: string) => void;
  onRestore: (itemId: string, itemType: string) => Promise<void>;
  onPageChange: (page: number) => void;
}

export default function ArchiveResultsTable({ 
  items = [],
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  onItemSelect, 
  onRestore,
  onPageChange
}: ArchiveResultsTableProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  
  const handleRestore = useCallback(async (itemId: string, itemType: string) => {
    setRestoringId(itemId);
    try {
      await onRestore(itemId, itemType);
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setRestoringId(null);
    }
  }, [onRestore]);

  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  }, [currentPage, totalPages, onPageChange]);

  // Memoize the content to avoid unnecessary re-renders
  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Archived</TableHead>
                  <TableHead>Original Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No archived items found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Archived</TableHead>
              <TableHead>Original Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>
                  {item.type === 'ticket' ? 'Ticket' : 'Workday'}
                </TableCell>
                <TableCell>{format(item.archivedAt, 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(item.originalDate, 'MMM d, yyyy')}</TableCell>
                <TableCell className="max-w-xs truncate">{item.details}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onItemSelect(item.id, item.type)}
                    className="inline-flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(item.id, item.type)}
                    disabled={restoringId === item.id}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    {restoringId === item.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RestoreIcon className="h-4 w-4 mr-1" />
                    )}
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [items, isLoading, restoringId, handleRestore, onItemSelect]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {content}
      
      {!isLoading && items.length > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{items.length ? (currentPage - 1) * 10 + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            {renderPagination()}
          </div>
        </div>
      )}
    </div>
  );
}
