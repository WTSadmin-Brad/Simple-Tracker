/**
 * Admin Workdays Export Helpers
 * 
 * Utilities for exporting workday data in various formats (CSV, Excel, JSON).
 * These helpers leverage the shared export utilities for consistent implementation
 * across different data types.
 */

import { fetchWorkdays, WorkdaySummary } from './helpers';
import { WorkdayExportParams } from '@/lib/schemas/exportSchemas';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { 
  generateCsvExport,
  generateExcelExport,
  generateJsonExport,
  calculateSummaries,
  ExcelSheetConfig
} from '@/lib/utils/exportUtils';

/**
 * Generate a workday export file in the specified format
 * 
 * This function handles the entire export process:
 * 1. Fetching workday data based on filter parameters
 * 2. Generating the export file in the requested format
 * 3. Uploading the file to Firebase Storage
 * 4. Returning download information with expiration
 * 
 * @param params Export parameters including format and filters
 * @returns Export result with download URL and metadata
 */
export async function generateWorkdayExport(params: WorkdayExportParams) {
  // Build filter parameters from export params
  const filters = {
    startDate: params.dateFrom,
    endDate: params.dateTo,
    employeeId: params.employeeId,
    jobsiteId: params.jobsiteId,
    pageSize: 1000, // Get a large batch of workdays
  };
  
  // Fetch workday data
  const { workdays } = await fetchWorkdays(filters);
  
  // Generate export file based on format
  const filename = `workdays_export_${new Date().toISOString().split('T')[0]}.${params.format}`;
  const storagePath = `exports/workdays/${uuidv4()}.${params.format}`;
  let fileBuffer: Buffer;
  
  // Define headers and row mapping function for exports
  const headers = [
    'ID', 'Date', 'Employee Name', 'Jobsite Name', 
    'Hours Worked', 'Status'
  ];
  
  const rowMapper = (workday: WorkdaySummary) => [
    workday.id,
    workday.date,
    workday.employeeName,
    workday.jobsiteName,
    workday.hoursWorked.toString(),
    workday.status
  ];
  
  switch (params.format) {
    case 'csv':
      fileBuffer = generateCsvExport(workdays, headers, rowMapper);
      break;
    case 'excel': {
      // Create summary sheets if requested
      const summarySheets = params.includeSummary ? createSummarySheets(workdays) : undefined;
      
      fileBuffer = generateExcelExport(
        workdays,
        headers,
        workday => [
          workday.id,
          workday.date,
          workday.employeeName,
          workday.jobsiteName,
          workday.hoursWorked,
          workday.status
        ],
        'Workdays',
        summarySheets
      );
      break;
    }
    case 'json':
      fileBuffer = generateJsonExport(workdays);
      break;
    default:
      fileBuffer = generateCsvExport(workdays, headers, rowMapper);
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
    recordCount: workdays.length,
    generatedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    storagePath,
  };
}

/**
 * Create summary sheets for Excel export
 * 
 * Generates additional worksheets with summary statistics:
 * - Employee Summary: Total hours worked by each employee
 * - Jobsite Summary: Total hours worked at each jobsite
 * 
 * @param workdays Collection of workday records to summarize
 * @returns Array of sheet configurations for the Excel export
 */
function createSummarySheets(workdays: WorkdaySummary[]): ExcelSheetConfig[] {
  // Calculate employee summary - total hours by employee
  const employeeTotals = calculateSummaries(
    workdays,
    workday => workday.employeeName,
    workday => workday.hoursWorked
  );
  
  // Calculate jobsite summary - total hours by jobsite
  const jobsiteTotals = calculateSummaries(
    workdays,
    workday => workday.jobsiteName,
    workday => workday.hoursWorked
  );
  
  // Prepare summary sheets
  return [
    {
      name: 'Employee Summary',
      headers: ['Employee', 'Total Hours'],
      data: Object.entries(employeeTotals).map(([name, hours]) => [name, hours])
    },
    {
      name: 'Jobsite Summary',
      headers: ['Jobsite', 'Total Hours'],
      data: Object.entries(jobsiteTotals).map(([name, hours]) => [name, hours])
    }
  ];
}
