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
import AdminHeader from '../_components/admin-header';
import DataGrid from '@/components/feature/admin/data-grid/data-grid.client';
import { 
  jobsiteColumns,
  defaultJobsiteQueryParams,
  Jobsite
} from '@/components/feature/admin/config';
import { getJobsites } from '@/lib/services/jobsiteService';
import JobsitesDataGrid from './_components/jobsites-data-grid.client';

export const metadata: Metadata = {
  title: 'Jobsite Management | Admin | Simple Tracker',
  description: 'Manage and review all jobsites',
};

export default async function AdminJobsitesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract filter parameters from search params with defaults
  const status = searchParams.status as string | undefined;
  const client = searchParams.client as string | undefined;
  const search = searchParams.search as string | undefined;
  const page = Number(searchParams.page) || 1;
  
  // Fetch jobsites with filters
  const jobsitesData = await getJobsites({
    status,
    client,
    search,
    page,
    ...defaultJobsiteQueryParams
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Jobsites Management" 
        description="View and manage all jobsites"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DataGrid isLoading columns={jobsiteColumns} data={[]} keyField="id" />}>
          <JobsitesDataGrid initialData={jobsitesData} />
        </Suspense>
      </div>
    </div>
  );
}
