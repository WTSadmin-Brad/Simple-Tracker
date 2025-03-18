'use client';

/**
 * TicketsDataGrid.client.tsx
 * Client component for the tickets admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataGrid from '@/components/feature/admin/data-grid/DataGrid.client';
import FilterBar from '@/components/feature/admin/data-grid/FilterBar.client';
import ActionBar from '@/components/feature/admin/data-grid/ActionBar.client';
import { 
  ticketColumns, 
  ticketFilters, 
  ticketActions, 
  defaultTicketQueryParams,
  Ticket
} from '@/components/feature/admin/config';

interface TicketsDataGridProps {
  initialData: {
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function TicketsDataGrid({ initialData }: TicketsDataGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for data grid
  const [data, setData] = useState<Ticket[]>(initialData.tickets);
  const [selectedItems, setSelectedItems] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialData.page);
  const [totalItems, setTotalItems] = useState<number>(initialData.total);
  
  // Initialize filter values from URL search params
  const getInitialFilters = () => {
    const filters: Record<string, any> = {};
    
    // Date range filter
    filters.dateRange = {
      startDate: searchParams.get('startDate') || defaultTicketQueryParams.startDate,
      endDate: searchParams.get('endDate') || defaultTicketQueryParams.endDate
    };
    
    // Truck filter
    if (searchParams.has('truck')) {
      filters.truckNumber = searchParams.get('truck');
    }
    
    // Jobsite filter
    if (searchParams.has('jobsite')) {
      filters.jobsite = searchParams.get('jobsite');
    }
    
    // Include archived filter
    filters.includeArchived = searchParams.get('includeArchived') === 'true';
    
    return filters;
  };
  
  const [filters, setFilters] = useState<Record<string, any>>(getInitialFilters());
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  
  // Update URL with current filters and search term
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add date range filter
    if (filters.dateRange?.startDate) {
      params.set('startDate', filters.dateRange.startDate);
    }
    if (filters.dateRange?.endDate) {
      params.set('endDate', filters.dateRange.endDate);
    }
    
    // Add truck filter
    if (filters.truckNumber) {
      params.set('truck', filters.truckNumber);
    }
    
    // Add jobsite filter
    if (filters.jobsite) {
      params.set('jobsite', filters.jobsite);
    }
    
    // Add include archived filter
    if (filters.includeArchived) {
      params.set('includeArchived', 'true');
    }
    
    // Add search term
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    // Add page number
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    // Update URL
    router.push(`/admin/tickets?${params.toString()}`);
  }, [filters, searchTerm, currentPage, router]);
  
  // Fetch data when filters or page changes
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add date range filter
      if (filters.dateRange?.startDate) {
        params.set('startDate', filters.dateRange.startDate);
      }
      if (filters.dateRange?.endDate) {
        params.set('endDate', filters.dateRange.endDate);
      }
      
      // Add truck filter
      if (filters.truckNumber) {
        params.set('truck', filters.truckNumber);
      }
      
      // Add jobsite filter
      if (filters.jobsite) {
        params.set('jobsite', filters.jobsite);
      }
      
      // Add include archived filter
      if (filters.includeArchived) {
        params.set('includeArchived', 'true');
      }
      
      // Add search term
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      
      // Add page number
      params.set('page', currentPage.toString());
      
      // Fetch data from API
      const response = await fetch(`/api/admin/tickets?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const result = await response.json();
      
      // Update state
      setData(result.tickets);
      setTotalItems(result.total);
      
      // Update URL
      updateUrl();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm, currentPage, updateUrl]);
  
  // Fetch data when filters or page changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle filter change
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle row selection
  const handleSelectionChange = (items: Ticket[]) => {
    setSelectedItems(items);
  };
  
  // Handle row click
  const handleRowClick = (item: Ticket) => {
    router.push(`/admin/tickets/${item.id}`);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handle actions
  const getActionHandlers = () => {
    return ticketActions.map(action => ({
      ...action,
      onClick: async () => {
        switch (action.id) {
          case 'view':
            if (selectedItems.length === 1) {
              router.push(`/admin/tickets/${selectedItems[0].id}`);
            }
            break;
            
          case 'export':
            try {
              // Build query parameters for export
              const params = new URLSearchParams();
              
              // Add date range filter
              if (filters.dateRange?.startDate) {
                params.set('startDate', filters.dateRange.startDate);
              }
              if (filters.dateRange?.endDate) {
                params.set('endDate', filters.dateRange.endDate);
              }
              
              // Add truck filter
              if (filters.truckNumber) {
                params.set('truck', filters.truckNumber);
              }
              
              // Add jobsite filter
              if (filters.jobsite) {
                params.set('jobsite', filters.jobsite);
              }
              
              // Add include archived filter
              if (filters.includeArchived) {
                params.set('includeArchived', 'true');
              }
              
              // Add search term
              if (searchTerm) {
                params.set('search', searchTerm);
              }
              
              // Add selected items if any
              if (selectedItems.length > 0) {
                params.set('ids', selectedItems.map(item => item.id).join(','));
              }
              
              // Redirect to export endpoint
              window.location.href = `/api/admin/export/tickets?${params.toString()}`;
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Export failed');
            }
            break;
            
          case 'archive':
            if (selectedItems.length > 0) {
              try {
                setIsLoading(true);
                
                const response = await fetch('/api/admin/archive/tickets', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ids: selectedItems.map(item => item.id)
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to archive tickets');
                }
                
                // Refresh data
                fetchData();
                
                // Clear selection
                setSelectedItems([]);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Archive failed');
              } finally {
                setIsLoading(false);
              }
            }
            break;
            
          case 'delete':
            if (selectedItems.length > 0) {
              try {
                setIsLoading(true);
                
                const response = await fetch('/api/admin/tickets', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ids: selectedItems.map(item => item.id)
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to delete tickets');
                }
                
                // Refresh data
                fetchData();
                
                // Clear selection
                setSelectedItems([]);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Delete failed');
              } finally {
                setIsLoading(false);
              }
            }
            break;
            
          default:
            break;
        }
      }
    }));
  };
  
  return (
    <>
      <FilterBar 
        filters={ticketFilters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Search tickets..."
        actionButtons={
          <ActionBar 
            actions={getActionHandlers()}
            selectedCount={selectedItems.length}
            position="top"
          />
        }
      />
      
      <DataGrid<Ticket>
        columns={ticketColumns}
        data={data}
        keyField="id"
        isLoading={isLoading}
        error={error}
        onRowClick={handleRowClick}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onSelectionChange={handleSelectionChange}
        currentPage={currentPage}
        pageSize={initialData.limit}
        totalItems={totalItems}
        selectable={true}
      />
    </>
  );
}

export default TicketsDataGrid;
