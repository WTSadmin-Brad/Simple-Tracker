/**
 * Firebase Admin SDK setup
 * 
 * This file initializes the Firebase Admin SDK for server-side operations
 * including Firestore, Storage, and Authentication.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin only once
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

/**
 * Initialize Firebase Admin SDK
 * This should only be called on the server side
 */
export function initializeFirebaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK should only be used on the server side');
  }

  if (!getApps().length) {
    try {
      // Check if we have environment variables for service account
      if (process.env.FIREBASE_PRIVATE_KEY) {
        if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL) {
          throw new Error('Missing required Firebase Admin environment variables. Check your .env.local file.');
        }
        
        initializeApp({
          credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          }),
          storageBucket: FIREBASE_STORAGE_BUCKET
        });
      } else {
        // Fallback initialization for development
        console.warn('Firebase Admin SDK initialized without service account. Some features may not work correctly.');
        
        if (!FIREBASE_PROJECT_ID) {
          throw new Error('Missing FIREBASE_PROJECT_ID environment variable.');
        }
        
        initializeApp({
          projectId: FIREBASE_PROJECT_ID,
          storageBucket: FIREBASE_STORAGE_BUCKET
        });
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }
  
  return getApps()[0];
}

/**
 * Get Firestore Admin instance
 * Used for server-side Firestore operations
 */
export function getFirestoreAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Firestore Admin should only be used on the server side');
  }

  // Initialize app if not already initialized
  if (!getApps().length) {
    initializeFirebaseAdmin();
  }
  
  return getFirestore();
}

/**
 * Get Storage Admin instance
 * Used for server-side Storage operations
 */
export function getStorageAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Storage Admin should only be used on the server side');
  }

  // Initialize app if not already initialized
  if (!getApps().length) {
    initializeFirebaseAdmin();
  }
  
  return getStorage();
}

/**
 * Get Auth Admin instance
 * Used for server-side Auth operations
 */
export function getAuthAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Auth Admin should only be used on the server side');
  }

  // Initialize app if not already initialized
  if (!getApps().length) {
    initializeFirebaseAdmin();
  }
  
  return getAuth();
}

/**
 * Verify ID token
 * Used to verify Firebase Auth ID tokens on the server
 */
export async function verifyIdToken(token: string) {
  if (typeof window !== 'undefined') {
    throw new Error('verifyIdToken should only be used on the server side');
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

/**
 * Create a new user with specified role
 * 
 * @param email - User email
 * @param password - Initial password
 * @param displayName - User display name
 * @param role - User role ('admin' or 'employee')
 * @param createdBy - ID of admin who created the user
 * @returns Created user record
 */
export async function createUserWithRole(
  email: string,
  password: string,
  displayName: string,
  role: 'admin' | 'employee' = 'employee',
  createdBy: string = 'system'
) {
  if (typeof window !== 'undefined') {
    throw new Error('createUserWithRole should only be used on the server side');
  }

  const auth = getAuthAdmin();
  
  try {
    // Create the user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });
    
    // Set custom claims with role
    await auth.setCustomUserClaims(userRecord.uid, { role });
    
    // Store user in Firestore
    const db = getFirestoreAdmin();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      createdAt: new Date(),
      createdBy,
      isActive: true
    });
    
    return userRecord;
  } catch (error) {
    console.error('Error creating user with role:', error);
    throw error;
  }
}

/**
 * Update a user's role
 * 
 * @param uid - User ID to update
 * @param role - New role ('admin' or 'employee')
 * @param updatedBy - ID of admin making the change
 */
export async function updateUserRole(
  uid: string, 
  role: 'admin' | 'employee',
  updatedBy: string = 'system'
) {
  if (typeof window !== 'undefined') {
    throw new Error('updateUserRole should only be used on the server side');
  }

  const auth = getAuthAdmin();
  const db = getFirestoreAdmin();
  
  try {
    // Update custom claims
    await auth.setCustomUserClaims(uid, { role });
    
    // Update user doc in Firestore
    await db.collection('users').doc(uid).update({
      role,
      updatedAt: new Date(),
      updatedBy
    });
    
    return { success: true, uid, role };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Deactivate a user account
 * Preferred over deletion to maintain data integrity
 * 
 * @param uid - User ID to deactivate
 * @param deactivatedBy - ID of admin performing the deactivation
 */
export async function deactivateUser(
  uid: string,
  deactivatedBy: string = 'system'
) {
  if (typeof window !== 'undefined') {
    throw new Error('deactivateUser should only be used on the server side');
  }

  const auth = getAuthAdmin();
  const db = getFirestoreAdmin();
  
  try {
    // Disable the user in Auth
    await auth.updateUser(uid, { disabled: true });
    
    // Update Firestore document
    await db.collection('users').doc(uid).update({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy
    });
    
    return { success: true, uid };
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

/**
 * Reactivate a disabled user account
 * 
 * @param uid - User ID to reactivate
 * @param reactivatedBy - ID of admin performing the reactivation
 */
export async function reactivateUser(
  uid: string,
  reactivatedBy: string = 'system'
) {
  if (typeof window !== 'undefined') {
    throw new Error('reactivateUser should only be used on the server side');
  }

  const auth = getAuthAdmin();
  const db = getFirestoreAdmin();
  
  try {
    // Enable the user in Auth
    await auth.updateUser(uid, { disabled: false });
    
    // Update Firestore document
    await db.collection('users').doc(uid).update({
      isActive: true,
      reactivatedAt: new Date(),
      reactivatedBy
    });
    
    return { success: true, uid };
  } catch (error) {
    console.error('Error reactivating user:', error);
    throw error;
  }
}

/**
 * Get a list of all users with their roles
 * Used by admins for user management
 * 
 * @returns Array of user objects with combined Auth and Firestore data
 */
export async function listUsersWithRoles(limit = 1000) {
  if (typeof window !== 'undefined') {
    throw new Error('listUsersWithRoles should only be used on the server side');
  }

  const auth = getAuthAdmin();
  const db = getFirestoreAdmin();
  
  try {
    // Get users from Auth (limited to specified number)
    const listUsersResult = await auth.listUsers(limit);
    
    // Get additional user data from Firestore
    const userDocs = await db.collection('users').get();
    const firestoreUsers = new Map();
    
    userDocs.forEach(doc => {
      firestoreUsers.set(doc.id, doc.data());
    });
    
    // Combine data from both sources
    const users = listUsersResult.users.map(userRecord => {
      const firestoreData = firestoreUsers.get(userRecord.uid) || {};
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userRecord.customClaims?.role || firestoreData.role || 'employee',
        disabled: userRecord.disabled,
        isActive: firestoreData.isActive,
        createdAt: firestoreData.createdAt,
        lastSignInTime: userRecord.metadata.lastSignInTime
      };
    });
    
    return users;
  } catch (error) {
    console.error('Error listing users with roles:', error);
    throw error;
  }
}

/**
 * Helper functions for common Firestore Admin operations
 */

// Collection reference helper
export const getAdminCollection = (path: string) => {
  const firestore = getFirestoreAdmin();
  return firestore.collection(path);
};

// Document reference helper
export const getAdminDocument = (collectionPath: string, docId: string) => {
  const firestore = getFirestoreAdmin();
  return firestore.collection(collectionPath).doc(docId);
};
