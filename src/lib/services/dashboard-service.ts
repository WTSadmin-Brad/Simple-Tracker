/**
 * dashboardService.ts
 * Service for fetching and transforming data for admin dashboard components
 * 
 * Provides data for different dashboard card types:
 * - Charts (line, bar, pie)
 * - Metrics (count, sum, average)
 * - Tables (paginated data)
 * - Status (system health)
 * - Activity (recent actions)
 */

import { format, subDays, isAfter, parseISO } from 'date-fns';
import ticketService, { Ticket } from '@/lib/services/ticketService';
import workdayService from '@/lib/services/workdayService';
import userService from '@/lib/services/userService';
import { getErrorMessage, ErrorCodes } from '@/lib/errors';

// Type definitions for dashboard data
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface MetricData {
  value: number;
  previousValue: number | null;
  percentChange: number | null;
  trend: 'up' | 'down' | 'stable' | null;
  lastUpdated: Date;
  formattedValue?: string;
}

export interface TableData {
  headers: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status';
  }>;
  rows: Record<string, any>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatusData {
  systems: {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    lastChecked: Date;
    history?: {
      status: 'operational' | 'degraded' | 'outage';
      timestamp: Date;
    }[];
  }[];
  lastUpdated: Date;
}

export interface ActivityData {
  items: {
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    user?: {
      id: string;
      name: string;
    };
  }[];
  lastUpdated: Date;
}

// Color constants for charts
const CHART_COLORS = {
  primary: 'rgba(59, 130, 246, 1)', // blue-500
  secondary: 'rgba(99, 102, 241, 1)', // indigo-500
  success: 'rgba(16, 185, 129, 1)', // green-500
  danger: 'rgba(239, 68, 68, 1)', // red-500
  warning: 'rgba(245, 158, 11, 1)', // amber-500
  info: 'rgba(14, 165, 233, 1)', // sky-500
  light: 'rgba(243, 244, 246, 1)', // gray-100
  dark: 'rgba(31, 41, 55, 1)', // gray-800
};

// Chart background colors with transparency
const CHART_BACKGROUND_COLORS = [
  'rgba(59, 130, 246, 0.5)', // blue-500
  'rgba(99, 102, 241, 0.5)', // indigo-500
  'rgba(16, 185, 129, 0.5)', // green-500
  'rgba(239, 68, 68, 0.5)', // red-500
  'rgba(245, 158, 11, 0.5)', // amber-500
  'rgba(14, 165, 233, 0.5)', // sky-500
  'rgba(161, 98, 247, 0.5)', // purple-500
  'rgba(236, 72, 153, 0.5)', // pink-500
];

/**
 * Fetch chart data for dashboard chart cards
 * @param chartType Type of chart (line, bar, pie)
 * @param dataSource Source of data (tickets, workdays, users)
 * @param filters Additional filters to apply
 * @returns Formatted chart data ready for rendering
 */
export async function fetchChartData(
  chartType: 'line' | 'bar' | 'pie', 
  dataSource: string, 
  filters?: Record<string, any>
): Promise<ChartData> {
  try {
    // Default date range if not provided (last 30 days)
    const defaultStartDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const defaultEndDate = format(new Date(), 'yyyy-MM-dd');
    
    // Set up filters with defaults
    const dataFilters = {
      startDate: filters?.dateRange?.start || defaultStartDate,
      endDate: filters?.dateRange?.end || defaultEndDate,
      ...filters
    };
    
    // Fetch data based on data source
    switch (dataSource) {
      case 'tickets':
        const ticketsResponse = await ticketService.getTickets(dataFilters);
        return transformTicketsToChartData(ticketsResponse.tickets, chartType, filters);
        
      case 'workdays':
        const workdaysResponse = await workdayService.getWorkdays(dataFilters);
        return transformWorkdaysToChartData(workdaysResponse.workdays, chartType, filters);
        
      case 'users':
        const users = await userService.getUsers(dataFilters);
        return transformUsersToChartData(users, chartType, filters);
        
      default:
        throw new Error(`Unknown data source: ${dataSource}`);
    }
  } catch (error) {
    console.error(`Error fetching chart data: ${getErrorMessage(error)}`);
    // Return empty chart data structure on error
    return {
      labels: [],
      datasets: [{
        label: 'Error loading data',
        data: [],
        backgroundColor: CHART_BACKGROUND_COLORS[0]
      }]
    };
  }
}

