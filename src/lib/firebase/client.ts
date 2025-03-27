/**
 * Firebase Client SDK setup
 * 
 * This file initializes the Firebase Client SDK for browser-side operations
 * including Firestore, Storage, and Authentication.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Make sure the required environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Firebase configuration error: Missing required environment variables. Check your .env.local file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const firestoreInstance = getFirestore(app);
const storageInstance = getStorage(app);
const authInstance = getAuth(app);

// Initialize Analytics only on client side
if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics initialization error:', error);
  }
}

/**
 * Get Firebase app instance
 */
export function getFirebaseApp() {
  return app;
}

/**
 * Get Firestore instance
 * Used for client-side Firestore operations
 */
export function getFirestoreClient() {
  return firestoreInstance;
}

/**
 * Get Storage instance
 * Used for client-side Storage operations
 */
export function getStorageClient() {
  return storageInstance;
}

/**
 * Get Auth instance
 * Used for client-side Auth operations
 */
export function getAuthClient() {
  return authInstance;
}

/**
 * Helper functions for common Firestore operations
 */

// Collection reference helper
export const getCollection = (path: string) => {
  return collection(firestoreInstance, path);
};

// Document reference helper
export const getDocument = (collectionPath: string, docId: string) => {
  return doc(firestoreInstance, collectionPath, docId);
};

// Storage reference helper
export const getStorageRef = (path: string) => {
  return ref(storageInstance, path);
};

// Export Firestore functions for direct use
export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  collection
};

// Export Storage functions for direct use
export {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
