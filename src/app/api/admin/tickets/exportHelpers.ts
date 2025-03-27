/**
 * Admin Tickets Export Helpers
 * 
 * Utilities for exporting ticket data in various formats (CSV, Excel, JSON).
 * These helpers leverage the shared export utilities for consistent implementation
 * across different data types.
 */

import { fetchTickets } from './helpers';
import { TicketExportParams } from '@/lib/schemas/exportSchemas';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { TicketSummary } from './helpers';
import { generateCsvExport, generateExcelExport, generateJsonExport } from '@/lib/utils/exportUtils';

/**
 * Generate a ticket export file in the specified format
 * 
 * This function handles the entire export process:
 * 1. Fetching ticket data based on filter parameters
 * 2. Generating the export file in the requested format
 * 3. Uploading the file to Firebase Storage
 * 4. Returning download information with expiration
 * 
 * @param params Export parameters including format and filters
 * @returns Export result with download URL and metadata
 */
export async function generateTicketExport(params: TicketExportParams) {
  // Build filter parameters from export params
  const filters = {
    startDate: params.dateFrom,
    endDate: params.dateTo,
    jobsite: params.jobsiteId,
    pageSize: 1000, // Get a large batch of tickets
  };
  
  // Fetch ticket data
  const { tickets } = await fetchTickets(filters);
  
  // Generate export file based on format
  const filename = `tickets_export_${new Date().toISOString().split('T')[0]}.${params.format}`;
  const storagePath = `exports/tickets/${uuidv4()}.${params.format}`;
  let fileBuffer: Buffer;
  
  // Define headers and row mapping function for exports
  const headers = [
    'ID', 'Date', 'Jobsite', 'Truck', 'Submitted By', 
    'Total Tickets', 'Hangers', 'Leaner 6-12', 'Leaner 13-24', 
    'Leaner 25-36', 'Leaner 37-48', 'Leaner 49+', 'Images', 'Status'
  ];
  
  const rowMapper = (ticket: TicketSummary) => [
    ticket.id,
    ticket.date,
    ticket.jobsite,
    ticket.truck,
    ticket.submittedBy,
    ticket.totalTickets.toString(),
    ticket.categoryCounts.hangers.toString(),
    ticket.categoryCounts.leaner6To12.toString(),
    ticket.categoryCounts.leaner13To24.toString(),
    ticket.categoryCounts.leaner25To36.toString(),
    ticket.categoryCounts.leaner37To48.toString(),
    ticket.categoryCounts.leaner49Plus.toString(),
    ticket.imageCount.toString(),
    ticket.status
  ];
  
  switch (params.format) {
    case 'csv':
      fileBuffer = generateCsvExport(tickets, headers, rowMapper);
      break;
    case 'excel':
      fileBuffer = generateExcelExport(
        tickets, 
        headers,
        ticket => [
          ticket.id,
          ticket.date,
          ticket.jobsite,
          ticket.truck,
          ticket.submittedBy,
          ticket.totalTickets,
          ticket.categoryCounts.hangers,
          ticket.categoryCounts.leaner6To12,
          ticket.categoryCounts.leaner13To24,
          ticket.categoryCounts.leaner25To36,
          ticket.categoryCounts.leaner37To48,
          ticket.categoryCounts.leaner49Plus,
          ticket.imageCount,
          ticket.status
        ],
        'Tickets'
      );
      break;
    case 'json':
      fileBuffer = generateJsonExport(tickets);
      break;
    default:
      fileBuffer = generateCsvExport(tickets, headers, rowMapper);
  }
  
  // Upload the file to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, fileBuffer);
  
  // Get the download URL
  const url = await getDownloadURL(storageRef);
  
  // Set expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  return {
    success: true,
    url,
    filename,
    format: params.format,
    recordCount: tickets.length,
    generatedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    storagePath,
  };
}