/**
 * Fetch metric data for dashboard metric cards
 * @param metricType Type of metric (count, sum, average)
 * @param dataSource Source of data (tickets, workdays, users)
 * @param filters Additional filters to apply
 * @returns Formatted metric data ready for rendering
 */
export async function fetchMetricData(
  metricType: 'count' | 'sum' | 'average', 
  dataSource: string, 
  filters?: Record<string, any>
): Promise<MetricData> {
  try {
    // Calculate current and previous period dates
    const today = new Date();
    let startDate, endDate, previousStartDate, previousEndDate;
    
    // Default to "today" if no period specified
    const period = filters?.trendPeriod || 'day';
    
    switch (period) {
      case 'day':
        endDate = format(today, 'yyyy-MM-dd');
        startDate = format(today, 'yyyy-MM-dd');
        previousEndDate = format(subDays(today, 1), 'yyyy-MM-dd');
        previousStartDate = format(subDays(today, 1), 'yyyy-MM-dd');
        break;
      case 'week':
        endDate = format(today, 'yyyy-MM-dd');
        startDate = format(subDays(today, 7), 'yyyy-MM-dd');
        previousEndDate = format(subDays(today, 8), 'yyyy-MM-dd');
        previousStartDate = format(subDays(today, 14), 'yyyy-MM-dd');
        break;
      case 'month':
        endDate = format(today, 'yyyy-MM-dd');
        startDate = format(subDays(today, 30), 'yyyy-MM-dd');
        previousEndDate = format(subDays(today, 31), 'yyyy-MM-dd');
        previousStartDate = format(subDays(today, 60), 'yyyy-MM-dd');
        break;
      default:
        endDate = format(today, 'yyyy-MM-dd');
        startDate = format(today, 'yyyy-MM-dd');
        previousEndDate = format(subDays(today, 1), 'yyyy-MM-dd');
        previousStartDate = format(subDays(today, 1), 'yyyy-MM-dd');
    }
    
    // Current period filters
    const currentFilters = {
      ...filters,
      startDate,
      endDate
    };
    
    // Previous period filters
    const previousFilters = {
      ...filters,
      startDate: previousStartDate,
      endDate: previousEndDate
    };
    
    // Fetch data for current and previous periods
    let currentValue = 0;
    let previousValue = 0;
    
    switch (dataSource) {
      case 'tickets':
        const currentTicketsResponse = await ticketService.getTickets(currentFilters);
        const previousTicketsResponse = await ticketService.getTickets(previousFilters);
        
        currentValue = calculateTicketMetric(currentTicketsResponse.tickets, metricType, filters);
        previousValue = calculateTicketMetric(previousTicketsResponse.tickets, metricType, filters);
        break;
        
      case 'workdays':
        const currentWorkdaysResponse = await workdayService.getWorkdays(currentFilters);
        const previousWorkdaysResponse = await workdayService.getWorkdays(previousFilters);
        
        currentValue = calculateWorkdayMetric(currentWorkdaysResponse.workdays, metricType, filters);
        previousValue = calculateWorkdayMetric(previousWorkdaysResponse.workdays, metricType, filters);
        break;
        
      case 'users':
        const currentUsers = await userService.getUsers(currentFilters);
        const previousUsers = await userService.getUsers(previousFilters);
        
        currentValue = calculateUserMetric(currentUsers, metricType, filters);
        previousValue = calculateUserMetric(previousUsers, metricType, filters);
        break;
        
      default:
        throw new Error(`Unknown data source: ${dataSource}`);
    }
    
    // Calculate percent change and trend
    let percentChange = null;
    let trend: 'up' | 'down' | 'stable' | null = null;
    
    if (previousValue !== 0) {
      percentChange = ((currentValue - previousValue) / previousValue) * 100;
      percentChange = parseFloat(percentChange.toFixed(1));
      
      if (percentChange > 1) {
        trend = 'up';
      } else if (percentChange < -1) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
    }
    
    // Format the value based on metric type
    let formattedValue: string | undefined;
    
    switch (metricType) {
      case 'count':
        formattedValue = currentValue.toLocaleString();
        break;
      case 'sum':
        formattedValue = `$${currentValue.toLocaleString()}`;
        break;
      case 'average':
        formattedValue = currentValue.toLocaleString(undefined, { 
          minimumFractionDigits: 1, 
          maximumFractionDigits: 1 
        });
        break;
    }
    
    return {
      value: currentValue,
      previousValue,
      percentChange,
      trend,
      lastUpdated: new Date(),
      formattedValue
    };
  } catch (error) {
    console.error(`Error fetching metric data: ${getErrorMessage(error)}`);
    // Return safe default values on error
    return {
      value: 0,
      previousValue: null,
      percentChange: null,
      trend: null,
      lastUpdated: new Date()
    };
  }
}

