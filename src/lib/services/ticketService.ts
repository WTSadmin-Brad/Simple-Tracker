import { format, subDays } from 'date-fns';

// Ticket type definition based on the data model
export interface Ticket {
  id: string;
  userId: string;
  date: Date;
  truckNumber: string;
  truckNickname: string;
  jobsite: string;
  jobsiteName: string; // For display purposes
  hangers: number;
  leaner6To12: number;
  leaner13To24: number;
  leaner25To36: number;
  leaner37To48: number;
  leaner49Plus: number;
  total: number;
  images: string[];
  thumbnails?: string[];
  imageCount: number;
  submissionDate: Date;
  isFuturePrediction: boolean;
  archiveStatus: 'active' | 'images_archived' | 'fully_archived';
  archiveDate?: Date;
  archivedImages?: string[];
  archiveFile?: string;
  archiveRow?: number;
}

// Filter parameters type
export interface TicketFilterParams {
  startDate?: string;
  endDate?: string;
  jobsite?: string;
  truck?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: keyof Ticket;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Generate mock tickets for development
 */
function generateMockTickets(count: number = 50): Ticket[] {
  const jobsites = [
    { id: 'site-1', name: 'Downtown HQ' },
    { id: 'site-2', name: 'North Campus' },
    { id: 'site-3', name: 'East Building' },
    { id: 'site-4', name: 'West Facility' },
    { id: 'site-5', name: 'South Complex' },
  ];
  
  const trucks = [
    { id: 'Truck-1', nickname: 'Big Red' },
    { id: 'Truck-2', nickname: 'Blue Thunder' },
    { id: 'Truck-3', nickname: 'Green Machine' },
    { id: 'Truck-4', nickname: 'Yellow Jacket' },
    { id: 'Truck-5', nickname: 'Silver Bullet' },
  ];
  
  const users = ['johndoe', 'janedoe', 'bobsmith', 'alicejones', 'mikebrown'];
  
  const statuses: ('active' | 'images_archived' | 'fully_archived')[] = [
    'active', 'active', 'active', 'active', 'images_archived', 'images_archived', 'fully_archived'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const jobsite = jobsites[Math.floor(Math.random() * jobsites.length)];
    const truck = trucks[Math.floor(Math.random() * trucks.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = subDays(new Date(), Math.floor(Math.random() * 60));
    const imageCount = Math.floor(Math.random() * 8) + 1;
    
    // Generate random ticket counts
    const hangers = Math.floor(Math.random() * 150);
    const leaner6To12 = Math.floor(Math.random() * 150);
    const leaner13To24 = Math.floor(Math.random() * 150);
    const leaner25To36 = Math.floor(Math.random() * 150);
    const leaner37To48 = Math.floor(Math.random() * 150);
    const leaner49Plus = Math.floor(Math.random() * 150);
    const total = hangers + leaner6To12 + leaner13To24 + leaner25To36 + leaner37To48 + leaner49Plus;
    
    // Generate mock images
    const images = Array.from({ length: imageCount }).map((_, imgIndex) => 
      `gs://workday-tracker-prod.appspot.com/tickets/${user}/ticket-${index}/image${imgIndex + 1}.jpg`
    );
    
    const thumbnails = images.map(img => img.replace('.jpg', '-thumb.jpg'));
    
    return {
      id: `ticket-${index + 1}`,
      userId: user,
      date,
      truckNumber: truck.id,
      truckNickname: truck.nickname,
      jobsite: jobsite.id,
      jobsiteName: jobsite.name,
      hangers,
      leaner6To12,
      leaner13To24,
      leaner25To36,
      leaner37To48,
      leaner49Plus,
      total,
      images,
      thumbnails,
      imageCount,
      submissionDate: new Date(date.getTime() + 1000 * 60 * 60 * 2), // 2 hours after date
      isFuturePrediction: false,
      archiveStatus: status,
      ...(status !== 'active' && {
        archiveDate: new Date(date.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days after date
      }),
      ...(status === 'fully_archived' && {
        archiveFile: `gs://archive-bucket/archive/data/2024-06/tickets-${jobsite.id}-2024-06.xlsx`,
        archiveRow: Math.floor(Math.random() * 100) + 1,
      }),
    };
  });
}

// Mock tickets cache
let mockTickets: Ticket[] | null = null;

/**
 * Get tickets with filtering, sorting, and pagination
 */
export async function getTickets(filters: TicketFilterParams = {}): Promise<{
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // In a real implementation, this would fetch from Firestore
  // Initialize mock data if not already done
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  // Apply filters
  let filteredTickets = [...mockTickets];
  
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filteredTickets = filteredTickets.filter(ticket => ticket.date >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    filteredTickets = filteredTickets.filter(ticket => ticket.date <= endDate);
  }
  
  if (filters.jobsite) {
    filteredTickets = filteredTickets.filter(ticket => ticket.jobsite === filters.jobsite);
  }
  
  if (filters.truck) {
    filteredTickets = filteredTickets.filter(ticket => ticket.truckNumber === filters.truck);
  }
  
  if (filters.status) {
    filteredTickets = filteredTickets.filter(ticket => ticket.archiveStatus === filters.status);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredTickets = filteredTickets.filter(ticket => 
      ticket.id.toLowerCase().includes(search) ||
      ticket.jobsiteName.toLowerCase().includes(search) ||
      ticket.truckNickname.toLowerCase().includes(search) ||
      ticket.userId.toLowerCase().includes(search)
    );
  }
  
  // Apply sorting
  if (filters.sortField) {
    filteredTickets.sort((a, b) => {
      const fieldA = a[filters.sortField as keyof Ticket];
      const fieldB = b[filters.sortField as keyof Ticket];
      
      if (fieldA instanceof Date && fieldB instanceof Date) {
        return filters.sortDirection === 'asc' 
          ? fieldA.getTime() - fieldB.getTime() 
          : fieldB.getTime() - fieldA.getTime();
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return filters.sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      
      const strA = String(fieldA).toLowerCase();
      const strB = String(fieldB).toLowerCase();
      
      return filters.sortDirection === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
  } else {
    // Default sort by date descending
    filteredTickets.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const total = filteredTickets.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    tickets: paginatedTickets,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket | null> {
  // In a real implementation, this would fetch from Firestore
  // Initialize mock data if not already done
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticket = mockTickets.find(t => t.id === id);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return ticket || null;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  id: string, 
  status: 'active' | 'images_archived' | 'fully_archived'
): Promise<Ticket | null> {
  // In a real implementation, this would update Firestore
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    return null;
  }
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...mockTickets[ticketIndex],
    archiveStatus: status,
    ...(status !== 'active' && {
      archiveDate: new Date(),
    }),
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTickets[ticketIndex];
}

/**
 * Archive ticket images
 */
export async function archiveTicketImages(id: string): Promise<Ticket | null> {
  // In a real implementation, this would move images to archive storage and update Firestore
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    return null;
  }
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...mockTickets[ticketIndex],
    archiveStatus: 'images_archived',
    archiveDate: new Date(),
    archivedImages: [...mockTickets[ticketIndex].images],
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockTickets[ticketIndex];
}

/**
 * Fully archive ticket
 */
export async function fullyArchiveTicket(id: string): Promise<Ticket | null> {
  // In a real implementation, this would export to Excel and update Firestore
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    return null;
  }
  
  const ticket = mockTickets[ticketIndex];
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...ticket,
    archiveStatus: 'fully_archived',
    archiveDate: new Date(),
    archiveFile: `gs://archive-bucket/archive/data/${format(new Date(), 'yyyy-MM')}/tickets-${ticket.jobsite}-${format(new Date(), 'yyyy-MM')}.xlsx`,
    archiveRow: Math.floor(Math.random() * 100) + 1,
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return mockTickets[ticketIndex];
}

/**
 * Restore ticket from archive
 */
export async function restoreTicket(id: string): Promise<Ticket | null> {
  // In a real implementation, this would restore from archive and update Firestore
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    return null;
  }
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...mockTickets[ticketIndex],
    archiveStatus: 'active',
    archiveDate: undefined,
    archiveFile: undefined,
    archiveRow: undefined,
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockTickets[ticketIndex];
}
