/**
 * Ticket Archive Controls Component
 * 
 * Client component for managing ticket archive operations.
 * Provides controls for archiving ticket data and images.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button.client';
import { Switch } from '@/components/ui/switch.client';
import { Label } from '@/components/ui/label';
import { Loader2, Archive, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketArchiveControlsProps {
  ticketId: string;
  hasImages: boolean;
  onArchiveImages: (ticketId: string) => Promise<void>;
  onArchiveTicket: (ticketId: string) => Promise<void>;
  className?: string;
}

export default function TicketArchiveControls({
  ticketId,
  hasImages,
  onArchiveImages,
  onArchiveTicket,
  className
}: TicketArchiveControlsProps) {
  const [isArchivingImages, setIsArchivingImages] = useState(false);
  const [isArchivingTicket, setIsArchivingTicket] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the archive images handler
  const handleArchiveImages = useCallback(async () => {
    if (isArchivingImages) return;
    
    setIsArchivingImages(true);
    setError(null);
    
    try {
      await onArchiveImages(ticketId);
    } catch (err) {
      setError('Failed to archive images. Please try again.');
      console.error('Error archiving images:', err);
    } finally {
      setIsArchivingImages(false);
    }
  }, [ticketId, isArchivingImages, onArchiveImages]);

  // Memoize the archive ticket handler
  const handleArchiveTicket = useCallback(async () => {
    if (isArchivingTicket) return;
    
    setIsArchivingTicket(true);
    setError(null);
    
    try {
      await onArchiveTicket(ticketId);
    } catch (err) {
      setError('Failed to archive ticket. Please try again.');
      console.error('Error archiving ticket:', err);
    } finally {
      setIsArchivingTicket(false);
    }
  }, [ticketId, isArchivingTicket, onArchiveTicket]);

  // Memoize the toggle handler
  const handleToggleIncludeImages = useCallback((checked: boolean) => {
    setIncludeImages(checked);
  }, []);

  // Memoize the error message component
  const errorMessage = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }, [error]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Archive Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasImages && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Archive Images</h3>
              <p className="text-sm text-gray-500">
                Archive images to save storage space while keeping ticket data accessible.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleArchiveImages}
              disabled={isArchivingImages}
              className="w-full"
            >
              {isArchivingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archiving Images...
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Images Only
                </>
              )}
            </Button>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Archive Entire Ticket</h3>
            <p className="text-sm text-gray-500">
              Archive the entire ticket including all data and references.
            </p>
          </div>
          
          {hasImages && (
            <div className="flex items-center space-x-2">
              <Switch
                id="include-images"
                checked={includeImages}
                onCheckedChange={handleToggleIncludeImages}
              />
              <Label htmlFor="include-images">Include images in archive</Label>
            </div>
          )}
          
          <Button
            variant="destructive"
            onClick={handleArchiveTicket}
            disabled={isArchivingTicket}
            className="w-full"
          >
            {isArchivingTicket ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving Ticket...
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive Entire Ticket
              </>
            )}
          </Button>
        </div>
        
        {errorMessage}
      </CardContent>
    </Card>
  );
}
