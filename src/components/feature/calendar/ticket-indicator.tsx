/**
 * TicketIndicator.tsx
 * Shared component for displaying ticket indicators in calendar cells
 */

/**
 * Simple indicator component that shows when a day has associated tickets
 */
const TicketIndicator = () => {
  return (
    <div className="mt-auto self-end" aria-hidden="true">
      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1 mb-1"></div>
    </div>
  );
};

export default TicketIndicator;
