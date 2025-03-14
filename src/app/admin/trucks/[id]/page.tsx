/**
 * Admin Truck Detail Page
 * 
 * This page displays detailed information for a specific truck.
 * It allows admins to view all truck data and take management actions.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminHeader from '../../_components/AdminHeader';
import EntityDetailView from '@/components/feature/admin/data-grid/EntityDetailView.client';
import { truckDetailFields, truckDetailTabs } from '@/components/feature/admin/config';
import { getTruckById } from '@/lib/services/truckService';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Truck Details | Admin | Simple Tracker',
  description: 'View detailed truck information',
};

// Generate dynamic metadata based on truck ID
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Truck #${params.id} | Admin | Simple Tracker`,
  };
}

export default async function TruckDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch truck data to check if it exists
  const truck = await getTruckById(id);
  
  // If truck doesn't exist, show 404 page
  if (!truck) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title={`Truck: ${truck.number}`} 
        backLink="/admin/trucks"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DetailSkeleton />}>
          <EntityDetailView
            entityId={id}
            entityType="Truck"
            title={`Truck: ${truck.number}`}
            description={`Type: ${truck.type}`}
            backLink="/admin/trucks"
            detailFields={truckDetailFields}
            tabs={truckDetailTabs}
            fetchEntity={getTruckById}
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