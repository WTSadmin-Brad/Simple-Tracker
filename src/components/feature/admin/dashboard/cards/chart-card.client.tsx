/**
 * ChartCard.client.tsx
 * Chart visualization card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Chart card"
 */

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BarChart2, LineChart, PieChart } from 'lucide-react';
import DashboardCard from '../dashboard-card.client';
import { CardSize } from '../dashboard-card.client';
import dashboardService from '@/lib/services/dashboardService';
import { useCardData } from '../hooks';
import { CardLoadingState, CardErrorState, CardEmptyState, CardFooterWithRefresh } from '../components';

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
  const chartRef = useRef<ChartJS>(null);
  
  // Create fetch function for the hook
  const fetchChartData = useCallback(async () => {
    // Use dashboard service to fetch chart data
    return await dashboardService.fetchChartData(
      chartType,
      dataSource,
      filters
    );
  }, [chartType, dataSource, JSON.stringify(filters)]);
  
  // Use the shared hook for data fetching
  const { 
    data: chartData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useCardData(fetchChartData, refreshInterval, [chartType, dataSource, JSON.stringify(filters)]);
  
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
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    if (!chartData || !chartData.data) return null;
    
    const options = getChartOptions();
    const { data } = chartData;
    
    switch (chartType) {
      case 'line':
        return (
          <Line 
            data={data} 
            options={options} 
            ref={chartRef as any}
          />
        );
        
      case 'bar':
        return (
          <Bar 
            data={data} 
            options={options} 
            ref={chartRef as any}
          />
        );
        
      case 'pie':
        return (
          <Pie 
            data={data} 
            options={options} 
            ref={chartRef as any}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Get chart icon based on type
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
  
  // Render chart content
  const renderChartContent = () => {
    if (isLoading) {
      return <CardLoadingState />;
    }
    
    if (error) {
      return <CardErrorState error={error} onRetry={refreshData} />;
    }
    
    if (!chartData || !chartData.data) {
      return <CardEmptyState message="No chart data available" onRefresh={refreshData} />;
    }
    
    return (
      <div className="h-full p-4">
        <motion.div 
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.5 }}
        >
          {renderChart()}
        </motion.div>
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
      headerActions={getChartIcon()}
      footer={
        <CardFooterWithRefresh 
          lastUpdated={lastUpdated} 
          onRefresh={refreshData} 
        />
      }
    >
      {renderChartContent()}
    </DashboardCard>
  );
};

export default ChartCard;