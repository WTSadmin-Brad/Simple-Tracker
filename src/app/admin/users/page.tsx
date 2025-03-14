/**
 * Admin Users Management Page
 * 
 * This component provides an interface for administrators to manage user accounts
 * including creating, editing, and deactivating users.
 * 
 * @source Project Requirements - Admin Section
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminHeader from '../_components/AdminHeader';
import DataGrid from '@/components/feature/admin/data-grid/DataGrid.client';
import FilterBar from '@/components/feature/admin/data-grid/FilterBar.client';
import ActionBar from '@/components/feature/admin/data-grid/ActionBar.client';
import { 
  userColumns, 
  userFilters, 
  userActions, 
  userDetailFields,
  defaultUserQueryParams,
  User
} from '@/components/feature/admin/config';
import { getUsers } from '@/lib/services/userService';

export const metadata: Metadata = {
  title: 'User Management | Admin | Simple Tracker',
  description: 'Manage and review all user accounts',
};

export default async function AdminUsersPage() {
  // Fetch users with default filters
  // This would normally use searchParams from the URL, but we're using defaults for now
  const { users, total, page, limit, totalPages } = await getUsers({
    ...defaultUserQueryParams
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Users Management" 
        description="View and manage all user accounts"
      />
      
      <div className="mt-6">
        <FilterBar 
          filters={userFilters}
          onFilterChange={() => {}}
          searchPlaceholder="Search users..."
          actionButtons={
            <ActionBar 
              actions={userActions}
              position="top"
            />
          }
        />
        
        <Suspense fallback={<DataGrid isLoading columns={userColumns} data={[]} keyField="id" />}>
          <DataGrid<User>
            columns={userColumns}
            data={users}
            keyField="id"
            onRowClick={() => {}}
            currentPage={page}
            pageSize={limit}
            totalItems={total}
            selectable={true}
          />
        </Suspense>
      </div>
    </div>
  );
}
