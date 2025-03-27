/**
 * Export Utilities
 * 
 * Shared utility functions for generating various export formats.
 * These functions provide a consistent approach to exporting data
 * across different modules (tickets, workdays, etc.).
 */

import * as XLSX from 'xlsx';

/**
 * Generate a CSV export from any data collection
 * 
 * @param data The collection of data items to export
 * @param headers Array of column headers for the CSV
 * @param rowMapper Function that maps each data item to an array of values
 * @returns Buffer containing the CSV data
 */
export function generateCsvExport<T>(
  data: T[], 
  headers: string[], 
  rowMapper: (item: T) => (string | number)[]
): Buffer {
  // Convert data to CSV format using the row mapper
  const rows = data.map(item => rowMapper(item).map(String));
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return Buffer.from(csvContent, 'utf-8');
}

/**
 * Additional sheet configuration for Excel exports
 */
export interface ExcelSheetConfig {
  name: string;
  headers: string[];
  data: (string | number)[][];
}

/**
 * Generate an Excel export from any data collection
 * 
 * @param data The collection of data items to export
 * @param headers Array of column headers for the main sheet
 * @param rowMapper Function that maps each data item to an array of values
 * @param sheetName Name for the main worksheet (defaults to "Data")
 * @param additionalSheets Optional additional sheets to include (e.g., for summaries)
 * @returns Buffer containing the Excel workbook
 */
export function generateExcelExport<T>(
  data: T[], 
  headers: string[], 
  rowMapper: (item: T) => (string | number)[], 
  sheetName: string = 'Data',
  additionalSheets?: ExcelSheetConfig[]
): Buffer {
  // Create worksheet data
  const worksheetData = [
    headers,
    ...data.map(item => rowMapper(item))
  ];
  
  // Create workbook and main worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Add additional sheets if provided
  if (additionalSheets && additionalSheets.length > 0) {
    additionalSheets.forEach(sheet => {
      const sheetData = [
        sheet.headers,
        ...sheet.data
      ];
      
      const additionalWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, additionalWorksheet, sheet.name);
    });
  }
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(excelBuffer);
}

/**
 * Generate a JSON export from any data collection
 * 
 * @param data The collection of data items to export
 * @param replacer Optional replacer function for JSON.stringify
 * @param space Optional space parameter for JSON.stringify (defaults to 2)
 * @returns Buffer containing the JSON data
 */
export function generateJsonExport<T>(
  data: T[],
  replacer?: (key: string, value: any) => any,
  space: number = 2
): Buffer {
  const jsonContent = JSON.stringify(data, replacer, space);
  return Buffer.from(jsonContent, 'utf-8');
}

/**
 * Calculate summary statistics for a data collection
 * 
 * @param data The collection of data items
 * @param keyExtractor Function to extract the key to group by
 * @param valueExtractor Function to extract the value to sum
 * @returns Object mapping keys to their summed values
 */
export function calculateSummaries<T>(
  data: T[],
  keyExtractor: (item: T) => string,
  valueExtractor: (item: T) => number
): Record<string, number> {
  return data.reduce((acc, item) => {
    const key = keyExtractor(item);
    acc[key] = (acc[key] || 0) + valueExtractor(item);
    return acc;
  }, {} as Record<string, number>);
}
