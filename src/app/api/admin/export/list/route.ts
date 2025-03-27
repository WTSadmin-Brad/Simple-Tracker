/**
 * Admin API - Export List Handler
 * GET /api/admin/export/list - Get a list of available exports
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { verifyAdminRole } from '@/lib/auth/verify-admin';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { exportItemSchema, ExportItem } from '@/lib/schemas/exportSchemas';

export async function GET(request: Request) {
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
    
    // Extract query parameters
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const maxResults = limitParam ? parseInt(limitParam, 10) : 20;
    
    // Query exports from Firestore
    const exportsCollection = collection(db, 'exports');
    const exportsQuery = query(
      exportsCollection,
      where('userId', '==', session.user.id),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const exportsSnapshot = await getDocs(exportsQuery);
    
    // Format the response data
    const exports = exportsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Parse and format dates
      const createdAt = data.createdAt?.toDate?.() 
        ? data.createdAt.toDate().toISOString() 
        : new Date(data.createdAt).toISOString();
      
      const expiresAt = data.expiresAt?.toDate?.() 
        ? data.expiresAt.toDate().toISOString() 
        : new Date(data.expiresAt).toISOString();
      
      return {
        id: doc.id,
        type: data.type,
        format: data.format,
        url: data.url,
        filename: data.filename,
        createdAt,
        expiresAt,
        recordCount: data.recordCount,
        status: data.status || 'completed',
        errorMessage: data.errorMessage,
        userId: data.userId,
      };
    });
    
    // Validate response data
    const validExports = exports.filter(item => {
      try {
        exportItemSchema.parse(item);
        return true;
      } catch (error) {
        console.error(`Invalid export item data:`, error);
        return false;
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      exports: validExports
    });
  } catch (error) {
    console.error('Error fetching exports:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch exports'
      },
      { status: 500 }
    );
  }
}
