/**
 * ArchiveItemDetail Component
 * 
 * Displays detailed information about an archived item
 * in a dialog with metadata and options to restore
 */

'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Eye, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { ArchiveItem } from '@/lib/schemas/archiveSchemas';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ArchiveItemDetailProps {
  isOpen: boolean;
  onClose: () => void;
  item: ArchiveItem | null;
  onRestoreItem: (item: ArchiveItem) => void;
  onViewImages?: (ticketId: string) => void;
}

export function ArchiveItemDetail({
  isOpen,
  onClose,
  item,
  onRestoreItem,
  onViewImages,
}: ArchiveItemDetailProps) {
  if (!item) return null;

  // Format date with fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper to render type-specific content
  const renderTypeSpecificContent = () => {
    switch (item.type) {
      case 'ticket':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Jobsite</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.jobsite || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Truck</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.truck || 'Not specified'}
                </p>
              </div>
            </div>
            
            {item.metadata?.categories && (
              <div>
                <p className="text-sm font-medium mb-2">Categories</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(item.metadata.categories).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Badge variant="outline" className="h-6 px-2 text-xs">
                        {value}
                      </Badge>
                      <span className="text-xs capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {item.metadata?.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {item.metadata.notes}
                </p>
              </div>
            )}
            
            {onViewImages && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onViewImages(item.id)}
              >
                <ImageIcon size={16} className="mr-2" />
                View Associated Images
              </Button>
            )}
          </div>
        );
        
      case 'workday':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Employee</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.employeeName || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Hours</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.hours || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.startTime 
                    ? format(new Date(item.metadata.startTime), 'h:mm a')
                    : 'Not recorded'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">End Time</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.endTime 
                    ? format(new Date(item.metadata.endTime), 'h:mm a')
                    : 'Not recorded'
                  }
                </p>
              </div>
            </div>
            
            {item.metadata?.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {item.metadata.notes}
                </p>
              </div>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
              {item.metadata?.url ? (
                <img 
                  src={item.metadata.url} 
                  alt={item.title} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon size={48} className="text-muted-foreground opacity-20" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Original Filename</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.filename || item.title}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Size</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata?.size 
                    ? `${Math.round(item.metadata.size / 1024)} KB` 
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
            
            {item.metadata?.ticketId && (
              <div>
                <p className="text-sm font-medium">Related Ticket</p>
                <p className="text-sm text-muted-foreground">
                  {item.metadata.ticketId}
                </p>
                
                {onViewImages && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs mt-1"
                    onClick={() => onViewImages(item.metadata?.ticketId || '')}
                  >
                    View all ticket images
                  </Button>
                )}
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <p className="text-sm text-muted-foreground">
            No additional details available for this item type.
          </p>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <span className="capitalize">{item.type}</span>: {item.title}
          </DialogTitle>
          <DialogDescription>
            Archive details and metadata
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Archive metadata section */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar size={16} className="mr-1" />
              <span>Created: {formatDate(item.date)}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock size={16} className="mr-1" />
              <span>Archived: {formatDate(item.archivedAt)}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Type-specific content */}
          {renderTypeSpecificContent()}
          
          {/* Technical metadata */}
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs font-medium mb-1">Technical Details</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Archive ID: {item.id}</p>
              {item.metadata?.originalId && (
                <p>Original ID: {item.metadata.originalId}</p>
              )}
              {item.metadata?.path && (
                <p>Storage Path: {item.metadata.path}</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
          
          <Button
            type="button"
            variant="default"
            onClick={() => onRestoreItem(item)}
          >
            <RotateCcw size={16} className="mr-2" />
            Restore Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
