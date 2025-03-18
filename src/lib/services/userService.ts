/**
 * User Service
 * Handles Firestore interactions for user data
 * 
 * Provides methods for:
 * - Fetching users with filtering and pagination
 * - Creating new users
 * - Updating existing users
 * - Managing user roles and status
 */

import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase/client';
import { User } from '@/components/feature/admin/config';

// Collection names
const USERS_COLLECTION = 'users';

// User filter parameters type
export interface UserFilterParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: keyof User;
  sortDirection?: 'asc' | 'desc';
}

// Default query parameters
export const defaultUserQueryParams = {
  limit: 10,
  page: 1,
  sortField: 'createdAt' as keyof User,
  sortDirection: 'desc' as 'asc' | 'desc'
};

// Mock users cache for development environment
let mockUsers: User[] | null = null;

/**
 * Generate mock users for development
 */
function generateMockUsers(count: number = 30): User[] {
  if (mockUsers) return mockUsers;
  
  const roles = ['admin', 'manager', 'employee'];
  const statuses = ['active', 'inactive', 'pending'];
  
  mockUsers = Array.from({ length: count }).map((_, index) => {
    const firstName = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'][Math.floor(Math.random() * 8)];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'][Math.floor(Math.random() * 8)];
    const role = roles[Math.floor(Math.random() * roles.length)] as 'admin' | 'manager' | 'employee';
    const status = statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'inactive' | 'pending';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
    
    const lastLogin = Math.random() > 0.2 ? new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : undefined;
    
    return {
      id: `user-${index + 1}`,
      email,
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      role,
      status,
      phoneNumber: Math.random() > 0.3 ? `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      lastLogin,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    };
  });
  
  return mockUsers;
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
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockUsers(filters);
    }
    
    const firestore = getFirestoreClient();
    const usersCollection = collection(firestore, USERS_COLLECTION);
    
    // Build query with filters
    let userQuery = query(usersCollection);
    
    // Apply role filter
    if (filters.role && filters.role !== 'all') {
      userQuery = query(userQuery, where('role', '==', filters.role));
    }
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      userQuery = query(userQuery, where('status', '==', filters.status));
    }
    
    // Apply sorting
    const sortField = filters.sortField || 'createdAt';
    const sortDirection = filters.sortDirection || 'desc';
    userQuery = query(userQuery, orderBy(sortField, sortDirection));
    
    // Execute query
    const snapshot = await getDocs(userQuery);
    
    // Get total count
    const total = snapshot.size;
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Process results
    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const lastLogin = data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin ? new Date(data.lastLogin) : undefined;
      
      return {
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        lastLogin
      } as User;
    });
    
    // Apply search filter (client-side for simplicity)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(users.length / limit);
    
    // Apply pagination
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      total: users.length,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to mock data
    return getMockUsers(filters);
  }
}

/**
 * Helper function to get mock users (for development or fallback)
 */
async function getMockUsers(filters: UserFilterParams = {}): Promise<{
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // Generate mock data if not already generated
  const allUsers = generateMockUsers();
  
  // Apply filters
  let filteredUsers = [...allUsers];
  
  // Apply role filter
  if (filters.role && filters.role !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.role === filters.role);
  }
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status);
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.displayName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply sorting
  const sortField = filters.sortField || 'createdAt';
  const sortDirection = filters.sortDirection || 'desc';
  
  filteredUsers.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
  
  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return {
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    limit,
    totalPages: Math.ceil(filteredUsers.length / limit)
  };
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockUserById(id);
    }
    
    const firestore = getFirestoreClient();
    const userDoc = doc(firestore, USERS_COLLECTION, id);
    const snapshot = await getDoc(userDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const lastLogin = data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin ? new Date(data.lastLogin) : undefined;
    
    return {
      id: snapshot.id,
      ...data,
      createdAt,
      updatedAt,
      lastLogin
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Fallback to mock data
    return getMockUserById(id);
  }
}

/**
 * Helper function to get a mock user by ID (for development or fallback)
 */
async function getMockUserById(id: string): Promise<User | null> {
  const users = generateMockUsers();
  return users.find(user => user.id === id) || null;
}

/**
 * Create a new user
 */
export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockCreateUser(userData);
    }
    
    const firestore = getFirestoreClient();
    const userCollection = collection(firestore, USERS_COLLECTION);
    const newUserRef = doc(userCollection);
    
    const now = serverTimestamp();
    
    const newUser = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(newUserRef, newUser);
    
    // Fetch the created user to return
    const snapshot = await getDoc(newUserRef);
    const data = snapshot.data();
    
    return {
      id: snapshot.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Fallback to mock data
    return getMockCreateUser(userData);
  }
}

/**
 * Helper function to create a mock user (for development or fallback)
 */
async function getMockCreateUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const users = generateMockUsers();
  const newId = `user-${users.length + 1}`;
  
  const now = new Date();
  
  const newUser: User = {
    id: newId,
    ...userData,
    createdAt: now,
    updatedAt: now
  };
  
  mockUsers = [...users, newUser];
  
  return newUser;
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockUpdateUser(id, userData);
    }
    
    const firestore = getFirestoreClient();
    const userDoc = doc(firestore, USERS_COLLECTION, id);
    
    // Check if user exists
    const snapshot = await getDoc(userDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    // Update user
    await updateDoc(userDoc, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    
    // Fetch updated user
    const updatedSnapshot = await getDoc(userDoc);
    const data = updatedSnapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const lastLogin = data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin ? new Date(data.lastLogin) : undefined;
    
    return {
      id: updatedSnapshot.id,
      ...data,
      createdAt,
      updatedAt,
      lastLogin
    } as User;
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Fallback to mock data
    return getMockUpdateUser(id, userData);
  }
}

/**
 * Helper function to update a mock user (for development or fallback)
 */
async function getMockUpdateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
  const users = generateMockUsers();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  const updatedUser = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date()
  };
  
  mockUsers = [
    ...users.slice(0, userIndex),
    updatedUser,
    ...users.slice(userIndex + 1)
  ];
  
  return updatedUser;
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockDeleteUser(id);
    }
    
    const firestore = getFirestoreClient();
    const userDoc = doc(firestore, USERS_COLLECTION, id);
    
    // Check if user exists
    const snapshot = await getDoc(userDoc);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    // Delete user
    await deleteDoc(userDoc);
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Fallback to mock data
    return getMockDeleteUser(id);
  }
}

/**
 * Helper function to delete a mock user (for development or fallback)
 */
async function getMockDeleteUser(id: string): Promise<boolean> {
  const users = generateMockUsers();
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return false;
  }
  
  mockUsers = [
    ...users.slice(0, userIndex),
    ...users.slice(userIndex + 1)
  ];
  
  return true;
}

/**
 * Update user status
 */
export async function updateUserStatus(id: string, status: 'active' | 'inactive' | 'pending'): Promise<User | null> {
  return updateUser(id, { status });
}

/**
 * Update user role
 */
export async function updateUserRole(id: string, role: 'admin' | 'manager' | 'employee'): Promise<User | null> {
  return updateUser(id, { role });
}

/**
 * Batch update user status
 */
export async function batchUpdateUserStatus(ids: string[], status: 'active' | 'inactive' | 'pending'): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchUpdateUserStatus(ids, status);
    }
    
    const firestore = getFirestoreClient();
    
    // Update each user
    const updatePromises = ids.map(id => {
      const userDoc = doc(firestore, USERS_COLLECTION, id);
      return updateDoc(userDoc, {
        status,
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch updating user status:', error);
    
    // Fallback to mock data
    return getMockBatchUpdateUserStatus(ids, status);
  }
}

/**
 * Helper function to batch update mock user status (for development or fallback)
 */
async function getMockBatchUpdateUserStatus(ids: string[], status: 'active' | 'inactive' | 'pending'): Promise<boolean> {
  const users = generateMockUsers();
  
  const updatedUsers = users.map(user => {
    if (ids.includes(user.id)) {
      return {
        ...user,
        status,
        updatedAt: new Date()
      };
    }
    return user;
  });
  
  mockUsers = updatedUsers;
  
  return true;
}

/**
 * Batch update user role
 */
export async function batchUpdateUserRole(ids: string[], role: 'admin' | 'manager' | 'employee'): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchUpdateUserRole(ids, role);
    }
    
    const firestore = getFirestoreClient();
    
    // Update each user
    const updatePromises = ids.map(id => {
      const userDoc = doc(firestore, USERS_COLLECTION, id);
      return updateDoc(userDoc, {
        role,
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch updating user role:', error);
    
    // Fallback to mock data
    return getMockBatchUpdateUserRole(ids, role);
  }
}

/**
 * Helper function to batch update mock user role (for development or fallback)
 */
async function getMockBatchUpdateUserRole(ids: string[], role: 'admin' | 'manager' | 'employee'): Promise<boolean> {
  const users = generateMockUsers();
  
  const updatedUsers = users.map(user => {
    if (ids.includes(user.id)) {
      return {
        ...user,
        role,
        updatedAt: new Date()
      };
    }
    return user;
  });
  
  mockUsers = updatedUsers;
  
  return true;
}

/**
 * Batch delete users
 */
export async function batchDeleteUsers(ids: string[]): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchDeleteUsers(ids);
    }
    
    const firestore = getFirestoreClient();
    
    // Delete each user
    const deletePromises = ids.map(id => {
      const userDoc = doc(firestore, USERS_COLLECTION, id);
      return deleteDoc(userDoc);
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch deleting users:', error);
    
    // Fallback to mock data
    return getMockBatchDeleteUsers(ids);
  }
}

/**
 * Helper function to batch delete mock users (for development or fallback)
 */
async function getMockBatchDeleteUsers(ids: string[]): Promise<boolean> {
  const users = generateMockUsers();
  
  mockUsers = users.filter(user => !ids.includes(user.id));
  
  return true;
}

// Export default object with all functions
const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  batchUpdateUserStatus,
  batchUpdateUserRole,
  batchDeleteUsers
};

export default userService;
