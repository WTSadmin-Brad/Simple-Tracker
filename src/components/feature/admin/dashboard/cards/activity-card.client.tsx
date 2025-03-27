/**
 * ActivityCard.client.tsx
 * Recent activity card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Activity card"
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DashboardCard from '../dashboard-card.client';
import { CardSize } from '../dashboard-card.client';
import dashboardService from '@/lib/services/dashboardService';
import { format, formatDistanceToNow } from 'date-fns';
import { useCardData } from '../hooks';
import { CardLoadingState, CardErrorState, CardEmptyState, CardFooterWithRefresh } from '../components';

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
  
  // Create fetch function for the hook
  const fetchActivityData = useCallback(async () => {
    // Use dashboard service to fetch activity data
    return await dashboardService.fetchActivityData(
      activityTypes,
      maxItems
    );
  }, [activityTypes, maxItems]);
  
  // Use the shared hook for data fetching
  const { 
    data: activityData, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useCardData(fetchActivityData, refreshInterval, [activityTypes, maxItems]);
  
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
  
  // Render activity content
  const renderActivityContent = () => {
    if (isLoading) {
      return <CardLoadingState />;
    }
    
    if (error) {
      return <CardErrorState error={error} onRetry={refreshData} />;
    }
    
    if (!activityData || !activityData.items || activityData.items.length === 0) {
      return <CardEmptyState message="No activity found" onRefresh={refreshData} />;
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
              <div className="text-sm">
                <span dangerouslySetInnerHTML={{ __html: item.message }} />
              </div>
              
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {showUser && item.user && (
              <div className="ml-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(item.user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </motion.div>
        ))}
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
      {renderActivityContent()}
    </DashboardCard>
  );
};

export default ActivityCard;