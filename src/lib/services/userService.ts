/**
 * User Service
 * Handles server-side operations for user data using Firebase Admin SDK
 *
 * Provides methods for:
 * - Fetching users with filtering and pagination
 * - Retrieving user details
 * - Creating new users
 * - Updating user roles and active status
 * - Deleting users (disabling)
 */

import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { User } from '@/components/feature/admin/config';
import { ServiceError, NotFoundError, ErrorCodes } from '../errors/error-types';
// import { hashPassword } from '../helpers/authHelpers'; // TODO: Locate or create this helper
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp

// User filter parameters type
export interface UserFilterParams {
  role?: string;
  isActive?: boolean | string;
  search?: string;
  page?: number;
  pageSize?: number;
  // Admin SDK listUsers doesn't support arbitrary field sorting easily,
  // sorting might need to be done after fetching or limited to supported fields.
  // sortField?: keyof User;
  // sortDirection?: 'asc' | 'desc';
}

// Firestore collection name
const USERS_COLLECTION = 'users';

/**
 * Get users with filtering and pagination using Firebase Admin SDK
 */
export async function getUsers(filters: UserFilterParams = {}): Promise<{
  users: User[];
  total: number; // Note: Admin SDK listUsers provides paginated results, getting total requires extra steps or assumptions
  page: number;
  limit: number;
  totalPages: number; // Calculated based on total and limit
}> {
  try {
    const adminAuth = getAuthAdmin();
    const adminFirestore = getFirestoreAdmin();

    // Admin SDK listUsers pagination is token-based, not offset-based.
    // For simplicity here, we might fetch all users matching basic filters
    // and then apply search/pagination in memory, or implement token-based pagination.
    // Fetching all users can be inefficient for large user bases.

    // Fetch all users (consider performance implications)
    // TODO: Implement proper pagination using page tokens if user base is large
    const listUsersResult = await adminAuth.listUsers(1000); // Max 1000 per call

    let allAuthUsers = listUsersResult.users;
    let nextPageToken = listUsersResult.pageToken;

    // Fetch remaining users if pageToken exists
    while (nextPageToken) {
      const nextPageResult = await adminAuth.listUsers(1000, nextPageToken);
      allAuthUsers = allAuthUsers.concat(nextPageResult.users);
      nextPageToken = nextPageResult.pageToken;
    }

    // Fetch corresponding Firestore user documents for roles/additional data
    const userDocsPromises = allAuthUsers.map(authUser =>
      adminFirestore.collection(USERS_COLLECTION).doc(authUser.uid).get()
    );
    const userDocsSnapshots = await Promise.all(userDocsPromises);

    let combinedUsers = allAuthUsers.map((authUser, index) => {
      const firestoreDoc = userDocsSnapshots[index];
      const firestoreData = firestoreDoc.exists ? firestoreDoc.data() : {};
      return transformUserFromAdminSDK(authUser, firestoreData);
    });

    // Apply filters in memory
    if (filters.role && filters.role !== 'all') {
      combinedUsers = combinedUsers.filter(user => user.role === filters.role);
    }

    if (filters.isActive !== undefined && filters.isActive !== 'all') {
      const isActiveFilter = String(filters.isActive) === 'true';
      combinedUsers = combinedUsers.filter(user => user.isActive === isActiveFilter);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      combinedUsers = combinedUsers.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm) ||
        user.uid?.toLowerCase().includes(searchTerm) // Add optional chaining for uid
      );
    }

    // Apply pagination in memory
    const total = combinedUsers.length;
    const page = filters.page || 1;
    const limit = filters.pageSize || 10;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = combinedUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages,
    };

  } catch (error: any) {
    console.error('Error fetching users with Admin SDK:', error);
    throw new ServiceError(
      'Failed to fetch users',
      'userService.getUsers',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error.message }
    );
  }
}

/**
 * Get a single user by ID using Firebase Admin SDK
 */
