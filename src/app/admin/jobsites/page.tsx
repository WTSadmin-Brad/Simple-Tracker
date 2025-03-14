/**
 * Admin Jobsites Management Page
 * 
 * This component provides an interface for administrators to manage jobsite data
 * including creating, editing, and archiving jobsites.
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
  jobsiteColumns, 
  jobsiteFilters, 
  jobsiteActions, 
  jobsiteDetailFields,
  defaultJobsiteQueryParams,
  Jobsite
} from '@/components/feature/admin/config';
import { getJobsites } from '@/lib/services/jobsiteService';

export const metadata: Metadata = {
  title: 'Jobsite Management | Admin | Simple Tracker',
  description: 'Manage and review all jobsites',
};

export default async function AdminJobsitesPage() {
  // Fetch jobsites with default filters
  // This would normally use searchParams from the URL, but we're using defaults for now
  const { jobsites, total, page, limit, totalPages } = await getJobsites({
    ...defaultJobsiteQueryParams
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Jobsites Management" 
        description="View and manage all jobsites"
      />
      
      <div className="mt-6">
        <FilterBar 
          filters={jobsiteFilters}
          onFilterChange={() => {}}
          searchPlaceholder="Search jobsites..."
          actionButtons={
            <ActionBar 
              actions={jobsiteActions}
              position="top"
            />
          }
        />
        
        <Suspense fallback={<DataGrid isLoading columns={jobsiteColumns} data={[]} keyField="id" />}>
          <DataGrid<Jobsite>
            columns={jobsiteColumns}
            data={jobsites}
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
