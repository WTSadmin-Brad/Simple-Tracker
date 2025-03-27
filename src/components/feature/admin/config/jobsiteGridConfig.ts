/**
 * jobsiteGridConfig.ts
 * Configuration for the jobsite data grid in the admin interface
 * 
 * @source Admin_Flows.md - "Manage Reference Data" section
 */

import { DataGridColumn } from '../data-grid/data-grid.client';
import { FilterOption } from '../data-grid/filter-bar.client';
import { Action } from '../data-grid/action-bar.client';
import { Jobsite } from './types';

// Column definitions for the jobsite data grid
export const jobsiteColumns: DataGridColumn<Jobsite>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true
  },
  {
    key: 'location',
    header: 'Location',
    sortable: true
  },
  {
    key: 'client',
    header: 'Client',
    sortable: true
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    renderCell: (item) => {
      const status = item.status;
      const statusMap = {
        active: { label: 'Active', className: 'bg-green-100 text-green-800' },
        inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
        completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800' }
      };
      
      const { label, className } = statusMap[status];
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
          {label}
        </span>
      );
    }
  },
  {
    key: 'lastUsed',
    header: 'Last Used',
    sortable: true,
    renderCell: (item) => item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never'
  },
  {
    key: 'contactName',
    header: 'Contact',
    sortable: true,
    renderCell: (item) => item.contactName || 'N/A'
  }
];

// Filter options for the jobsite filter bar
export const jobsiteFilters: FilterOption[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'completed', label: 'Completed' }
    ],
    defaultValue: 'all'
  },
  {
    id: 'client',
    label: 'Client',
    type: 'select',
    options: [] // To be populated at runtime from API
  },
  {
    id: 'searchTerm',
    label: 'Search',
    type: 'text',
    defaultValue: ''
  }
];

// Action definitions for the jobsite action bar
export const jobsiteActions: Action[] = [
  {
    id: 'add',
    label: 'Add Jobsite',
    icon: 'plus',
    onClick: () => {}, // To be implemented at runtime
    variant: 'primary'
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'edit',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    variant: 'secondary'
  },
  {
    id: 'setStatus',
    label: 'Change Status',
    icon: 'refresh',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    variant: 'secondary'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to delete the selected jobsite(s)? This action cannot be undone.',
    variant: 'danger'
  }
];

// Detail field definitions for the jobsite detail panel
export const jobsiteDetailFields = [
  { key: 'id', label: 'Jobsite ID' },
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
  { key: 'client', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'contactName', label: 'Contact Name' },
  { key: 'contactPhone', label: 'Contact Phone' },
  { key: 'contactEmail', label: 'Contact Email' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
  { key: 'lastUsed', label: 'Last Used', type: 'date' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
  { key: 'updatedAt', label: 'Updated At', type: 'date' }
];

// Form field definitions for the jobsite form
export const jobsiteFormFields = [
  { 
    key: 'name', 
    label: 'Name', 
    type: 'text',
    required: true,
    validation: {
      required: 'Jobsite name is required',
      maxLength: {
        value: 100,
        message: 'Name must be 100 characters or less'
      }
    }
  },
  { 
    key: 'location', 
    label: 'Location', 
    type: 'text',
    required: true,
    validation: {
      required: 'Location is required',
      maxLength: {
        value: 200,
        message: 'Location must be 200 characters or less'
      }
    }
  },
  { 
    key: 'client', 
    label: 'Client', 
    type: 'text',
    required: true,
    validation: {
      required: 'Client is required'
    }
  },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'completed', label: 'Completed' }
    ],
    defaultValue: 'active'
  },
  { 
    key: 'contactName', 
    label: 'Contact Name', 
    type: 'text'
  },
  { 
    key: 'contactPhone', 
    label: 'Contact Phone', 
    type: 'text',
    validation: {
      pattern: {
        value: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        message: 'Please enter a valid phone number'
      }
    }
  },
  { 
    key: 'contactEmail', 
    label: 'Contact Email', 
    type: 'email',
    validation: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address'
      }
    }
  },
  { 
    key: 'notes', 
    label: 'Notes', 
    type: 'textarea'
  }
];

// Default query parameters for the jobsite API
export const defaultJobsiteQueryParams = {
  status: 'all',
  client: '',
  searchTerm: ''
};