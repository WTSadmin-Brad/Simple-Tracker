'use client';

/**
 * Pagination Component
 * 
 * Client component for data grid pagination controls.
 * Provides navigation between pages and page size selection.
 */

import { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button.client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.client';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  compact?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize = 10,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
  showPageSizeSelector = true,
  showItemCount = true,
  compact = false
}: PaginationProps) {
  // Calculate visible page numbers
  const visiblePages = useMemo(() => {
    const delta = compact ? 1 : 2; // Number of pages to show before and after current page
    const range: number[] = [];
    
    // Always include first page
    range.push(1);
    
    // Calculate start and end of range
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      range.push(-1); // -1 represents ellipsis
    }
    
    // Add all pages in the middle range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      range.push(-2); // -2 represents ellipsis (different key from the first one)
    }
    
    // Always include last page if it exists
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  }, [currentPage, totalPages, compact]);
  
  // Calculate item range for display
  const itemRange = useMemo(() => {
    if (!totalItems) return null;
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    
    return { start, end };
  }, [currentPage, pageSize, totalItems]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  }, [currentPage, totalPages, onPageChange]);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((value: string) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(value));
    }
  }, [onPageSizeChange]);
  
  // If there's only one page, don't show pagination
  if (totalPages <= 1 && !showPageSizeSelector) return null;
  
  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-2", className)}>
      {/* Item count display */}
      {showItemCount && totalItems && itemRange && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {itemRange.start}-{itemRange.end} of {totalItems} items
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Items per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Page navigation */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            {/* First page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            
            {/* Previous page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            
            {/* Page numbers */}
            {visiblePages.map((page, index) => {
              if (page < 0) {
                // Render ellipsis
                return (
                  <span 
                    key={`ellipsis-${page}`} 
                    className="h-8 w-8 flex items-center justify-center text-gray-500"
                  >
                    ...
                  </span>
                );
              }
              
              return (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(page)}
                  disabled={currentPage === page}
                >
                  {page}
                  <span className="sr-only">Page {page}</span>
                </Button>
              );
            })}
            
            {/* Next page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            
            {/* Last page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRightIcon className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
