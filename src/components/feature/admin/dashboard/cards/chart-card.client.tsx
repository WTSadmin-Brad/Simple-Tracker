/**
 * ChartCard.client.tsx
 * Chart visualization card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Chart card"
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw, BarChart2, LineChart, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';
import dashboardService, { ChartData } from '@/lib/services/dashboardService';

// Chart libraries (will use in Chart component)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartCardProps {
  id: string;
  title: string;
  chartType: 'line' | 'bar' | 'pie';
  dataSource: string;
  filters?: Record<string, any>;
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * Chart visualization card for the admin dashboard
 */
const ChartCard = ({
  id,
  title,
  chartType,
  dataSource,
  filters = {},
  refreshInterval = 0,
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: ChartCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const chartRef = useRef<ChartJS>(null);
  
  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use dashboard service to fetch chart data
      const result = await dashboardService.fetchChartData(
        chartType,
        dataSource,
        filters
      );
      
      setChartData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load chart data');
      console.error('Error fetching chart data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chartType, dataSource, JSON.stringify(filters)]);
  
  // Initial data fetch
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchChartData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchChartData]);
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
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
          onClick={fetchChartData}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  };
  
  // Get chart options based on chart type
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: prefersReducedMotion ? 0 : 1000,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
        },
        tooltip: {
          enabled: true,
        },
      },
    };
    
    // Additional options for specific chart types
    switch (chartType) {
      case 'line':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        };
        
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        };
        
      case 'pie':
        return {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: 'right' as const,
            },
          },
        };
        
      default:
        return baseOptions;
    }
  };
  
  // Render chart based on type
  const renderChart = () => {
    if (!chartData) return null;
    
    const options = getChartOptions();
    
    switch (chartType) {
      case 'line':
        return <Line ref={chartRef} data={chartData} options={options} />;
        
      case 'bar':
        return <Bar ref={chartRef} data={chartData} options={options} />;
        
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={options} />;
        
      default:
        return null;
    }
  };
  
  // Get chart icon for header
  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
        return <LineChart className="h-4 w-4" />;
        
      case 'bar':
        return <BarChart2 className="h-4 w-4" />;
        
      case 'pie':
        return <PieChart className="h-4 w-4" />;
        
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };
  
  // Render refresh button
  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full"
      onClick={fetchChartData}
      title="Refresh data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
  );
  
  // Header actions for the card
  const headerActions = (
    <>
      <span className="text-gray-400 mr-1">
        {getChartIcon()}
      </span>
      <RefreshButton />
    </>
  );
  
  return (
    <DashboardCard
      id={id}
      title={title}
      size={size}
      isEditing={isEditing}
      onEdit={onEdit}
      onRemove={onRemove}
      onResize={onResize}
      headerActions={headerActions}
      className="chart-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow p-4">
              <div className="h-full w-full">
                {renderChart()}
              </div>
            </div>
            <div className="text-xs text-gray-500 text-right px-4 pb-2">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default ChartCard;