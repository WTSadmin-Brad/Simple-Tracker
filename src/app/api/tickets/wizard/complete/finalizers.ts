/**
 * Ticket Submission Finalizers
 * Functions for finalizing and submitting tickets
 */
import { BasicInfoData, CategoriesData, ImageUploadData } from '@/lib/validation/wizardSchemas';
import ticketService from '@/lib/services/ticketService';
import { errorHandler, ValidationError, ErrorCodes } from '@/lib/errors';
import { adminNotifyNewTicket } from '@/lib/admin/notifications';

// Combined ticket data type
export interface TicketData {
  basicInfo: BasicInfoData;
  categories: CategoriesData;
  imageUpload: ImageUploadData;
  submittedAt: string;
  userId: string;
  status: 'submitted';
}

/**
 * Function to combine all wizard steps into a final ticket
 * 
 * @param userId - User ID creating the ticket
 * @param basicInfo - Basic info step data
 * @param categories - Categories step data
 * @param imageUpload - Image upload step data
 * @returns Promise with the new ticket ID
 * @throws ValidationError if data is invalid
 */
export async function finalizeTicket(
  userId: string,
  basicInfo: BasicInfoData,
  categories: CategoriesData,
  imageUpload: ImageUploadData
): Promise<{ ticketId: string }> {
  try {
    // Validate that we have all required data
    if (!userId) {
      throw new ValidationError(
        'User ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'userId' }
      );
    }
    
    if (!basicInfo?.date || !basicInfo?.jobsiteId || !basicInfo?.truckId) {
      throw new ValidationError(
        'Missing required basic info',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'basicInfo' }
      );
    }
    
    // Transform data to match ticketService format
    const ticketData = {
      date: basicInfo.date,
      truckNumber: basicInfo.truckId,
      truckNickname: basicInfo.truckId, // Would come from a trucks lookup
      jobsite: basicInfo.jobsiteId,
      jobsiteName: basicInfo.jobsiteId, // Would come from a jobsites lookup
      categories: {
        hangers: categories.category1 || 0,
        leaner6To12: categories.category2 || 0,
        leaner13To24: categories.category3 || 0,
        leaner25To36: categories.category4 || 0,
        leaner37To48: categories.category5 || 0,
        leaner49Plus: categories.category6 || 0,
      },
      images: imageUpload?.images?.map(img => new File([], img.id, { type: 'image/jpeg' })) || [],
    };
    
    // Create the ticket using ticketService
    const ticket = await ticketService.createTicket(userId, ticketData);
    
    // Schedule images to be archived after 2 weeks
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    await scheduleImageArchiving(ticket.id, twoWeeksFromNow);
    
    // Notify admin users about the new ticket
    await adminNotifyNewTicket(ticket);
    
    return { ticketId: ticket.id };
  } catch (error) {
    console.error('Error finalizing ticket:', error);
    return errorHandler(
      error, 
      'Failed to finalize ticket', 
      { userId, basicInfo, categories }
    );
  }
}

/**
 * Schedule images to be archived after a certain date
 * 
 * @param ticketId - Ticket ID to schedule archiving for
 * @param archiveDate - Date to archive images
 */
async function scheduleImageArchiving(ticketId: string, archiveDate: Date): Promise<void> {
  try {
    // In a real implementation, this would create a scheduled job
    // For now, we'll just log the scheduled date
    console.log(`Scheduled archiving for ticket ${ticketId} on ${archiveDate.toISOString()}`);
    
    // Here we would use a scheduled function or job queue
    // e.g., firebase.functions().runScheduled('archiveTicketImages', { ticketId, archiveDate })
  } catch (error) {
    console.error('Error scheduling image archiving:', error);
    // Don't throw - this shouldn't break the ticket creation flow
  }
}
