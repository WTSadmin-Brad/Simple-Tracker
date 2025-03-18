/**
 * DetailPanel.client.tsx
 * Detail panel component for admin data management pages
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Field definition type
export interface DetailField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'image' | 'status' | 'list' | 'link' | 'custom';
  renderValue?: (value: any) => React.ReactNode;
}

// Tab definition type
export interface DetailTab {
  id: string;
  label: string;
  fields: DetailField[];
}

// Detail panel props
export interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
  tabs?: DetailTab[];
  fields?: DetailField[];
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Detail panel component for admin data management pages
 * 
 * TODO: Implement the following features:
 * - Sliding panel animation
 * - Tabs for different sections
 * - Field rendering based on type
 * - Loading and error states
 * - Action buttons
 */
export function DetailPanel({
  isOpen,
  onClose,
  title,
  data,
  tabs,
  fields,
  actions,
  isLoading = false,
  error = null,
  onEdit,
  onDelete
}: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>(tabs && tabs.length > 0 ? tabs[0].id : null);
  
  // Reset active tab when data changes
  useEffect(() => {
    if (tabs && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [data, tabs]);
  
  // Render field value based on type
  const renderFieldValue = (field: DetailField, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-gray-400 dark:text-gray-500">Not available</span>;
    }
    
    if (field.renderValue) {
      return field.renderValue(value);
    }
    
    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleString();
        
      case 'image':
        return (
          <img
            src={value}
            alt={field.label}
            className="h-20 w-20 object-cover rounded-md"
          />
        );
        
      case 'status':
        let statusColor = '';
        switch (String(value).toLowerCase()) {
          case 'active':
          case 'completed':
          case 'approved':
            statusColor = 'bg-green-100 text-green-800';
            break;
          case 'pending':
          case 'in progress':
            statusColor = 'bg-yellow-100 text-yellow-800';
            break;
          case 'inactive':
          case 'rejected':
          case 'failed':
            statusColor = 'bg-red-100 text-red-800';
            break;
          default:
            statusColor = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {value}
          </span>
        );
        
      case 'list':
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-gray-400 dark:text-gray-500">None</span>;
        }
        
        return (
          <ul className="list-disc list-inside text-sm">
            {value.map((item, index) => (
              <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
            ))}
          </ul>
        );
        
      case 'link':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {value}
          </a>
        );
        
      default:
        return String(value);
    }
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <div className="text-lg mb-2">Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  };
  
  // Render fields
  const renderFields = (fieldsToRender: DetailField[]) => {
    return (
      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        {fieldsToRender.map(field => (
          <div key={field.key} className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
              {data ? renderFieldValue(field, data[field.key]) : null}
            </dd>
          </div>
        ))}
      </dl>
    );
  };
  
  // Render content
  const renderContent = () => {
    if (isLoading) {
      return renderLoading();
    }
    
    if (error) {
      return renderError();
    }
    
    if (!data) {
      return (
        <div className="text-center text-gray-500 py-8">
          No data available
        </div>
      );
    }
    
    if (tabs && tabs.length > 0) {
      const activeTabData = tabs.find(tab => tab.id === activeTab);
      
      return (
        <div>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="py-6">
            {activeTabData && renderFields(activeTabData.fields)}
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-6">
        {fields && renderFields(fields)}
      </div>
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <motion.div
            className="relative w-screen max-w-md"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="bg-white dark:bg-gray-800 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close panel</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Actions */}
                {(onEdit || onDelete || actions) && (
                  <div className="mt-4 flex space-x-2">
                    {onEdit && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={onEdit}
                      >
                        Edit
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={onDelete}
                      >
                        Delete
                      </button>
                    )}
                    
                    {actions}
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default DetailPanel;
