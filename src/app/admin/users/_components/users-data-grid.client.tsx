'use client';

/**
 * UsersDataGrid.client.tsx
 * Client component for the users admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataGrid from '@/components/feature/admin/data-grid/DataGrid.client';
import FilterBar from '@/components/feature/admin/data-grid/FilterBar.client';
import ActionBar from '@/components/feature/admin/data-grid/ActionBar.client';
import { 
  userColumns, 
  userFilters, 
  userActions,
  User
} from '@/components/feature/admin/config';

interface UsersDataGridProps {
  initialData: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function UsersDataGrid({ initialData }: UsersDataGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for data grid
  const [data, setData] = useState<User[]>(initialData.users);
  const [selectedItems, setSelectedItems] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialData.page);
  const [totalItems, setTotalItems] = useState<number>(initialData.total);
  
  // Initialize filter values from URL search params
  const getInitialFilters = () => {
    const filters: Record<string, any> = {};
    
    // Role filter
    filters.role = searchParams.get('role') || 'all';
    
    // Status filter
    filters.status = searchParams.get('status') || 'active';
    
    // Search term
    filters.searchTerm = searchParams.get('search') || '';
    
    return filters;
  };
  
  const [filters, setFilters] = useState<Record<string, any>>(getInitialFilters());
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  
  // Update URL with current filters and search term
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add role filter
    if (filters.role && filters.role !== 'all') {
      params.set('role', filters.role);
    }
    
    // Add status filter
    if (filters.status && filters.status !== 'all') {
      params.set('status', filters.status);
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
    router.push(`/admin/users?${params.toString()}`);
  }, [filters, searchTerm, currentPage, router]);
  
  // Fetch data when filters or page changes
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add role filter
      if (filters.role && filters.role !== 'all') {
        params.set('role', filters.role);
      }
      
      // Add status filter
      if (filters.status && filters.status !== 'all') {
        params.set('status', filters.status);
      }
      
      // Add search term
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      
      // Add page number
      params.set('page', currentPage.toString());
      
      // Fetch data from API
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const result = await response.json();
      
      // Update state
      setData(result.users);
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
  const handleSelectionChange = (items: User[]) => {
    setSelectedItems(items);
  };
  
  // Handle row click
  const handleRowClick = (item: User) => {
    router.push(`/admin/users/${item.id}`);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handle actions
  const getActionHandlers = () => {
    return userActions.map(action => ({
      ...action,
      onClick: async () => {
        switch (action.id) {
          case 'invite':
            router.push('/admin/users/invite');
            break;
            
          case 'edit':
            if (selectedItems.length === 1) {
              router.push(`/admin/users/${selectedItems[0].id}/edit`);
            }
            break;
            
          case 'resetPassword':
            if (selectedItems.length > 0) {
              try {
                setIsLoading(true);
                
                const response = await fetch('/api/admin/users/reset-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ids: selectedItems.map(item => item.id)
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to send password reset emails');
                }
                
                // Show success message (this would typically be implemented with a toast component)
                alert('Password reset emails sent successfully');
                
                // Refresh data
                fetchData();
                
                // Clear selection
                setSelectedItems([]);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Password reset failed');
              } finally {
                setIsLoading(false);
              }
            }
            break;
            
          case 'changeRole':
            if (selectedItems.length > 0) {
              try {
                // Open a dialog to select the new role
                // This would typically be implemented with a modal component
                const newRole = window.prompt('Select new role (admin, manager, employee):');
                
                if (newRole && ['admin', 'manager', 'employee'].includes(newRole)) {
                  setIsLoading(true);
                  
                  const response = await fetch('/api/admin/users/role', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      ids: selectedItems.map(item => item.id),
                      role: newRole
                    })
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to update user roles');
                  }
                  
                  // Refresh data
                  fetchData();
                  
                  // Clear selection
                  setSelectedItems([]);
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Role update failed');
              } finally {
                setIsLoading(false);
              }
            }
            break;
            
          case 'deactivate':
            if (selectedItems.length > 0) {
              try {
                setIsLoading(true);
                
                const response = await fetch('/api/admin/users/status', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ids: selectedItems.map(item => item.id),
                    status: 'inactive'
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to deactivate users');
                }
                
                // Refresh data
                fetchData();
                
                // Clear selection
                setSelectedItems([]);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Deactivation failed');
              } finally {
                setIsLoading(false);
              }
            }
            break;
            
          case 'delete':
            if (selectedItems.length > 0) {
              try {
                setIsLoading(true);
                
                const response = await fetch('/api/admin/users', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    ids: selectedItems.map(item => item.id)
                  })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to delete users');
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
        filters={userFilters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Search users..."
        actionButtons={
          <ActionBar 
            actions={getActionHandlers()}
            selectedCount={selectedItems.length}
            position="top"
          />
        }
      />
      
      <DataGrid<User>
        columns={userColumns}
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

export default UsersDataGrid;