/**
 * Fetch table data for dashboard table cards
 * @param dataSource Source of data (tickets, workdays, users)
 * @param columns Column configuration
 * @param filters Additional filters including pagination and sorting
 * @returns Formatted table data ready for rendering
 */
export async function fetchTableData(
  dataSource: string,
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status';
  }>,
  filters?: Record<string, any>
): Promise<TableData> {
  try {
    // Set up filters with defaults
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 5;
    const sortBy = filters?.sortBy;
    const sortDirection = filters?.sortDirection || 'desc';
    
    const dataFilters = {
      ...filters,
      page,
      limit: pageSize,
      sortField: sortBy,
      sortDirection
    };
    
    // Fetch data based on data source
    switch (dataSource) {
      case 'tickets':
        const ticketsResponse = await ticketService.getTickets(dataFilters);
        
        // Transform tickets to table rows
        const ticketRows = ticketsResponse.tickets.map(ticket => {
          const row: Record<string, any> = {};
          
          // Map ticket properties to row properties based on columns
          columns.forEach(column => {
            if (column.key in ticket) {
              row[column.key] = ticket[column.key as keyof Ticket];
            } else if (column.key === 'date') {
              row[column.key] = ticket.date;
            } else if (column.key === 'status') {
              row[column.key] = ticket.archiveStatus;
            } else if (column.key === 'id') {
              row[column.key] = ticket.id;
            } else {
              row[column.key] = '-'; // Default value for unknown columns
            }
          });
          
          return row;
        });
        
        return {
          headers: columns,
          rows: ticketRows,
          total: ticketsResponse.total,
          page: ticketsResponse.page,
          pageSize: ticketsResponse.limit,
          totalPages: ticketsResponse.totalPages
        };
        
      case 'workdays':
        const workdaysResponse = await workdayService.getWorkdays(dataFilters);
        
        // Transform workdays to table rows
        const workdayRows = workdaysResponse.workdays.map(workday => {
          const row: Record<string, any> = {};
          
          // Map workday properties to row properties based on columns
          columns.forEach(column => {
            if (column.key in workday) {
              row[column.key] = workday[column.key as keyof typeof workday];
            } else {
              row[column.key] = '-'; // Default value for unknown columns
            }
          });
          
          return row;
        });
        
        return {
          headers: columns,
          rows: workdayRows,
          total: workdaysResponse.total,
          page: workdaysResponse.page,
          pageSize: workdaysResponse.limit,
          totalPages: workdaysResponse.totalPages
        };
        
      case 'users':
        const usersResponse = await userService.getUsers(dataFilters);
        
        // Transform users to table rows
        const userRows = usersResponse.users.map(user => {
          const row: Record<string, any> = {};
          
          // Map user properties to row properties based on columns
          columns.forEach(column => {
            if (column.key in user) {
              row[column.key] = user[column.key as keyof typeof user];
            } else {
              row[column.key] = '-'; // Default value for unknown columns
            }
          });
          
          return row;
        });
        
        return {
          headers: columns,
          rows: userRows,
          total: usersResponse.total,
          page: usersResponse.page,
          pageSize: usersResponse.pageSize,
          totalPages: usersResponse.totalPages
        };
        
      default:
        throw new Error(`Unknown data source: ${dataSource}`);
    }
  } catch (error) {
    console.error(`Error fetching table data: ${getErrorMessage(error)}`);
    // Return empty table structure on error
    return {
      headers: columns,
      rows: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    };
  }
}

