/**
 * ArchiveRestoreControls Component
 * 
 * Provides a dialog interface for confirming and handling
 * the restoration of archived items.
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArchiveItem } from '@/lib/schemas/archiveSchemas';

interface ArchiveRestoreControlsProps {
  isOpen: boolean;
  onClose: () => void;
  item: ArchiveItem | null;
  onConfirmRestore: (item: ArchiveItem) => Promise<{ success: boolean; message: string }>;
}

export function ArchiveRestoreControls({
  isOpen,
  onClose,
  item,
  onConfirmRestore,
}: ArchiveRestoreControlsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Function to handle the restore confirmation
  const handleConfirmRestore = async () => {
    if (!item) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const result = await onConfirmRestore(item);
      setResult(result);
      
      if (result.success) {
        toast({
          title: 'Item Restored',
          description: result.message || `${item.type} has been successfully restored.`,
          variant: 'default',
        });
        
        // Auto-close the dialog after a successful restore
        setTimeout(() => {
          onClose();
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle dialog reset
  const handleDialogClose = () => {
    if (!isLoading) {
      setResult(null);
      onClose();
    }
  };

  // Render the type-specific message
  const getItemTypeDescription = () => {
    if (!item) return '';
    
    switch (item.type) {
      case 'ticket':
        return 'This will restore the ticket to the active tickets collection with its original data.';
      case 'workday':
        return 'This will restore the workday to the active workdays collection with its original data.';
      case 'image':
        return 'This will restore the image to the active storage bucket with its original metadata.';
      default:
        return 'This will restore the item to its original collection.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore Archived Item</DialogTitle>
          <DialogDescription>
            {item && (
              <span>
                You are about to restore <strong>{item.title}</strong> ({item.type}).
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {result ? (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? 'Restoration Successful' : 'Restoration Failed'}
              </AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {getItemTypeDescription()}
              </p>
              
              <p className="text-sm font-medium mb-2">Important notes:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>The restored item will be marked as active</li>
                <li>The archive record will be updated to show it was restored</li>
                <li>If the original references still exist, they will be linked</li>
                <li>This action cannot be automatically reverted</li>
              </ul>
            </>
          )}
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDialogClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="button"
            variant="default"
            onClick={handleConfirmRestore}
            disabled={isLoading || !item || result?.success}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restoring...
              </>
            ) : (
              'Restore Item'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
