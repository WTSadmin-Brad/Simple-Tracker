/**
 * TicketList.tsx
 * Server Component for displaying a list of tickets
 */

import { Ticket } from '@/types/tickets';
import TicketItem from './ticket-item';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketListProps } from './ticket-types';

const TicketList = ({
  tickets = [],
  isLoading = false,
  emptyMessage = "No tickets found",
  onTicketClick,
  className
}: TicketListProps) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-${index}`} className="p-4">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-1/4" />
          </Card>
        ))}
      </div>
    );
  }

  // Handle empty state
  if (tickets.length === 0) {
    return (
      <Card className={`p-6 text-center text-muted-foreground ${className || ''}`}>
        {emptyMessage}
      </Card>
    );
  }

  // Render ticket list
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {tickets.map((ticket) => (
        <TicketItem 
          key={ticket.id} 
          ticket={ticket} 
          onClick={() => onTicketClick?.(ticket)}
        />
      ))}
    </div>
  );
};

export default TicketList;
