/**
 * StatusCard.client.tsx
 * System status monitoring card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Status card"
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw, AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';
import dashboardService, { StatusData } from '@/lib/services/dashboardService';

interface StatusCardProps {
  id: string;
  title: string;
  systems: Array<{
    name: string;
    endpoint?: string;
  }>;
  showHistory?: boolean;
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * System status monitoring card for the admin dashboard
 */
const StatusCard = ({
  id,
  title,
  systems,
  showHistory = false,
  refreshInterval = 60,
  size = 'small',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: StatusCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch status data
  const fetchStatusData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use dashboard service to fetch system status
      const result = await dashboardService.fetchStatusData(
        systems,
        showHistory
      );
      
      setStatusData(result);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      setError('Failed to load system status');
      console.error('Error fetching system status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [systems, showHistory]);
  
  // Initial data fetch
  useEffect(() => {
    fetchStatusData();
  }, [fetchStatusData]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchStatusData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchStatusData]);
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Get status icon and color
  const getStatusDetails = (status: 'operational' | 'degraded' | 'outage') => {
    switch (status) {
      case 'operational':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          label: 'Operational'
        };
      case 'degraded':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          label: 'Degraded'
        };
      case 'outage':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          label: 'Outage'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          label: 'Unknown'
        };
    }
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
          onClick={fetchStatusData}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  };
  
  // Render status content
  const renderStatusContent = () => {
    if (!statusData || !statusData.systems) return null;
    
    return (
      <div className="space-y-3 p-4">
        {statusData.systems.map((system, index) => {
          const { icon, color, bgColor, label } = getStatusDetails(system.status);
          const timestamp = system.lastChecked ? 
            new Date(system.lastChecked).toLocaleTimeString() : '';
          
          return (
            <motion.div
              key={system.name}
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : index * 0.1,
                duration: prefersReducedMotion ? 0.1 : 0.2
              }}
            >
              <div className={`flex-shrink-0 rounded-full p-1 ${bgColor}`}>
                <span className={color}>{icon}</span>
              </div>
              <div className="ml-3 flex-grow">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{system.name}</span>
                  <span className={`text-xs ${color} font-medium`}>{label}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last checked: {timestamp}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };
  
  // Render history content
  const renderHistoryContent = () => {
    if (!statusData || !statusData.systems || !showHistory) return null;
    
    // Find systems with history
    const systemsWithHistory = statusData.systems.filter(
      system => system.history && system.history.length > 0
    );
    
    if (systemsWithHistory.length === 0) return null;
    
    return (
      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <h4 className="text-sm font-medium mb-2">Recent History</h4>
        <div className="space-y-3">
          {systemsWithHistory.map(system => (
            <div key={`${system.name}-history`} className="text-xs">
              <div className="font-medium mb-1">{system.name}</div>
              <div className="space-y-1">
                {system.history && system.history.slice(0, 3).map((event, index) => {
                  const { color, label } = getStatusDetails(event.status);
                  const timestamp = event.timestamp ? 
                    new Date(event.timestamp).toLocaleString() : '';
                  
                  return (
                    <div 
                      key={`${system.name}-event-${index}`}
                      className="flex justify-between"
                    >
                      <span className={color}>{label}</span>
                      <span className="text-gray-500">{timestamp}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
      onClick={fetchStatusData}
      title="Refresh status"
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
      className="status-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow overflow-auto">
              {renderStatusContent()}
            </div>
            {showHistory && renderHistoryContent()}
            <div className="text-xs text-gray-500 text-right px-4 pb-2">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default StatusCard;