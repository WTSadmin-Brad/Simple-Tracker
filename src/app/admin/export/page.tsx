/**
 * Admin Data Export Page
 * 
 * This page provides functionality to export tickets and workday data.
 * It allows admins to select date ranges, data types, and export formats.
 */

import { Metadata } from 'next';
import AdminHeader from '../_components/admin-header';
import { ExportManagerClient } from './_components/export-manager-client';

export const metadata: Metadata = {
  title: 'Data Export | Admin | Simple Tracker',
  description: 'Export tickets and workday data',
};

export default function DataExportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader 
        title="Data Export" 
        description="Export tickets and workday data"
      />
      
      <div className="mt-6">
        <ExportManagerClient />
      </div>
    </div>
  );
}
