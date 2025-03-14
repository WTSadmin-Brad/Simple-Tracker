/**
 * ChartCard.client.tsx
 * Chart visualization card for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Chart visualization card"
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from '../DashboardCard.client';
import { CardSize } from '../DashboardCard.client';

// Chart data type
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

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
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Fetch chart data
  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on chart type
      let mockData: ChartData;
      
      switch (chartType) {
        case 'line':
          mockData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Tickets',
                data: [12, 19, 3, 5, 2, 3].map(() => Math.floor(Math.random() * 100)),
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2
              }
            ]
          };
          break;
          
        case 'bar':
          mockData = {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [
              {
                label: 'Categories',
                data: [12, 19, 3, 5, 2, 3].map(() => Math.floor(Math.random() * 100)),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
              }
            ]
          };
          break;
          
        case 'pie':
          mockData = {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
            datasets: [
              {
                label: 'Dataset 1',
                data: [300, 50, 100, 75, 125].map(() => Math.floor(Math.random() * 100)),
                backgroundColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 205, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(153, 102, 255)'
                ]
              }
            ]
          };
          break;
          
        default:
          mockData = {
            labels: [],
            datasets: []
          };
      }
      
      setChartData(mockData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load chart data');
      console.error('Error fetching chart data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchChartData();
  }, [chartType, dataSource, JSON.stringify(filters)]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchChartData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, chartType, dataSource, JSON.stringify(filters)]);
  
  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString();
  };
  
  // Render chart visualization
  const renderChart = () => {
    if (!chartData) return null;
    
    // Get chart dimensions based on card size
    const chartHeight = size === 'small' ? 150 : size === 'large' ? 300 : 200;
    
    // Create a simulated chart visualization
    return (
      <div className="w-full" style={{ height: `${chartHeight}px` }}>
        {chartType === 'line' && (
          <LineChartPlaceholder data={chartData} height={chartHeight} />
        )}
        
        {chartType === 'bar' && (
          <BarChartPlaceholder data={chartData} height={chartHeight} />
        )}
        
        {chartType === 'pie' && (
          <PieChartPlaceholder data={chartData} height={chartHeight} />
        )}
      </div>
    );
  };
  
  // Line chart placeholder
  const LineChartPlaceholder = ({ data, height }: { data: ChartData, height: number }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const points = data.datasets[0].data.map((value, index) => {
      const x = (index / (data.labels.length - 1)) * 100;
      const y = 100 - ((value / maxValue) * 80);
      return `${x}%,${y}%`;
    }).join(' ');
    
    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-grow relative">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value, i) => (
              <line 
                key={i}
                x1="0%" 
                y1={`${100 - value * 0.8}%`} 
                x2="100%" 
                y2={`${100 - value * 0.8}%`} 
                stroke="rgba(156, 163, 175, 0.2)" 
                strokeWidth="1"
              />
            ))}
            
            {/* Line */}
            <polyline
              fill="none"
              stroke="rgb(75, 192, 192)"
              strokeWidth="2"
              points={points}
            />
            
            {/* Data points */}
            {data.datasets[0].data.map((value, index) => {
              const x = (index / (data.labels.length - 1)) * 100;
              const y = 100 - ((value / maxValue) * 80);
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="white"
                  stroke="rgb(75, 192, 192)"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-2 text-xs text-gray-500">
          {data.labels.map((label, index) => (
            <div key={index}>{label}</div>
          ))}
        </div>
      </div>
    );
  };
  
  // Bar chart placeholder
  const BarChartPlaceholder = ({ data, height }: { data: ChartData, height: number }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const barWidth = 100 / data.labels.length;
    
    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="flex-grow relative">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value, i) => (
              <line 
                key={i}
                x1="0%" 
                y1={`${100 - value * 0.8}%`} 
                x2="100%" 
                y2={`${100 - value * 0.8}%`} 
                stroke="rgba(156, 163, 175, 0.2)" 
                strokeWidth="1"
              />
            ))}
            
            {/* Bars */}
            {data.datasets[0].data.map((value, index) => {
              const barHeight = (value / maxValue) * 80;
              const backgroundColor = Array.isArray(data.datasets[0].backgroundColor) 
                ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
                : data.datasets[0].backgroundColor || 'rgba(75, 192, 192, 0.7)';
              
              return (
                <rect
                  key={index}
                  x={`${index * barWidth + barWidth * 0.1}%`}
                  y={`${100 - barHeight}%`}
                  width={`${barWidth * 0.8}%`}
                  height={`${barHeight}%`}
                  fill={backgroundColor}
                  rx="2"
                  ry="2"
                />
              );
            })}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-2 text-xs text-gray-500">
          {data.labels.map((label, index) => (
            <div key={index}>{label}</div>
          ))}
        </div>
      </div>
    );
  };
  
  // Pie chart placeholder
  const PieChartPlaceholder = ({ data, height }: { data: ChartData, height: number }) => {
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <svg width={height} height={height} viewBox="0 0 100 100">
          {data.datasets[0].data.map((value, index) => {
            const backgroundColor = Array.isArray(data.datasets[0].backgroundColor) 
              ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
              : data.datasets[0].backgroundColor || 'rgba(75, 192, 192, 0.7)';
            
            const angle = (value / total) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // Calculate start and end points
            const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
            const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
            
            currentAngle += angle;
            
            const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
            const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
            
            const path = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
            
            return (
              <path
                key={index}
                d={path}
                fill={backgroundColor}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
          {data.labels.map((label, index) => {
            const backgroundColor = Array.isArray(data.datasets[0].backgroundColor) 
              ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
              : data.datasets[0].backgroundColor || 'rgba(75, 192, 192, 0.7)';
            
            return (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 mr-1 rounded-sm" 
                  style={{ backgroundColor }}
                />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <div className="text-4xl mb-2">⚠️</div>
          <div>{error}</div>
          <Button 
            onClick={fetchChartData}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
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
      onClick={fetchChartData}
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
      className="chart-card"
    >
      <div className="h-full flex flex-col">
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : (
          <>
            <div className="flex-grow">
              {renderChart()}
            </div>
            <div className="text-xs text-gray-500 mt-2 text-right">
              Last updated: {formatLastUpdated()}
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default ChartCard;
