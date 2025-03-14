/**
 * Skeleton Component
 * Used for loading states and placeholders
 */

import { cn } from "@/lib/utils";

/**
 * Props for the Skeleton component
 */
interface SkeletonProps {
  /** Additional class names to apply to the skeleton */
  className?: string;
  /** Width of the skeleton (can be provided via className instead) */
  width?: string | number;
  /** Height of the skeleton (can be provided via className instead) */
  height?: string | number;
  /** Optional children elements */
  children?: React.ReactNode;
}

/**
 * Skeleton component for loading states
 * Displays a pulsing placeholder element
 */
function Skeleton({ 
  className, 
  width, 
  height, 
  children,
  ...props 
}: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export { Skeleton };
