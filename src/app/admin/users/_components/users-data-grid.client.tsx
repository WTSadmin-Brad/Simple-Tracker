'use client';

/**
 * UsersDataGrid.client.tsx
 * Client component for the users admin page that implements client-side handlers
 * for filters, actions, and row selection
 */

import { useRouter } from 'next/navigation';
import { DataGrid, FilterBar, ActionBar } from '@/components/feature/admin/data-grid';
import { useAdminDataGrid } from '@/hooks';
import { toast } from 'sonner';
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
  } = useAdminDataGrid<User>({
    initialData: {
      items: initialData.users,
      total: initialData.total,
      page: initialData.page,
      limit: initialData.limit,
      totalPages: initialData.totalPages
    },
    apiEndpoint: '/api/admin/users',
    keyField: 'uid'
  });
  
  // Handle user role change
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'employee') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: 'changeRole',
          uid: userId,
          data: { role: newRole }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change user role');
      }
      
      toast.success('Role updated', {
        description: `User role updated to ${newRole}`,
      });
      
      handleRefresh();
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to change user role',
      });
    }
  };
  
  // Handle user activate/deactivate
  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: 'setActiveStatus',
          uid: userId,
          data: { isActive }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isActive ? 'activate' : 'deactivate'} user`);
      }
      
      if (isActive) {
        toast.success('User Activated', {
          description: 'User has been activated',
        });
      } else {
        toast('User Deactivated', {
          description: 'User has been deactivated',
        });
      }
      
      handleRefresh();
    } catch (error) {
      console.error(`Error ${isActive ? 'activating' : 'deactivating'} user:`, error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : `Failed to ${isActive ? 'activate' : 'deactivate'} user`,
      });
    }
  };
  
  // Get action handlers
  const getActionHandlers = () => {
    return userActions.map(action => ({
      ...action,
      onClick: async () => {
        switch (action.id) {
          case 'add':
            router.push('/admin/users/new');
            break;
            
          case 'edit':
            if (selectedItems.length === 1) {
              router.push(`/admin/users/${selectedItems[0].uid}/edit`);
            }
            break;
            
          case 'resetPassword':
            if (selectedItems.length > 0) {
              try {
                // Not implemented yet - will be added in another task
                toast('Not Implemented', {
                  description: 'Password reset functionality will be implemented in a future update',
                });
              } catch (err) {
                console.error('Error resetting password:', err);
                toast.error('Error', {
                  description: 'Failed to reset password',
                });
              }
            }
            break;
            
          case 'deactivate':
            if (selectedItems.length > 0) {
              try {
                // Process each selected user
                for (const user of selectedItems) {
                  if (user.isActive) {
                    await handleStatusChange(user.uid!, false);
                  }
                }
              } catch (err) {
                console.error('Error deactivating users:', err);
                toast.error('Error', {
                  description: 'Failed to deactivate one or more users',
                });
              }
            }
            break;
            
          case 'activate':
            if (selectedItems.length > 0) {
              try {
                // Process each selected user
                for (const user of selectedItems) {
                  if (!user.isActive) {
                    await handleStatusChange(user.uid!, true);
                  }
                }
              } catch (err) {
                console.error('Error activating users:', err);
                toast.error('Error', {
                  description: 'Failed to activate one or more users',
                });
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
          filters={userFilters}
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
        columns={userColumns}
        data={data}
        keyField="uid"
        isLoading={isLoading}
        error={error}
        onRowClick={(item) => router.push(`/admin/users/${item.uid}`)}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / initialData.limit),
          pageSize: initialData.limit,
          totalItems,
          onPageChange: handlePageChange
        }}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}

export default UsersDataGrid;
