/**
 * Tickets API - Images Dynamic Handler
 * Handles permanent and temporary image operations
 */

import { NextResponse } from 'next/server';
import { handleApiError, authenticateRequest } from '@/lib/api/middleware';
import { getStorageAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { ValidationError, NotFoundError, UnauthorizedError, ErrorCodes } from '@/lib/errors/error-types';
import { 
  validateImage, 
  MAX_IMAGE_SIZE, 
  ALLOWED_IMAGE_TYPES, 
  generateThumbnail 
} from '@/lib/helpers/imageHelpers';
import { 
  TempImageMetadata, 
  generateTempImageId, 
  calculateExpirationTime, 
  createTempImageMetadata 
} from '../temp/helpers';

// Storage paths for images
const TEMP_IMAGES_PATH = 'temp-images';
const TICKETS_IMAGES_PATH = 'tickets';
const THUMBNAILS_FOLDER = 'thumbnails';

// Firestore collections
const TEMP_IMAGES_COLLECTION = 'tempImages';
const TICKETS_COLLECTION = 'tickets';

/**
 * GET handler for retrieving images
 * 
 * @route GET /api/tickets/images/[type]
 * @authentication Required
 */
export const GET = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { type: string } }
) => {
  const { type } = params;
  
  try {
    // Handle different image types based on the dynamic parameter
    switch (type) {
      case 'temp':
        return await handleGetTempImages(request, userId);
      default:
        return await handleGetImages(request, userId);
    }
  } catch (error) {
    return handleApiError(error, `Failed to fetch ${type} images`);
  }
});

/**
 * POST handler for uploading images
 * 
 * @route POST /api/tickets/images/[type]
 * @authentication Required
 */
export const POST = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { type: string } }
) => {
  const { type } = params;
  
  try {
    // Handle different image types based on the dynamic parameter
    switch (type) {
      case 'temp':
        return await handleUploadTempImage(request, userId);
      default:
        return await handleUploadImage(request, userId);
    }
  } catch (error) {
    return handleApiError(error, `Failed to upload ${type} image`);
  }
});

/**
 * DELETE handler for removing images
 * 
 * @route DELETE /api/tickets/images/[type]
 * @authentication Required
 */
export const DELETE = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { type: string } }
) => {
  const { type } = params;
  
  try {
    // Handle different image types based on the dynamic parameter
    switch (type) {
      case 'temp':
        return await handleDeleteTempImage(request, userId);
      default:
        return await handleDeleteImage(request, userId);
    }
  } catch (error) {
    return handleApiError(error, `Failed to delete ${type} image`);
  }
});

/**
 * Retrieve permanent images for a specific ticket
 * @param request Request object
 * @param userId User ID
 * @returns Response with image array
 */
