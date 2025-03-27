'use client';

/**
 * TicketsDataGrid.client.tsx
 * Client component for the tickets admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useRouter } from 'next/navigation';
import { DataGrid, FilterBar, ActionBar } from '@/components/feature/admin/data-grid';
import { useAdminDataGrid } from '@/hooks';
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
  } = useAdminDataGrid<Ticket>({
    initialData: {
      items: initialData.tickets,
      total: initialData.total,
      page: initialData.page,
      limit: initialData.limit,
      totalPages: initialData.totalPages
    },
    apiEndpoint: '/admin/tickets',
    keyField: 'id',
    defaultQueryParams: defaultTicketQueryParams
  });
  
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
            
          case 'archive':
            if (selectedItems.length > 0) {
              try {
                if (window.confirm(`Are you sure you want to archive ${selectedItems.length} ticket(s)?`)) {
                  const response = await fetch('/api/admin/tickets/archive', {
                    method: 'PATCH',
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
                  
                  handleRefresh();
                }
              } catch (err) {
                console.error('Error archiving tickets:', err);
                // Could add toast notification here
              }
            }
            break;
            
          case 'unarchive':
            if (selectedItems.length > 0) {
              try {
                if (window.confirm(`Are you sure you want to unarchive ${selectedItems.length} ticket(s)?`)) {
                  const response = await fetch('/api/admin/tickets/unarchive', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      ids: selectedItems.map(item => item.id)
                    })
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to unarchive tickets');
                  }
                  
                  handleRefresh();
                }
              } catch (err) {
                console.error('Error unarchiving tickets:', err);
                // Could add toast notification here
              }
            }
            break;
            
          case 'export':
            try {
              // Determine which tickets to export (selected or all filtered)
              const idsToExport = selectedItems.length > 0 
                ? selectedItems.map(item => item.id) 
                : null;
              
              // Construct query parameters
              const queryParams = new URLSearchParams();
              
              // Add filters if exporting all filtered tickets
              if (!idsToExport) {
                // Add all current filters
                Object.entries(filters).forEach(([key, value]) => {
                  if (value && value !== 'all') {
                    queryParams.set(key, String(value));
                  }
                });
                
                // Add search term
                if (searchTerm) {
                  queryParams.set('search', searchTerm);
                }
              } else {
                // Add selected ids
                queryParams.set('ids', idsToExport.join(','));
              }
              
              // Redirect to export page with query parameters
              window.open(`/admin/export/tickets?${queryParams.toString()}`, '_blank');
            } catch (err) {
              console.error('Error exporting tickets:', err);
              // Could add toast notification here
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
          filters={ticketFilters}
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
        columns={ticketColumns}
        data={data}
        keyField="id"
        isLoading={isLoading}
        error={error}
        onRowClick={(item) => router.push(`/admin/tickets/${item.id}`)}
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

export default TicketsDataGrid;
