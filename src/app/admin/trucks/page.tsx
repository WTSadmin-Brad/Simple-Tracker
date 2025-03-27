/**
 * Admin Trucks Management Page
 * 
 * This component provides an interface for administrators to manage truck data
 * including creating, editing, and archiving trucks.
 * 
 * @source Project Requirements - Admin Section
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminHeader from '../_components/admin-header';
import { DataGrid } from '@/components/feature/admin/data-grid';
import { 
  truckColumns,
  defaultTruckQueryParams,
  Truck
} from '@/components/feature/admin/config';
import { getTrucks } from '@/lib/services/truckService';
import TrucksDataGrid from './_components/trucks-data-grid.client';

export const metadata: Metadata = {
  title: 'Truck Management | Admin | Simple Tracker',
  description: 'Manage and review all trucks',
};

export default async function AdminTrucksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract filter parameters from search params with defaults
  const status = searchParams.status as string | undefined;
  const search = searchParams.search as string | undefined;
  const page = Number(searchParams.page) || 1;
  
  // Fetch trucks with filters
  const trucksData = await getTrucks({
    status,
    search,
    page,
    ...defaultTruckQueryParams
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Trucks Management" 
        description="View and manage all trucks"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DataGrid isLoading columns={truckColumns} data={[]} keyField="id" />}>
          <TrucksDataGrid initialData={trucksData} />
        </Suspense>
      </div>
    </div>
  );
}
