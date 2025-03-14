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
import AdminHeader from '../_components/AdminHeader';
import DataGrid from '@/components/feature/admin/data-grid/DataGrid.client';
import FilterBar from '@/components/feature/admin/data-grid/FilterBar.client';
import ActionBar from '@/components/feature/admin/data-grid/ActionBar.client';
import { 
  truckColumns, 
  truckFilters, 
  truckActions, 
  truckDetailFields,
  defaultTruckQueryParams,
  Truck
} from '@/components/feature/admin/config';
import { getTrucks } from '@/lib/services/truckService';

export const metadata: Metadata = {
  title: 'Truck Management | Admin | Simple Tracker',
  description: 'Manage and review all trucks',
};

export default async function AdminTrucksPage() {
  // Fetch trucks with default filters
  // This would normally use searchParams from the URL, but we're using defaults for now
  const { trucks, total, page, limit, totalPages } = await getTrucks({
    ...defaultTruckQueryParams
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Trucks Management" 
        description="View and manage all trucks"
      />
      
      <div className="mt-6">
        <FilterBar 
          filters={truckFilters}
          onFilterChange={() => {}}
          searchPlaceholder="Search trucks..."
          actionButtons={
            <ActionBar 
              actions={truckActions}
              position="top"
            />
          }
        />
        
        <Suspense fallback={<DataGrid isLoading columns={truckColumns} data={[]} keyField="id" />}>
          <DataGrid<Truck>
            columns={truckColumns}
            data={trucks}
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
