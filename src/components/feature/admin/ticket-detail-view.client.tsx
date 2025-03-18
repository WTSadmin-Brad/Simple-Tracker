'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  TruckIcon, 
  MapPinIcon, 
  UserIcon, 
  ClockIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  ArrowLeftIcon,
  ArchiveIcon
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TicketStatusBadge from './TicketStatusBadge.client';
import TicketArchiveControls from './TicketArchiveControls.client';
import { getTicketById, Ticket } from '@/lib/services/ticketService';
import { fadeVariants } from '@/lib/animations/variants';
import { defaultSpring } from '@/lib/animations/springs';

interface TicketDetailViewProps {
  ticketId: string;
}

/**
 * TicketDetailView component
 * Displays detailed information about a ticket, including counts, images, and archive information
 */
export default function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const ticketData = await getTicketById(ticketId);
        
        if (!ticketData) {
          setError('Ticket not found');
        } else {
          setTicket(ticketData);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicket();
  }, [ticketId]);
  
  // Handle ticket status change
  const handleStatusChange = (updatedTicket: Ticket) => {
    setTicket(updatedTicket);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render error state
  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Ticket not found'}. Please try again or select a different ticket.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/admin/tickets')}>
          View All Tickets
        </Button>
      </div>
    );
  }
  
  // Calculate counter color classes based on values
  const getCounterColorClass = (value: number) => {
    if (value === 0) return 'bg-red-50 text-red-700 border-red-200';
    if (value >= 1 && value <= 84) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (value >= 85 && value <= 124) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // 125-150 (gold)
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? {} : fadeVariants}
      transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        
        <TicketArchiveControls 
          ticket={ticket} 
          onStatusChange={handleStatusChange} 
        />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl">Ticket {ticket.id}</CardTitle>
              <CardDescription>
                Submitted on {format(ticket.submissionDate, 'MMM d, yyyy h:mm a')}
              </CardDescription>
            </div>
            <TicketStatusBadge 
              status={ticket.archiveStatus} 
              className="w-fit" 
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Ticket metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 border rounded-md bg-gray-50">
              <CalendarIcon className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-lg">{format(ticket.date, 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border rounded-md bg-gray-50">
              <TruckIcon className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Truck</p>
                <p className="text-lg">{ticket.truckNickname || ticket.truckNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border rounded-md bg-gray-50">
              <MapPinIcon className="h-5 w-5 mr-3 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Jobsite</p>
                <p className="text-lg">{ticket.jobsiteName || ticket.jobsite}</p>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images ({ticket.imageCount})</TabsTrigger>
              <TabsTrigger value="archive">Archive Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`p-4 border rounded-md ${getCounterColorClass(ticket.hangers)}`}>
                  <p className="text-sm font-medium">Hangers</p>
                  <p className="text-2xl font-bold">{ticket.hangers}</p>
                </div>
                
                <div className={`p-4 border rounded-md ${getCounterColorClass(ticket.leaner6To12)}`}>
                  <p className="text-sm font-medium">Leaner 6-12&quot;</p>
                  <p className="text-2xl font-bold">{ticket.leaner6To12}</p>
                </div>
                
                <div className={`p-4 border rounded-md ${getCounterColorClass(ticket.leaner13To24)}`}>
                  <p className="text-sm font-medium">Leaner 13-24&quot;</p>
                  <p className="text-2xl font-bold">{ticket.leaner13To24}</p>
                </div>
                
                <div className={`p-4 border rounded-md ${getCounterColorClass(ticket.leaner25To36)}`}>
                  <p className="text-sm font-medium">Leaner 25-36&quot;</p>
                  <p className="text-2xl font-bold">{ticket.leaner25To36}</p>
                </div>
                
                <div className={`p-4 border rounded-md ${getCounterColorClass(ticket.leaner37To48)}`}>
                  <p className="text-sm font-medium">Leaner 37-48&quot;</p>
                  <p className="text-2xl font-bold">{ticket.leaner37To48}</p>
                </div>
                
                <div className={`p-4 border rounded-md ${getCounterColorClass(ticket.leaner49Plus)}`}>
                  <p className="text-sm font-medium">Leaner 49&quot;+</p>
                  <p className="text-2xl font-bold">{ticket.leaner49Plus}</p>
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-blue-50 text-blue-700 border-blue-200">
                <p className="text-sm font-medium">Total Count</p>
                <p className="text-3xl font-bold">{ticket.total}</p>
              </div>
              
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="flex items-center mb-2">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm font-medium">Submitted by</p>
                </div>
                <p>{ticket.userId}</p>
              </div>
              
              <div className="p-4 border rounded-md bg-gray-50">
                <div className="flex items-center mb-2">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm font-medium">Submission Time</p>
                </div>
                <p>{format(ticket.submissionDate, 'MMM d, yyyy h:mm:ss a')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="images">
              {ticket.imageCount > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ticket.thumbnails?.map((thumbnail, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-square border rounded-md overflow-hidden bg-gray-100"
                      >
                        {/* In a real implementation, this would use a proper image URL */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {ticket.archiveStatus === 'images_archived' && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertDescription className="flex items-center text-amber-700">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Images have been archived. They may take longer to retrieve.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No images attached to this ticket.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="archive">
              {ticket.archiveStatus === 'active' ? (
                <Alert>
                  <AlertDescription>
                    This ticket is active and has not been archived.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-gray-50">
                    <div className="flex items-center mb-2">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <p className="text-sm font-medium">Archive Date</p>
                    </div>
                    <p>{ticket.archiveDate ? format(ticket.archiveDate, 'MMM d, yyyy h:mm a') : 'N/A'}</p>
                  </div>
                  
                  {ticket.archiveStatus === 'fully_archived' && ticket.archiveFile && (
                    <div className="p-4 border rounded-md bg-gray-50">
                      <div className="flex items-center mb-2">
                        <FileSpreadsheetIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="text-sm font-medium">Archive File</p>
                      </div>
                      <p className="text-sm break-all">{ticket.archiveFile}</p>
                      {ticket.archiveRow && (
                        <Badge variant="outline" className="mt-2">
                          Row {ticket.archiveRow}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {ticket.archiveStatus === 'images_archived' && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertDescription className="flex items-center text-amber-700">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Only images have been archived. Ticket data is still active.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {ticket.archiveStatus === 'fully_archived' && (
                    <Alert className="bg-slate-50 border-slate-200">
                      <AlertDescription className="flex items-center text-slate-700">
                        <ArchiveIcon className="h-4 w-4 mr-2" />
                        This ticket has been fully archived. Data and images have been moved to long-term storage.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Ticket ID: {ticket.id}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
