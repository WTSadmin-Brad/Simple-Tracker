/**
 * userGridConfig.ts
 * Configuration for the user data grid in the admin interface
 * 
 * @source Admin_Flows.md - "User Management" section
 */

import { DataGridColumn } from '../data-grid/DataGrid.client';
import { FilterOption } from '../data-grid/FilterBar.client';
import { Action } from '../data-grid/ActionBar.client';
import { format } from 'date-fns';

// User type definition based on the data model
export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive' | 'pending';
  phoneNumber?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Column definitions for the user data grid
export const userColumns: DataGridColumn<User>[] = [
  {
    key: 'displayName',
    header: 'Name',
    sortable: true,
    renderCell: (item) => item.displayName || `${item.firstName} ${item.lastName}`
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    renderCell: (item) => {
      const role = item.role;
      const roleMap = {
        admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800' },
        manager: { label: 'Manager', className: 'bg-blue-100 text-blue-800' },
        employee: { label: 'Employee', className: 'bg-green-100 text-green-800' }
      };
      
      const { label, className } = roleMap[role];
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
          {label}
        </span>
      );
    }
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
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' }
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
    key: 'lastLogin',
    header: 'Last Login',
    sortable: true,
    renderCell: (item) => item.lastLogin ? format(new Date(item.lastLogin), 'MMM d, yyyy h:mm a') : 'Never'
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    renderCell: (item) => format(new Date(item.createdAt), 'MMM d, yyyy')
  }
];

// Filter options for the user filter bar
export const userFilters: FilterOption[] = [
  {
    id: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'all', label: 'All Roles' },
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'employee', label: 'Employee' }
    ],
    defaultValue: 'all'
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' }
    ],
    defaultValue: 'active'
  },
  {
    id: 'searchTerm',
    label: 'Search',
    type: 'text',
    defaultValue: ''
  }
];

// Action definitions for the user action bar
export const userActions: Action[] = [
  {
    id: 'invite',
    label: 'Invite User',
    icon: 'mail',
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
    id: 'resetPassword',
    label: 'Reset Password',
    icon: 'key',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to send a password reset email to the selected user(s)?',
    variant: 'warning'
  },
  {
    id: 'changeRole',
    label: 'Change Role',
    icon: 'users',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    variant: 'secondary'
  },
  {
    id: 'deactivate',
    label: 'Deactivate',
    icon: 'slash',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to deactivate the selected user(s)?',
    variant: 'warning'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: 'trash',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to delete the selected user(s)? This action cannot be undone.',
    variant: 'danger'
  }
];

// Detail field definitions for the user detail panel
export const userDetailFields = [
  { key: 'id', label: 'User ID' },
  { key: 'email', label: 'Email' },
  { key: 'displayName', label: 'Display Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'lastLogin', label: 'Last Login', type: 'date' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
  { key: 'updatedAt', label: 'Updated At', type: 'date' }
];

// Form field definitions for the user form
export const userFormFields = [
  { 
    key: 'email', 
    label: 'Email', 
    type: 'email',
    required: true,
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address'
      }
    }
  },
  { 
    key: 'firstName', 
    label: 'First Name', 
    type: 'text',
    required: true,
    validation: {
      required: 'First name is required'
    }
  },
  { 
    key: 'lastName', 
    label: 'Last Name', 
    type: 'text',
    required: true,
    validation: {
      required: 'Last name is required'
    }
  },
  { 
    key: 'displayName', 
    label: 'Display Name', 
    type: 'text',
    required: false
  },
  { 
    key: 'role', 
    label: 'Role', 
    type: 'select',
    required: true,
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'employee', label: 'Employee' }
    ],
    defaultValue: 'employee'
  },
  { 
    key: 'phoneNumber', 
    label: 'Phone Number', 
    type: 'text',
    validation: {
      pattern: {
        value: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        message: 'Please enter a valid phone number'
      }
    }
  }
];

// Default query parameters for the user API
export const defaultUserQueryParams = {
  role: 'all',
  status: 'active',
  searchTerm: ''
};