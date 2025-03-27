/**
 * ArchiveManagerClient Component
 * 
 * Client component that integrates all archive management functionality:
 * - Search and filtering
 * - Results display
 * - Item restoration
 * - Item details viewing
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ArchiveSearchBar } from './archive-search-bar';
import { ArchiveFilterControls, ArchiveFilters } from './archive-filter-controls';
import { ArchiveResultsTable } from './archive-results-table';
import { ArchiveRestoreControls } from './archive-restore-controls';
import { ArchiveItemDetail } from './archive-item-detail';
import { ArchiveItem } from '@/lib/schemas/archiveSchemas';

// Default search parameters
const DEFAULT_FILTERS: ArchiveFilters = {
  type: 'all',
  dateFrom: undefined,
  dateTo: undefined,
};

// Default pagination state
const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

export function ArchiveManagerClient() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ArchiveFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  
  // Results state
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('search');
  
  // Calculate total active filters for badge display
  const calculateTotalFilters = useCallback(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);
  
  // Load search parameters from URL on initial load
  useEffect(() => {
    if (searchParams) {
      const query = searchParams.get('query') || '';
      const type = searchParams.get('type') || 'all';
      const page = parseInt(searchParams.get('page') || '1', 10);
      
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      
      setSearchQuery(query);
      setFilters({
        type: type as ArchiveFilters['type'],
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });
      
      setPagination(prev => ({
        ...prev,
        page,
      }));
      
      // Perform initial search if we have query parameters
      if (query || type !== 'all' || dateFrom || dateTo) {
        performSearch(query, {
          type: type as ArchiveFilters['type'],
          dateFrom: dateFrom ? new Date(dateFrom) : undefined,
          dateTo: dateTo ? new Date(dateTo) : undefined,
        }, page);
      }
    }
  }, []);
  
  // Update URL with current search parameters
  const updateSearchParams = useCallback((
    query: string, 
    currentFilters: ArchiveFilters, 
    page: number
  ) => {
    const params = new URLSearchParams();
    
    if (query) params.set('query', query);
    if (currentFilters.type !== 'all') params.set('type', currentFilters.type);
    if (currentFilters.dateFrom) params.set('dateFrom', currentFilters.dateFrom.toISOString().split('T')[0]);
    if (currentFilters.dateTo) params.set('dateTo', currentFilters.dateTo.toISOString().split('T')[0]);
    if (page > 1) params.set('page', page.toString());
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl);
  }, [router]);
  
  // Perform search with current parameters
  const performSearch = async (
    query: string, 
    searchFilters: ArchiveFilters, 
    page: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build API request URL
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('type', searchFilters.type);
      params.append('page', page.toString());
      params.append('pageSize', pagination.pageSize.toString());
      
      if (searchFilters.dateFrom) {
        params.append('dateFrom', searchFilters.dateFrom.toISOString().split('T')[0]);
      }
      
      if (searchFilters.dateTo) {
        params.append('dateTo', searchFilters.dateTo.toISOString().split('T')[0]);
      }
      
      // Call the archive search API
      const response = await fetch(`/api/admin/archive/search?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search archives');
      }
      
      // Update state with search results
      setItems(data.items || []);
      setPagination({
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });
      
      // Update URL
      updateSearchParams(query, searchFilters, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setItems([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0,
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    performSearch(query, filters, 1);
  };
  
  // Handler for filter changes
  const handleFilterChange = (newFilters: ArchiveFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    performSearch(searchQuery, newFilters, 1);
  };
  
  // Handler for resetting filters
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    performSearch(searchQuery, DEFAULT_FILTERS, 1);
  };
  
  // Handler for pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    performSearch(searchQuery, filters, newPage);
  };
  
  // Handler for viewing item details
  const handleViewDetails = (item: ArchiveItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };
  
  // Handler for opening restore dialog
  const handleRestoreItem = (item: ArchiveItem) => {
    setSelectedItem(item);
    setIsRestoreOpen(true);
  };
  
  // Handler for confirming restoration
  const handleConfirmRestore = async (item: ArchiveItem) => {
    try {
      const response = await fetch('/api/admin/archive/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          type: item.type,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to restore item');
      }
      
      // Refresh the search results
      performSearch(searchQuery, filters, pagination.page);
      
      return {
        success: true,
        message: data.message || `${item.type} has been successfully restored.`,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'An unknown error occurred',
      };
    }
  };
  
  // Handler for viewing all images for a ticket
  const handleViewImages = (ticketId: string) => {
    // Implementation for viewing all images for a ticket
    toast({
      title: 'View Images',
      description: `Viewing images for ticket ${ticketId}`,
      variant: 'default',
    });
    
    // Close the detail dialog
    setIsDetailOpen(false);
    
    // Here you would typically navigate to a view with all images
    // or open another modal with the images
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="search">Search Archives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <ArchiveSearchBar
                  onSearch={handleSearch}
                  initialQuery={searchQuery}
                  isLoading={isLoading}
                />
              </div>
              
              <ArchiveFilterControls
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalFilters={calculateTotalFilters()}
              />
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <ArchiveResultsTable
                items={items}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onViewDetails={handleViewDetails}
                onRestoreItem={handleRestoreItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Item detail dialog */}
      <ArchiveItemDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedItem}
        onRestoreItem={handleRestoreItem}
        onViewImages={handleViewImages}
      />
      
      {/* Restore confirmation dialog */}
      <ArchiveRestoreControls
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        item={selectedItem}
        onConfirmRestore={handleConfirmRestore}
      />
    </div>
  );
}
