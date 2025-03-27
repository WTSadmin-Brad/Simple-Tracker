/**
 * Admin Users Helpers
 * Utilities for user management in the admin API
 */

import { 
  getFirestoreAdmin, 
  getAuthAdmin, 
  createUserWithRole, 
  updateUserRole,
  deactivateUser,
  reactivateUser,
  listUsersWithRoles
} from '@/lib/firebase/admin';

// User animation preferences
export interface UserAnimationPrefs {
  reducedMotion: boolean;
  hapticFeedback: boolean;
}

// User statistics structure
export interface UserStats {
  ticketsSubmitted: number;
  workdaysLogged: number;
  lastActive: string;
}

// Complete user structure
export interface User {
  username: string;
  role: 'admin' | 'employee';
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  animationPrefs: UserAnimationPrefs;
  stats?: UserStats;
  isActive?: boolean;
  uid?: string;
  email?: string;
  displayName?: string;
}

// Filter parameters for user queries
export interface UserFilterParams {
  role?: string;
  search?: string; // For username search
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

// Pagination structure
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User creation params
export interface CreateUserParams {
  email: string;
  password: string;
  displayName: string;
  username: string;
  role: 'admin' | 'employee';
  animationPrefs?: UserAnimationPrefs;
}

/**
 * Fetch users with filtering and pagination
 * Uses Firebase Admin SDK's listUsersWithRoles
 */
export async function fetchUsers(filters: UserFilterParams): Promise<{ users: User[], pagination: Pagination }> {
  const { page = 1, pageSize = 10, role, search, isActive } = filters;
  
  try {
    // Get users from Firebase Admin 
    const firebaseUsers = await listUsersWithRoles();
    
    // Apply filters
    let filteredUsers = [...firebaseUsers];
    
    // Filter by role if specified
    if (role && ['admin', 'employee'].includes(role)) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Filter by search term (email, displayName)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email?.toLowerCase().includes(searchLower) || 
        user.displayName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by active status if specified
    if (isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }
    
    // Calculate pagination values
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / pageSize);
    
    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
    
    // Transform to app-specific User format
    const users = paginatedUsers.map(fbUser => transformFirebaseUserToAppUser(fbUser));
    
    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Fetch a specific user by username
 */
export async function fetchUserByUsername(username: string): Promise<User | null> {
  try {
    const db = getFirestoreAdmin();
    
    // Query Firestore for user with the given username
    const userSnapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return null;
    }
    
    const userData = userSnapshot.docs[0].data();
    const uid = userSnapshot.docs[0].id;
    
    // Get auth data
    const auth = getAuthAdmin();
    const authUser = await auth.getUser(uid);
    
    // Combine data and transform
    return transformFirebaseUserToAppUser({
      ...userData,
      uid,
      email: authUser.email,
      displayName: authUser.displayName,
      lastSignInTime: authUser.metadata.lastSignInTime
    });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

/**
 * Create a new user
 * Uses Firebase Admin SDK's createUserWithRole
 */
export async function createUser(params: CreateUserParams, createdBy: string): Promise<User> {
  try {
    const { email, password, displayName, role, username, animationPrefs } = params;
    
    // Check username uniqueness in Firestore
    if (await usernameExists(username)) {
      throw new Error('Username already exists');
    }
    
    // Create user with Firebase Admin SDK
    const userRecord = await createUserWithRole(
      email,
      password,
      displayName,
      role,
      createdBy
    );
    
    // Add additional app-specific data to Firestore
    const db = getFirestoreAdmin();
    await db.collection('users').doc(userRecord.uid).update({
      username,
      animationPrefs: animationPrefs || {
        reducedMotion: false,
        hapticFeedback: true
      }
    });
    
    // Return the newly created user
    return {
      username,
      email,
      displayName,
      role,
      uid: userRecord.uid,
      createdAt: new Date().toISOString(),
      createdBy,
      updatedAt: null,
      updatedBy: null,
      isActive: true,
      animationPrefs: animationPrefs || {
        reducedMotion: false,
        hapticFeedback: true
      }
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Change user role
 * Uses Firebase Admin SDK's updateUserRole
 */
export async function changeUserRole(uid: string, role: 'admin' | 'employee', updatedBy: string): Promise<User> {
  try {
    // Update role with Firebase Admin SDK
    await updateUserRole(uid, role, updatedBy);
    
    // Get updated user data
    const auth = getAuthAdmin();
    const db = getFirestoreAdmin();
    
    const [authUser, firestoreUser] = await Promise.all([
      auth.getUser(uid),
      db.collection('users').doc(uid).get()
    ]);
    
    const userData = firestoreUser.data();
    
    return transformFirebaseUserToAppUser({
      ...userData,
      uid,
      email: authUser.email,
      displayName: authUser.displayName,
      lastSignInTime: authUser.metadata.lastSignInTime
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    throw error;
  }
}

/**
 * Activate or deactivate a user
 * Uses Firebase Admin SDK's activateUser or deactivateUser
 */
export async function setUserActiveStatus(uid: string, isActive: boolean, adminId: string): Promise<User> {
  try {
    if (isActive) {
      await reactivateUser(uid, adminId);
    } else {
      await deactivateUser(uid, adminId);
    }
    
    // Get updated user data
    const auth = getAuthAdmin();
    const db = getFirestoreAdmin();
    
    const [authUser, firestoreUser] = await Promise.all([
      auth.getUser(uid),
      db.collection('users').doc(uid).get()
    ]);
    
    const userData = firestoreUser.data();
    
    return transformFirebaseUserToAppUser({
      ...userData,
      uid,
      email: authUser.email,
      displayName: authUser.displayName,
      lastSignInTime: authUser.metadata.lastSignInTime
    });
  } catch (error) {
    console.error(`Error ${isActive ? 'activating' : 'deactivating'} user:`, error);
    throw error;
  }
}

/**
 * Validate user data
 */
export function validateUserData(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  // Password validation (only check if present - for create operation)
  if (data.password !== undefined) {
    if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
  }
  
  // Display name validation
  if (!data.displayName) {
    errors.push('Display name is required');
  }
  
  // Username validation
  if (!data.username) {
    errors.push('Username is required');
  } else if (!/^[a-z0-9_]{3,16}$/.test(data.username)) {
    errors.push('Username must be 3-16 characters and can only contain lowercase letters, numbers, and underscores');
  }
  
  // Role validation
  if (!data.role) {
    errors.push('Role is required');
  } else if (!['admin', 'employee'].includes(data.role)) {
    errors.push('Role must be either "admin" or "employee"');
  }
  
  return { 
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Check if username exists
 */
export async function usernameExists(username: string): Promise<boolean> {
  try {
    const db = getFirestoreAdmin();
    
    const snapshot = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking username existence:', error);
    throw error;
  }
}

/**
 * Transform Firebase user object to app User format
 */
function transformFirebaseUserToAppUser(fbUser: any): User {
  return {
    uid: fbUser.uid,
    username: fbUser.username || '',
    email: fbUser.email || '',
    displayName: fbUser.displayName || '',
    role: fbUser.role || 'employee',
    createdAt: fbUser.createdAt ? new Date(fbUser.createdAt).toISOString() : new Date().toISOString(),
    createdBy: fbUser.createdBy || 'system',
    updatedAt: fbUser.updatedAt ? new Date(fbUser.updatedAt).toISOString() : null,
    updatedBy: fbUser.updatedBy || null,
    isActive: fbUser.isActive !== undefined ? fbUser.isActive : true,
    animationPrefs: fbUser.animationPrefs || {
      reducedMotion: false,
      hapticFeedback: true
    },
    stats: fbUser.stats || {
      ticketsSubmitted: 0,
      workdaysLogged: 0,
      lastActive: fbUser.lastSignInTime || new Date().toISOString()
    }
  };
}
