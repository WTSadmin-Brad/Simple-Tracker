'use client';

/**
 * Reference data query hooks using TanStack Query v5
 * Includes jobsites, trucks, and other reference data
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import jobsiteService from '@/lib/services/jobsiteService';
import truckService from '@/lib/services/truckService';
import { useToast } from '@/components/ui/sonner';
import { errorHandler } from '@/lib/errors';
import { queryKeys } from '@/lib/query/queryKeys';
import { createMutationOptionsWithInvalidation, createRetryConfig } from '@/lib/query/mutationUtils';
import { Jobsite, JobsiteFormData, Truck, TruckFormData } from '@/types/reference';

// Standard stale time for reference data
const REFERENCE_DATA_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// =================== JOBSITE QUERIES ===================

/**
 * Get all active jobsites
 */
export function useGetJobsites(includeInactive = false) {
  return useQuery({
    queryKey: queryKeys.jobsites.lists(includeInactive),
    queryFn: async () => {
      const response = await jobsiteService.getJobsites(includeInactive);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.jobsites; // Use specific 'jobsites' property instead of generic 'data'
    },
    staleTime: REFERENCE_DATA_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Get jobsite by ID
 */
export function useGetJobsiteById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.jobsites.detail(id || ''),
    queryFn: async () => {
      const response = await jobsiteService.getJobsiteById(id || '');
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.jobsite; // Use specific 'jobsite' property instead of generic 'data'
    },
    enabled: !!id, // Only run the query if an ID is provided
    staleTime: REFERENCE_DATA_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Create a new jobsite
 */
export function useCreateJobsite() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JobsiteFormData) => jobsiteService.createJobsite(data),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Jobsite created successfully",
      error: "Failed to create jobsite",
      operationName: 'createJobsite',
      invalidateQueries: [queryKeys.jobsites.lists()],
    }),
  });
}

/**
 * Update an existing jobsite
 */
export function useUpdateJobsite() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string, jobsite: Partial<JobsiteFormData> }) => 
      jobsiteService.updateJobsite(data.id, data.jobsite),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Jobsite updated successfully",
      error: "Failed to update jobsite",
      operationName: 'updateJobsite',
      onSuccessCallback: (response) => {
        if (!response.success) return;
        
        const updatedJobsite = response.jobsite; // Use specific 'jobsite' property
        
        // Invalidate specific jobsite detail
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.jobsites.detail(updatedJobsite.id) 
        });
      },
      invalidateQueries: [queryKeys.jobsites.lists()],
    }),
  });
}

// =================== TRUCK QUERIES ===================

/**
 * Get all active trucks
 */
export function useGetTrucks(includeInactive = false) {
  return useQuery({
    queryKey: queryKeys.trucks.lists(includeInactive),
    queryFn: async () => {
      const response = await truckService.getTrucks(includeInactive);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.trucks; // Use specific 'trucks' property instead of generic 'data'
    },
    staleTime: REFERENCE_DATA_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Get truck by ID
 */
export function useGetTruckById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.trucks.detail(id || ''),
    queryFn: async () => {
      const response = await truckService.getTruckById(id || '');
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.truck; // Use specific 'truck' property instead of generic 'data'
    },
    enabled: !!id, // Only run the query if an ID is provided
    staleTime: REFERENCE_DATA_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Create a new truck
 */
export function useCreateTruck() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TruckFormData) => truckService.createTruck(data),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Truck created successfully",
      error: "Failed to create truck",
      operationName: 'createTruck',
      invalidateQueries: [queryKeys.trucks.lists()],
    }),
  });
}

/**
 * Update an existing truck
 */
export function useUpdateTruck() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string, truck: Partial<TruckFormData> }) => 
      truckService.updateTruck(data.id, data.truck),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Truck updated successfully",
      error: "Failed to update truck",
      operationName: 'updateTruck',
      onSuccessCallback: (response) => {
        if (!response.success) return;
        
        const updatedTruck = response.truck; // Use specific 'truck' property
        
        // Invalidate specific truck detail
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.trucks.detail(updatedTruck.id) 
        });
      },
      invalidateQueries: [queryKeys.trucks.lists()],
    }),
  });
}
