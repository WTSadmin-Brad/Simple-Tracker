/**
 * Admin Feature Components Index
 * 
 * This file exports all admin feature components for easier imports.
 * Follow the layered component architecture pattern.
 */

// Export standalone admin components
export { default as AdminActionButton } from './admin-action-button.client';
export { default as ArchiveResultsTable } from './archive-results-table.client';
export { default as ArchiveSearchBar } from './archive-search-bar.client';
export { default as ExportButton } from './export-button.client';
export { default as ExportControls } from './export-controls.client';
export { default as ExportHistoryList } from './export-history-list.client';
export { default as TicketArchiveControls } from './ticket-archive-controls.client';
export { default as TicketDetailView } from './ticket-detail-view.client';
export { default as TicketStatusBadge } from './ticket-status-badge.client';

// Export types
export type { TicketStatus } from './ticket-status-badge.client';
export type { ArchiveType, DateRange, ArchiveSearchFilters } from './archive-search-bar.client';
export type { ArchiveItem } from './archive-results-table.client';
export type { ExportType, ExportFormat, ExportConfig } from './export-controls.client';
export type { ExportHistoryItem } from './export-history-list.client';

// Re-export from subdirectories
export * from './data-grid';
