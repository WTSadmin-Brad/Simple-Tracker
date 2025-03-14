/**
 * ActivityCard.client.tsx
 * Recent activity feed card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Activity feed card"
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw, ChevronDown, ChevronUp, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';

// Activity types
type ActivityType = 'ticket' | 'workday' | 'user' | 'system';
type ActivityAction = 'created' | 'updated' | 'deleted' | 'completed' | 'approved' | 'rejected' | 'login';

interface ActivityItem {
  id: string;
  type: ActivityType;
  action: ActivityAction;
  subject: string;
  timestamp: Date;
  user?: string;
  details?: string;
}

interface ActivityCardProps {
  id: string;
  title: string;
  activityTypes?: ActivityType[];
  limit?: number;
  refreshInterval?: number;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
}

/**
 * Recent activity feed card for the admin dashboard
 * Displays a filterable activity feed with expandable details
 */
const ActivityCard = ({
  id,
  title,
  activityTypes = ['ticket', 'workday', 'user', 'system'],
  limit = 10,
  refreshInterval = 30,
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onResize
}: ActivityCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActivityType | 'all'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch activity data
  const fetchActivityData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock activity data
      const mockActivities: ActivityItem[] = [];
      
      // Activity subjects by type
      const subjects = {
        ticket: ['Ticket #1234', 'Ticket #5678', 'Ticket #9012', 'Ticket #3456'],
        workday: ['Workday 2023-10-15', 'Workday 2023-10-16', 'Workday 2023-10-17'],
        user: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'],
        system: ['Backup', 'Maintenance', 'Update', 'Security Scan']
      };
      
      // Actions by type
      const actions: Record<ActivityType, ActivityAction[]> = {
        ticket: ['created', 'updated', 'completed', 'approved', 'rejected'],
        workday: ['created', 'updated', 'approved', 'rejected'],
        user: ['created', 'updated', 'deleted', 'login'],
        system: ['created', 'updated', 'completed']
      };
      
      // Users
      const users = ['admin', 'supervisor', 'manager', 'operator'];
      
      // Generate random activities
      for (let i = 0; i < 20; i++) {
        // Random type from available types
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        // Random action for this type
        const action = actions[type][Math.floor(Math.random() * actions[type].length)];
        
        // Random subject for this type
        const subject = subjects[type][Math.floor(Math.random() * subjects[type].length)];
        
        // Random user
        const user = users[Math.floor(Math.random() * users.length)];
        
        // Random timestamp within the last 24 hours
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 24));
        
        // Create activity item
        mockActivities.push({
          id: `activity-${i}`,
          type,
          action,
          subject,
          timestamp,
          user,
          details: `Details for ${subject} ${action} by ${user}`
        });
      }
      
      // Sort by timestamp (newest first)
      mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setActivities(mockActivities);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load activity data');
      console.error('Error fetching activity data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchActivityData();
  }, [JSON.stringify(activityTypes)]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchActivityData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, JSON.stringify(activityTypes)]);
  
  // Toggle expanded item
  const toggleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };
  
  // Filter activities
  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(activity => activity.type === activeFilter);
  
  // Limit activities
  const displayActivities = filteredActivities.slice(0, limit);
  
  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else {
      return `${diffDay}d ago`;
    }
  };
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Get activity details
  const getActivityDetails = (type: ActivityType) => {
    switch (type) {
      case 'ticket':
        return {
          icon: '🎫',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          badgeVariant: 'blue',
          label: 'Ticket'
        };
      case 'workday':
        return {
          icon: '📅',
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          badgeVariant: 'green',
          label: 'Workday'
        };
      case 'user':
        return {
          icon: '👤',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100 dark:bg-purple-950/30',
          borderColor: 'border-purple-200 dark:border-purple-800',
          badgeVariant: 'purple',
          label: 'User'
        };
      case 'system':
        return {
          icon: '🖥️',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          badgeVariant: 'gray',
          label: 'System'
        };
      default:
        return {
          icon: '📝',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          badgeVariant: 'gray',
          label: 'Other'
        };
    }
  };
  
  // Get action text
  const getActionText = (action: ActivityAction): string => {
    switch (action) {
      case 'created':
        return 'created';
      case 'updated':
        return 'updated';
      case 'deleted':
        return 'deleted';
      case 'completed':
        return 'completed';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'login':
        return 'logged in';
      default:
        return action;
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
          onClick={fetchActivityData}
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
      onClick={fetchActivityData}
      title="Refresh data"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
  );
  
  // Render filter tabs
  const renderFilterTabs = () => {
    return (
      <Tabs 
        defaultValue="all" 
        value={activeFilter} 
        onValueChange={(value) => setActiveFilter(value as ActivityType | 'all')}
        className="w-full"
      >
        <div className="flex items-center mb-2">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Filter:</span>
        </div>
        <TabsList className="grid grid-flow-col auto-cols-fr bg-gray-100 dark:bg-gray-800 p-1 h-8 text-xs">
          <TabsTrigger value="all" className="h-6">All</TabsTrigger>
          {activityTypes.map(type => {
            const details = getActivityDetails(type);
            return (
              <TabsTrigger key={type} value={type} className="h-6 capitalize">
                {details.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  };
  
  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.05,
        duration: prefersReducedMotion ? 0.1 : 0.2
      }
    })
  };
  
  // Render activity content
  const renderActivityContent = () => {
    return (
      <div className="space-y-3 h-full flex flex-col">
        {/* Filter tabs */}
        {renderFilterTabs()}
        
        {/* Activity list */}
        <div className="space-y-2 flex-grow overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence>
            {displayActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No activities found
              </div>
            ) : (
              displayActivities.map((activity, index) => {
                const activityDetails = getActivityDetails(activity.type);
                
                return (
                  <motion.div
                    key={activity.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={listItemVariants}
                    className={`border rounded-md overflow-hidden ${activityDetails.borderColor}`}
                    layout={!prefersReducedMotion}
                  >
                    <div
                      className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => toggleExpandItem(activity.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 rounded-full p-1.5 ${activityDetails.bgColor}`}>
                          <span className="text-base">{activityDetails.icon}</span>
                        </div>
                        
                        <div className="ml-3 flex-grow">
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium">
                              {activity.subject}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRelativeTime(activity.timestamp)}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            {activity.user && <span className="font-medium mr-1">{activity.user}</span>}
                            <span>{getActionText(activity.action)}</span>
                            <Badge variant="outline" className="ml-2 text-[0.65rem] h-4 px-1 capitalize">
                              {activity.type}
                            </Badge>
                          </div>
                        </div>
                        
                        {activity.details && (
                          <div className="ml-1 text-gray-400">
                            {expandedItem === activity.id ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedItem === activity.id && activity.details && (
                        <motion.div
                          className={`p-2 text-xs border-t ${activityDetails.borderColor} ${activityDetails.bgColor}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
                        >
                          {activity.details}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
        
        {/* View all link */}
        {filteredActivities.length > limit && (
          <div className="text-right pt-1">
            <Button
              variant="link"
              size="sm"
              className="h-6 p-0 text-xs"
              onClick={() => {
                // Handle "View All" click - would navigate to full activity view
              }}
            >
              View all {filteredActivities.length} activities
            </Button>
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
      headerActions={<RefreshButton />}
      className="activity-card"
    >
      <div className="h-full flex flex-col p-2">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow">
              {renderActivityContent()}
            </div>
            <div className="text-xs text-gray-500 text-right pt-1">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default ActivityCard;
