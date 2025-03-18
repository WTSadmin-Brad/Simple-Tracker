/**
 * TableCard.client.tsx
 * Data table card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Table card"
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  RefreshCcw, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';
import dashboardService, { TableData } from '@/lib/services/dashboardService';

interface TableCardProps {
  id: string;
  title: string;
  dataSource: string;
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status';
  }>;
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * Data table card for the admin dashboard
 */
const TableCard = ({
  id,
  title,
  dataSource,
  columns,
  filters = {},
  sortBy,
  sortDirection = 'desc',
  pageSize = 5,
  refreshInterval = 0,
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: TableCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentSortBy, setCurrentSortBy] = useState<string | undefined>(sortBy);
  const [currentSortDirection, setCurrentSortDirection] = useState<'asc' | 'desc'>(sortDirection);
  
  // Fetch table data
  const fetchTableData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Combine filters with pagination and sorting
      const tableFilters = {
        ...filters,
        page: currentPage,
        pageSize,
        sortBy: currentSortBy,
        sortDirection: currentSortDirection
      };
      
      // Use dashboard service to fetch table data
      const result = await dashboardService.fetchTableData(
        dataSource,
        columns,
        tableFilters
      );
      
      setTableData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load table data');
      console.error('Error fetching table data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    dataSource, 
    JSON.stringify(columns), 
    JSON.stringify(filters), 
    currentPage, 
    pageSize, 
    currentSortBy, 
    currentSortDirection
  ]);
  
  // Initial data fetch
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchTableData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchTableData]);
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle sort change
  const handleSortChange = (column: string) => {
    if (currentSortBy === column) {
      // Toggle direction if already sorting by this column
      setCurrentSortDirection(currentSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort column
      setCurrentSortBy(column);
      setCurrentSortDirection('asc');
    }
  };
  
  // Format cell value based on column type
  const formatCellValue = (value: any, type?: string) => {
    if (value === undefined || value === null) {
      return '-';
    }
    
    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        } else if (typeof value === 'string') {
          try {
            return new Date(value).toLocaleDateString();
          } catch {
            return value;
          }
        }
        return value;
        
      case 'number':
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        return value;
        
      case 'status':
        return (
          <Badge variant={
            value === 'active' ? 'success' : 
            value === 'pending' ? 'warning' : 
            value === 'inactive' ? 'secondary' : 
            'default'
          }>
            {typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value}
          </Badge>
        );
        
      default:
        return value;
    }
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-500 p-4">
        <div className="text-2xl mb-2">⚠️</div>
        <div className="mb-2">{error}</div>
        <Button 
          onClick={fetchTableData}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
        <div className="text-2xl mb-2">📊</div>
        <div className="mb-2">No data available</div>
        <Button 
          onClick={fetchTableData}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>
    );
  };
  
  // Render table header with sorting
  const renderTableHeader = () => {
    if (!tableData) return null;
    
    return (
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {tableData.headers.map((column) => (
            <th 
              key={column.key}
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleSortChange(column.key)}
            >
              <div className="flex items-center space-x-1">
                <span>{column.label}</span>
                {currentSortBy === column.key ? (
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentSortDirection === 'asc' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </span>
                ) : (
                  <ArrowUpDown className="h-4 w-4 opacity-20" />
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  };
  
  // Render table rows
  const renderTableRows = () => {
    if (!tableData || !tableData.rows || tableData.rows.length === 0) {
      return (
        <tr>
          <td 
            colSpan={tableData?.headers.length || 1}
            className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            No data available
          </td>
        </tr>
      );
    }
    
    return tableData.rows.map((row, rowIndex) => (
      <motion.tr 
        key={`row-${rowIndex}`}
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : rowIndex * 0.05,
          duration: prefersReducedMotion ? 0.1 : 0.2
        }}
      >
        {tableData.headers.map((column) => (
          <td 
            key={`${rowIndex}-${column.key}`}
            className="px-4 py-2 text-sm"
          >
            {formatCellValue(row[column.key], column.type)}
          </td>
        ))}
      </motion.tr>
    ));
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (!tableData || tableData.total === 0) return null;
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(Math.min(tableData.totalPages, currentPage + 1))}
            disabled={currentPage === tableData.totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, tableData.total)}
              </span>{' '}
              of <span className="font-medium">{tableData.total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="icon"
                className="rounded-l-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, tableData.totalPages) }, (_, i) => {
                // Logic to show pages around current page
                let pageNum;
                if (tableData.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= tableData.totalPages - 2) {
                  pageNum = tableData.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                onClick={() => handlePageChange(Math.min(tableData.totalPages, currentPage + 1))}
                disabled={currentPage === tableData.totalPages}
                variant="outline"
                size="icon"
                className="rounded-r-md"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    );
  };
  
  // Render refresh button
  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full"
      onClick={fetchTableData}
      title="Refresh data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
  );
  
  return (
    <DashboardCard
      id={id}
      title={title}
      size={size}
      isEditing={isEditing}
      onEdit={onEdit}
      onRemove={onRemove}
      onResize={onResize}
      headerActions={<RefreshButton />}
      className="table-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : !tableData || tableData.total === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="flex-grow overflow-auto">
              <table className="min-w-full">
                {renderTableHeader()}
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
            {renderPagination()}
            <div className="text-xs text-gray-500 text-right px-4 pb-2">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default TableCard;
