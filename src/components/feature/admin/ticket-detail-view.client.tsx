/**
 * Ticket Detail View Component
 * 
 * Client component for displaying detailed ticket information.
 * Shows all ticket data with image gallery and metadata.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button.client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.client';
import { TicketStatusBadge } from '@/components/feature/admin';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn, Download, Loader2 } from 'lucide-react';

export interface TicketImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  uploadedAt: Date;
}

export interface TicketCategory {
  name: string;
  count: number;
  color?: string;
}

export interface TicketDetail {
  id: string;
  date: Date;
  truck: string;
  jobsite: string;
  status: 'active' | 'images_archived' | 'fully_archived';
  categories: TicketCategory[];
  images: TicketImage[];
  submittedBy: string;
  submittedAt: Date;
  notes?: string;
}

interface TicketDetailViewProps {
  ticket?: TicketDetail;
  isLoading?: boolean;
  onClose?: () => void;
  onDownloadImage?: (imageUrl: string, fileName: string) => Promise<void>;
  className?: string;
}

export default function TicketDetailView({
  ticket,
  isLoading = false,
  onClose,
  onDownloadImage,
  className
}: TicketDetailViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Memoize the active image
  const activeImage = useMemo(() => {
    if (!ticket?.images?.length) return null;
    return ticket.images[activeImageIndex];
  }, [ticket?.images, activeImageIndex]);

  // Handle image navigation
  const handlePrevImage = useCallback(() => {
    if (!ticket?.images?.length) return;
    setActiveImageIndex((prev) => (prev === 0 ? ticket.images.length - 1 : prev - 1));
  }, [ticket?.images]);

  const handleNextImage = useCallback(() => {
    if (!ticket?.images?.length) return;
    setActiveImageIndex((prev) => (prev === ticket.images.length - 1 ? 0 : prev + 1));
  }, [ticket?.images]);

  // Handle image download
  const handleDownloadImage = useCallback(async () => {
    if (!activeImage || !onDownloadImage) return;
    
    setIsDownloading(activeImage.id);
    try {
      await onDownloadImage(activeImage.url, activeImage.fileName);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(null);
    }
  }, [activeImage, onDownloadImage]);

  // Toggle zoom state
  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  // Memoize the image gallery
  const imageGallery = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-md" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex gap-2 overflow-x-auto py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-16 flex-shrink-0 rounded-md" />
            ))}
          </div>
        </div>
      );
    }

    if (!ticket?.images?.length) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
          <p className="text-gray-500">No images available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className={cn(
          "relative h-64 bg-gray-100 rounded-md overflow-hidden transition-all duration-300",
          isZoomed && "fixed inset-0 z-50 h-full bg-black/90 flex items-center justify-center"
        )}>
          <Image
            src={activeImage?.url || ''}
            alt={`Ticket image ${activeImageIndex + 1}`}
            fill
            className={cn(
              "object-contain",
              isZoomed ? "p-4" : "p-0"
            )}
          />
          
          <div className={cn(
            "absolute inset-x-0 bottom-0 flex justify-between p-2 bg-black/50",
            isZoomed ? "p-4" : "p-2"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleZoom}
              className="text-white hover:bg-black/20"
            >
              <ZoomIn className="h-4 w-4" />
              {isZoomed ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadImage}
              disabled={isDownloading === activeImage?.id}
              className="text-white hover:bg-black/20"
            >
              {isDownloading === activeImage?.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevImage}
            disabled={ticket.images.length <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            {activeImageIndex + 1} of {ticket.images.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextImage}
            disabled={ticket.images.length <= 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto py-2">
          {ticket.images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveImageIndex(index)}
              className={cn(
                "relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2",
                activeImageIndex === index ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={image.thumbnailUrl}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }, [
    isLoading, 
    ticket?.images, 
    activeImageIndex, 
    activeImage, 
    isZoomed, 
    isDownloading, 
    handlePrevImage, 
    handleNextImage, 
    handleDownloadImage, 
    toggleZoom
  ]);

  // Memoize the ticket details
  const ticketDetails = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      );
    }

    if (!ticket) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No ticket details available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Ticket ID</h3>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <p>{ticket.id}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Date</h3>
            <p>{format(ticket.date, 'MMMM d, yyyy')}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Submitted</h3>
            <p>{format(ticket.submittedAt, 'MMM d, yyyy h:mm a')}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Truck</h3>
            <p>{ticket.truck}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Jobsite</h3>
            <p>{ticket.jobsite}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Submitted By</h3>
            <p>{ticket.submittedBy}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {ticket.categories.map((category) => (
              <Badge 
                key={category.name}
                variant="outline"
                className={cn(
                  "bg-gray-100",
                  category.color && `bg-${category.color}-100 text-${category.color}-800`
                )}
              >
                {category.name}: {category.count}
              </Badge>
            ))}
          </div>
        </div>
        
        {ticket.notes && (
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{ticket.notes}</p>
          </div>
        )}
      </div>
    );
  }, [isLoading, ticket]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Ticket Details</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images ({ticket?.images?.length || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            {ticketDetails}
          </TabsContent>
          <TabsContent value="images" className="pt-4">
            {imageGallery}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
