/**
 * Archive Images Helpers
 * Utilities for accessing archived images
 */

import { ArchiveImagesParams } from '@/lib/schemas/archiveSchemas';
import { archiveTicketImages } from '@/lib/services/archiveService';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { NotFoundError } from '@/lib/errors/error-types';

// Interface for archived image metadata
export interface ArchivedImageMetadata {
  id: string;
  originalTicketId: string;
  originalFilename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  createdAt: string;
  archivedAt: string;
  expiresAt?: string; // Optional expiration date for permanent deletion
}

/**
 * Archive images for a ticket
 * @param params - Images to archive and their ticket ID
 * @returns Result of the archive operation
 */
export async function archiveImages(params: ArchiveImagesParams): Promise<{
  success: boolean;
  archivedCount: number;
  ticketId: string;
  failedIds?: string[];
}> {
  return archiveTicketImages(params);
}

/**
 * Fetch archived image metadata
 * @param imageId - ID of the archived image
 * @returns Metadata for the archived image
 */
export async function fetchArchivedImageMetadata(imageId: string): Promise<ArchivedImageMetadata> {
  const db = getFirestoreAdmin();
  
  // Try to fetch from archive images collection
  const doc = await db.collection('archiveImages').doc(imageId).get();
  
  if (!doc.exists) {
    throw new NotFoundError(`Archived image with ID ${imageId} not found`);
  }
  
  const data = doc.data() as any;
  
  return {
    id: doc.id,
    originalTicketId: data.metadata?.ticketId || '',
    originalFilename: data.metadata?.filename || `image-${doc.id}`,
    url: data.metadata?.url || '',
    thumbnailUrl: data.metadata?.thumbnailUrl,
    size: data.metadata?.size || 0,
    createdAt: data.date || data.archivedAt,
    archivedAt: data.archivedAt,
    expiresAt: data.expiresAt,
  };
}

/**
 * Fetch archived images by ticket ID
 * @param ticketId - ID of the ticket
 * @returns Array of archived image metadata
 */
export async function fetchArchivedImagesByTicket(ticketId: string): Promise<ArchivedImageMetadata[]> {
  const db = getFirestoreAdmin();
  
  // Query for archived images related to this ticket
  const snapshot = await db.collection('archiveImages')
    .where('metadata.ticketId', '==', ticketId)
    .orderBy('archivedAt', 'desc')
    .get();
  
  if (snapshot.empty) {
    return [];
  }
  
  // Map documents to metadata
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    
    return {
      id: doc.id,
      originalTicketId: data.metadata?.ticketId || '',
      originalFilename: data.metadata?.filename || `image-${doc.id}`,
      url: data.metadata?.url || '',
      thumbnailUrl: data.metadata?.thumbnailUrl,
      size: data.metadata?.size || 0,
      createdAt: data.date || data.archivedAt,
      archivedAt: data.archivedAt,
      expiresAt: data.expiresAt,
    };
  });
}

// TODO: Implement proper Firebase Storage integration for archived images
// TODO: Add access control to ensure only admins can access archived images
// TODO: Implement permanent deletion for images older than retention period
