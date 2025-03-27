/**
 * types.ts
 * Centralized type definitions for the admin data-grid components
 * 
 * This file contains shared types used across the data-grid components
 * to ensure consistency and maintainability.
 */

import { ReactNode } from 'react';

/**
 * Common field definition for data grid columns
 */
export interface DataGridField<T = any> {
  label: string;
  key: keyof T | string;
  render?: (item: T) => ReactNode;
  format?: (value: any, item: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Row selection configuration
 */
export interface RowSelectionConfig<T = any> {
  enabled: boolean;
  selectedKeys: Array<string | number>;
  onSelectionChange: (selectedKeys: Array<string | number>) => void;
  selectionKey: keyof T;
}

/**
 * Data grid props
 */
export interface DataGridProps<T = any> {
  columns: DataGridField<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  rowSelection?: RowSelectionConfig<T>;
  className?: string;
  stickyHeader?: boolean;
  zebra?: boolean;
  compact?: boolean;
  hideHeader?: boolean;
}

/**
 * Action type for action buttons
 */
export interface Action {
  type: 'create' | 'edit' | 'delete' | 'export' | 'refresh' | 'custom';
  id?: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  requiresSelection?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary' | 'danger' | 'success' | 'warning';
  className?: string;
  isLoading?: boolean;
  confirmationRequired?: boolean;
  confirmationMessage?: string;
  confirmationTitle?: string;
}

/**
 * Configuration for the action bar component
 */
export interface ActionBarProps {
  actions: Action[];
  selectedCount?: number;
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

/**
 * Filter option for select filters
 */
export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Filter configuration for the filter bar component
 */
export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'number';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

/**
 * Props for the filter bar component
 */
export interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  onSearch?: (term: string) => void;
  initialFilters?: Record<string, any>;
  initialSearchTerm?: string;
  className?: string;
}

/**
 * Form field definition
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  validation?: any;
  defaultValue?: any;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Section definition for detail view
 */
export interface DetailViewSection<T = any> {
  title: string;
  fields: Array<{
    label: string;
    key: keyof T | string;
    render?: (item: T) => ReactNode;
    format?: (value: any, item: T) => ReactNode;
    className?: string;
  }>;
  className?: string;
}

/**
 * Props for the entity detail view component
 */
export interface EntityDetailViewProps<T = any> {
  entityId: string;
  entityType: string;
  title: string;
  description?: string;
  backLink: string;
  sections: DetailViewSection<T>[];
  fetchEntity: (id: string) => Promise<T | null>;
  actions?: Action[];
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Props for the form panel component
 */
export interface FormPanelProps<T = any> {
  title: string;
  description?: string;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<T>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  children: ReactNode;
  isOpen?: boolean;
  fields?: FormField[];
  className?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * Props for the detail panel component
 */
export interface DetailPanelProps<T = any> {
  item: T | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  renderContent?: (item: T) => ReactNode;
  actions?: Action[];
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
