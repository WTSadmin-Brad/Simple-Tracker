/**
 * StatusCard.client.tsx
 * System status monitoring card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Status card"
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import DashboardCard from '../dashboard-card.client';
import { CardSize } from '../dashboard-card.client';
import dashboardService from '@/lib/services/dashboardService';
import { useCardData } from '../hooks';
import { CardLoadingState, CardErrorState, CardEmptyState, CardFooterWithRefresh } from '../components';

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
  
  // Create fetch function for the hook
  const fetchStatusData = useCallback(async () => {
    // Use dashboard service to fetch system status
    return await dashboardService.fetchStatusData(
      systems,
      showHistory
    );
  }, [systems, showHistory]);
  
  // Use the shared hook for data fetching
  const { 
    data: statusData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useCardData(fetchStatusData, refreshInterval, [systems, showHistory]);
  
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
  
  // Render status content
  const renderStatusContent = () => {
    if (isLoading) {
      return <CardLoadingState />;
    }
    
    if (error) {
      return <CardErrorState error={error} onRetry={refreshData} />;
    }
    
    if (!statusData || !statusData.systems || statusData.systems.length === 0) {
      return <CardEmptyState message="No system status available" onRefresh={refreshData} />;
    }
    
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
        
        {showHistory && statusData.history && statusData.history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-medium mb-2">Recent History</h4>
            <div className="space-y-2">
              {statusData.history.map((item, index) => (
                <motion.div
                  key={`${item.system}-${item.timestamp}`}
                  className="text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : index * 0.05,
                    duration: prefersReducedMotion ? 0.1 : 0.2
                  }}
                >
                  <div className="flex items-center">
                    <span className={getStatusDetails(item.status).color}>
                      {getStatusDetails(item.status).icon}
                    </span>
                    <span className="ml-2 font-medium">{item.system}</span>
                    <span className="ml-auto text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="ml-6 text-gray-600 dark:text-gray-400">
                    {item.message}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
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
      {renderStatusContent()}
    </DashboardCard>
  );
};

export default StatusCard;