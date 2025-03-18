/**
 * CardConfigPanel.client.tsx
 * Configuration panel for dashboard cards
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Card configuration panel"
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  CardConfig, 
  CardType, 
  CardSize, 
  ChartType, 
  MetricType,
  ChartCardConfig,
  MetricCardConfig,
  TableCardConfig,
  StatusCardConfig,
  ActivityCardConfig
} from '@/stores/dashboardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CardConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardConfig;
  onSave: (config: CardConfig) => void;
}

/**
 * Configuration panel for dashboard cards
 * Provides a dynamic form interface for configuring different types of dashboard cards
 */
const CardConfigPanel = ({
  isOpen,
  onClose,
  config,
  onSave
}: CardConfigPanelProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentConfig, setCurrentConfig] = useState<CardConfig>(config);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('general');
  
  // Reset form when config changes
  useEffect(() => {
    if (isOpen) {
      setCurrentConfig(config);
      setErrors({});
      setActiveTab('general');
    }
  }, [isOpen, config]);
  
  // Handle input change for general fields
  const handleInputChange = (field: string, value: any) => {
    setCurrentConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle nested object changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setCurrentConfig(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CardConfig],
        [field]: value
      }
    }));
    
    // Clear error for this field if it exists
    const errorKey = `${parent}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };
  
  // Handle array item changes
  const handleArrayItemChange = (arrayName: string, index: number, field: string, value: any) => {
    setCurrentConfig(prev => {
      const array = [...(prev[arrayName as keyof CardConfig] as any[])];
      array[index] = { ...array[index], [field]: value };
      return { ...prev, [arrayName]: array };
    });
  };
  
  // Add array item
  const handleAddArrayItem = (arrayName: string, newItem: any) => {
    setCurrentConfig(prev => {
      const array = [...(prev[arrayName as keyof CardConfig] as any[] || [])];
      array.push(newItem);
      return { ...prev, [arrayName]: array };
    });
  };
  
  // Remove array item
  const handleRemoveArrayItem = (arrayName: string, index: number) => {
    setCurrentConfig(prev => {
      const array = [...(prev[arrayName as keyof CardConfig] as any[])];
      array.splice(index, 1);
      return { ...prev, [arrayName]: array };
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation for all card types
    if (!currentConfig.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Type-specific validation
    if (currentConfig.type === 'chart') {
      const chartConfig = currentConfig as ChartCardConfig;
      if (!chartConfig.chartType) {
        newErrors.chartType = 'Chart type is required';
      }
      if (!chartConfig.dataSource) {
        newErrors.dataSource = 'Data source is required';
      }
    }
    
    if (currentConfig.type === 'metric') {
      const metricConfig = currentConfig as MetricCardConfig;
      if (!metricConfig.metricType) {
        newErrors.metricType = 'Metric type is required';
      }
      if (!metricConfig.dataSource) {
        newErrors.dataSource = 'Data source is required';
      }
    }
    
    if (currentConfig.type === 'table') {
      const tableConfig = currentConfig as TableCardConfig;
      if (!tableConfig.dataSource) {
        newErrors.dataSource = 'Data source is required';
      }
      if (!tableConfig.columns || tableConfig.columns.length === 0) {
        newErrors.columns = 'At least one column is required';
      }
    }
    
    if (currentConfig.type === 'status') {
      const statusConfig = currentConfig as StatusCardConfig;
      if (!statusConfig.systems || statusConfig.systems.length === 0) {
        newErrors.systems = 'At least one system is required';
      }
    }
    
    if (currentConfig.type === 'activity') {
      const activityConfig = currentConfig as ActivityCardConfig;
      if (!activityConfig.activityTypes || activityConfig.activityTypes.length === 0) {
        newErrors.activityTypes = 'At least one activity type is required';
      }
      if (!activityConfig.maxItems || activityConfig.maxItems <= 0) {
        newErrors.maxItems = 'Max items must be greater than 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      onSave(currentConfig);
      onClose();
    }
  };
  
  // Animation variants
  const panelVariants = {
    hidden: { 
      opacity: 0, 
      x: '100%',
      transition: { duration: prefersReducedMotion ? 0.1 : 0.3 }
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.3 }
    }
  };
  
  // Render general configuration fields
  const renderGeneralFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Card Title</Label>
        <Input
          id="title"
          value={currentConfig.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="size">Card Size</Label>
        <Select
          id="size"
          value={currentConfig.size}
          onValueChange={(value) => handleInputChange('size', value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
        <Input
          id="refreshInterval"
          type="number"
          min="0"
          value={currentConfig.refreshInterval || 0}
          onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value) || 0)}
        />
        <p className="text-xs text-gray-500 mt-1">Set to 0 for no auto-refresh</p>
      </div>
    </div>
  );
  
  // Render chart configuration fields
  const renderChartFields = () => {
    const chartConfig = currentConfig as ChartCardConfig;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="chartType">Chart Type</Label>
          <Select
            id="chartType"
            value={chartConfig.chartType || ''}
            onValueChange={(value) => handleInputChange('chartType', value)}
            className={errors.chartType ? 'border-red-500' : ''}
          >
            <option value="">Select chart type</option>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </Select>
          {errors.chartType && (
            <p className="mt-1 text-sm text-red-500">{errors.chartType}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="dataSource">Data Source</Label>
          <Select
            id="dataSource"
            value={chartConfig.dataSource || ''}
            onValueChange={(value) => handleInputChange('dataSource', value)}
            className={errors.dataSource ? 'border-red-500' : ''}
          >
            <option value="">Select data source</option>
            <option value="tickets">Tickets</option>
            <option value="workdays">Workdays</option>
            <option value="users">Users</option>
          </Select>
          {errors.dataSource && (
            <p className="mt-1 text-sm text-red-500">{errors.dataSource}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="dateRange">Date Range</Label>
          <div className="grid grid-cols-2 gap-2 w-full">
            <div>
              <Label htmlFor="dateRangeStart" className="text-xs">Start</Label>
              <Input
                id="dateRangeStart"
                type="date"
                value={chartConfig.dateRange?.start || ''}
                onChange={(e) => handleNestedChange('dateRange', 'start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateRangeEnd" className="text-xs">End</Label>
              <Input
                id="dateRangeEnd"
                type="date"
                value={chartConfig.dateRange?.end || ''}
                onChange={(e) => handleNestedChange('dateRange', 'end', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render metric configuration fields
  const renderMetricFields = () => {
    const metricConfig = currentConfig as MetricCardConfig;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="metricType">Metric Type</Label>
          <Select
            id="metricType"
            value={metricConfig.metricType || ''}
            onValueChange={(value) => handleInputChange('metricType', value)}
            className={errors.metricType ? 'border-red-500' : ''}
          >
            <option value="">Select metric type</option>
            <option value="count">Count</option>
            <option value="sum">Sum</option>
            <option value="average">Average</option>
          </Select>
          {errors.metricType && (
            <p className="mt-1 text-sm text-red-500">{errors.metricType}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="dataSource">Data Source</Label>
          <Select
            id="dataSource"
            value={metricConfig.dataSource || ''}
            onValueChange={(value) => handleInputChange('dataSource', value)}
            className={errors.dataSource ? 'border-red-500' : ''}
          >
            <option value="">Select data source</option>
            <option value="tickets">Tickets</option>
            <option value="workdays">Workdays</option>
            <option value="users">Users</option>
          </Select>
          {errors.dataSource && (
            <p className="mt-1 text-sm text-red-500">{errors.dataSource}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="showTrend"
            checked={metricConfig.showTrend || false}
            onCheckedChange={(checked) => handleInputChange('showTrend', checked)}
          />
          <Label htmlFor="showTrend">Show Trend</Label>
        </div>
        
        {metricConfig.showTrend && (
          <div>
            <Label htmlFor="trendPeriod">Trend Period</Label>
            <Select
              id="trendPeriod"
              value={metricConfig.trendPeriod || 'day'}
              onValueChange={(value) => handleInputChange('trendPeriod', value)}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
          </div>
        )}
        
        <div>
          <Label htmlFor="format">Display Format</Label>
          <Input
            id="format"
            value={metricConfig.format || ''}
            onChange={(e) => handleInputChange('format', e.target.value)}
            placeholder="e.g., $#,###.## or #,###"
          />
        </div>
      </div>
    );
  };
  
  // Render table configuration fields
  const renderTableFields = () => {
    const tableConfig = currentConfig as TableCardConfig;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="dataSource">Data Source</Label>
          <Select
            id="dataSource"
            value={tableConfig.dataSource || ''}
            onValueChange={(value) => handleInputChange('dataSource', value)}
            className={errors.dataSource ? 'border-red-500' : ''}
          >
            <option value="">Select data source</option>
            <option value="tickets">Tickets</option>
            <option value="workdays">Workdays</option>
            <option value="users">Users</option>
          </Select>
          {errors.dataSource && (
            <p className="mt-1 text-sm text-red-500">{errors.dataSource}</p>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Columns</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddArrayItem('columns', { key: '', label: '', type: 'text' })}
            >
              Add Column
            </Button>
          </div>
          
          {errors.columns && (
            <p className="mt-1 text-sm text-red-500 mb-2">{errors.columns}</p>
          )}
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tableConfig.columns?.map((column, index) => (
              <Card key={index} className="p-2">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <div>
                      <Label htmlFor={`column-key-${index}`} className="text-xs">Key</Label>
                      <Input
                        id={`column-key-${index}`}
                        value={column.key}
                        onChange={(e) => handleArrayItemChange('columns', index, 'key', e.target.value)}
                        placeholder="Field key"
                        size="sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`column-label-${index}`} className="text-xs">Label</Label>
                      <Input
                        id={`column-label-${index}`}
                        value={column.label}
                        onChange={(e) => handleArrayItemChange('columns', index, 'label', e.target.value)}
                        placeholder="Display label"
                        size="sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`column-type-${index}`} className="text-xs">Type</Label>
                      <Select
                        id={`column-type-${index}`}
                        value={column.type || 'text'}
                        onValueChange={(value) => handleArrayItemChange('columns', index, 'type', value)}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="status">Status</option>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={() => handleRemoveArrayItem('columns', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              id="sortBy"
              value={tableConfig.sortBy || ''}
              onValueChange={(value) => handleInputChange('sortBy', value)}
            >
              <option value="">None</option>
              {tableConfig.columns?.map((column) => (
                <option key={column.key} value={column.key}>{column.label}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sortDirection">Sort Direction</Label>
            <Select
              id="sortDirection"
              value={tableConfig.sortDirection || 'asc'}
              onValueChange={(value) => handleInputChange('sortDirection', value)}
              disabled={!tableConfig.sortBy}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="pageSize">Page Size</Label>
          <Input
            id="pageSize"
            type="number"
            min="1"
            value={tableConfig.pageSize || 5}
            onChange={(e) => handleInputChange('pageSize', parseInt(e.target.value) || 5)}
          />
        </div>
      </div>
    );
  };
  
  // Render status configuration fields
  const renderStatusFields = () => {
    const statusConfig = currentConfig as StatusCardConfig;
    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Systems to Monitor</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddArrayItem('systems', { name: '', endpoint: '' })}
            >
              Add System
            </Button>
          </div>
          
          {errors.systems && (
            <p className="mt-1 text-sm text-red-500 mb-2">{errors.systems}</p>
          )}
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {statusConfig.systems?.map((system, index) => (
              <Card key={index} className="p-2">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div>
                      <Label htmlFor={`system-name-${index}`} className="text-xs">Name</Label>
                      <Input
                        id={`system-name-${index}`}
                        value={system.name}
                        onChange={(e) => handleArrayItemChange('systems', index, 'name', e.target.value)}
                        placeholder="System name"
                        size="sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`system-endpoint-${index}`} className="text-xs">Endpoint</Label>
                      <Input
                        id={`system-endpoint-${index}`}
                        value={system.endpoint || ''}
                        onChange={(e) => handleArrayItemChange('systems', index, 'endpoint', e.target.value)}
                        placeholder="/api/health/system"
                        size="sm"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={() => handleRemoveArrayItem('systems', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="showHistory"
            checked={statusConfig.showHistory || false}
            onCheckedChange={(checked) => handleInputChange('showHistory', checked)}
          />
          <Label htmlFor="showHistory">Show Status History</Label>
        </div>
      </div>
    );
  };
  
  // Render activity configuration fields
  const renderActivityFields = () => {
    const activityConfig = currentConfig as ActivityCardConfig;
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="activityTypes">Activity Types</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['login', 'logout', 'ticket-created', 'ticket-updated', 'workday-logged'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`activity-type-${type}`}
                  checked={(activityConfig.activityTypes || []).includes(type)}
                  onChange={(e) => {
                    const types = [...(activityConfig.activityTypes || [])];
                    if (e.target.checked) {
                      if (!types.includes(type)) {
                        types.push(type);
                      }
                    } else {
                      const index = types.indexOf(type);
                      if (index !== -1) {
                        types.splice(index, 1);
                      }
                    }
                    handleInputChange('activityTypes', types);
                  }}
                  className="rounded"
                />
                <Label htmlFor={`activity-type-${type}`} className="text-sm">
                  {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
          {errors.activityTypes && (
            <p className="mt-1 text-sm text-red-500">{errors.activityTypes}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="maxItems">Maximum Items</Label>
          <Input
            id="maxItems"
            type="number"
            min="1"
            value={activityConfig.maxItems || 5}
            onChange={(e) => handleInputChange('maxItems', parseInt(e.target.value) || 5)}
            className={errors.maxItems ? 'border-red-500' : ''}
          />
          {errors.maxItems && (
            <p className="mt-1 text-sm text-red-500">{errors.maxItems}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="showUser"
            checked={activityConfig.showUser || false}
            onCheckedChange={(checked) => handleInputChange('showUser', checked)}
          />
          <Label htmlFor="showUser">Show User Information</Label>
        </div>
      </div>
    );
  };
  
  // Render type-specific fields based on card type
  const renderTypeSpecificFields = () => {
    switch (currentConfig.type) {
      case 'chart':
        return renderChartFields();
      case 'metric':
        return renderMetricFields();
      case 'table':
        return renderTableFields();
      case 'status':
        return renderStatusFields();
      case 'activity':
        return renderActivityFields();
      default:
        return null;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-lg z-50 overflow-y-auto"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={panelVariants}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Configure Card</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="specific" className="flex-1">
              {currentConfig.type.charAt(0).toUpperCase() + currentConfig.type.slice(1)} Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            {renderGeneralFields()}
          </TabsContent>
          
          <TabsContent value="specific" className="space-y-4">
            {renderTypeSpecificFields()}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CardConfigPanel;
