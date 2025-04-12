/**
 * userGridConfig.ts
 * Configuration for the user data grid in the admin interface
 * 
 * @source Admin_Flows.md - "User Management" section
 */

import { DataGridColumn } from '../data-grid/data-grid.client';
import { FilterOption } from '../data-grid/filter-bar.client';
import { Action } from '../data-grid/action-bar.client';
import { User } from './types';
import { format } from 'date-fns';

// Column definitions for the user data grid
export const userColumns: DataGridColumn<User>[] = [
  {
    key: 'displayName',
    header: 'Name',
    sortable: true,
    renderCell: (item) => item.displayName
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true
  },
  {
    key: 'username',
    header: 'Username',
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
        employee: { label: 'Employee', className: 'bg-green-100 text-green-800' }
      };
      
      const { label, className } = roleMap[role] || { label: role, className: 'bg-gray-100 text-gray-800' };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
          {label}
        </span>
      );
    }
  },
  {
    key: 'isActive',
    header: 'Status',
    sortable: true,
    renderCell: (item) => {
      const isActive = !!item.isActive;
      const statusMap = {
        true: { label: 'Active', className: 'bg-green-100 text-green-800' },
        false: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' }
      };
      
      const { label, className } = statusMap[String(isActive)];
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
      { value: 'employee', label: 'Employee' }
    ],
    defaultValue: 'all'
  },
  {
    id: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'all', label: 'All Statuses' },
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ],
    defaultValue: 'true'
  }
];

// Action definitions for the user action bar
export const userActions: Action[] = [
  {
    id: 'add',
    label: 'Add User',
    icon: 'plus-circle',
    requiresSelection: false,
    variant: 'primary'
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: 'pencil',
    requiresSelection: true,
    maxSelection: 1,
    variant: 'secondary'
  },
  {
    id: 'resetPassword',
    label: 'Reset Password',
    icon: 'key',
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to send a password reset email to the selected user(s)?',
    variant: 'warning'
  },
  {
    id: 'deactivate',
    label: 'Deactivate',
    icon: 'ban',
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to deactivate the selected user(s)?',
    variant: 'warning',
    showWhen: (selectedItems) => selectedItems.some(item => item.isActive)
  },
  {
    id: 'activate',
    label: 'Activate',
    icon: 'check-circle',
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to activate the selected user(s)?',
    variant: 'success',
    showWhen: (selectedItems) => selectedItems.some(item => !item.isActive)
  },
  {
    id: 'refresh',
    label: 'Refresh',
    icon: 'refresh-cw',
    requiresSelection: false,
    variant: 'ghost'
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
  { key: 'isActive', label: 'Status' },
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
  isActive: 'true',
  searchTerm: ''
};