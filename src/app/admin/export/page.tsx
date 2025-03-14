/**
 * Admin Data Export Page
 * 
 * This page provides functionality to export tickets and workday data.
 * It allows admins to select date ranges, data types, and export formats.
 */

import { Metadata } from 'next';
import AdminHeader from '../_components/AdminHeader';

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
      
      {/* Data export components will be added here */}
      <div className="mt-6">
        {/* 
          TODO: Implement data export components:
          - ExportTypeSelector for choosing between tickets and workdays
          - DateRangeSelector for selecting the export period
          - FormatSelector for choosing export format (CSV, Excel, etc.)
          - ExportButton for triggering the export process
          - ExportHistoryList for viewing past exports
        */}
      </div>
    </div>
  );
}
