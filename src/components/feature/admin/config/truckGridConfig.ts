/**
 * truckGridConfig.ts
 * Configuration for the truck data grid in the admin interface
 * 
 * @source Admin_Flows.md - "Manage Reference Data" section
 */

import { DataGridColumn } from '../data-grid/DataGrid.client';
import { FilterOption } from '../data-grid/FilterBar.client';
import { Action } from '../data-grid/ActionBar.client';

// Truck type definition based on the data model
export interface Truck {
  id: string;
  truckNumber: string;
  nickname: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUsed?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Column definitions for the truck data grid
export const truckColumns: DataGridColumn<Truck>[] = [
  {
    key: 'truckNumber',
    header: 'Truck #',
    sortable: true
  },
  {
    key: 'nickname',
    header: 'Nickname',
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
        maintenance: { label: 'Maintenance', className: 'bg-amber-100 text-amber-800' }
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
    key: 'updatedAt',
    header: 'Last Updated',
    sortable: true,
    renderCell: (item) => new Date(item.updatedAt).toLocaleDateString()
  }
];

// Filter options for the truck filter bar
export const truckFilters: FilterOption[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'maintenance', label: 'Maintenance' }
    ],
    defaultValue: 'all'
  },
  {
    id: 'searchTerm',
    label: 'Search',
    type: 'text',
    defaultValue: ''
  }
];

// Action definitions for the truck action bar
export const truckActions: Action[] = [
  {
    id: 'add',
    label: 'Add Truck',
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
    confirmationMessage: 'Are you sure you want to delete the selected truck(s)? This action cannot be undone.',
    variant: 'danger'
  }
];

// Detail field definitions for the truck detail panel
export const truckDetailFields = [
  { key: 'id', label: 'Truck ID' },
  { key: 'truckNumber', label: 'Truck Number' },
  { key: 'nickname', label: 'Nickname' },
  { key: 'status', label: 'Status' },
  { key: 'lastUsed', label: 'Last Used', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
  { key: 'updatedAt', label: 'Updated At', type: 'date' }
];

// Form field definitions for the truck form
export const truckFormFields = [
  { 
    key: 'truckNumber', 
    label: 'Truck Number', 
    type: 'text',
    required: true,
    validation: {
      required: 'Truck number is required',
      pattern: {
        value: /^[A-Z0-9]{1,10}$/,
        message: 'Truck number must be 1-10 uppercase letters or numbers'
      }
    }
  },
  { 
    key: 'nickname', 
    label: 'Nickname', 
    type: 'text',
    required: true,
    validation: {
      required: 'Nickname is required',
      maxLength: {
        value: 30,
        message: 'Nickname must be 30 characters or less'
      }
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
      { value: 'maintenance', label: 'Maintenance' }
    ],
    defaultValue: 'active'
  },
  { 
    key: 'notes', 
    label: 'Notes', 
    type: 'textarea'
  }
];

// Default query parameters for the truck API
export const defaultTruckQueryParams = {
  status: 'all',
  searchTerm: ''
};