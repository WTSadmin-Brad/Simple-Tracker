/**
 * useAdminDataGrid.ts
 * Custom hook for managing admin data grid state and operations
 * 
 * This hook centralizes common data grid functionality used across admin pages
 * including filtering, pagination, selection, and API interactions.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QueryParams } from '@/components/feature/admin/config/types';

interface DataGridState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  selectedItems: T[];
  currentPage: number;
  totalItems: number;
  filters: Record<string, any>;
  searchTerm: string;
}

interface UseAdminDataGridProps<T> {
  initialData: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  apiEndpoint: string;
  keyField: keyof T;
  defaultQueryParams?: QueryParams;
}

interface UseAdminDataGridReturn<T> {
  // State
  data: T[];
  isLoading: boolean;
  error: string | null;
  selectedItems: T[];
  currentPage: number;
  totalItems: number;
  filters: Record<string, any>;
  searchTerm: string;
  
  // Actions
  handleFilterChange: (newFilters: Record<string, any>) => void;
  handleSearch: (term: string) => void;
  handlePageChange: (page: number) => void;
  handleSelectionChange: (items: T[]) => void;
  handleRowClick: (item: T) => void;
  handleRefresh: () => void;
  
  // Utilities
  getInitialFilters: () => Record<string, any>;
  updateUrl: () => void;
  fetchData: () => Promise<void>;
}

/**
 * Custom hook for managing admin data grid state and operations
 */
export function useAdminDataGrid<T>({
  initialData,
  apiEndpoint,
  keyField,
  defaultQueryParams = {}
}: UseAdminDataGridProps<T>): UseAdminDataGridReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filter values from URL search params
  const getInitialFilters = useCallback(() => {
    const filters: Record<string, any> = {};
    
    // Add filters from search params
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'search' && key !== 'page') {
        filters[key] = value;
      }
    }
    
    return filters;
  }, [searchParams]);
  
  // State for data grid
  const [state, setState] = useState<DataGridState<T>>({
    data: initialData.items,
    isLoading: false,
    error: null,
    selectedItems: [],
    currentPage: initialData.page,
    totalItems: initialData.total,
    filters: getInitialFilters(),
    searchTerm: searchParams.get('search') || ''
  });
  
  // Update URL with current filters and search term
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, String(value));
      }
    });
    
    // Add search term
    if (state.searchTerm) {
      params.set('search', state.searchTerm);
    }
    
    // Add page number
    if (state.currentPage > 1) {
      params.set('page', state.currentPage.toString());
    }
    
    // Update URL without full navigation
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }, [state.filters, state.searchTerm, state.currentPage]);
  
  // Get authorization token for API requests
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken') || '';
  }, []);
  
  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== 'all') {
          params.set(key, String(value));
        }
      });
      
      // Add search term
      if (state.searchTerm) {
        params.set('search', state.searchTerm);
      }
      
      // Add page number
      params.set('page', state.currentPage.toString());
      
      // Add default query params
      Object.entries(defaultQueryParams).forEach(([key, value]) => {
        if (value !== undefined && !params.has(key)) {
          params.set(key, String(value));
        }
      });
      
      // Fetch data from API with authorization
      const response = await fetch(`${apiEndpoint}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Check for success status and handle Firebase Admin response format
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      // Update state based on Firebase Admin API response format
      setState(prev => ({
        ...prev,
        data: result.data?.users || [],
        totalItems: result.data?.pagination?.total || 0,
        isLoading: false
      }));
      
      // Update URL
      updateUrl();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred',
        isLoading: false
      }));
    }
  }, [
    state.filters, 
    state.searchTerm, 
    state.currentPage, 
    apiEndpoint, 
    defaultQueryParams, 
    updateUrl,
    getAuthToken
  ]);
  
  // Fetch data when filters or page changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle filter change
  const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
      selectedItems: [] // Clear selection when filters change
    }));
  }, []);
  
  // Handle search term change
  const handleSearch = useCallback((term: string) => {
    setState(prev => ({
      ...prev,
      searchTerm: term,
      currentPage: 1, // Reset to first page when search term changes
      selectedItems: [] // Clear selection when search term changes
    }));
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      currentPage: page,
      selectedItems: [] // Clear selection when page changes
    }));
  }, []);
  
  // Handle selection change
  const handleSelectionChange = useCallback((items: T[]) => {
    setState(prev => ({
      ...prev,
      selectedItems: items
    }));
  }, []);
  
  // Handle row click
  const handleRowClick = useCallback((item: T) => {
    // Navigate to detail page
    router.push(`${apiEndpoint}/${(item as any)[keyField]}`);
  }, [router, apiEndpoint, keyField]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    // State
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    selectedItems: state.selectedItems,
    currentPage: state.currentPage,
    totalItems: state.totalItems,
    filters: state.filters,
    searchTerm: state.searchTerm,
    
    // Actions
    handleFilterChange,
    handleSearch,
    handlePageChange,
    handleSelectionChange,
    handleRowClick,
    handleRefresh,
    
    // Utilities
    getInitialFilters,
    updateUrl,
    fetchData
  };
}
