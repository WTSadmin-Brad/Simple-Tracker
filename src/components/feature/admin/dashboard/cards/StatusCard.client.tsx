/**
 * StatusCard.client.tsx
 * System status card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "System status card"
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw, ChevronDown, ChevronUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';

// Status types
type StatusLevel = 'healthy' | 'warning' | 'critical' | 'unknown';

interface StatusItem {
  id: string;
  name: string;
  status: StatusLevel;
  message?: string;
  lastUpdated: Date;
}

interface StatusCardProps {
  id: string;
  title: string;
  systems: string[];
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * System status card for the admin dashboard
 */
const StatusCard = ({
  id,
  title,
  systems,
  refreshInterval = 60,
  size = 'small',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: StatusCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch status data
  const fetchStatusData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock status data for each system
      const mockStatusItems: StatusItem[] = systems.map(system => {
        // Randomly determine status level with bias toward healthy
        const rand = Math.random();
        let status: StatusLevel;
        
        if (rand < 0.7) {
          status = 'healthy';
        } else if (rand < 0.9) {
          status = 'warning';
        } else {
          status = 'critical';
        }
        
        // Generate appropriate message based on status
        let message = '';
        switch (status) {
          case 'healthy':
            message = 'System operating normally';
            break;
          case 'warning':
            message = `Performance degraded: ${Math.floor(Math.random() * 20) + 80}% capacity`;
            break;
          case 'critical':
            message = 'System experiencing critical issues';
            break;
          default:
            message = 'Status unknown';
        }
        
        return {
          id: system.toLowerCase().replace(/\s+/g, '-'),
          name: system,
          status,
          message,
          lastUpdated: new Date()
        };
      });
      
      setStatusItems(mockStatusItems);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load status data');
      console.error('Error fetching status data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchStatusData();
  }, [JSON.stringify(systems)]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchStatusData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, JSON.stringify(systems)]);
  
  // Get overall system status
  const getOverallStatus = (): StatusLevel => {
    if (statusItems.length === 0) return 'unknown';
    
    if (statusItems.some(item => item.status === 'critical')) {
      return 'critical';
    }
    
    if (statusItems.some(item => item.status === 'warning')) {
      return 'warning';
    }
    
    if (statusItems.every(item => item.status === 'healthy')) {
      return 'healthy';
    }
    
    return 'unknown';
  };
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Get status details
  const getStatusDetails = (status: StatusLevel) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          bgColorLight: 'bg-green-100 dark:bg-green-950/30',
          label: 'Healthy'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500',
          bgColorLight: 'bg-amber-100 dark:bg-amber-950/30',
          label: 'Warning'
        };
      case 'critical':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          bgColorLight: 'bg-red-100 dark:bg-red-950/30',
          label: 'Critical'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500',
          bgColorLight: 'bg-gray-100 dark:bg-gray-800',
          label: 'Unknown'
        };
    }
  };
  
  // Toggle expanded item
  const toggleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString();
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
  
  // Render refresh button
  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full"
      onClick={fetchStatusData}
      title="Refresh data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
  );
  
  // Render status content
  const renderStatusContent = () => {
    const overallStatus = getOverallStatus();
    const overallStatusDetails = getStatusDetails(overallStatus);
    
    // Adjust content based on card size
    const isCompact = size === 'small';
    
    return (
      <div className="space-y-3 p-2 h-full flex flex-col">
        {/* Overall status */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Overall Status</div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${overallStatusDetails.bgColorLight} ${overallStatusDetails.color}`}>
            {overallStatusDetails.icon}
            <div className="text-xs font-medium">{overallStatusDetails.label}</div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Individual systems */}
        <div className="space-y-2 flex-grow overflow-auto">
          <AnimatePresence>
            {statusItems.map((item) => {
              const statusDetails = getStatusDetails(item.status);
              
              return (
                <motion.div 
                  key={item.id}
                  className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                  layout={!prefersReducedMotion}
                >
                  <div 
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => toggleExpandItem(item.id)}
                  >
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 ${statusDetails.color}`}>
                        <div className={`h-2 w-2 rounded-full ${statusDetails.bgColor}`}></div>
                        <div className="text-xs">{statusDetails.label}</div>
                      </div>
                      {expandedItem === item.id ? 
                        <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedItem === item.id && (
                      <motion.div 
                        className={`p-2 bg-gray-50 dark:bg-gray-800 text-xs border-t border-gray-200 dark:border-gray-700`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                      >
                        <div className="mb-1 font-medium">{item.message}</div>
                        <div className="text-gray-500">
                          Last updated: {formatDate(item.lastUpdated)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {statusItems.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No systems to monitor
            </div>
          )}
        </div>
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
      className="status-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow">
              {renderStatusContent()}
            </div>
            <div className="text-xs text-gray-500 text-right px-2 pb-2">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default StatusCard;
