/**
 * Firebase Admin SDK setup
 * 
 * This file initializes the Firebase Admin SDK for server-side operations
 * including Firestore, Storage, and Authentication.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import bcrypt from 'bcrypt';

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
      // Ensure all required environment variables for service account are present
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !privateKey) {
        console.error('Missing required Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Check your environment configuration.');
        throw new Error('Missing required Firebase Admin environment variables.');
      }

      // Initialize with service account credentials
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines in private key
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: FIREBASE_STORAGE_BUCKET,
      });
      
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

  const auth = getAuthAdmin(); // Use getAuthAdmin to ensure initialization
  try {
    // Verify the ID token while checking if the token is revoked.
    const checkRevoked = true;
    const decodedToken = await auth.verifyIdToken(token, checkRevoked);
    return decodedToken;
  } catch (error: any) {
    let errorMessage = 'Error verifying ID token.';
    if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'ID token has been revoked. Please re-authenticate.';
      console.warn(errorMessage, { uid: error.uid }); // Log revoked token UID if available
    } else if (error.code === 'auth/id-token-expired') {
      errorMessage = 'ID token has expired. Please re-authenticate.';
      console.warn(errorMessage);
    } else {
      // Log other verification errors
      console.error('Error verifying ID token:', error.code, error.message);
    }
    // Re-throw a generic error or a more specific one if needed downstream
    throw new Error(errorMessage);
  }
}

/**
 * Create a new user with specified role
 * 
 * @param username - User's chosen username (for login)
 * @param password - Initial password
 * @param displayName - User display name
 * @param role - User role ('admin' or 'employee')
 * @param createdBy - ID of admin who created the user
 * @returns Created user record
 */
export async function createUserWithRole(
  username: string, // Changed from email
  password: string,
  displayName: string,
  role: 'admin' | 'employee' = 'employee',
  createdBy: string = 'system'
): Promise<UserRecord> { // Added return type hint
  if (typeof window !== 'undefined') {
    throw new Error('createUserWithRole should only be used on the server side');
  }

  const auth = getAuthAdmin();
  const db = getFirestoreAdmin();
  
  try {
    // 1. Hash the password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. Create the Firebase Auth user (using a placeholder email)
    // Firebase Auth might still require an email, but we use username for login.
    // Password is required here for creation, but login uses the hash in Firestore.
    const placeholderEmail = `${username}@placeholder.app`;
    const userRecord = await auth.createUser({
      email: placeholderEmail,
      emailVerified: false, // Mark placeholder email as not verified
      password: password, // Required by Firebase Auth for creation
      displayName: displayName,
      disabled: false,
    });
    
    // 3. Set custom claims with role immediately
    await auth.setCustomUserClaims(userRecord.uid, { role });
    
    // 4. Store user details (including username and hashed password) in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: username, // Store the actual username
      passwordHash: passwordHash, // Store the hashed password
      displayName: displayName,
      role: role,
      createdAt: new Date(),
      createdBy: createdBy,
      isActive: true,
      // email: placeholderEmail, // Optionally store placeholder email if needed for reference
    });
    
    console.log(`User created successfully: ${username} (UID: ${userRecord.uid})`);
    return userRecord;

  } catch (error: any) {
    // Log specific Firebase errors if possible
    if (error.code === 'auth/email-already-exists') {
       console.error(`Error creating user: Placeholder email ${username}@placeholder.app likely conflicts. This might indicate the username is effectively taken or a collision occurred.`, error);
       // Consider deleting the partially created Auth user if necessary
       // await auth.deleteUser(partiallyCreatedUid).catch(delErr => console.error('Failed to clean up partially created user', delErr));
       throw new Error(`Username or placeholder email conflict for ${username}.`);
    } else {
      console.error(`Error creating user ${username} with role ${role}:`, error);
    }
    throw error; // Re-throw the original error
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