/**
 * Fetch status data for dashboard status cards
 * @param systems Array of system configurations to check
 * @returns Formatted status data ready for rendering
 */
export async function fetchStatusData(
  systems: Array<{
    name: string;
    endpoint?: string;
  }>,
  showHistory: boolean = false
): Promise<StatusData> {
  try {
    // If endpoints are provided, fetch status from them
    const statusPromises = systems.map(async system => {
      if (system.endpoint) {
        try {
          // Try to fetch from the endpoint
          const response = await fetch(system.endpoint);
          
          if (response.ok) {
            return {
              name: system.name,
              status: 'operational' as const,
              lastChecked: new Date(),
              ...(showHistory && {
                history: [
                  { status: 'operational' as const, timestamp: new Date() }
                ]
              })
            };
          } else {
            return {
              name: system.name,
              status: 'degraded' as const,
              lastChecked: new Date(),
              ...(showHistory && {
                history: [
                  { status: 'degraded' as const, timestamp: new Date() }
                ]
              })
            };
          }
        } catch (error) {
          return {
            name: system.name,
            status: 'outage' as const,
            lastChecked: new Date(),
            ...(showHistory && {
              history: [
                { status: 'outage' as const, timestamp: new Date() }
              ]
            })
          };
        }
      } else {
        // For systems without endpoints, use mock status
        return getMockSystemStatus(system.name, showHistory);
      }
    });
    
    const systemStatuses = await Promise.all(statusPromises);
    
    return {
      systems: systemStatuses,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error(`Error fetching status data: ${getErrorMessage(error)}`);
    // Return mock status data on error
    return {
      systems: systems.map(system => getMockSystemStatus(system.name, showHistory)),
      lastUpdated: new Date()
    };
  }
}

/**
 * Fetch activity data for dashboard activity cards
 * @param activityTypes Types of activities to include
 * @param maxItems Maximum number of activities to return
 * @returns Formatted activity data ready for rendering
 */
export async function fetchActivityData(
  activityTypes: string[],
  maxItems: number = 10
): Promise<ActivityData> {
  try {
    // In a real implementation, this would fetch from an activity log collection
    // For now, generate mock activity data
    const mockActivities = generateMockActivityData(activityTypes, maxItems);
    
    return {
      items: mockActivities,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error(`Error fetching activity data: ${getErrorMessage(error)}`);
    // Return empty activity data on error
    return {
      items: [],
      lastUpdated: new Date()
    };
  }
}

/**
 * Transform tickets data to chart format
 * @param tickets Array of ticket objects
 * @param chartType Type of chart (line, bar, pie)
 * @param filters Additional configuration
 * @returns Formatted chart data
 */
function transformTicketsToChartData(
  tickets: Ticket[], 
  chartType: string, 
  filters?: Record<string, any>
): ChartData {
  // Default grouping by date if not specified
  const groupBy = filters?.groupBy || 'date';
  
  if (chartType === 'pie') {
    // For pie charts, group by category or jobsite
    const groupField = groupBy === 'category' ? 'category' : 
                        groupBy === 'jobsite' ? 'jobsiteName' : 
                        groupBy === 'truck' ? 'truckNickname' : 
                        'status';
    
    const groups: Record<string, number> = {};
    
    // Group tickets
    tickets.forEach(ticket => {
      let key: string;
      
      if (groupField === 'category') {
        // Flatten categories for pie chart
        if (ticket.hangers > 0) {
          groups['Hangers'] = (groups['Hangers'] || 0) + ticket.hangers;
        }
        if (ticket.leaner6To12 > 0) {
          groups['Leaner 6-12'] = (groups['Leaner 6-12'] || 0) + ticket.leaner6To12;
        }
        if (ticket.leaner13To24 > 0) {
          groups['Leaner 13-24'] = (groups['Leaner 13-24'] || 0) + ticket.leaner13To24;
        }
        if (ticket.leaner25To36 > 0) {
          groups['Leaner 25-36'] = (groups['Leaner 25-36'] || 0) + ticket.leaner25To36;
        }
        if (ticket.leaner37To48 > 0) {
          groups['Leaner 37-48'] = (groups['Leaner 37-48'] || 0) + ticket.leaner37To48;
        }
        if (ticket.leaner49Plus > 0) {
          groups['Leaner 49+'] = (groups['Leaner 49+'] || 0) + ticket.leaner49Plus;
        }
      } else if (groupField === 'status') {
        key = ticket.archiveStatus;
        groups[key] = (groups[key] || 0) + 1;
      } else {
        // For jobsite or truck
        key = ticket[groupField as keyof Ticket] as string;
        groups[key] = (groups[key] || 0) + 1;
      }
    });
    
    // Convert to chart data
    const labels = Object.keys(groups);
    const data = Object.values(groups);
    
    return {
      labels,
      datasets: [{
        label: 'Tickets',
        data,
        backgroundColor: CHART_BACKGROUND_COLORS.slice(0, labels.length)
      }]
    };
  } else {
    // For line/bar charts, group by time period
    const period = filters?.period || 'day';
    const aggregation = filters?.aggregation || 'count';
    
    // Group by time period
    const timeGroups: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      const date = ticket.date;
      let key: string;
      
      switch (period) {
        case 'day':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'week':
          // Use the week number as the key
          key = `Week ${format(date, 'w')}`;
          break;
        case 'month':
          key = format(date, 'yyyy-MM');
          break;
        default:
          key = format(date, 'yyyy-MM-dd');
      }
      
      // Aggregate based on configuration
      switch (aggregation) {
        case 'count':
          timeGroups[key] = (timeGroups[key] || 0) + 1;
          break;
        case 'total':
          timeGroups[key] = (timeGroups[key] || 0) + ticket.total;
          break;
        default:
          timeGroups[key] = (timeGroups[key] || 0) + 1;
      }
    });
    
    // Sort keys chronologically
    const sortedKeys = Object.keys(timeGroups).sort((a, b) => {
      if (period === 'week') {
        return parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]);
      }
      return a.localeCompare(b);
    });
    
    // Format labels based on period
    const labels = sortedKeys.map(key => {
      if (period === 'month') {
        // Format 'yyyy-MM' as 'Mon yyyy'
        const [year, month] = key.split('-');
        return format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMM yyyy');
      }
      return key;
    });
    
    const data = sortedKeys.map(key => timeGroups[key]);
    
    return {
      labels,
      datasets: [{
        label: aggregation === 'count' ? 'Number of Tickets' : 'Total Items',
        data,
        backgroundColor: chartType === 'bar' ? CHART_BACKGROUND_COLORS[0] : 'transparent',
        borderColor: CHART_COLORS.primary,
        borderWidth: 2
      }]
    };
  }
}

