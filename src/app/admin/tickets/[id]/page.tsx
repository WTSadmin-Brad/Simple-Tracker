/**
 * Admin Ticket Detail Page
 * 
 * This page displays detailed information for a specific ticket.
 * It allows admins to view all ticket data, images, and take actions.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminHeader from '../../_components/AdminHeader';
import EntityDetailView from '@/components/feature/admin/data-grid/EntityDetailView.client';
import { ticketDetailFields, ticketDetailTabs } from '@/components/feature/admin/config';
import { getTicketById } from '@/lib/services/ticketService';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Ticket Details | Admin | Simple Tracker',
  description: 'View detailed ticket information',
};

// This is a placeholder for dynamic metadata generation
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Ticket #${params.id} | Admin | Simple Tracker`,
  };
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch ticket data to check if it exists
  const ticket = await getTicketById(id);
  
  // If ticket doesn't exist, show 404 page
  if (!ticket) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title={`Ticket #${id}`} 
        backLink="/admin/tickets"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DetailSkeleton />}>
          <EntityDetailView
            entityId={id}
            entityType="Ticket"
            title={`Ticket #${id}`}
            description={`Submitted on ${ticket.submissionDate.toLocaleDateString()}`}
            backLink="/admin/tickets"
            detailFields={ticketDetailFields}
            tabs={ticketDetailTabs}
            fetchEntity={getTicketById}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Skeleton loader for detail view
function DetailSkeleton() {
  return (
    <div className="w-full rounded-lg border border-gray-200 shadow animate-pulse">
      <div className="p-6 space-y-6">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
