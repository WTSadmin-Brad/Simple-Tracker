'use client';

/**
 * Standalone ticket query hooks using TanStack Query v5
 * Designed for direct use in components without additional abstraction layers
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ticketService from '@/lib/services/ticketService';
import { useToast } from '@/components/ui/use-toast';
import { errorHandler } from '@/lib/errors';
import { queryKeys } from '@/lib/query/queryKeys';
import { Ticket, TicketFilterParams, WizardData } from '@/types/tickets';

/**
 * Get tickets with filtering, sorting, and pagination
 */
export function useGetTickets(filters: TicketFilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: () => ticketService.getTickets(filters),
  });
}

/**
 * Get a single ticket by ID
 */
export function useGetTicketById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id || ''),
    queryFn: () => ticketService.getTicketById(id || ''),
    enabled: !!id, // Only run the query if an ID is provided
  });
}

/**
 * Fetch tickets for a specific user within a date range
 */
export function useGetUserTickets(userId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...queryKeys.tickets.lists(), userId, startDate, endDate],
    queryFn: () => ticketService.fetchUserTickets(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
  });
}

/**
 * Create a new ticket
 */
export function useCreateTicket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { userId: string, ticketData: WizardData }) => 
      ticketService.createTicket(data.userId, data.ticketData),
    onSuccess: () => {
      toast({ title: "Ticket created successfully" });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
    onError: (error) => {
      const userMessage = errorHandler.getUserFriendlyMessage(error);
      toast({
        title: "Failed to create ticket",
        description: userMessage,
        variant: "destructive",
      });
      errorHandler.logError(error, { operation: 'createTicket' });
    },
  });
}

/**
 * Update an existing ticket
 */
export function useUpdateTicket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { ticketId: string, userId: string, ticketData: any }) => 
      ticketService.updateTicket(data.ticketId, data.userId, data.ticketData),
    onSuccess: (updatedTicket) => {
      toast({ title: "Ticket updated successfully" });
      
      // Update specific ticket in cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.detail(updatedTicket.id)
      });
      
      // Invalidate lists that might include this ticket
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.lists()
      });
    },
    onError: (error) => {
      const userMessage = errorHandler.getUserFriendlyMessage(error);
      toast({
        title: "Failed to update ticket",
        description: userMessage,
        variant: "destructive",
      });
      errorHandler.logError(error, { operation: 'updateTicket' });
    },
  });
}

/**
 * Update ticket status
 */
export function useUpdateTicketStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      id: string, 
      status: 'active' | 'images_archived' | 'fully_archived' 
    }) => ticketService.updateTicketStatus(data.id, data.status),
    onSuccess: (updatedTicket) => {
      if (!updatedTicket) return;
      
      toast({ title: "Ticket status updated successfully" });
      
      // Update specific ticket in cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.detail(updatedTicket.id)
      });
      
      // Invalidate lists that might include this ticket
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.lists()
      });
    },
    onError: (error) => {
      const userMessage = errorHandler.getUserFriendlyMessage(error);
      toast({
        title: "Failed to update ticket status",
        description: userMessage,
        variant: "destructive",
      });
      errorHandler.logError(error, { operation: 'updateTicketStatus' });
    },
  });
}

/**
 * Archive ticket images
 */
export function useArchiveTicketImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId: string) => ticketService.archiveTicketImages(ticketId),
    onSuccess: (updatedTicket) => {
      if (!updatedTicket) return;
      
      toast({ title: "Ticket images archived successfully" });
      
      // Update specific ticket in cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.detail(updatedTicket.id)
      });
      
      // Invalidate lists that might include this ticket
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.lists()
      });
    },
    onError: (error) => {
      const userMessage = errorHandler.getUserFriendlyMessage(error);
      toast({
        title: "Failed to archive ticket images",
        description: userMessage,
        variant: "destructive",
      });
      errorHandler.logError(error, { operation: 'archiveTicketImages' });
    },
  });
}

/**
 * Fully archive ticket
 */
export function useFullyArchiveTicket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId: string) => ticketService.fullyArchiveTicket(ticketId),
    onSuccess: (updatedTicket) => {
      if (!updatedTicket) return;
      
      toast({ title: "Ticket fully archived successfully" });
      
      // Update specific ticket in cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.detail(updatedTicket.id)
      });
      
      // Invalidate lists that might include this ticket
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.lists()
      });
    },
    onError: (error) => {
      const userMessage = errorHandler.getUserFriendlyMessage(error);
      toast({
        title: "Failed to fully archive ticket",
        description: userMessage,
        variant: "destructive",
      });
      errorHandler.logError(error, { operation: 'fullyArchiveTicket' });
    },
  });
}

/**
 * Restore ticket from archive
 */
export function useRestoreTicket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId: string) => ticketService.restoreTicket(ticketId),
    onSuccess: (updatedTicket) => {
      if (!updatedTicket) return;
      
      toast({ title: "Ticket restored successfully" });
      
      // Update specific ticket in cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.detail(updatedTicket.id)
      });
      
      // Invalidate lists that might include this ticket
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tickets.lists()
      });
    },
    onError: (error) => {
      const userMessage = errorHandler.getUserFriendlyMessage(error);
      toast({
        title: "Failed to restore ticket",
        description: userMessage,
        variant: "destructive",
      });
      errorHandler.logError(error, { operation: 'restoreTicket' });
    },
  });
}
