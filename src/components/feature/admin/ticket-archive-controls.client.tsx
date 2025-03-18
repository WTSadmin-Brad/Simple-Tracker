'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArchiveIcon, 
  ImageIcon, 
  FileSpreadsheetIcon, 
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LoaderIcon
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  archiveTicketImages, 
  fullyArchiveTicket, 
  restoreTicket, 
  Ticket 
} from '@/lib/services/ticketService';
import { fadeVariants } from '@/lib/animations/variants';
import { defaultSpring } from '@/lib/animations/springs';

interface TicketArchiveControlsProps {
  ticket: Ticket;
  onStatusChange?: (updatedTicket: Ticket) => void;
}

type ArchiveAction = 'archive_images' | 'fully_archive' | 'restore';

/**
 * TicketArchiveControls component
 * Provides controls for archiving ticket images, fully archiving tickets, and restoring tickets
 */
export default function TicketArchiveControls({ ticket, onStatusChange }: TicketArchiveControlsProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ArchiveAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Open confirmation dialog for archive action
  const openArchiveDialog = (action: ArchiveAction) => {
    setCurrentAction(action);
    setIsDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  // Get dialog content based on current action
  const getDialogContent = () => {
    switch (currentAction) {
      case 'archive_images':
        return {
          title: 'Archive Ticket Images',
          description: 'This will archive all images associated with this ticket. The ticket data will remain accessible, but images will be moved to long-term storage and may take longer to retrieve.',
          confirmLabel: 'Archive Images',
          icon: <ImageIcon className="h-5 w-5 mr-2" />,
        };
      case 'fully_archive':
        return {
          title: 'Fully Archive Ticket',
          description: 'This will archive both the ticket data and images. The ticket will be exported to a spreadsheet and removed from the active database. It can still be viewed but cannot be modified.',
          confirmLabel: 'Fully Archive',
          icon: <FileSpreadsheetIcon className="h-5 w-5 mr-2" />,
        };
      case 'restore':
        return {
          title: 'Restore Ticket',
          description: 'This will restore the ticket to active status. If the ticket was fully archived, it will be re-imported from the archive.',
          confirmLabel: 'Restore Ticket',
          icon: <RefreshCwIcon className="h-5 w-5 mr-2" />,
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed with this action?',
          confirmLabel: 'Confirm',
          icon: null,
        };
    }
  };

  // Handle archive action confirmation
  const handleConfirmAction = async () => {
    if (!currentAction) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let updatedTicket: Ticket | null = null;
      
      switch (currentAction) {
        case 'archive_images':
          updatedTicket = await archiveTicketImages(ticket.id);
          setSuccess('Ticket images have been archived successfully.');
          break;
        case 'fully_archive':
          updatedTicket = await fullyArchiveTicket(ticket.id);
          setSuccess('Ticket has been fully archived successfully.');
          break;
        case 'restore':
          updatedTicket = await restoreTicket(ticket.id);
          setSuccess('Ticket has been restored successfully.');
          break;
      }
      
      if (updatedTicket && onStatusChange) {
        onStatusChange(updatedTicket);
      }
      
      // Close dialog after a delay to show success message
      setTimeout(() => {
        setIsDialogOpen(false);
        router.refresh();
      }, 2000);
      
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      console.error('Archive action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which buttons to show based on ticket status
  const renderActionButtons = () => {
    switch (ticket.archiveStatus) {
      case 'active':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openArchiveDialog('archive_images')}
              className="flex items-center"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Archive Images
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openArchiveDialog('fully_archive')}
              className="flex items-center"
            >
              <ArchiveIcon className="h-4 w-4 mr-2" />
              Fully Archive
            </Button>
          </>
        );
      case 'images_archived':
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openArchiveDialog('fully_archive')}
              className="flex items-center"
            >
              <ArchiveIcon className="h-4 w-4 mr-2" />
              Fully Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openArchiveDialog('restore')}
              className="flex items-center"
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </>
        );
      case 'fully_archived':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openArchiveDialog('restore')}
            className="flex items-center"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Restore
          </Button>
        );
      default:
        return null;
    }
  };

  const dialogContent = getDialogContent();

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {renderActionButtons()}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={shouldReduceMotion ? {} : fadeVariants}
                transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
              >
                <Alert variant="destructive" className="mt-4">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                key="success"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={shouldReduceMotion ? {} : fadeVariants}
                transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
              >
                <Alert variant="success" className="mt-4 bg-green-50 text-green-800 border-green-200">
                  <CheckCircleIcon className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          
          <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {dialogContent.icon}
                  {dialogContent.confirmLabel}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
