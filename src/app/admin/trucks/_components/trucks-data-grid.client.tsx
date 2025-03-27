'use client';

/**
 * TrucksDataGrid.client.tsx
 * Client component for the trucks admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useRouter } from 'next/navigation';
import { DataGrid, FilterBar, ActionBar } from '@/components/feature/admin/data-grid';
import { useAdminDataGrid } from '@/hooks';
import { 
  truckColumns, 
  truckFilters, 
  truckActions,
  Truck
} from '@/components/feature/admin/config';

interface TrucksDataGridProps {
  initialData: {
    trucks: Truck[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function TrucksDataGrid({ initialData }: TrucksDataGridProps) {
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
  } = useAdminDataGrid<Truck>({
    initialData: {
      items: initialData.trucks,
      total: initialData.total,
      page: initialData.page,
      limit: initialData.limit,
      totalPages: initialData.totalPages
    },
    apiEndpoint: '/admin/trucks',
    keyField: 'id'
  });
  
  // Handle actions
  const getActionHandlers = () => {
    return truckActions.map(action => ({
      ...action,
      onClick: async () => {
        switch (action.id) {
          case 'add':
            router.push('/admin/trucks/new');
            break;
            
          case 'edit':
            if (selectedItems.length === 1) {
              router.push(`/admin/trucks/${selectedItems[0].id}/edit`);
            }
            break;
            
          case 'setStatus':
            if (selectedItems.length > 0) {
              try {
                // Open a dialog to select the new status
                const newStatus = window.prompt('Select new status (active, inactive, maintenance):');
                
                if (newStatus && ['active', 'inactive', 'maintenance'].includes(newStatus)) {
                  const response = await fetch('/api/admin/trucks/status', {
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
                    throw new Error('Failed to update truck status');
                  }
                  
                  handleRefresh();
                }
              } catch (err) {
                console.error('Error updating truck status:', err);
                // Could add toast notification here
              }
            }
            break;
            
          case 'refresh':
            handleRefresh();
            break;
            
          default:
            break;
        }
      }
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <FilterBar
          filters={truckFilters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          initialFilters={filters}
          initialSearchTerm={searchTerm}
        />
        
        <ActionBar
          actions={getActionHandlers()}
          selectedCount={selectedItems.length}
        />
      </div>
      
      <DataGrid
        columns={truckColumns}
        data={data}
        keyField="id"
        isLoading={isLoading}
        error={error}
        onRowClick={(item) => router.push(`/admin/trucks/${item.id}`)}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / initialData.limit),
          pageSize: initialData.limit,
          totalItems,
          onPageChange: handlePageChange
        }}
        selectable
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}

export default TrucksDataGrid;
