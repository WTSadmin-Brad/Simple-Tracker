/**
 * Shared type definitions for ticket components
 * 
 * This file contains standardized interfaces used across
 * ticket-related components to ensure consistency
 */

import { Ticket, TicketCategory } from '@/types/tickets';

/**
 * Base props interface for all ticket-related components
 */
export interface BaseTicketProps {
  /** Optional CSS class to apply to the component */
  className?: string;
}

/**
 * Props for components that display a single ticket
 */
export interface SingleTicketProps extends BaseTicketProps {
  /** The ticket data to display */
  ticket: Ticket;
  /** Optional click handler for the ticket item */
  onClick?: (ticket: Ticket) => void;
}

/**
 * Props for components that display multiple tickets
 */
export interface TicketListProps extends BaseTicketProps {
  /** Array of tickets to display */
  tickets: Ticket[];
  /** Whether the tickets are currently loading */
  isLoading?: boolean;
  /** Message to display when there are no tickets */
  emptyMessage?: string;
  /** Optional click handler for individual tickets */
  onTicketClick?: (ticket: Ticket) => void;
}

/**
 * Props for components that display ticket categories
 */
export interface TicketCategoryProps extends BaseTicketProps {
  /** The category data to display */
  category: TicketCategory;
  /** Optional click handler for the category */
  onClick?: (category: TicketCategory) => void;
}

/**
 * Props for counter components
 */
export interface CounterProps extends BaseTicketProps {
  /** The label for the counter */
  label: string;
  /** The current value of the counter */
  value: number;
  /** Callback function when the counter value changes */
  onChange: (value: number) => void;
  /** Minimum allowed value (default: 0) */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Size variant of the counter */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props for image upload components
 */
export interface ImageUploadProps extends BaseTicketProps {
  /** Array of uploaded images */
  images: any[];
  /** Callback function when images change */
  onImagesChange: (images: any[]) => void;
  /** Maximum number of images allowed */
  maxImages?: number;
}