/**
 * Transform workdays data to chart format
 * @param workdays Array of workday objects
 * @param chartType Type of chart (line, bar, pie)
 * @param filters Additional configuration
 * @returns Formatted chart data
 */
function transformWorkdaysToChartData(
  workdays: any[], 
  chartType: string, 
  filters?: Record<string, any>
): ChartData {
  // Implementation similar to transformTicketsToChartData
  // Adapted for workday data structure
  
  // For now, return a basic chart structure
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{
      label: 'Workdays',
      data: [5, 8, 7, 9, 6],
      backgroundColor: CHART_BACKGROUND_COLORS[0],
      borderColor: CHART_COLORS.primary,
      borderWidth: 2
    }]
  };
}

/**
 * Transform users data to chart format
 * @param users Array of user objects
 * @param chartType Type of chart (line, bar, pie)
 * @param filters Additional configuration
 * @returns Formatted chart data
 */
function transformUsersToChartData(
  users: any[], 
  chartType: string, 
  filters?: Record<string, any>
): ChartData {
  // Implementation similar to transformTicketsToChartData
  // Adapted for user data structure
  
  // For now, return a basic chart structure
  return {
    labels: ['Admins', 'Employees'],
    datasets: [{
      label: 'Users by Role',
      data: [2, 10],
      backgroundColor: [CHART_BACKGROUND_COLORS[0], CHART_BACKGROUND_COLORS[1]],
      borderColor: CHART_COLORS.primary,
      borderWidth: 2
    }]
  };
}

