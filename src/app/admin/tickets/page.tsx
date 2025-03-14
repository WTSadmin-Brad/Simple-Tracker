/**
 * Admin Tickets Management Page
 * 
 * This page displays all tickets with filtering, sorting, and management capabilities.
 * It allows admins to view, search, filter, and manage ticket submissions.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminHeader from '../_components/AdminHeader';
import DataGrid from '@/components/feature/admin/data-grid/DataGrid.client';
import FilterBar from '@/components/feature/admin/data-grid/FilterBar.client';
import ActionBar from '@/components/feature/admin/data-grid/ActionBar.client';
import { 
  ticketColumns, 
  ticketFilters, 
  ticketActions, 
  ticketDetailFields,
  defaultTicketQueryParams,
  Ticket
} from '@/components/feature/admin/config';
import { getTickets } from '@/lib/services/ticketService';

export const metadata: Metadata = {
  title: 'Ticket Management | Admin | Simple Tracker',
  description: 'Manage and review all ticket submissions',
};

export default async function TicketsManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract filter parameters from search params with defaults from config
  const startDate = searchParams.startDate as string || defaultTicketQueryParams.startDate;
  const endDate = searchParams.endDate as string || defaultTicketQueryParams.endDate;
  const jobsite = searchParams.jobsite as string | undefined;
  const truck = searchParams.truck as string | undefined;
  const includeArchived = searchParams.includeArchived === 'true' || defaultTicketQueryParams.includeArchived;
  const search = searchParams.search as string | undefined;
  
  // Fetch tickets with filters
  const { tickets, total, page, limit, totalPages } = await getTickets({
    startDate,
    endDate,
    jobsite,
    truck,
    status: includeArchived ? undefined : 'active',
    search,
  });

  // Handle client-side actions (these will be implemented at runtime in the client component)
  const handleFilterChange = () => {
    // This will be implemented in the client component
  };

  const handleActionClick = () => {
    // This will be implemented in the client component
  };

  const handleRowClick = () => {
    // This will be implemented in the client component
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Ticket Management" 
        description="View and manage all ticket submissions"
      />
      
      <div className="mt-6">
        <FilterBar 
          filters={ticketFilters}
          onFilterChange={handleFilterChange}
          searchPlaceholder="Search tickets..."
          actionButtons={
            <ActionBar 
              actions={ticketActions}
              position="top"
            />
          }
        />
        
        <Suspense fallback={<DataGrid isLoading columns={ticketColumns} data={[]} keyField="id" />}>
          <DataGrid<Ticket>
            columns={ticketColumns}
            data={tickets}
            keyField="id"
            onRowClick={handleRowClick}
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
