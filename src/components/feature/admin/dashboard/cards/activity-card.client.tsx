/**
 * ActivityCard.client.tsx
 * Recent activity card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Activity card"
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  RefreshCcw, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Lock,
  Activity,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';
import dashboardService, { ActivityData } from '@/lib/services/dashboardService';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityCardProps {
  id: string;
  title: string;
  activityTypes: string[];
  maxItems: number;
  showUser?: boolean;
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * Recent activity card for the admin dashboard
 */
const ActivityCard = ({
  id,
  title,
  activityTypes,
  maxItems = 10,
  showUser = true,
  refreshInterval = 60,
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: ActivityCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch activity data
  const fetchActivityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use dashboard service to fetch activity data
      const result = await dashboardService.fetchActivityData(
        activityTypes,
        maxItems
      );
      
      setActivityData(result);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      setError('Failed to load activity data');
      console.error('Error fetching activity data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activityTypes, maxItems]);
  
  // Initial data fetch
  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchActivityData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchActivityData]);
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4 text-blue-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'ticket-created':
      case 'ticket-updated':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'user':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'workday-logged':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          onClick={fetchActivityData}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
        <div className="text-2xl mb-2">📋</div>
        <div className="mb-2">No activity found</div>
        <Button 
          onClick={fetchActivityData}
          variant="outline"
          size="sm"
        >
          Refresh
        </Button>
      </div>
    );
  };
  
  // Render activity content
  const renderActivityContent = () => {
    if (!activityData || !activityData.items || activityData.items.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <div className="space-y-4 p-4">
        {activityData.items.map((item, index) => (
          <motion.div
            key={item.id}
            className="flex items-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: prefersReducedMotion ? 0 : index * 0.05,
              duration: prefersReducedMotion ? 0.1 : 0.2
            }}
          >
            <div className="mr-3 mt-0.5">
              {getActivityIcon(item.type)}
            </div>
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div className="text-sm">
                  {item.message}
                </div>
                {showUser && item.user && (
                  <Avatar className="h-6 w-6 ml-2">
                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                      {getUserInitials(item.user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <time dateTime={item.timestamp.toISOString()} title={format(item.timestamp, 'PPpp')}>
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </time>
                {showUser && item.user && (
                  <span className="ml-2">{item.user.name}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };
  
  // Render refresh button
  const RefreshButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full"
      onClick={fetchActivityData}
      title="Refresh activity"
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
      className="activity-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow overflow-auto">
              {renderActivityContent()}
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

export default ActivityCard;