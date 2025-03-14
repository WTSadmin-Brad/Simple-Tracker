/**
 * Admin Jobsite Detail Page
 * 
 * This page displays detailed information for a specific jobsite.
 * It allows admins to view all jobsite data and take management actions.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminHeader from '../../_components/AdminHeader';
import EntityDetailView from '@/components/feature/admin/data-grid/EntityDetailView.client';
import { jobsiteDetailFields, jobsiteDetailTabs } from '@/components/feature/admin/config';
import { getJobsiteById } from '@/lib/services/jobsiteService';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Jobsite Details | Admin | Simple Tracker',
  description: 'View detailed jobsite information',
};

// Generate dynamic metadata based on jobsite ID
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Jobsite #${params.id} | Admin | Simple Tracker`,
  };
}

export default async function JobsiteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch jobsite data to check if it exists
  const jobsite = await getJobsiteById(id);
  
  // If jobsite doesn't exist, show 404 page
  if (!jobsite) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title={`Jobsite: ${jobsite.name}`} 
        backLink="/admin/jobsites"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DetailSkeleton />}>
          <EntityDetailView
            entityId={id}
            entityType="Jobsite"
            title={`Jobsite: ${jobsite.name}`}
            description={`Location: ${jobsite.location}`}
            backLink="/admin/jobsites"
            detailFields={jobsiteDetailFields}
            tabs={jobsiteDetailTabs}
            fetchEntity={getJobsiteById}
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