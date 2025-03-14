/**
 * ActionBar.client.tsx
 * Action bar component for admin data management pages
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

// Action type
export interface Action {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  requiresSelection?: boolean;
  confirmationRequired?: boolean;
  confirmationMessage?: string;
}

// Action bar props
export interface ActionBarProps {
  actions: Action[];
  selectedCount?: number;
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

/**
 * Action bar component for admin data management pages
 * 
 * TODO: Implement the following features:
 * - Action buttons with icons
 * - Confirmation dialogs for destructive actions
 * - Disabled state for actions requiring selection
 * - Floating action bar for mobile
 */
export function ActionBar({
  actions,
  selectedCount = 0,
  position = 'top',
  className = ''
}: ActionBarProps) {
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);
  
  // Get button variant class
  const getVariantClass = (variant: Action['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white';
      case 'secondary':
        return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
    }
  };
  
  // Handle action click
  const handleActionClick = (action: Action) => {
    if (action.confirmationRequired) {
      setConfirmAction(action);
    } else {
      action.onClick();
    }
  };
  
  // Handle confirmation
  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onClick();
      setConfirmAction(null);
    }
  };
  
  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setConfirmAction(null);
  };
  
  // Get position class
  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'border-b border-gray-200 dark:border-gray-700';
      case 'bottom':
        return 'border-t border-gray-200 dark:border-gray-700';
      case 'floating':
        return 'fixed bottom-4 right-4 left-4 sm:left-auto rounded-lg shadow-lg z-10';
      default:
        return '';
    }
  };
  
  return (
    <>
      <div className={`bg-white dark:bg-gray-800 px-4 py-3 ${getPositionClass()} ${className}`}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selected count */}
          {selectedCount > 0 && (
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
          
          {/* Action buttons */}
          {actions.map(action => {
            const isDisabled = action.disabled || (action.requiresSelection && selectedCount === 0);
            
            return (
              <button
                key={action.id}
                type="button"
                className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md ${
                  getVariantClass(action.variant)
                } ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !isDisabled && handleActionClick(action)}
                disabled={isDisabled}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Confirm {confirmAction.label}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {confirmAction.confirmationMessage || `Are you sure you want to ${confirmAction.label.toLowerCase()}? This action cannot be undone.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${
                    confirmAction.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelConfirm}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}

export default ActionBar;
