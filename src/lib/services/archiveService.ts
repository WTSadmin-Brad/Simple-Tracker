/**
 * Archive Service
 * 
 * Handles archiving, searching, and restoration of data
 * Provides a consistent interface for archive operations
 */

import { getFirestoreAdmin, getStorageAdmin } from '../firebase/admin';
import { ArchiveItem, ArchiveSearchParams, ArchiveRestoreParams, ArchiveImagesParams } from '../schemas/archiveSchemas';
import { ServiceError, NotFoundError, ValidationError, ErrorCodes } from '../errors/error-types';
import { getAdminCollection, getAdminDocument } from '../firebase/admin';

// Collection constants
const ARCHIVE_INDEX_COLLECTION = 'archiveIndex';
const ARCHIVE_IMAGES_COLLECTION = 'archiveImages';
const TICKETS_COLLECTION = 'tickets';
const WORKDAYS_COLLECTION = 'workdays';

// Status constants for tracking archive status
export enum ArchiveStatus {
  ACTIVE = 'active',
  IMAGES_ARCHIVED = 'images_archived',
  FULLY_ARCHIVED = 'fully_archived'
}

/**
 * Search for archived items matching specified criteria
 * 
 * @param params - Search parameters
 * @returns Promise with search results
 */
export async function searchArchive(params: ArchiveSearchParams): Promise<{
  items: ArchiveItem[];
  total: number;
  hasMore: boolean;
}> {
  try {
    const db = getFirestoreAdmin();
    let query = db.collection(ARCHIVE_INDEX_COLLECTION);
    
    // Apply type filter (if not 'all')
    if (params.type && params.type !== 'all') {
      query = query.where('type', '==', params.type.endsWith('s') 
        ? params.type.slice(0, -1) // Convert plural to singular (tickets -> ticket)
        : params.type);
    }
    
    // Apply date range filters if provided
    if (params.startDate) {
      query = query.where('date', '>=', params.startDate);
    }
    
    if (params.endDate) {
      query = query.where('date', '<=', params.endDate);
    }
    
    // Apply metadata filters if provided
    if (params.metadataFilters) {
      Object.entries(params.metadataFilters).forEach(([key, value]) => {
        query = query.where(`metadata.${key}`, '==', value);
      });
    }
    
    // Get total count first (before pagination)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    
    // Apply pagination
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    
    query = query.orderBy('archivedAt', 'desc')
                 .limit(limit)
                 .offset(offset);
    
    // Execute the query
    const snapshot = await query.get();
    
    // Transform data to the expected format
    const items: ArchiveItem[] = snapshot.docs.map(doc => {
      const data = doc.data() as ArchiveItem;
      return {
        ...data,
        id: doc.id
      };
    });
    
    return {
      items,
      total,
      hasMore: offset + items.length < total
    };
  } catch (error) {
    throw new ServiceError(
      'Failed to search archive',
      'archiveService',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

/**
 * Restore an archived item back to its original collection
 * 
 * @param params - Restore parameters
 * @returns Promise with restore result
 */
export async function restoreArchivedItem(params: ArchiveRestoreParams): Promise<{
  success: boolean;
  originalId: string;
  newId: string;
  type: string;
}> {
  try {
    const db = getFirestoreAdmin();
    
    // Get the archived item
    const archiveRef = db.collection(ARCHIVE_INDEX_COLLECTION).doc(params.id);
    const archiveDoc = await archiveRef.get();
    
    if (!archiveDoc.exists) {
      throw new NotFoundError(
        `Archived item with ID ${params.id} not found`,
        ErrorCodes.DATA_NOT_FOUND
      );
    }
    
    const archiveData = archiveDoc.data() as ArchiveItem;
    
    // Check if item is already restored
    if (archiveData.status === 'restored') {
      throw new ValidationError(
        'This item has already been restored',
        ErrorCodes.DATA_INVALID
      );
    }
    
    // Determine the destination collection
    let destinationCollection: string;
    
    switch (archiveData.type) {
      case 'ticket':
        destinationCollection = TICKETS_COLLECTION;
        break;
      case 'workday':
        destinationCollection = WORKDAYS_COLLECTION;
        break;
      case 'image':
        destinationCollection = 'ticketImages'; // Assuming ticketImages is the collection
        break;
      default:
        throw new ValidationError(
          `Unsupported archive type: ${archiveData.type}`,
          ErrorCodes.DATA_INVALID
        );
    }
    
    // Override destination if specified
    if (params.destinationCollection) {
      destinationCollection = params.destinationCollection;
    }
    
    // Create a new document in the destination collection
    const newDocRef = db.collection(destinationCollection).doc();
    const timestamp = new Date();
    
    // Construct the restored data
    const restoredData = {
      ...archiveData.metadata, // Original data is stored in metadata
      restoredAt: timestamp.toISOString(),
      restoredFrom: params.id,
      originalId: archiveData.originalId
    };
    
    // Create the document
    await newDocRef.set(restoredData);
    
    // Update the archive status
    await archiveRef.update({
      status: 'restored',
      restoredAt: timestamp.toISOString(),
      restoredId: newDocRef.id
    });
    
    return {
      success: true,
      originalId: archiveData.originalId,
      newId: newDocRef.id,
      type: archiveData.type
    };
  } catch (error) {
    // Rethrow NotFoundError and ValidationError
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServiceError(
      'Failed to restore archived item',
      'archiveService',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

/**
 * Archive images for a ticket
 * 
 * @param params - Archive images parameters
 * @returns Promise with archive result
 */
export async function archiveTicketImages(params: ArchiveImagesParams): Promise<{
  success: boolean;
  archivedCount: number;
  ticketId: string;
  failedIds?: string[];
}> {
  try {
    const db = getFirestoreAdmin();
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Get the ticket document
    const ticketDoc = await db.collection(TICKETS_COLLECTION).doc(params.ticketId).get();
    
    if (!ticketDoc.exists) {
      throw new NotFoundError(
        `Ticket with ID ${params.ticketId} not found`,
        ErrorCodes.DATA_NOT_FOUND
      );
    }
    
    const ticketData = ticketDoc.data() || {};
    
    // Validate that the images belong to this ticket
    const ticketImages = Array.isArray(ticketData.images) ? ticketData.images : [];
    const validImageIds = new Set(ticketImages.map((img: any) => img.id));
    
    const invalidIds = params.ids.filter(id => !validImageIds.has(id));
    if (invalidIds.length > 0) {
      throw new ValidationError(
        `Some images do not belong to this ticket: ${invalidIds.join(', ')}`,
        ErrorCodes.DATA_INVALID
      );
    }
    
    // Track success and failure
    const archivedImages: string[] = [];
    const failedIds: string[] = [];
    
    // Process each image
    for (const imageId of params.ids) {
      try {
        // Find the image in the ticket
        const imageData = ticketImages.find((img: any) => img.id === imageId);
        
        if (!imageData) {
          failedIds.push(imageId);
          continue;
        }
        
        // Create archive record
        const archiveRef = db.collection(ARCHIVE_IMAGES_COLLECTION).doc();
        const timestamp = new Date();
        
        // Copy the image to archive storage
        // In a real implementation, this would copy from active storage to archive storage
        // For now, we're just recording the archival action
        
        // Create archive metadata
        const archiveData = {
          id: archiveRef.id,
          type: 'image',
          originalId: imageId,
          title: imageData.filename || `Image ${imageId}`,
          description: `Image from ticket ${params.ticketId}`,
          date: ticketData.date || timestamp.toISOString(),
          archivedAt: timestamp.toISOString(),
          metadata: {
            ...imageData,
            ticketId: params.ticketId,
            originalPath: imageData.url,
            size: imageData.size || 0,
            contentType: imageData.contentType || 'image/jpeg'
          },
          retentionPeriod: params.retentionPeriod || 365, // Days to keep archived
          expiresAt: new Date(timestamp.getTime() + (params.retentionPeriod || 365) * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Save the archive record
        await archiveRef.set(archiveData);
        
        // Add archive reference to the main index
        await db.collection(ARCHIVE_INDEX_COLLECTION).doc(archiveRef.id).set({
          id: archiveRef.id,
          type: 'image',
          originalId: imageId,
          title: archiveData.title,
          date: archiveData.date,
          archivedAt: archiveData.archivedAt,
          status: 'archived',
          metadata: {
            ticketId: params.ticketId,
            size: imageData.size || 0,
            contentType: imageData.contentType || 'image/jpeg'
          }
        });
        
        archivedImages.push(imageId);
      } catch (error) {
        console.error(`Failed to archive image ${imageId}:`, error);
        failedIds.push(imageId);
      }
    }
    
    // Update ticket to mark images as archived
    if (archivedImages.length > 0) {
      // Update images array to mark archived images
      const updatedImages = ticketImages.map((img: any) => {
        if (archivedImages.includes(img.id)) {
          return {
            ...img,
            archived: true,
            archivedAt: new Date().toISOString()
          };
        }
        return img;
      });
      
      // Update ticket status if all images are archived
      const allImagesArchived = updatedImages.every((img: any) => img.archived);
      let status = ticketData.status || ArchiveStatus.ACTIVE;
      
      if (allImagesArchived) {
        status = ArchiveStatus.IMAGES_ARCHIVED;
      }
      
      await db.collection(TICKETS_COLLECTION).doc(params.ticketId).update({
        images: updatedImages,
        status,
        lastUpdated: new Date().toISOString()
      });
    }
    
    return {
      success: archivedImages.length > 0,
      archivedCount: archivedImages.length,
      ticketId: params.ticketId,
      failedIds: failedIds.length > 0 ? failedIds : undefined
    };
  } catch (error) {
    // Rethrow NotFoundError and ValidationError
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    throw new ServiceError(
      'Failed to archive ticket images',
      'archiveService',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}
