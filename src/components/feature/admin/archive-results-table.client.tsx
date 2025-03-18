/**
 * Archive Results Table Component
 * 
 * Client component for displaying archived items search results.
 * Shows archived tickets and data with restore options.
 */

'use client';

import { useState } from 'react';
import { Table } from '@/components/ui/table.client';
import { Button } from '@/components/ui/button.client';
import { Pagination } from '@/components/ui/pagination.client';

interface ArchiveResultsTableProps {
  onItemSelect: (itemId: string, itemType: string) => void;
  onRestore: (itemId: string, itemType: string) => void;
}

export default function ArchiveResultsTable({ 
  onItemSelect, 
  onRestore 
}: ArchiveResultsTableProps) {
  // TODO: Implement table state and handlers
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Archived
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* TODO: Implement archive item rows with data */}
          </tbody>
        </Table>
      </div>
      
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">50</span> results
            </p>
          </div>
          <Pagination />
        </div>
      </div>
    </div>
  );
}
