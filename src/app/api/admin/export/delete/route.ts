/**
 * Admin API - Export Delete Handler
 * DELETE /api/admin/export/delete - Delete an export record and file
 */

import { NextResponse } from 'next/server';
import { getFirestoreAdmin, getStorageAdmin, verifyIdToken } from '@/lib/firebase/admin'; // Corrected Firebase admin import + verifyIdToken
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
// Removed old auth imports, replaced by middleware below
import { ref, deleteObject } from 'firebase/storage';
import { deleteExportSchema } from '@/lib/schemas/exportSchemas';
import { createSuccessResponse } from '@/lib/api/responseUtils';
import { handleApiError } from '@/lib/api/middleware'; // Keep handleApiError
import { AuthError } from '@/lib/errors/error-types'; // Import AuthError
import { ValidationError, ForbiddenError, NotFoundError, ErrorCodes } from '@/lib/errors/error-types';

export async function DELETE(request: Request) {
  try {
    // Authenticate user
    // Authenticate user and verify admin role using verifyIdToken
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Authentication required', ErrorCodes.AUTH_INVALID_TOKEN, 401);
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token); // Throws on invalid/expired token

    // Check for admin role
    if (decodedToken.role !== 'admin') {
      throw new ForbiddenError('Admin access required', ErrorCodes.AUTH_FORBIDDEN, 403);
    }
    
    // Use decodedToken.uid instead of session.user.id
    const userId = decodedToken.uid;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = deleteExportSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid request data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        validationResult.error.errors
      );
    }
    
    const { id } = validationResult.data;
    
    // Get export document using getFirestoreAdmin()
    const db = getFirestoreAdmin();
    const exportDocRef = doc(db, 'exports', id);
    const exportDoc = await getDoc(exportDocRef);
    
    if (!exportDoc.exists()) {
      throw new NotFoundError(
        'Export not found',
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { exportId: id }
      );
    }
    
    const exportData = exportDoc.data();
    
    // Verify the export belongs to the user using userId from decodedToken
    // Verify the export belongs to the user using userId from decodedToken (userId defined above)
    if (exportData.userId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to delete this export',
        ErrorCodes.AUTH_FORBIDDEN, // Corrected error code
        403,
        { resourceType: 'export', id: id }
      );
    }
    
    // Delete the storage file if path exists
    if (exportData.storagePath) {
      try {
        const storage = getStorageAdmin(); // Get storage instance
        const storageRef = ref(storage.bucket().name ? storage.bucket() : storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET), exportData.storagePath); // Ensure bucket is referenced correctly
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting export file from storage:', error);
        // Continue with deletion of the export record even if file deletion fails
      }
    }
    
    // Delete the export document (db instance already obtained)
    await deleteDoc(exportDocRef);
    
    // Return standardized success response
    return createSuccessResponse(
      'Export deleted successfully',
      {
        id,
        deletedAt: new Date().toISOString()
      },
      'export'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to delete export');
  }
}
