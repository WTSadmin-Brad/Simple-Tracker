/**
 * TicketBadge.tsx
 * Server Component for displaying category badges with appropriate colors
 * based on counter values
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCounterColorState } from '@/lib/constants/ticketCategories';
import { useId } from 'react';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'counter';

export interface TicketBadgeProps {
  /** The label to display in the badge */
  label: string;
  /** Optional count value to display after the label */
  count?: number;
  /** Optional custom variant to override the automatic color selection */
  variant?: BadgeVariant;
  /** Optional CSS class to apply to the badge */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Maps a counter color state to a badge variant
 */
const mapColorStateToBadgeVariant = (colorState: string): BadgeVariant => {
  switch (colorState) {
    case 'red':
      return 'destructive';
    case 'yellow':
      return 'secondary';
    case 'green':
    case 'gold':
      return 'default';
    default:
      return 'outline';
  }
};

/**
 * TicketBadge component for displaying category badges with appropriate colors
 */
const TicketBadge = ({
  label,
  count,
  variant,
  className,
  onClick
}: TicketBadgeProps) => {
  // If count is provided, determine the badge variant based on the count
  // Otherwise, use the provided variant or default to 'outline'
  const badgeVariant = count !== undefined 
    ? mapColorStateToBadgeVariant(getCounterColorState(count))
    : (variant || 'outline');

  // Determine if the badge is interactive
  const isInteractive = !!onClick;

  return (
    <Badge 
      variant={badgeVariant} 
      className={cn(
        "touch-target",
        isInteractive && "cursor-pointer",
        className
      )}
      onClick={onClick}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? "button" : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {label}{count !== undefined && `: ${count}`}
    </Badge>
  );
};

export default TicketBadge;
