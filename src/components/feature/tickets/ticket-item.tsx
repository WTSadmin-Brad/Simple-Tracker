/**
 * TicketItem.tsx
 * Server Component for displaying an individual ticket
 */

import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Ticket } from '@/types/tickets';
import TicketBadge from './ticket-badge';
import { SingleTicketProps } from './ticket-types';
import { cn } from '@/lib/utils';

const TicketItem = ({ 
  ticket, 
  onClick,
  className
}: SingleTicketProps) => {
  // Format the date for display
  const formattedDate = format(new Date(ticket.date), 'MMM d, yyyy');
  
  // Get total count across all categories
  const totalCount = ticket.categories.reduce((sum, category) => sum + category.count, 0);
  
  // Determine if ticket has images
  const hasImages = ticket.images.length > 0;

  return (
    <Card 
      className={cn(
        "w-full cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick ? () => onClick(ticket) : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(ticket);
        }
      } : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{formattedDate}</h3>
            <p className="text-sm text-muted-foreground">
              {ticket.truckName} • {ticket.jobsiteName}
            </p>
          </div>
          
          {hasImages && (
            <TicketBadge
              label={`${ticket.images.length} ${ticket.images.length === 1 ? 'Image' : 'Images'}`}
              variant="outline"
              className="ml-2"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {ticket.categories.map((category) => {
            // Only show categories with counts > 0
            if (category.count === 0) return null;
            
            return (
              <TicketBadge
                key={category.id}
                label={category.name}
                count={category.count}
              />
            );
          })}
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground">
          Total: {totalCount} items
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketItem;
