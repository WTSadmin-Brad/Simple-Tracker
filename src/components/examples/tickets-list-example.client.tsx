'use client';

/**
 * Example component that demonstrates the use of the new query hooks
 * Shows tickets with loading, error, and empty states
 */

import { useState } from 'react';
import { useGetTickets } from '@/hooks/queries/useTickets';
import { Ticket } from '@/types/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TicketsListExample() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Using the new query hook
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetTickets({ 
    page, 
    limit 
  });
  
  const tickets = data?.tickets || [];
  const totalPages = data?.totalPages || 1;

  // Handle pagination
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <p className="text-red-500">Error loading tickets: {error?.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>No tickets found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Data state
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket: Ticket) => (
            <div 
              key={ticket.id} 
              className="p-4 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold">{ticket.jobsiteName}</h3>
              <p className="text-sm text-gray-500">
                {new Date(ticket.date).toLocaleDateString()} - {ticket.truckNickname}
              </p>
              <p className="mt-2">Total: {ticket.total}</p>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={prevPage} 
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={nextPage} 
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
