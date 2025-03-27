/**
 * TableCard.client.tsx
 * Data table card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Table card"
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import DashboardCard from '../dashboard-card.client';
import { CardSize } from '../dashboard-card.client';
import dashboardService from '@/lib/services/dashboardService';
import { useCardData } from '../hooks';
import { CardLoadingState, CardErrorState, CardEmptyState, CardFooterWithRefresh } from '../components';

interface TableCardProps {
  id: string;
  title: string;
  dataSource: string;
  columns: Array<{
    key: string;
    header: string;
    width?: string;
  }>;
  filters?: Record<string, any>;
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * Data table card for the admin dashboard
 */
const TableCard = ({
  id,
  title,
  dataSource,
  columns,
  filters = {},
  refreshInterval = 60,
  size = 'large',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: TableCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Create fetch function for the hook
  const fetchTableData = useCallback(async () => {
    // Use dashboard service to fetch table data
    return await dashboardService.fetchTableData(
      dataSource,
      columns.map(col => col.key),
      filters
    );
  }, [dataSource, JSON.stringify(columns), JSON.stringify(filters)]);
  
  // Use the shared hook for data fetching
  const { 
    data: tableData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useCardData(fetchTableData, refreshInterval, [dataSource, JSON.stringify(columns), JSON.stringify(filters)]);
  
  // Format cell value based on type
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };
  
  // Render table content
  const renderTableContent = () => {
    if (isLoading) {
      return <CardLoadingState />;
    }
    
    if (error) {
      return <CardErrorState error={error} onRetry={refreshData} />;
    }
    
    if (!tableData || !tableData.rows || tableData.rows.length === 0) {
      return <CardEmptyState message="No data available" onRefresh={refreshData} />;
    }
    
    return (
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  style={{ width: column.width || 'auto' }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.rows.map((row, rowIndex) => (
              <motion.tr
                key={row.id || rowIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: prefersReducedMotion ? 0 : rowIndex * 0.05,
                  duration: prefersReducedMotion ? 0.1 : 0.2
                }}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                {columns.map((column) => (
                  <TableCell key={`${row.id || rowIndex}-${column.key}`}>
                    {formatCellValue(row[column.key])}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  return (
    <DashboardCard
      id={id}
      title={title}
      size={size}
      isEditing={isEditing}
      onEdit={onEdit}
      onRemove={onRemove}
      onResize={onResize}
      footer={
        <CardFooterWithRefresh 
          lastUpdated={lastUpdated} 
          onRefresh={refreshData} 
        />
      }
    >
      {renderTableContent()}
    </DashboardCard>
  );
};

export default TableCard;
