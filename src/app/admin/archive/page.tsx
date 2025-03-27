/**
 * Admin Archive Management Page
 * 
 * This page provides access to archived tickets and data.
 * It allows admins to search, view, and restore archived items.
 */

import { Metadata } from 'next';
import AdminHeader from '../_components/admin-header';
import { ArchiveManagerClient } from './_components/archive-manager-client';

export const metadata: Metadata = {
  title: 'Archive Management | Admin | Simple Tracker',
  description: 'Search and manage archived tickets and data',
};

export default function ArchiveManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Archive Management" 
        description="Search and manage archived tickets and data"
      />
      
      <div className="mt-6">
        <ArchiveManagerClient />
      </div>
    </div>
  );
}
