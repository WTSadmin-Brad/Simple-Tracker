/**
 * TableCard.client.tsx
 * Data table card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Data table card"
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';

// Table data types
interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'status';
  width?: string;
}

interface TableRow {
  id: string;
  [key: string]: any;
}

interface TableCardProps {
  id: string;
  title: string;
  dataSource: string;
  columns: TableColumn[];
  rowLimit?: number;
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
  rowLimit = 5,
  filters = {},
  refreshInterval = 0,
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: TableCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [rows, setRows] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch table data
  const fetchTableData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data based on data source and columns
      const mockRows: TableRow[] = [];
      
      // Create mock data based on columns
      for (let i = 0; i < 10; i++) {
        const row: TableRow = { id: `row-${i}` };
        
        columns.forEach(column => {
          switch (column.type) {
            case 'text':
              row[column.key] = `Sample ${column.label} ${i + 1}`;
              break;
              
            case 'number':
              row[column.key] = Math.floor(Math.random() * 1000);
              break;
              
            case 'date':
              const date = new Date();
              date.setDate(date.getDate() - Math.floor(Math.random() * 30));
              row[column.key] = date;
              break;
              
            case 'status':
              const statuses = ['active', 'pending', 'completed', 'error'];
              row[column.key] = statuses[Math.floor(Math.random() * statuses.length)];
              break;
              
            default:
              row[column.key] = `Value ${i + 1}`;
          }
        });
        
        mockRows.push(row);
      }
      
      setRows(mockRows);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load table data');
      console.error('Error fetching table data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchTableData();
  }, [dataSource, JSON.stringify(columns), JSON.stringify(filters)]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchTableData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, dataSource, JSON.stringify(columns), JSON.stringify(filters)]);
  
  // Handle column sort
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction if already sorting by this column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };
  
  // Sort rows based on current sort settings
  const sortedRows = [...rows].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const column = columns.find(col => col.key === sortColumn);
    if (!column) return 0;
    
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    
    let comparison = 0;
    
    switch (column.type) {
      case 'number':
        comparison = valueA - valueB;
        break;
        
      case 'date':
        comparison = new Date(valueA).getTime() - new Date(valueB).getTime();
        break;
        
      default:
        comparison = String(valueA).localeCompare(String(valueB));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Limit rows based on rowLimit
  const displayRows = sortedRows.slice(0, rowLimit);
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Format cell value based on column type
  const formatCellValue = (value: any, columnType: string): string => {
    if (value === null || value === undefined) return '-';
    
    switch (columnType) {
      case 'date':
        return new Date(value).toLocaleDateString();
        
      case 'number':
        return value.toLocaleString();
        
      default:
        return String(value);
    }
  };
  
  // Get sort icon for column header
  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3 text-primary-500" />
      : <ArrowDown className="ml-1 h-3 w-3 text-primary-500" />;
  };
  
  // Render status indicator
  const renderStatusIndicator = (status: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" = "default";
    
    switch (status.toLowerCase()) {
      case 'active':
        variant = "success";
        break;
        
      case 'pending':
        variant = "warning";
        break;
        
      case 'completed':
        variant = "secondary";
        break;
        
      case 'error':
        variant = "destructive";
        break;
        
      default:
        variant = "outline";
    }
    
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    );
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-500 p-4">
        <div className="text-2xl mb-2">⚠️</div>
        <div className="mb-2">{error}</div>
        <Button 
          onClick={fetchTableData}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  };
  
  // Animation variants
  const tableRowVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.05,
        duration: prefersReducedMotion ? 0.1 : 0.2
      }
    })
  };
  
  // Render refresh button
  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full"
      onClick={fetchTableData}
      title="Refresh data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
  );
  
  // Render table content
  const renderTable = () => {
    const tableHeight = size === 'small' ? 'max-h-[150px]' : size === 'large' ? 'max-h-[400px]' : 'max-h-[250px]';
    
    return (
      <div className={`overflow-auto ${tableHeight}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead 
                  key={column.key}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    <span>{column.label}</span>
                    {getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24 text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={tableRowVariants}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=selected]:bg-gray-100 dark:data-[state=selected]:bg-gray-800"
                >
                  {columns.map(column => (
                    <TableCell key={`${row.id}-${column.key}`}>
                      {column.type === 'status' ? (
                        renderStatusIndicator(row[column.key])
                      ) : (
                        formatCellValue(row[column.key], column.type)
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
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
      headerActions={<RefreshButton />}
      className="table-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow">
              {renderTable()}
            </div>
            <div className="flex items-center justify-between mt-2 px-2">
              <div className="text-xs text-gray-500">
                {rows.length > rowLimit && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => {
                      // Handle "View All" click - would navigate to full data view
                    }}
                  >
                    View all {rows.length} rows
                  </Button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {formatLastUpdated()}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default TableCard;
