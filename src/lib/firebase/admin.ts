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
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'simple-tracker-99234';
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@simple-tracker-99234.iam.gserviceaccount.com';
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'simple-tracker-99234.firebasestorage.app';

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
        initializeApp({
          credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
          }),
          storageBucket: FIREBASE_STORAGE_BUCKET
        });
      } else {
        // Fallback initialization for development
        console.warn('Firebase Admin SDK initialized without service account. Some features may not work correctly.');
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
