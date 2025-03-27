/**
 * types.ts
 * Shared type definitions for admin data grids and forms
 */

// Base entity types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Jobsite entity
export interface Jobsite extends BaseEntity {
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'completed';
  client: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  lastUsed?: Date;
}

// Truck entity
export interface Truck extends BaseEntity {
  truckNumber: string;
  nickname: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUsed?: Date;
  notes?: string;
}

// User entity
export interface User extends BaseEntity {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'employee';
  status?: 'active' | 'inactive' | 'pending';
  isActive?: boolean;
  phoneNumber?: string;
  lastLogin?: Date;
  uid?: string;
  username?: string;
  animationPrefs?: {
    reducedMotion: boolean;
    hapticFeedback: boolean;
  };
  deactivatedAt?: Date;
  deactivatedBy?: string;
}

// Ticket entity
export interface Ticket extends BaseEntity {
  // Fields from the original Ticket type
  date: Date;
  employeeId?: string; // For backward compatibility
  employeeName?: string; // For backward compatibility
  truckId?: string; // For backward compatibility
  truckNumber: string;
  jobsiteId?: string; // For backward compatibility
  jobsiteName?: string;
  categories: {
    [key: string]: number;
  };
  status?: 'submitted' | 'processing' | 'approved' | 'rejected'; // For backward compatibility
  imageUrls?: string[];
  notes?: string;
  
  // Fields from the ticketGridConfig Ticket type
  userId?: string;
  truckNickname?: string;
  jobsite?: string;
  total?: number;
  imageCount?: number;
  submissionDate?: Date;
  archiveStatus?: 'active' | 'images_archived' | 'fully_archived';
}

// Workday entity
export interface Workday extends BaseEntity {
  userId: string;
  employeeName?: string;
  date: Date;
  jobsite: string;
  jobsiteName?: string;
  workType: 'regular' | 'overtime' | 'holiday' | 'sick' | 'vacation';
  hours: number;
  notes?: string;
  status: 'active' | 'archived';
  isPrediction?: boolean;
  type?: 'full' | 'half' | 'off'; // For backward compatibility
  hasTickets?: boolean; // For backward compatibility
}

// Query parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// Default query parameters
export const defaultQueryParams: QueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

// Default user query parameters
export const defaultUserQueryParams: QueryParams = {
  ...defaultQueryParams,
  isActive: true
};

// Default jobsite query parameters
export const defaultJobsiteQueryParams: QueryParams = {
  ...defaultQueryParams,
  status: 'active'
};

// Default truck query parameters
export const defaultTruckQueryParams: QueryParams = {
  ...defaultQueryParams,
  status: 'active'
};

// Default ticket query parameters
export const defaultTicketQueryParams: QueryParams = {
  ...defaultQueryParams,
  archiveStatus: 'active'
};

// Default workday query parameters
export const defaultWorkdayQueryParams: QueryParams = {
  ...defaultQueryParams,
  status: 'active'
};