export async function getUserById(uid: string): Promise<User | null> {
  try {
    const adminAuth = getAuthAdmin();
    const adminFirestore = getFirestoreAdmin();

    const authUser = await adminAuth.getUser(uid);
    const firestoreDoc = await adminFirestore.collection(USERS_COLLECTION).doc(uid).get();
    const firestoreData = firestoreDoc.exists ? firestoreDoc.data() : {};

    if (!authUser) { // Should technically throw if not found by adminAuth.getUser
      return null;
    }

    return transformUserFromAdminSDK(authUser, firestoreData);

  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return null; // User doesn't exist
    }
    console.error(`Error fetching user ${uid} with Admin SDK:`, error);
    throw new ServiceError(
      `Failed to fetch user ${uid}`,
      'userService.getUserById',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error.message }
    );
  }
}

/**
 * Create a new user using Firebase Admin SDK
 */
export async function createUser(userData: {
  email: string;
  password?: string; // Password optional if using other providers or manual setup
  displayName: string;
  username: string; // Assuming username is stored in Firestore
  role: 'admin' | 'employee';
  isActive?: boolean;
  // Add other fields needed for Firestore document
}): Promise<User> {
  try {
    const adminAuth = getAuthAdmin();
    const adminFirestore = getFirestoreAdmin();

    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      password: userData.password, // Ensure password meets requirements
      displayName: userData.displayName,
      emailVerified: true, // Or false, depending on flow
      disabled: !(userData.isActive ?? true), // Disable user if isActive is false
    });

    const uid = userRecord.uid;

    // 2. Set custom claims (role)
    await adminAuth.setCustomUserClaims(uid, { role: userData.role });

    // 3. Create corresponding user document in Firestore
    const now = new Date();
    const userDocRef = adminFirestore.collection(USERS_COLLECTION).doc(uid);
    const firestoreData = {
      uid: uid, // Redundant but can be useful
      email: userData.email,
      displayName: userData.displayName,
      username: userData.username,
      role: userData.role,
      isActive: userData.isActive ?? true,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      // Add any other fields from userData as needed
    };

    // Hash password if provided and store hash in Firestore (if needed for custom login)
    // Note: If using Firebase standard providers, storing hash isn't needed for Firebase Auth itself.
    // If implementing custom username/password flow as per docs, store hash here.
    // if (userData.password) {
    //    // firestoreData.passwordHash = await hashPassword(userData.password); // TODO: Uncomment when helper is available
    // }
    await userDocRef.set(firestoreData);
    } // End of try block operations

    // Fetch the newly created user data to return consistent format
    const newUser = await getUserById(uid);
    if (!newUser) {
      throw new Error('Failed to retrieve newly created user data.');
    }
    return newUser;

  } catch (error: any) {
    console.error('Error creating user with Admin SDK:', error);
    // Handle specific errors like 'auth/email-already-exists'
    if (error.code === 'auth/email-already-exists') {
      throw new ServiceError(
        'Email already in use',
        'userService.createUser',
        ErrorCodes.AUTH_EMAIL_IN_USE, // Use existing error code for email conflict
        409,
        { email: userData.email }
      );
    }
    throw new ServiceError(
      'Failed to create user',
      'userService.createUser',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error.message }
    );
  }
}

/**
 * Change user role using Firebase Admin SDK (Custom Claims)
 */
export async function changeUserRole(uid: string, role: 'admin' | 'employee'): Promise<User | null> {
  try {
    const adminAuth = getAuthAdmin();
    const adminFirestore = getFirestoreAdmin();

    // 1. Set custom claim
    await adminAuth.setCustomUserClaims(uid, { role });

    // 2. Update role in Firestore document for consistency (optional but recommended)
    const userDocRef = adminFirestore.collection(USERS_COLLECTION).doc(uid);
    await userDocRef.update({
      role: role,
      updatedAt: Timestamp.now()
    });

    // Return updated user data
    return await getUserById(uid);

  } catch (error: any) {
    console.error(`Error changing role for user ${uid}:`, error);
     if (error.code === 'auth/user-not-found') {
      throw new NotFoundError(`User ${uid} not found`, ErrorCodes.DATA_NOT_FOUND);
    }
    throw new ServiceError(
      `Failed to change role for user ${uid}`,
      'userService.changeUserRole',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error.message }
    );
  }
}

