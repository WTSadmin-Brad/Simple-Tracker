/**
 * MetricCard.client.tsx
 * KPI counter card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "KPI counter card"
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import DashboardCard from '../dashboard-card.client';
import { CardSize } from '../dashboard-card.client';
import dashboardService from '@/lib/services/dashboardService';
import { useCardData } from '../hooks';
import { CardLoadingState, CardErrorState, CardFooterWithRefresh } from '../components';

interface MetricCardProps {
  id: string;
  title: string;
  metricType: 'count' | 'sum' | 'average';
  dataSource: string;
  filters?: Record<string, any>;
  showTrend?: boolean;
  trendPeriod?: 'day' | 'week' | 'month';
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * KPI counter card for the admin dashboard
 */
const MetricCard = ({
  id,
  title,
  metricType,
  dataSource,
  filters = {},
  showTrend = true,
  trendPeriod = 'day',
  refreshInterval = 0,
  size = 'small',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: MetricCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [formattedValue, setFormattedValue] = useState<string | null>(null);
  
  // Create fetch function for the hook
  const fetchMetricData = useCallback(async () => {
    // Include the trend period in the filters
    const metricFilters = {
      ...filters,
      trendPeriod: trendPeriod
    };
    
    // Use the dashboard service to fetch data
    const result = await dashboardService.fetchMetricData(
      metricType,
      dataSource,
      metricFilters
    );
    
    // Update formatted value if provided by the service
    if (result.formattedValue) {
      setFormattedValue(result.formattedValue);
    }
    
    return result;
  }, [metricType, dataSource, JSON.stringify(filters), trendPeriod]);
  
  // Use the shared hook for data fetching
  const { 
    data: metricData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useCardData(fetchMetricData, refreshInterval, [metricType, dataSource, JSON.stringify(filters), trendPeriod]);
  
  // Format value based on metric type
  const formatValue = (val: number): string => {
    // If we have a formatted value from the service, use it
    if (formattedValue) return formattedValue;
    
    // Otherwise format it here
    switch (metricType) {
      case 'count':
        return val.toLocaleString();
        
      case 'sum':
        return `$${val.toLocaleString()}`;
        
      case 'average':
        return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        
      default:
        return val.toString();
    }
  };
  
  // Get trend icon and color
  const getTrendDetails = () => {
    if (!metricData || metricData.trend === null) {
      return {
        icon: <Minus className="h-4 w-4" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-800'
      };
    }
    
    switch (metricData.trend) {
      case 'up':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950/30'
        };
      case 'down':
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950/30'
        };
      case 'stable':
        return {
          icon: <Minus className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800'
        };
      default:
        return {
          icon: <Minus className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800'
        };
    }
  };
  
  // Render trend indicator
  const renderTrendIndicator = () => {
    if (!showTrend || !metricData || metricData.percentChange === null) return null;
    
    const { icon, color, bgColor } = getTrendDetails();
    
    return (
      <div className="flex items-center justify-center">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${color}`}>
          {icon}
          <span className="text-xs font-medium">
            {metricData.percentChange > 0 ? '+' : ''}{metricData.percentChange}%
          </span>
        </div>
      </div>
    );
  };
  
  // Render card content
  const renderCardContent = () => {
    if (isLoading) {
      return <CardLoadingState />;
    }
    
    if (error) {
      return <CardErrorState error={error} onRetry={refreshData} />;
    }
    
    if (!metricData || metricData.value === null) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
          <div className="text-2xl mb-2">📊</div>
          <div className="mb-2">No data available</div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-4 h-full">
        <motion.div 
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.1 : 0.5,
            type: prefersReducedMotion ? 'tween' : 'spring',
            bounce: 0.2
          }}
        >
          {formatValue(metricData.value)}
        </motion.div>
        
        {renderTrendIndicator()}
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
      {renderCardContent()}
    </DashboardCard>
  );
};

export default MetricCard;