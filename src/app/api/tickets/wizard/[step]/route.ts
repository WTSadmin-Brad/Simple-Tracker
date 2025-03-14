/**
 * Tickets API - Wizard Steps Dynamic Handler
 * POST /api/tickets/wizard/[step] - Save data for specific wizard step
 */

import { NextResponse } from 'next/server';
import { validateRequest, handleApiError } from '@/lib/api/middleware';
import { 
  basicInfoSchema, 
  categoriesSchema, 
  imageUploadSchema, 
  completeWizardSchema,
  BasicInfoData,
  CategoriesData,
  ImageData,
  ImageUploadData,
  CompleteWizardData
} from '@/lib/validation/wizardSchemas';

// Define types for our mock storage
interface SessionBasicInfo {
  date: string;
  truckId: string;
  jobsiteId: string;
  updatedAt: string;
}

// Extended categories data with metadata
interface SessionCategories {
  [key: string]: number;
  totalCount: number;
  updatedAt: string;
}

interface SessionImageUpload {
  images: ImageData[];
  count: number;
  updatedAt: string;
}

interface SessionData {
  basicInfo?: SessionBasicInfo;
  categories?: SessionCategories;
  imageUpload?: SessionImageUpload;
}

interface TicketData extends CompleteWizardData {
  id: string;
  status: string;
  submittedAt: string;
  userId: string;
  createdAt: string;
}

// Mock storage for development (replace with Firebase in production)
const mockStorage = {
  tickets: new Map<string, TicketData>(),
  sessions: new Map<string, SessionData>(),
  
  // Get session data
  getSession(sessionId: string): SessionData {
    return this.sessions.get(sessionId) || {};
  },
  
  // Update session data
  updateSession(sessionId: string, data: Partial<SessionData>): SessionData {
    const existingData = this.getSession(sessionId);
    const updatedData = { ...existingData, ...data };
    this.sessions.set(sessionId, updatedData);
    return updatedData;
  },
  
  // Create a ticket
  createTicket(ticketData: Omit<TicketData, 'id' | 'createdAt'>): string {
    const ticketId = `TICKET-${Date.now().toString().slice(-6)}`;
    const completeTicket: TicketData = { 
      id: ticketId, 
      ...ticketData, 
      createdAt: new Date().toISOString() 
    };
    this.tickets.set(ticketId, completeTicket);
    return ticketId;
  }
};

export async function POST(
  request: Request,
  { params }: { params: { step: string } }
) {
  const { step } = params;
  
  try {
    // Handle different steps based on the dynamic parameter
    switch (step) {
      case 'step1':
        return validateRequest(basicInfoSchema, handleBasicInfo)(request);
      case 'step2':
        return validateRequest(categoriesSchema, handleCategories)(request);
      case 'step3':
        return validateRequest(imageUploadSchema, handleImageUpload)(request);
      case 'complete':
        return validateRequest(completeWizardSchema, handleCompletion)(request);
      default:
        return NextResponse.json(
          { success: false, message: `Invalid step: ${step}` },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleApiError(error, `Failed to process ${step}`);
  }
}

// Extract session ID from request
async function getSessionId(request: Request): Promise<string> {
  // In a real implementation, this would come from a cookie or auth token
  // For now, we'll use a header for simplicity
  const sessionId = request.headers.get('x-session-id');
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  return sessionId;
}

// Step 1: Basic Info handler
async function handleBasicInfo(data: BasicInfoData, request: Request) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Validate date is not in the future
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return NextResponse.json({
        success: false,
        message: 'Date cannot be in the future',
        errors: { date: ['Date cannot be in the future'] }
      }, { status: 400 });
    }
    
    // Store data in session (would be Firestore in production)
    const sessionData = mockStorage.updateSession(sessionId, {
      basicInfo: {
        ...data,
        updatedAt: new Date().toISOString()
      }
    });
    
    // Return success response with the updated data
    return NextResponse.json({ 
      success: true,
      message: 'Basic info saved successfully',
      data: sessionData.basicInfo
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Session ID is required') {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required',
      }, { status: 401 });
    }
    return handleApiError(error, 'Failed to save basic info');
  }
}

// Step 2: Categories handler
async function handleCategories(data: CategoriesData, request: Request) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Ensure all required categories are present
    const requiredCategories = ['category1', 'category2', 'category3', 'category4', 'category5', 'category6'];
    const missingCategories = requiredCategories.filter(cat => !(cat in data));
    
    if (missingCategories.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Missing required categories',
        errors: {
          categories: [`Missing required categories: ${missingCategories.join(', ')}`]
        }
      }, { status: 400 });
    }
    
    // Calculate total count across all categories
    const totalCount = Object.values(data).reduce((sum, count) => sum + count, 0);
    
    // Store data in session (would be Firestore in production)
    const updatedCategories = {
      ...data,
      totalCount,
      updatedAt: new Date().toISOString()
    };
    
    const sessionData = mockStorage.updateSession(sessionId, {
      categories: updatedCategories
    });
    
    // Return success response with the updated data
    return NextResponse.json({ 
      success: true,
      message: 'Categories saved successfully',
      data: sessionData.categories
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Session ID is required') {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required',
      }, { status: 401 });
    }
    return handleApiError(error, 'Failed to save categories');
  }
}

// Step 3: Image Upload handler
async function handleImageUpload(data: ImageUploadData, request: Request) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Validate image count
    if (data.images.length > 10) {
      return NextResponse.json({
        success: false,
        message: 'Too many images',
        errors: { images: ['Maximum 10 images allowed'] }
      }, { status: 400 });
    }
    
    // In a real implementation, we would move images from temporary storage to permanent storage
    // For now, we'll just store the image metadata
    
    // Store data in session (would be Firestore in production)
    const sessionData = mockStorage.updateSession(sessionId, {
      imageUpload: {
        images: data.images,
        count: data.images.length,
        updatedAt: new Date().toISOString()
      }
    });
    
    // Return success response with the updated data
    return NextResponse.json({ 
      success: true,
      message: 'Image upload data saved successfully',
      data: sessionData.imageUpload
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Session ID is required') {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required',
      }, { status: 401 });
    }
    return handleApiError(error, 'Failed to save image upload data');
  }
}

// Complete: Finalize the ticket
async function handleCompletion(data: CompleteWizardData, request: Request) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Validate all required steps are completed
    const { basicInfo, categories } = data;
    
    // Additional validation for the complete step
    if (!basicInfo || !categories) {
      return NextResponse.json({
        success: false,
        message: 'Missing required data',
        errors: {
          ...(basicInfo ? {} : { basicInfo: ['Basic info is required'] }),
          ...(categories ? {} : { categories: ['Categories are required'] })
        }
      }, { status: 400 });
    }
    
    // Create the final ticket (would be in Firestore in production)
    const ticketData = {
      ...data,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      userId: 'mock-user-id', // In production, this would come from authentication
    };
    
    const ticketId = mockStorage.createTicket(ticketData);
    
    // Clear the session data after successful submission
    mockStorage.sessions.delete(sessionId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Ticket created successfully',
      ticketId,
      submittedAt: ticketData.submittedAt
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Session ID is required') {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required',
      }, { status: 401 });
    }
    return handleApiError(error, 'Failed to create ticket');
  }
}
