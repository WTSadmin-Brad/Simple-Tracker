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
import AdminHeader from '../_components/admin-header';
import DataGrid from '@/components/feature/admin/data-grid/data-grid.client';
import { 
  userColumns,
  defaultUserQueryParams,
  User
} from '@/components/feature/admin/config';
import { getUsers } from '@/lib/services/userService';
import UsersDataGrid from './_components/users-data-grid.client';

export const metadata: Metadata = {
  title: 'User Management | Admin | Simple Tracker',
  description: 'Manage and review all user accounts',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract filter parameters from search params with defaults
  const role = searchParams.role as string | undefined;
  const status = searchParams.status as string | undefined;
  const search = searchParams.search as string | undefined;
  const page = Number(searchParams.page) || 1;
  
  // Fetch users with filters
  const usersData = await getUsers({
    role,
    status,
    search,
    page,
    ...defaultUserQueryParams
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Users Management" 
        description="View and manage all user accounts"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DataGrid isLoading columns={userColumns} data={[]} keyField="id" />}>
          <UsersDataGrid initialData={usersData} />
        </Suspense>
      </div>
    </div>
  );
}