async function handleGetImages(request: Request, userId: string) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticketId');
    
    if (!ticketId) {
      throw new ValidationError(
        'Ticket ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'ticketId' }
      );
    }
    
    // Get Firestore instance
    const db = getFirestoreAdmin();
    
    // Verify ticket exists and belongs to user
    const ticketDoc = await db.collection(TICKETS_COLLECTION).doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      throw new NotFoundError(
        'Ticket not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    const ticketData = ticketDoc.data();
    
    // Check ticket ownership (unless admin)
    if (ticketData?.userId !== userId) {
      // TODO: Add admin check here using user claims
      throw new UnauthorizedError(
        'Unauthorized to access this ticket',
        ErrorCodes.RESOURCE_ACCESS_DENIED,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    // Get Storage instance
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Retrieve image URLs
    const images = [];
    
    if (ticketData?.images && Array.isArray(ticketData.images)) {
      for (const imagePath of ticketData.images) {
        try {
          // Generate signed URLs for each image
          const [url] = await bucket.file(imagePath).getSignedUrl({
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          });
          
          // Get file metadata
          const [metadata] = await bucket.file(imagePath).getMetadata();
          
          images.push({
            id: imagePath.split('/').pop() || imagePath,
            path: imagePath,
            url,
            contentType: metadata.contentType,
            size: metadata.size,
            name: imagePath.split('/').pop(),
            uploadTime: metadata.timeCreated
          });
        } catch (error) {
          console.error(`Error getting signed URL for ${imagePath}:`, error);
          // Skip problematic images but continue with the rest
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Images retrieved successfully',
      count: images.length,
      images
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}

/**
 * Upload a permanent image to a specific ticket
 * @param request Request object
 * @param userId User ID
 * @returns Response with uploaded image details
 */
async function handleUploadImage(request: Request, userId: string) {
  try {
    // Check if request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      throw new ValidationError(
        'Content type must be multipart/form-data',
        ErrorCodes.VALIDATION_INVALID_CONTENT_TYPE,
        400,
        { contentType }
      );
    }
    
    // Get form data with image file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const ticketId = formData.get('ticketId') as string;
    const tempId = formData.get('tempId') as string;
    
    // Check if this is a conversion from temp image or a direct upload
    if (tempId) {
      // Convert a temporary image to permanent
      return await handleConvertTempImage(userId, ticketId, tempId);
    }
    
    // Validate direct upload inputs
    if (!file) {
      throw new ValidationError(
        'No image file provided',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'file' }
      );
    }
    
    if (!ticketId) {
      throw new ValidationError(
        'Ticket ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'ticketId' }
      );
    }
    
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new ValidationError(
        validation.error || 'Invalid image',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        { details: validation.error }
      );
    }
    
    // Verify ticket exists and belongs to user
    const db = getFirestoreAdmin();
    const ticketDoc = await db.collection(TICKETS_COLLECTION).doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      throw new NotFoundError(
        'Ticket not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    const ticketData = ticketDoc.data();
    
    // Check ticket ownership (unless admin)
    if (ticketData?.userId !== userId) {
      // TODO: Add admin check here using user claims
      throw new UnauthorizedError(
        'Unauthorized to modify this ticket',
        ErrorCodes.RESOURCE_ACCESS_DENIED,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    // Get Firebase Storage
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Create a storage path for the image
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${TICKETS_IMAGES_PATH}/${ticketId}/${filename}`;
    
    // Convert File to Buffer for Firebase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload file to Firebase Storage
    const fileRef = bucket.file(filePath);
    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        contentType: file.type,
        metadata: {
          userId,
          ticketId,
          originalName: file.name
        }
      }
    });
    
    // Generate signed URL for the uploaded file
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Update ticket with new image
    const currentImages = ticketData?.images || [];
    await db.collection(TICKETS_COLLECTION).doc(ticketId).update({
      images: [...currentImages, filePath],
      imageCount: currentImages.length + 1,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Image uploaded successfully',
      id: filePath,
      url,
      fileName: file.name,
      contentType: file.type,
      size: file.size
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}

/**
 * Delete a permanent image from a specific ticket
 * @param request Request object
 * @param userId User ID
 * @returns Response with success message
 */
async function handleDeleteImage(request: Request, userId: string) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticketId');
    const imagePath = url.searchParams.get('path');
    
    if (!ticketId) {
      throw new ValidationError(
        'Ticket ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'ticketId' }
      );
    }
    
    if (!imagePath) {
      throw new ValidationError(
        'Image path is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'path' }
      );
    }
    
    // Get Firestore instance
    const db = getFirestoreAdmin();
    
    // Verify ticket exists and belongs to user
    const ticketDoc = await db.collection(TICKETS_COLLECTION).doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      throw new NotFoundError(
        'Ticket not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    const ticketData = ticketDoc.data();
    
    // Check ticket ownership (unless admin)
    if (ticketData?.userId !== userId) {
      // TODO: Add admin check here using user claims
      throw new UnauthorizedError(
        'Unauthorized to modify this ticket',
        ErrorCodes.RESOURCE_ACCESS_DENIED,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    // Verify image exists in ticket
    const currentImages = ticketData?.images || [];
    if (!currentImages.includes(imagePath)) {
      throw new NotFoundError(
        'Image not found in this ticket',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'image', ticketId }
      );
    }
    
    // Get Storage instance
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Delete image file from Storage
    try {
      await bucket.file(imagePath).delete();
    } catch (error) {
      console.error('Error deleting storage file:', error);
      // Continue with Firestore update even if Storage deletion fails
    }
    
    // Update ticket by removing the image
    const updatedImages = currentImages.filter(img => img !== imagePath);
    await db.collection(TICKETS_COLLECTION).doc(ticketId).update({
      images: updatedImages,
      imageCount: updatedImages.length,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully',
      id: imagePath.split('/').pop() || imagePath,
      path: imagePath
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}

/**
 * Convert temporary image to permanent ticket image
 * @param userId User ID
 * @param ticketId Ticket ID
 * @param tempId Temporary image ID
 * @returns Response with converted image details
 */
async function handleConvertTempImage(userId: string, ticketId: string, tempId: string) {
  try {
    // Validate inputs
    if (!ticketId) {
      throw new ValidationError(
        'Ticket ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'ticketId' }
      );
    }
    
    if (!tempId) {
      throw new ValidationError(
        'Temporary image ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'tempId' }
      );
    }
    
    // Get Firestore instance
    const db = getFirestoreAdmin();
    
    // Verify temp image exists and belongs to user
    const tempImageDoc = await db.collection(TEMP_IMAGES_COLLECTION).doc(tempId).get();
    
    if (!tempImageDoc.exists) {
      throw new NotFoundError(
        'Temporary image not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'tempImage', id: tempId }
      );
    }
    
    const tempImageData = tempImageDoc.data() as TempImageMetadata;
    
    // Check image ownership
    if (tempImageData.userId !== userId) {
      throw new UnauthorizedError(
        'Unauthorized to access this image',
        ErrorCodes.RESOURCE_ACCESS_DENIED,
        { resourceType: 'tempImage', id: tempId }
      );
    }
    
    // Verify ticket exists and belongs to user
    const ticketDoc = await db.collection(TICKETS_COLLECTION).doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      throw new NotFoundError(
        'Ticket not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    const ticketData = ticketDoc.data();
    
    // Check ticket ownership
    if (ticketData?.userId !== userId) {
      throw new UnauthorizedError(
        'Unauthorized to modify this ticket',
        ErrorCodes.RESOURCE_ACCESS_DENIED,
        { resourceType: 'ticket', id: ticketId }
      );
    }
    
    // Get Storage instance
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Define source and destination paths
    const tempFilePath = tempImageData.storagePath;
    const permanentFilePath = `${TICKETS_IMAGES_PATH}/${ticketId}/${tempId}_${tempImageData.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Copy the file to the new path
    await bucket.file(tempFilePath).copy(bucket.file(permanentFilePath));
    
    // Update file metadata
    await bucket.file(permanentFilePath).setMetadata({
      metadata: {
        tempImage: null,
        userId,
        ticketId,
        originalName: tempImageData.filename,
        convertedAt: new Date().toISOString()
      }
    });
    
    // Generate signed URL for the new file
    const [url] = await bucket.file(permanentFilePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Update ticket with new image
    const currentImages = ticketData?.images || [];
    await db.collection(TICKETS_COLLECTION).doc(ticketId).update({
      images: [...currentImages, permanentFilePath],
      imageCount: currentImages.length + 1,
      updatedAt: new Date().toISOString()
    });
    
    // Delete the temporary image (both storage and metadata)
    try {
      await bucket.file(tempFilePath).delete();
      
      // If there's a thumbnail, delete that too
      if (tempImageData.thumbnailPath) {
        await bucket.file(tempImageData.thumbnailPath).delete();
      }
    } catch (error) {
      console.error('Error deleting temp storage file:', error);
      // Continue even if deletion fails
    }
    
    // Delete temp image document from Firestore
    await db.collection(TEMP_IMAGES_COLLECTION).doc(tempId).delete();
    
    return NextResponse.json({ 
      success: true,
      message: 'Temporary image converted successfully',
      id: permanentFilePath,
      url,
      originalFileName: tempImageData.filename,
      size: tempImageData.size
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}

/**
 * Retrieve temporary images for a specific session
 * @param request Request object
 * @param userId User ID
 * @returns Response with temp images array
 */
async function handleGetTempImages(request: Request, userId: string) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      throw new ValidationError(
        'Session ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'sessionId' }
      );
    }
    
    // Get Firestore instance
    const db = getFirestoreAdmin();
    
    // Query temporary images for this user and session
    const imagesRef = db.collection(TEMP_IMAGES_COLLECTION);
    const querySnapshot = await imagesRef
      .where('userId', '==', userId)
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Process results
    const images: TempImageMetadata[] = [];
    querySnapshot.forEach(doc => {
      images.push(doc.data() as TempImageMetadata);
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Temporary images retrieved successfully',
      count: images.length,
      images
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}

/**
 * Upload a temporary image for a specific session
 * @param request Request object
 * @param userId User ID
 * @returns Response with uploaded temp image details
 */
async function handleUploadTempImage(request: Request, userId: string) {
  try {
    // Check if request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      throw new ValidationError(
        'Content type must be multipart/form-data',
        ErrorCodes.VALIDATION_INVALID_CONTENT_TYPE,
        400,
        { contentType }
      );
    }
    
    // Get form data with image file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string;
    
    // Validate inputs
    if (!file) {
      throw new ValidationError(
        'No image file provided',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'file' }
      );
    }
    
    if (!sessionId) {
      throw new ValidationError(
        'Session ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'sessionId' }
      );
    }
    
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      throw new ValidationError(
        validation.error || 'Invalid image',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        { details: validation.error }
      );
    }
    
    // Get Firebase Storage
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Create a unique filename for the image
    const imageId = generateTempImageId();
    const filename = `${imageId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${TEMP_IMAGES_PATH}/${userId}/${filename}`;
    
    // Convert File to Buffer for Firebase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload file to Firebase Storage
    const fileRef = bucket.file(filePath);
    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        contentType: file.type,
        metadata: {
          tempImage: 'true',
          userId,
          sessionId,
          originalName: file.name,
          expiresAt: calculateExpirationTime()
        }
      }
    });
    
    // Generate signed URL for the uploaded file
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Create thumbnail path (we'll implement generation separately)
    const thumbnailPath = `${TEMP_IMAGES_PATH}/${userId}/${THUMBNAILS_FOLDER}/${filename}`;
    
    // Create metadata for Firestore
    const metadata = {
      id: imageId,
      userId,
      sessionId,
      url,
      filename: file.name,
      size: file.size,
      storagePath: filePath,
      thumbnailPath,
      createdAt: new Date().toISOString(),
      expiresAt: calculateExpirationTime()
    };
    
    // Save metadata to Firestore
    const db = getFirestoreAdmin();
    await db.collection(TEMP_IMAGES_COLLECTION).doc(imageId).set(metadata);
    
    return NextResponse.json({ 
      success: true,
      message: 'Temporary image uploaded successfully',
      id: imageId,
      url,
      fileName: file.name,
      size: file.size,
      expiresAt: calculateExpirationTime()
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}

/**
 * Delete a temporary image
 * @param request Request object
 * @param userId User ID
 * @returns Response with success message
 */
async function handleDeleteTempImage(request: Request, userId: string) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const imageId = url.searchParams.get('id');
    
    if (!imageId) {
      throw new ValidationError(
        'Image ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'id' }
      );
    }
    
    // Get Firestore instance
    const db = getFirestoreAdmin();
    
    // Get image metadata
    const imageDoc = await db.collection(TEMP_IMAGES_COLLECTION).doc(imageId).get();
    
    if (!imageDoc.exists) {
      throw new NotFoundError(
        'Image not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'tempImage', id: imageId }
      );
    }
    
    const imageData = imageDoc.data() as TempImageMetadata;
    
    // Verify ownership
    if (imageData.userId !== userId) {
      throw new UnauthorizedError(
        'Unauthorized to delete this image',
        ErrorCodes.RESOURCE_ACCESS_DENIED,
        { resourceType: 'tempImage', id: imageId }
      );
    }
    
    // Get Storage instance
    const storage = getStorageAdmin();
    const bucket = storage.bucket();
    
    // Delete image file from Storage
    if (imageData.storagePath) {
      try {
        await bucket.file(imageData.storagePath).delete();
      } catch (error) {
        console.error('Error deleting storage file:', error);
        // Continue with Firestore deletion even if Storage deletion fails
      }
    }
    
    // Delete thumbnail if exists
    if (imageData.thumbnailPath) {
      try {
        await bucket.file(imageData.thumbnailPath).delete();
      } catch (error) {
        console.error('Error deleting thumbnail file:', error);
        // Continue even if thumbnail deletion fails
      }
    }
    
    // Delete document from Firestore
    await db.collection(TEMP_IMAGES_COLLECTION).doc(imageId).delete();
    
    return NextResponse.json({ 
      success: true,
      message: 'Temporary image deleted successfully',
      id: imageId
    });
  } catch (error) {
    throw error; // Let the main handler catch and format the error
  }
}
