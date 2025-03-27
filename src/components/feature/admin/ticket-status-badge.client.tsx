'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TicketStatus = 'active' | 'images_archived' | 'fully_archived';

interface StatusConfig {
  label: string;
  variant: 'default' | 'outline' | 'secondary' | 'destructive';
  className: string;
}

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

/**
 * TicketStatusBadge component
 * Displays a color-coded badge for ticket status
 */
export default function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  // Memoize status configuration to avoid recalculation on re-renders
  const statusConfig = useMemo<StatusConfig>(() => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'images_archived':
        return {
          label: 'Images Archived',
          variant: 'outline',
          className: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
        };
      case 'fully_archived':
        return {
          label: 'Fully Archived',
          variant: 'outline',
          className: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'outline',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  }, [status]);

  return (
    <Badge 
      variant="outline"
      className={cn(statusConfig.className, className)}
    >
      {statusConfig.label}
    </Badge>
  );
}
