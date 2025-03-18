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

// Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSvb79jEdv-8hex7D1NP2d4YYPJoK-1Bjqmo",
  authDomain: "simple-tracker-99234.firebaseapp.com",
  projectId: "simple-tracker-99234",
  storageBucket: "simple-tracker-99234.firebasestorage.app",
  messagingSenderId: "3441135708B",
  appId: "1:3441135708B:web:d6bb4ca3172ce3b78dc1ed",
  measurementId: "G-P9TCQFTW4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const firestoreInstance = getFirestore(app);
const storageInstance = getStorage(app);
const authInstance = getAuth(app);

// Initialize Analytics only on client side
if (typeof window !== 'undefined') {
  getAnalytics(app);
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
