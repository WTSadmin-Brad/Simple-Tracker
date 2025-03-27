/**
 * Admin API - Export Delete Handler
 * DELETE /api/admin/export/delete - Delete an export record and file
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { verifyAdminRole } from '@/lib/auth/verify-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';
import { deleteExportSchema } from '@/lib/schemas/exportSchemas';

export async function DELETE(request: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify admin role
    const isAdmin = await verifyAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = deleteExportSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const { id } = validationResult.data;
    
    // Get export document
    const exportDocRef = doc(db, 'exports', id);
    const exportDoc = await getDoc(exportDocRef);
    
    if (!exportDoc.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Export not found'
        },
        { status: 404 }
      );
    }
    
    const exportData = exportDoc.data();
    
    // Verify the export belongs to the user
    if (exportData.userId !== session.user.id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You do not have permission to delete this export'
        },
        { status: 403 }
      );
    }
    
    // Delete the storage file if path exists
    if (exportData.storagePath) {
      try {
        const storageRef = ref(storage, exportData.storagePath);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting export file from storage:', error);
        // Continue with deletion of the export record even if file deletion fails
      }
    }
    
    // Delete the export document
    await deleteDoc(exportDocRef);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Export deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting export:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete export'
      },
      { status: 500 }
    );
  }
}