/**
 * Set user active status using Firebase Admin SDK
 */
export async function setUserActiveStatus(uid: string, isActive: boolean): Promise<User | null> {
  try {
    const adminAuth = getAuthAdmin();
    const adminFirestore = getFirestoreAdmin();

    // 1. Enable/disable user in Firebase Auth
    await adminAuth.updateUser(uid, { disabled: !isActive });

    // 2. Update status in Firestore document
    const userDocRef = adminFirestore.collection(USERS_COLLECTION).doc(uid);
    await userDocRef.update({
      isActive: isActive,
      updatedAt: Timestamp.now()
    });

    // Return updated user data
    return await getUserById(uid);

  } catch (error: any) {
    console.error(`Error updating active status for user ${uid}:`, error);
     if (error.code === 'auth/user-not-found') {
      throw new NotFoundError(`User ${uid} not found`, ErrorCodes.DATA_NOT_FOUND);
    }
    throw new ServiceError(
      `Failed to update active status for user ${uid}`,
      'userService.setUserActiveStatus',
      ErrorCodes.SERVICE_UNAVAILABLE,
      500,
      { originalError: error.message }
    );
  }
}

/**
 * Delete a user using Firebase Admin SDK (Disables user, doesn't permanently delete)
 * Note: For permanent deletion, use adminAuth.deleteUser(uid) and handle Firestore cleanup.
 */
export async function deleteUser(uid: string): Promise<boolean> {
   try {
    // This function now disables the user instead of deleting
    await setUserActiveStatus(uid, false);
    // Optionally add logic here to mark as 'deleted' in Firestore if needed
    return true;
  } catch (error: any) {
     if (error instanceof NotFoundError) {
       console.warn(`Attempted to delete non-existent user: ${uid}`);
       return false; // Or handle as needed - was user already deleted?
     }
    console.error(`Error disabling user ${uid}:`, error);
    return false;
  }
}


/**
 * Transform user data from Firebase Admin SDK format to local User type
 */
function transformUserFromAdminSDK(
  authUser: import('firebase-admin/auth').UserRecord,
  firestoreData: FirebaseFirestore.DocumentData | undefined = {}
): User {
  const metadata = authUser.metadata;
  const creationTime = metadata?.creationTime ? new Date(metadata.creationTime) : new Date();
  const lastSignInTime = metadata?.lastSignInTime ? new Date(metadata.lastSignInTime) : undefined;
  // Use Firestore role if available, fallback to claims, then default
  const role = firestoreData?.role || authUser.customClaims?.role || 'employee';

  return {
    id: authUser.uid,
    uid: authUser.uid,
    email: authUser.email || '',
    displayName: authUser.displayName || firestoreData?.displayName || '',
    username: firestoreData?.username || '', // Get username from Firestore
    role: role,
    isActive: !authUser.disabled, // Get active status from Auth
    phoneNumber: authUser.phoneNumber || firestoreData?.phoneNumber,
    lastLogin: lastSignInTime,
    createdAt: creationTime,
    updatedAt: firestoreData?.updatedAt?.toDate() || creationTime, // Use Firestore updatedAt
    // Map other fields from firestoreData if necessary
    // animationPrefs: firestoreData?.animationPrefs,
  };
}

// Export default object with all functions
const userService = {
  getUsers,
  getUserById,
  createUser,
  changeUserRole,
  setUserActiveStatus,
  deleteUser
};

export default userService;
