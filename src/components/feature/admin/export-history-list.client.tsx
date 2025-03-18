/**
 * Export History List Component
 * 
 * Client component for displaying past data exports.
 * Shows export history with download options.
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button.client';
import { Table } from '@/components/ui/table.client';

interface ExportHistoryListProps {
  onDownload: (exportId: string) => void;
}

export default function ExportHistoryList({ onDownload }: ExportHistoryListProps) {
  // TODO: Implement history list state and handlers
  
  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Export History</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* TODO: Implement export history rows with data */}
          </tbody>
        </Table>
      </div>
      
      {/* Empty state when no exports exist */}
      <div className="text-center py-6 hidden">
        <p className="text-gray-500">No export history available</p>
      </div>
    </Card>
  );
}
