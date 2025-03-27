/**
 * Tickets API - Wizard Steps Dynamic Handler
 * POST /api/tickets/wizard/[step] - Save data for specific wizard step
 */

import { NextResponse } from 'next/server';
import { handleApiError, authenticateRequest } from '@/lib/api/middleware';
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
import ticketService from '@/lib/services/ticketService';
import { 
  validateBasicInfo, 
  isActiveJobsite, 
  isActiveTruck 
} from '../step1/validators';
import { validateCategories, calculateTotalCount } from '../step2/validators';
import { validateImageUpload, validateSingleImage } from '../step3/validators';
import { finalizeTicket } from '../complete/finalizers';
import { ValidationError, NotFoundError, ErrorCodes } from '@/lib/errors/error-types';
import { z } from 'zod';

/**
 * POST handler for saving wizard step data
 * 
 * @route POST /api/tickets/wizard/[step]
 * @authentication Required
 */
export const POST = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { step: string } }
) => {
  const { step } = params;
  
  try {
    // Handle different steps based on the dynamic parameter
    switch (step) {
      case 'step1':
        return await handleStep1Request(request, userId);
      case 'step2':
        return await handleStep2Request(request, userId);
      case 'step3':
        return await handleStep3Request(request, userId);
      case 'complete':
        return await handleCompleteRequest(request, userId);
      default:
        throw new ValidationError(
          `Invalid step: ${step}`,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400
        );
    }
  } catch (error) {
    return handleApiError(error, `Failed to process ${step}`);
  }
});

/**
 * Extract session ID from request headers
 * @param request Request object
 * @returns Session ID string
 */
async function getSessionId(request: Request): Promise<string> {
  const sessionId = request.headers.get('x-session-id');
  if (!sessionId) {
    throw new ValidationError(
      'Session ID is required',
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'sessionId' }
    );
  }
  return sessionId;
}

/**
 * Process a request for step 1 (Basic Info)
 * @param request Request object
 * @param userId User ID
 * @returns Response object
 */
async function handleStep1Request(request: Request, userId: string) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      const data = basicInfoSchema.parse(body);
      return await handleBasicInfo(data, request, userId);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid basic info data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
        );
      }
      throw validationError;
    }
  } catch (error) {
    return handleApiError(error, 'Failed to process basic info');
  }
}

/**
 * Process a request for step 2 (Categories)
 * @param request Request object
 * @param userId User ID
 * @returns Response object
 */
async function handleStep2Request(request: Request, userId: string) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      const data = categoriesSchema.parse(body);
      return await handleCategories(data, request, userId);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid categories data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
        );
      }
      throw validationError;
    }
  } catch (error) {
    return handleApiError(error, 'Failed to process categories');
  }
}

/**
 * Process a request for step 3 (Image Upload)
 * @param request Request object
 * @param userId User ID
 * @returns Response object
 */
async function handleStep3Request(request: Request, userId: string) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      const data = imageUploadSchema.parse(body);
      return await handleImageUpload(data, request, userId);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid image upload data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
        );
      }
      throw validationError;
    }
  } catch (error) {
    return handleApiError(error, 'Failed to process image upload');
  }
}

/**
 * Process a request for the completion step
 * @param request Request object
 * @param userId User ID
 * @returns Response object
 */
async function handleCompleteRequest(request: Request, userId: string) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    
    try {
      const data = completeWizardSchema.parse(body);
      return await handleCompletion(data, request, userId);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid completion data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
        );
      }
      throw validationError;
    }
  } catch (error) {
    return handleApiError(error, 'Failed to complete wizard');
  }
}

/**
 * Handle Basic Info step data
 * @param data Validated basic info data
 * @param request Request object
 * @param userId User ID
 * @returns Response with saved basic info
 */