/**
 * Calculate ticket metric
 * @param tickets Array of ticket objects
 * @param metricType Type of metric to calculate (count, sum, average)
 * @param filters Additional configuration
 * @returns Calculated metric value
 */
function calculateTicketMetric(
  tickets: Ticket[],
  metricType: string,
  filters?: Record<string, any>
): number {
  switch (metricType) {
    case 'count':
      return tickets.length;
      
    case 'sum':
      // Sum based on specified field or default to total
      const sumField = filters?.field || 'total';
      return tickets.reduce((sum, ticket) => {
        const value = ticket[sumField as keyof Ticket];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
      
    case 'average':
      // Average based on specified field or default to total
      const avgField = filters?.field || 'total';
      if (tickets.length === 0) return 0;
      
      const total = tickets.reduce((sum, ticket) => {
        const value = ticket[avgField as keyof Ticket];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
      
      return parseFloat((total / tickets.length).toFixed(1));
      
    default:
      return tickets.length;
  }
}

/**
 * Calculate workday metric
 * @param workdays Array of workday objects
 * @param metricType Type of metric to calculate (count, sum, average)
 * @param filters Additional configuration
 * @returns Calculated metric value
 */
function calculateWorkdayMetric(
  workdays: any[],
  metricType: string,
  filters?: Record<string, any>
): number {
  // Implementation similar to calculateTicketMetric
  // Adapted for workday data structure
  
  // For now, return mock values
  switch (metricType) {
    case 'count':
      return workdays.length;
    case 'sum':
      return 160; // Example: total hours
    case 'average':
      return 8.5; // Example: average hours per day
    default:
      return workdays.length;
  }
}

/**
 * Calculate user metric
 * @param users Array of user objects
 * @param metricType Type of metric to calculate (count, sum, average)
 * @param filters Additional configuration
 * @returns Calculated metric value
 */
function calculateUserMetric(
  users: any[],
  metricType: string,
  filters?: Record<string, any>
): number {
  // Implementation similar to calculateTicketMetric
  // Adapted for user data structure
  
  // For now, return mock values
  switch (metricType) {
    case 'count':
      return users.length;
    case 'sum':
      return 250; // Example: total tickets submitted
    case 'average':
      return 25; // Example: average tickets per user
    default:
      return users.length;
  }
}

/**
 * Generate mock system status for testing
 * @param systemName Name of the system
 * @param includeHistory Whether to include status history
 * @returns Mock system status object
 */
function getMockSystemStatus(
  systemName: string,
  includeHistory: boolean = false
): {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  lastChecked: Date;
  history?: {
    status: 'operational' | 'degraded' | 'outage';
    timestamp: Date;
  }[];
} {
  // Generate a random status weighted toward operational
  const random = Math.random();
  let status: 'operational' | 'degraded' | 'outage';
  
  if (random < 0.8) {
    status = 'operational';
  } else if (random < 0.95) {
    status = 'degraded';
  } else {
    status = 'outage';
  }
  
  // Generate mock history if requested
  const history = includeHistory ? [
    { status, timestamp: new Date() },
    { status: 'operational', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }, // 2 hours ago
    { status: 'operational', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) } // 1 day ago
  ] : undefined;
  
  return {
    name: systemName,
    status,
    lastChecked: new Date(),
    ...(includeHistory && { history })
  };
}

/**
 * Generate mock activity data for testing
 * @param activityTypes Types of activities to include
 * @param maxItems Maximum number of items to generate
 * @returns Array of mock activity items
 */
function generateMockActivityData(
  activityTypes: string[],
  maxItems: number = 10
): Array<{
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
  };
}> {
  // Activity templates by type
  const activityTemplates: Record<string, Array<{ message: string, needsUser: boolean }>> = {
    'login': [
      { message: 'Logged in successfully', needsUser: true },
      { message: 'Logged in from new device', needsUser: true }
    ],
    'logout': [
      { message: 'Logged out', needsUser: true },
      { message: 'Session expired', needsUser: true }
    ],
    'ticket-created': [
      { message: 'Created new ticket for {jobsite}', needsUser: true },
      { message: 'Submitted ticket #{id} with {total} items', needsUser: true }
    ],
    'ticket-updated': [
      { message: 'Updated ticket #{id}', needsUser: true },
      { message: 'Modified items for ticket #{id}', needsUser: true },
      { message: 'Added images to ticket #{id}', needsUser: true }
    ],
    'user': [
      { message: 'Added new user {name}', needsUser: true },
      { message: 'Updated user profile', needsUser: true },
      { message: 'Changed password', needsUser: true }
    ],
    'workday-logged': [
      { message: 'Logged workday for {date}', needsUser: true },
      { message: 'Submitted timesheet for {date}', needsUser: true }
    ],
    'system': [
      { message: 'System backup completed', needsUser: false },
      { message: 'Maintenance scheduled for {date}', needsUser: false },
      { message: 'New version deployed', needsUser: false }
    ]
  };
  
  // Filter to only requested activity types
  const validTypes = activityTypes.filter(type => type in activityTemplates);
  
  // If no valid types, use all types
  const typesToUse = validTypes.length > 0 ? validTypes : Object.keys(activityTemplates);
  
  // Mock user data
  const users = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Mike Johnson' },
    { id: 'admin1', name: 'Admin User' }
  ];
  
  // Generate activities
  const activities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    user?: {
      id: string;
      name: string;
    };
  }> = [];
  
  // Calculate how many items to generate (up to maxItems)
  const itemsToGenerate = Math.min(maxItems, 30);
  
  for (let i = 0; i < itemsToGenerate; i++) {
    // Select random activity type from the filtered list
    const type = typesToUse[Math.floor(Math.random() * typesToUse.length)];
    
    // Select random template for this type
    const templates = activityTemplates[type];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Create timestamp (random time in the last 7 days)
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    
    // Process template to replace placeholders
    let message = template.message;
    
    // Replace {jobsite} placeholder
    if (message.includes('{jobsite}')) {
      const jobsites = ['Downtown HQ', 'North Campus', 'East Building', 'West Facility'];
      message = message.replace('{jobsite}', jobsites[Math.floor(Math.random() * jobsites.length)]);
    }
    
    // Replace {id} placeholder
    if (message.includes('{id}')) {
      message = message.replace('{id}', Math.floor(Math.random() * 1000).toString());
    }
    
    // Replace {total} placeholder
    if (message.includes('{total}')) {
      message = message.replace('{total}', Math.floor(Math.random() * 100).toString());
    }
    
    // Replace {date} placeholder
    if (message.includes('{date}')) {
      message = message.replace('{date}', format(new Date(timestamp), 'MMM d, yyyy'));
    }
    
    // Replace {name} placeholder
    if (message.includes('{name}')) {
      message = message.replace('{name}', users[Math.floor(Math.random() * users.length)].name);
    }
    
    // Create activity object
    const activity: {
      id: string;
      type: string;
      message: string;
      timestamp: Date;
      user?: {
        id: string;
        name: string;
      };
    } = {
      id: `activity-${i + 1}`,
      type,
      message,
      timestamp
    };
    
    // Add user if needed
    if (template.needsUser) {
      const user = users[Math.floor(Math.random() * users.length)];
      activity.user = {
        id: user.id,
        name: user.name
      };
    }
    
    activities.push(activity);
  }
  
  // Sort by timestamp (newest first)
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Return up to maxItems
  return activities.slice(0, maxItems);
}

const dashboardService = {
  fetchChartData,
  fetchMetricData,
  fetchTableData,
  fetchStatusData,
  fetchActivityData
};

export default dashboardService;