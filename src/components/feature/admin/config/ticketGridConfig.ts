/**
 * ticketGridConfig.ts
 * Configuration for the ticket data grid in the admin interface
 * 
 * @source Admin_Flows.md - "Filter & Export Truck Tickets" section
 */

import { DataGridColumn } from '../data-grid/DataGrid.client';
import { FilterOption } from '../data-grid/FilterBar.client';
import { Action } from '../data-grid/ActionBar.client';
import { format } from 'date-fns';

// Ticket type definition based on the data model
export interface Ticket {
  id: string;
  userId: string;
  date: Date;
  truckNumber: string;
  truckNickname: string;
  jobsite: string;
  jobsiteName?: string; // For display purposes
  total: number;
  imageCount: number;
  submissionDate: Date;
  archiveStatus: 'active' | 'images_archived' | 'fully_archived';
  categories?: {
    [key: string]: number;
  };
}

// Column definitions for the ticket data grid
export const ticketColumns: DataGridColumn<Ticket>[] = [
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    renderCell: (item) => format(new Date(item.date), 'MMM d, yyyy')
  },
  {
    key: 'userId',
    header: 'Employee',
    sortable: true
  },
  {
    key: 'truck',
    header: 'Truck',
    sortable: true,
    renderCell: (item) => `${item.truckNumber} (${item.truckNickname})`
  },
  {
    key: 'jobsite',
    header: 'Jobsite',
    sortable: true,
    renderCell: (item) => item.jobsiteName || item.jobsite
  },
  {
    key: 'total',
    header: 'Total Tickets',
    sortable: true
  },
  {
    key: 'imageCount',
    header: 'Images',
    sortable: true
  },
  {
    key: 'archiveStatus',
    header: 'Status',
    sortable: true,
    renderCell: (item) => {
      const status = item.archiveStatus;
      const statusMap = {
        active: { label: 'Active', className: 'bg-green-100 text-green-800' },
        images_archived: { label: 'Images Archived', className: 'bg-amber-100 text-amber-800' },
        fully_archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800' }
      };
      
      const { label, className } = statusMap[status];
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
          {label}
        </span>
      );
    }
  }
];

// Filter options for the ticket filter bar
export const ticketFilters: FilterOption[] = [
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'dateRange',
    defaultValue: {
      startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    }
  },
  {
    id: 'truckNumber',
    label: 'Truck',
    type: 'select',
    options: [] // To be populated at runtime from API
  },
  {
    id: 'jobsite',
    label: 'Jobsite',
    type: 'select',
    options: [] // To be populated at runtime from API
  },
  {
    id: 'includeArchived',
    label: 'Include Archived',
    type: 'boolean',
    defaultValue: false
  }
];

// Action definitions for the ticket action bar
export const ticketActions: Action[] = [
  {
    id: 'view',
    label: 'View Details',
    icon: 'eye',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true
  },
  {
    id: 'export',
    label: 'Export',
    icon: 'download',
    onClick: () => {}, // To be implemented at runtime
    variant: 'primary'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: 'archive',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to archive the selected tickets?',
    variant: 'warning'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to delete the selected tickets? This action cannot be undone.',
    variant: 'danger'
  }
];

// Detail field definitions for the ticket detail panel
export const ticketDetailFields = [
  { key: 'id', label: 'Ticket ID' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'userId', label: 'Employee' },
  { key: 'truckNumber', label: 'Truck Number' },
  { key: 'truckNickname', label: 'Truck Nickname' },
  { key: 'jobsite', label: 'Jobsite ID' },
  { key: 'jobsiteName', label: 'Jobsite Name' },
  { key: 'total', label: 'Total Tickets' },
  { key: 'imageCount', label: 'Image Count' },
  { key: 'submissionDate', label: 'Submission Date', type: 'date' },
  { key: 'archiveStatus', label: 'Archive Status' }
];

// Default query parameters for the ticket API
export const defaultTicketQueryParams = {
  startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  includeArchived: false
};