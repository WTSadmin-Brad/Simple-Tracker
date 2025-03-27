/**
 * Admin User Detail Page
 * 
 * This page displays detailed information for a specific user.
 * It allows admins to view all user data and take management actions.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminHeader from '../../_components/admin-header';
import { EntityDetailView } from '@/components/feature/admin/data-grid';
import { userDetailFields, userDetailTabs } from '@/components/feature/admin/config';
import { getUserById } from '@/lib/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'User Details | Admin | Simple Tracker',
  description: 'View detailed user information',
};

// Generate dynamic metadata based on user ID
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `User #${params.id} | Admin | Simple Tracker`,
  };
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Fetch user data to check if it exists
  const user = await getUserById(id);
  
  // If user doesn't exist, show 404 page
  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title={`User: ${user.name}`} 
        backLink="/admin/users"
      />
      
      <div className="mt-6">
        <Suspense fallback={<DetailSkeleton />}>
          <EntityDetailView
            entityId={id}
            entityType="User"
            title={`User: ${user.name}`}
            description={`Role: ${user.role}`}
            backLink="/admin/users"
            detailFields={userDetailFields}
            tabs={userDetailTabs}
            fetchEntity={getUserById}
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