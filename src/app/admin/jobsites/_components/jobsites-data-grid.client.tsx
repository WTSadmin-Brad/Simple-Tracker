'use client';

/**
 * JobsitesDataGrid.client.tsx
 * Client component for the jobsites admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useRouter } from 'next/navigation';
import { DataGrid, FilterBar, ActionBar } from '@/components/feature/admin/data-grid';
import { useAdminDataGrid } from '@/hooks';
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
  
  // Use the shared admin data grid hook
  const {
    data,
    isLoading,
    error,
    selectedItems,
    currentPage,
    totalItems,
    filters,
    searchTerm,
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSelectionChange,
    handleRefresh
  } = useAdminDataGrid<Jobsite>({
    initialData: {
      items: initialData.jobsites,
      total: initialData.total,
      page: initialData.page,
      limit: initialData.limit,
      totalPages: initialData.totalPages
    },
    apiEndpoint: '/admin/jobsites',
    keyField: 'id'
  });
  
  // Handle actions with jobsite-specific logic
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
                  // Update status for all selected jobsites
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
                  handleRefresh();
                }
              } catch (err) {
                console.error('Error updating jobsite status:', err);
                alert('Failed to update jobsite status. Please try again.');
              }
            }
            break;
            
          case 'delete':
            if (selectedItems.length > 0) {
              try {
                // Delete selected jobsites
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
                handleRefresh();
              } catch (err) {
                console.error('Error deleting jobsites:', err);
                alert('Failed to delete jobsites. Please try again.');
              }
            }
            break;
            
          default:
            break;
        }
      }
    }));
  };
  
  // Handle row click to navigate to jobsite detail
  const handleRowClick = (item: Jobsite) => {
    router.push(`/admin/jobsites/${item.id}`);
  };
  
  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <FilterBar 
        filters={jobsiteFilters}
        values={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchTerm={searchTerm}
      />
      
      {/* Action bar */}
      <ActionBar 
        actions={getActionHandlers()}
        selectedItems={selectedItems}
      />
      
      {/* Data grid */}
      <DataGrid
        columns={jobsiteColumns}
        data={data}
        keyField="id"
        isLoading={isLoading}
        error={error}
        onRowClick={handleRowClick}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={initialData.limit}
        selectable={true}
        onSelectionChange={handleSelectionChange}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

export default JobsitesDataGrid;
