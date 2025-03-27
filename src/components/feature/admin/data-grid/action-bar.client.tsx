/**
 * Action Bar Component
 * 
 * Client component for data grid action controls.
 * Provides buttons for creating, editing, deleting, and other actions.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button.client';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.client';
import { cn } from '@/lib/utils';
import { PlusIcon, PencilIcon, TrashIcon, DownloadIcon, RefreshIcon, AlertCircleIcon } from 'lucide-react';

export type ActionType = 'create' | 'edit' | 'delete' | 'export' | 'refresh' | 'custom';

export interface Action {
  type: ActionType;
  id?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  requiresSelection?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary' | 'danger' | 'success' | 'warning';
  className?: string;
  isLoading?: boolean;
  confirmationRequired?: boolean;
  confirmationMessage?: string;
  confirmationTitle?: string;
}

interface ActionBarProps {
  actions: Action[];
  selectedCount?: number;
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

/**
 * ActionBar component
 * Displays action buttons for data grid operations
 */
export default function ActionBar({ actions, selectedCount = 0, position = 'top', className }: ActionBarProps) {
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);

  // Memoize the default icons for better performance
  const defaultIcons = useMemo(() => ({
    create: <PlusIcon className="h-4 w-4 mr-2" />,
    edit: <PencilIcon className="h-4 w-4 mr-2" />,
    delete: <TrashIcon className="h-4 w-4 mr-2" />,
    export: <DownloadIcon className="h-4 w-4 mr-2" />,
    refresh: <RefreshIcon className="h-4 w-4 mr-2" />,
    custom: null
  }), []);

  // Memoize the default variants for better performance
  const defaultVariants = useMemo(() => ({
    create: 'default',
    edit: 'outline',
    delete: 'destructive',
    export: 'outline',
    refresh: 'outline',
    custom: 'outline'
  }), []);

  // Handle confirmation
  const handleConfirm = useCallback(() => {
    if (confirmAction) {
      confirmAction.onClick();
      setConfirmAction(null);
    }
  }, [confirmAction]);

  // Handle cancel confirmation
  const handleCancelConfirm = useCallback(() => {
    setConfirmAction(null);
  }, []);

  // Get position class
  const getPositionClass = useCallback(() => {
    switch (position) {
      case 'floating':
        return 'fixed bottom-4 right-4 shadow-lg z-50';
      case 'bottom':
        return 'border-t mt-4';
      default:
        return '';
    }
  }, [position]);

  // Memoize the selection text for better performance
  const selectionText = useMemo(() => {
    if (selectedCount === 0) return null;
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <span className="font-medium">{selectedCount}</span>
        <span className="ml-1">{selectedCount === 1 ? 'item' : 'items'} selected</span>
      </div>
    );
  }, [selectedCount]);

  // Render a button for each action
  const renderActionButton = useCallback((action: Action) => {
    const { 
      type, 
      id, 
      label, 
      icon, 
      onClick, 
      disabled, 
      requiresSelection, 
      variant, 
      className, 
      isLoading, 
      confirmationRequired 
    } = action;
    
    const buttonIcon = icon || defaultIcons[type];
    const buttonVariant = mapVariant(variant || defaultVariants[type]);
    const isDisabled = disabled || (requiresSelection && selectedCount === 0) || isLoading;
    
    const handleActionClick = () => {
      if (confirmationRequired) {
        setConfirmAction(action);
      } else {
        onClick();
      }
    };
    
    return (
      <Button
        key={id || `${type}-${label}`}
        variant={buttonVariant}
        size="sm"
        onClick={handleActionClick}
        disabled={isDisabled}
        className={cn("flex items-center", className)}
      >
        {isLoading ? (
          <span className="w-4 h-4 mr-2 border-2 border-t-transparent border-current rounded-full animate-spin" />
        ) : buttonIcon}
        {label}
      </Button>
    );
  }, [defaultIcons, defaultVariants, selectedCount]);

  return (
    <>
      <Card className={cn("p-3", getPositionClass(), className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {actions.map(renderActionButton)}
          </div>
          {selectionText}
        </div>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmAction?.confirmationTitle || 'Confirm Action'}</DialogTitle>
            <DialogDescription>
              {confirmAction?.confirmationMessage || 'Are you sure you want to perform this action?'}
            </DialogDescription>
          </DialogHeader>
          
          {confirmAction?.type === 'delete' && (
            <div className="flex items-center p-3 my-2 bg-red-50 text-red-800 rounded-md">
              <AlertCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">This action cannot be undone. The data will be permanently deleted.</p>
            </div>
          )}
          
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancelConfirm}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {confirmAction?.type === 'delete' ? 'Delete' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to map legacy variants to new variants
function mapVariant(variant: Action['variant']): any {
  switch (variant) {
    case 'primary':
      return 'default';
    case 'danger':
      return 'destructive';
    case 'success':
    case 'warning':
      return 'outline';
    default:
      return variant;
  }
}
