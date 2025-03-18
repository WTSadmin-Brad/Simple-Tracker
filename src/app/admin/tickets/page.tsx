/**
 * Admin Tickets Management Page
 * 
 * This page displays all tickets with filtering, sorting, and management capabilities.
 * It allows admins to view, search, filter, and manage ticket submissions.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import AdminHeader from '../_components/admin-header';
import DataGrid from '@/components/feature/admin/data-grid/data-grid.client';
import { 
  ticketColumns,
  defaultTicketQueryParams,
  Ticket
} from '@/components/feature/admin/config';
import { getTickets } from '@/lib/services/ticketService';
import TicketsDataGrid from './_components/tickets-data-grid.client';

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
  const page = Number(searchParams.page) || 1;
  
  // Fetch tickets with filters
  const ticketsData = await getTickets({
    startDate,
    endDate,
    jobsite,
    truck,
    status: includeArchived ? undefined : 'active',
    search,
    page
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Ticket Management" 
        description="View and manage all ticket submissions"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DataGrid isLoading columns={ticketColumns} data={[]} keyField="id" />}>
          <TicketsDataGrid initialData={ticketsData} />
        </Suspense>
      </div>
    </div>
  );
}
