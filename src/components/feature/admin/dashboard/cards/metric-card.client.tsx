/**
 * MetricCard.client.tsx
 * KPI counter card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "KPI counter card"
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';
import dashboardService from '@/lib/services/dashboardService';

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
  const [value, setValue] = useState<number | null>(null);
  const [formattedValue, setFormattedValue] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<number | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch metric data
  const fetchMetricData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
      
      // Update state with the results
      setValue(result.value);
      if (result.formattedValue) {
        setFormattedValue(result.formattedValue);
      }
      setPreviousValue(result.previousValue);
      setPercentChange(result.percentChange);
      setTrend(result.trend);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      setError('Failed to load metric data');
      console.error('Error fetching metric data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [metricType, dataSource, JSON.stringify(filters), trendPeriod]);
  
  // Initial data fetch
  useEffect(() => {
    fetchMetricData();
  }, [fetchMetricData]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchMetricData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchMetricData]);
  
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
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Get trend icon and color
  const getTrendDetails = () => {
    if (trend === null) {
      return {
        icon: <Minus className="h-4 w-4" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-800'
      };
    }
    
    switch (trend) {
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
    if (!showTrend || percentChange === null) return null;
    
    const { icon, color, bgColor } = getTrendDetails();
    
    return (
      <div className="flex items-center justify-center">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${color}`}>
          {icon}
          <span className="text-xs font-medium">
            {percentChange > 0 ? '+' : ''}{percentChange}%
          </span>
        </div>
      </div>
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
          onClick={fetchMetricData}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  };
  
  // Render metric content
  const renderMetricContent = () => {
    if (value === null) return null;
    
    // Get appropriate size classes based on card size
    const valueSize = size === 'small' 
      ? 'text-3xl' 
      : size === 'large' 
        ? 'text-5xl' 
        : 'text-4xl';
    
    const { color } = getTrendDetails();
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <motion.div 
          className={`${valueSize} font-bold mb-2 ${color}`}
          key={value} // Re-animate when value changes
          initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.1 : 0.5,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          {formatValue(value)}
        </motion.div>
        
        {renderTrendIndicator()}
        
        <div className="text-xs text-gray-500 mt-3">
          {metricType.charAt(0).toUpperCase() + metricType.slice(1)} from {dataSource}
        </div>
      </div>
    );
  };
  
  // Render refresh button
  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full"
      onClick={fetchMetricData}
      title="Refresh data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
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
      headerActions={<RefreshButton />}
      className="metric-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            {renderMetricContent()}
            <div className="text-xs text-gray-500 text-right px-4 pb-2">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default MetricCard;