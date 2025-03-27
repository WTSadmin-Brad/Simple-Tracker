/**
 * User Service
 * Handles server-side API calls for user data using Firebase Admin
 * 
 * Provides methods for:
 * - Fetching users with filtering and pagination
 * - Retrieving user details
 * - Creating new users
 * - Updating user roles and active status
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import { User } from '@/components/feature/admin/config';

// User filter parameters type
export interface UserFilterParams {
  role?: string;
  isActive?: boolean | string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Admin API base URL
const API_BASE_URL = '/api/admin/users';

/**
 * Get authorization header for server-side API calls
 */
async function getAuthHeader() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('Authentication required');
  }
  return {
    'Authorization': `Bearer ${session.accessToken}`
  };
}

/**
 * Get users with filtering, sorting, and pagination
 */
export async function getUsers(filters: UserFilterParams = {}): Promise<{
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    // Build query params
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.role && filters.role !== 'all') {
      queryParams.set('role', filters.role);
    }
    
    if (filters.isActive !== undefined && filters.isActive !== 'all') {
      queryParams.set('isActive', typeof filters.isActive === 'boolean' 
        ? String(filters.isActive) 
        : filters.isActive);
    }
    
    if (filters.search) {
      queryParams.set('search', filters.search);
    }
    
    // Add pagination
    if (filters.page) {
      queryParams.set('page', String(filters.page));
    }
    
    if (filters.pageSize) {
      queryParams.set('pageSize', String(filters.pageSize));
    }
    
    // Make API request
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users');
    }
    
    // Extract data from response
    const { users, pagination } = result.data;
    
    // Format response for component
    return {
      users: users.map(transformUserFromApi),
      total: pagination.total,
      page: pagination.page,
      limit: pagination.pageSize,
      totalPages: pagination.totalPages
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty result on error
    return {
      users: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(uid: string): Promise<User | null> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/${uid}`, {
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user');
    }
    
    return transformUserFromApi(result.data.user);
  } catch (error) {
    console.error(`Error fetching user ${uid}:`, error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string;
  password: string;
  displayName: string;
  username: string;
  role: 'admin' | 'employee';
  animationPrefs?: {
    reducedMotion: boolean;
    hapticFeedback: boolean;
  };
}): Promise<User | null> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create user');
    }
    
    return transformUserFromApi(result.data);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Change user role
 */
export async function changeUserRole(uid: string, role: 'admin' | 'employee'): Promise<User | null> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'changeRole',
        uid,
        data: { role }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to change user role: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to change user role');
    }
    
    return transformUserFromApi(result.data);
  } catch (error) {
    console.error('Error changing user role:', error);
    return null;
  }
}

/**
 * Set user active status
 */
export async function setUserActiveStatus(uid: string, isActive: boolean): Promise<User | null> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'setActiveStatus',
        uid,
        data: { isActive }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user status: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user status');
    }
    
    return transformUserFromApi(result.data);
  } catch (error) {
    console.error('Error updating user status:', error);
    return null;
  }
}

/**
 * Delete a user (deactivates rather than truly deleting)
 */
export async function deleteUser(uid: string): Promise<boolean> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}?uid=${uid}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result.success === true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * Transform user data from API format to component format
 */
function transformUserFromApi(apiUser: any): User {
  // Convert Firebase timestamp to Date if needed
  const createdAt = apiUser.createdAt instanceof Date 
    ? apiUser.createdAt 
    : new Date(apiUser.createdAt);
    
  const updatedAt = apiUser.updatedAt instanceof Date 
    ? apiUser.updatedAt 
    : new Date(apiUser.updatedAt);
    
  const lastLogin = apiUser.lastLogin 
    ? (apiUser.lastLogin instanceof Date ? apiUser.lastLogin : new Date(apiUser.lastLogin))
    : undefined;
    
  // Map Firebase Auth user to our User interface
  return {
    id: apiUser.uid,
    uid: apiUser.uid,
    email: apiUser.email,
    displayName: apiUser.displayName,
    username: apiUser.username,
    role: apiUser.role,
    isActive: apiUser.isActive,
    phoneNumber: apiUser.phoneNumber,
    lastLogin,
    createdAt,
    updatedAt,
    animationPrefs: apiUser.animationPrefs
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
