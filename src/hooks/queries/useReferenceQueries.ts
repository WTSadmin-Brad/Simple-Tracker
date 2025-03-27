'use client';

/**
 * Reference data query hooks using TanStack Query v5
 * Includes jobsites, trucks, and other reference data
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import jobsiteService from '@/lib/services/jobsiteService';
import truckService from '@/lib/services/truckService';
import { useToast } from '@/components/ui/use-toast';
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
    queryFn: () => jobsiteService.getJobsites(includeInactive),
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
    queryFn: () => jobsiteService.getJobsiteById(id || ''),
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
      onSuccessCallback: (updatedJobsite) => {
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
    queryFn: () => truckService.getTrucks(includeInactive),
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
    queryFn: () => truckService.getTruckById(id || ''),
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
      onSuccessCallback: (updatedTruck) => {
        // Invalidate specific truck detail
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.trucks.detail(updatedTruck.id) 
        });
      },
      invalidateQueries: [queryKeys.trucks.lists()],
    }),
  });
}
