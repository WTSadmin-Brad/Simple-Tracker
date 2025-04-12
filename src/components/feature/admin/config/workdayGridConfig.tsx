/**
 * workdayGridConfig.ts
 * Configuration for the workday data grid in the admin interface
 * 
 * @source Admin_Flows.md - "Filter & View Workdays" section
 */

import { DataGridColumn } from '../data-grid/data-grid.client';
import { FilterOption } from '../data-grid/filter-bar.client';
import { Action } from '../data-grid/action-bar.client';
import { Workday } from './types';
import { format } from 'date-fns';

// Column definitions for the workday data grid
export const workdayColumns: DataGridColumn<Workday>[] = [
  {
    key: 'date',
    header: 'Date',
    sortable: true,
    renderCell: (item) => format(new Date(item.date), 'MMM d, yyyy')
  },
  {
    key: 'employeeName',
    header: 'Employee',
    sortable: true,
    renderCell: (item) => item.employeeName || item.userId
  },
  {
    key: 'jobsite',
    header: 'Jobsite',
    sortable: true,
    renderCell: (item) => item.jobsiteName || item.jobsite
  },
  {
    key: 'workType',
    header: 'Work Type',
    sortable: true,
    renderCell: (item) => {
      const workType = item.workType;
      const typeMap = {
        regular: { label: 'Regular', className: 'bg-blue-100 text-blue-800' },
        overtime: { label: 'Overtime', className: 'bg-purple-100 text-purple-800' },
        holiday: { label: 'Holiday', className: 'bg-green-100 text-green-800' },
        sick: { label: 'Sick', className: 'bg-red-100 text-red-800' },
        vacation: { label: 'Vacation', className: 'bg-amber-100 text-amber-800' }
      };
      
      const { label, className } = typeMap[workType];
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
          {label}
        </span>
      );
    }
  },
  {
    key: 'hours',
    header: 'Hours',
    sortable: true
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    renderCell: (item) => {
      const isPrediction = item.isPrediction;
      const status = item.status;
      
      if (isPrediction) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Predicted
          </span>
        );
      }
      
      const statusMap = {
        active: { label: 'Active', className: 'bg-green-100 text-green-800' },
        archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800' }
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

// Filter options for the workday filter bar
export const workdayFilters: FilterOption[] = [
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
    id: 'jobsite',
    label: 'Jobsite',
    type: 'select',
    options: [] // To be populated at runtime from API
  },
  {
    id: 'userId',
    label: 'Employee',
    type: 'select',
    options: [] // To be populated at runtime from API
  },
  {
    id: 'workType',
    label: 'Work Type',
    type: 'select',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'overtime', label: 'Overtime' },
      { value: 'holiday', label: 'Holiday' },
      { value: 'sick', label: 'Sick' },
      { value: 'vacation', label: 'Vacation' }
    ]
  },
  {
    id: 'includeFuturePredictions',
    label: 'Include Predictions',
    type: 'boolean',
    defaultValue: true
  },
  {
    id: 'includeArchived',
    label: 'Include Archived',
    type: 'boolean',
    defaultValue: false
  }
];

// Action definitions for the workday action bar
export const workdayActions: Action[] = [
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
    id: 'edit',
    label: 'Edit',
    icon: 'edit',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    variant: 'secondary'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: 'archive',
    onClick: () => {}, // To be implemented at runtime
    requiresSelection: true,
    confirmationRequired: true,
    confirmationMessage: 'Are you sure you want to archive the selected workdays?',
    variant: 'warning'
  }
];

// Detail field definitions for the workday detail panel
export const workdayDetailFields = [
  { key: 'id', label: 'Workday ID' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'userId', label: 'Employee ID' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'jobsite', label: 'Jobsite ID' },
  { key: 'jobsiteName', label: 'Jobsite Name' },
  { key: 'workType', label: 'Work Type' },
  { key: 'hours', label: 'Hours' },
  { key: 'notes', label: 'Notes' },
  { key: 'status', label: 'Status' },
  { key: 'isPrediction', label: 'Is Prediction' }
];

// Default query parameters for the workday API
export const defaultWorkdayQueryParams = {
  startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
  endDate: format(new Date(), 'yyyy-MM-dd'),
  includeFuturePredictions: true,
  includeArchived: false
};