async function handleBasicInfo(data: BasicInfoData, request: Request, userId: string) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Additional validation using the step1 validators
    await validateBasicInfo(data);
    
    // Validate jobsite and truck are active
    const [jobsiteActive, truckActive] = await Promise.all([
      isActiveJobsite(data.jobsiteId),
      isActiveTruck(data.truckId)
    ]);
    
    if (!jobsiteActive) {
      throw new ValidationError(
        'Selected jobsite is not active',
        ErrorCodes.VALIDATION_INVALID_REFERENCE,
        400,
        { jobsiteId: ['Selected jobsite is not active'] }
      );
    }
    
    if (!truckActive) {
      throw new ValidationError(
        'Selected truck is not active',
        ErrorCodes.VALIDATION_INVALID_REFERENCE,
        400,
        { truckId: ['Selected truck is not active'] }
      );
    }
    
    // Save wizard state using ticket service
    await ticketService.saveWizardState(userId, 1, {
      date: data.date,
      truckNumber: data.truckId,
      truckNickname: data.truckId, // In a real app, would fetch the nickname
      jobsite: data.jobsiteId,
      jobsiteName: data.jobsiteId, // In a real app, would fetch the name
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Basic info saved successfully',
      step: 1,
      date: data.date,
      truckId: data.truckId,
      jobsiteId: data.jobsiteId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to save basic info');
  }
}

/**
 * Handle Categories step data
 * @param data Validated categories data
 * @param request Request object
 * @param userId User ID
 * @returns Response with saved categories data
 */
async function handleCategories(data: CategoriesData, request: Request, userId: string) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Additional validation using the step2 validators
    await validateCategories(data);
    
    // Calculate total count
    const totalCount = calculateTotalCount(data);
    
    // Save wizard state using ticket service
    await ticketService.saveWizardState(userId, 2, {
      categories: {
        hangers: data.category1 || 0,
        leaner6To12: data.category2 || 0,
        leaner13To24: data.category3 || 0,
        leaner25To36: data.category4 || 0,
        leaner37To48: data.category5 || 0,
        leaner49Plus: data.category6 || 0,
      },
      hangers: data.category1 || 0,
      leaner6To12: data.category2 || 0,
      leaner13To24: data.category3 || 0,
      leaner25To36: data.category4 || 0,
      leaner37To48: data.category5 || 0,
      leaner49Plus: data.category6 || 0,
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Categories saved successfully',
      step: 2,
      totalCount,
      categories: {
        hangers: data.category1 || 0,
        leaner6To12: data.category2 || 0,
        leaner13To24: data.category3 || 0,
        leaner25To36: data.category4 || 0,
        leaner37To48: data.category5 || 0,
        leaner49Plus: data.category6 || 0,
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to save categories');
  }
}

/**
 * Handle Image Upload step data
 * @param data Validated image upload data
 * @param request Request object
 * @param userId User ID
 * @returns Response with saved image data
 */
async function handleImageUpload(data: ImageUploadData, request: Request, userId: string) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Additional validation using the step3 validators
    await validateImageUpload(data);
    
    // In a real implementation, this would process image files
    // Here we're assuming the images are already uploaded and have URLs
    
    // Save wizard state using ticket service
    await ticketService.saveWizardState(userId, 3, {
      images: data.images.map(img => 
        // Convert image data to File objects for storage
        // In a real implementation, we'd have actual File objects here
        new File([], img.id, { type: 'image/jpeg' })
      ),
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Images saved successfully',
      step: 3,
      imageCount: data.images.length,
      images: data.images.map(img => ({
        id: img.id,
        url: img.url
      })),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to save images');
  }
}

/**
 * Handle wizard completion
 * @param data Validated completion data
 * @param request Request object
 * @param userId User ID
 * @returns Response with created ticket details
 */
async function handleCompletion(data: CompleteWizardData, request: Request, userId: string) {
  try {
    // Get session ID
    const sessionId = await getSessionId(request);
    
    // Validate all required steps are completed
    const { basicInfo, categories, imageUpload } = data;
    
    // Additional validation for the complete step
    if (!basicInfo || !categories) {
      throw new ValidationError(
        'Missing required data',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        {
          ...(basicInfo ? {} : { basicInfo: ['Basic info is required'] }),
          ...(categories ? {} : { categories: ['Categories are required'] })
        }
      );
    }
    
    // Finalize the ticket using the finalizer
    const result = await finalizeTicket(
      userId,
      basicInfo,
      categories,
      imageUpload || { images: [] }
    );
    
    // Clear the wizard state after successful submission
    await ticketService.clearWizardState(userId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Ticket created successfully',
      id: result.ticketId,
      submittedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to create ticket');
  }
}
