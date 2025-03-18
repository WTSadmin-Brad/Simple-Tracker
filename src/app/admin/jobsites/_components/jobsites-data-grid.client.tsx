'use client';

/**
 * JobsitesDataGrid.client.tsx
 * Client component for the jobsites admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataGrid from '@/components/feature/admin/data-grid/DataGrid.client';
import FilterBar from '@/components/feature/admin/data-grid/FilterBar.client';
import ActionBar from '@/components/feature/admin/data-grid/ActionBar.client';
import { 
  jobsiteColumns, 
  jobsiteFilters, 
  jobsiteActions,
  Jobsite
} from '@/components/feature/admin/config';

interface JobsitesDataGridProps {
  initialData: {
    jobsites: Jobsite[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function JobsitesDataGrid({ initialData }: JobsitesDataGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for data grid
  const [data, setData] = useState<Jobsite[]>(initialData.jobsites);
  const [selectedItems, setSelectedItems] = useState<Jobsite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialData.page);
  const [totalItems, setTotalItems] = useState<number>(initialData.total);
  
  // Initialize filter values from URL search params
  const getInitialFilters = () => {
    const filters: Record<string, any> = {};
    
    // Status filter
    filters.status = searchParams.get('status') || 'all';
    
    // Client filter
    if (searchParams.has('client')) {
      filters.client = searchParams.get('client');
    }
    
    // Search term
    filters.searchTerm = searchParams.get('search') || '';
    
    return filters;
  };
  
  const [filters, setFilters] = useState<Record<string, any>>(getInitialFilters());
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  
  // Update URL with current filters and search term
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add status filter
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    
    // Add client filter
    if (filters.client) {
      params.set('client', filters.client);
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
    router.push(`/admin/jobsites?${params.toString()}`);
  }, [filters, searchTerm, currentPage, router]);
  
  // Fetch data when filters or page changes
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add status filter
      if (filters.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      
      // Add client filter
      if (filters.client) {
        params.set('client', filters.client);
      }
      
      // Add search term
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      
      // Add page number
      params.set('page', currentPage.toString());
      
      // Fetch data from API
      const response = await fetch(`/api/admin/jobsites?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobsites');
      }
      
      const result = await response.json();
      
      // Update state
      setData(result.jobsites);
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
  const handleSelectionChange = (items: Jobsite[]) => {
    setSelectedItems(items);
  };
  
  // Handle row click
  const handleRowClick = (item: Jobsite) => {
    router.push(`/admin/jobsites/${item.id}`);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handle actions
  const getActionHandlers = () => {
    return jobsiteActions.map(action => ({
      ...action,
      onClick: async () => {
        switch (action.id) {
          case 'add':
            router.push('/admin/jobsites/new');
            break;
            
          case 'edit':
            if (selectedItems.length === 1) {
              router.push(`/admin/jobsites/${selectedItems[0].id}/edit`);
            }
            break;
            
          case 'setStatus':
            if (selectedItems.length > 0) {
              try {
                // Open a dialog to select the new status
                // This would typically be implemented with a modal component
                const newStatus = window.prompt('Select new status (active, inactive, completed):');
                
                if (newStatus && ['active', 'inactive', 'completed'].includes(newStatus)) {
                  setIsLoading(true);
                  
                  const response = await fetch('/api/admin/jobsites/status', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      ids: selectedItems.map(item => item.id),
                      status: newStatus
                    })
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to update jobsite status');
                  }
                  
                  // Refresh data
                  fetchData();
                  
                  // Clear selection
                  setSelectedItems([]);
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Status update failed');
              } finally {
                setIsLoading(false);
              }
            }
            break;
            
          case 'delete':
            if (selectedItems.length > 0) {
              try {
                setIsLoading(true);
                
                const response = await fetch('/api/admin/jobsites', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ids: selectedItems.map(item => item.id)
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to delete jobsites');
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
        filters={jobsiteFilters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Search jobsites..."
        actionButtons={
          <ActionBar 
            actions={getActionHandlers()}
            selectedCount={selectedItems.length}
            position="top"
          />
        }
      />
      
      <DataGrid<Jobsite>
        columns={jobsiteColumns}
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

export default JobsitesDataGrid;
