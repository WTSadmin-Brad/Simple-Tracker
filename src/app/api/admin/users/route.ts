/**
 * Admin Users API Route
 * 
 * Handles admin operations for user management:
 * - GET: Retrieve users with filtering and pagination
 * - POST: Create a new user
 * - PUT: Update user details (including role changes)
 * - DELETE: Deactivate a user (soft delete)
 */

import { NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { 
  fetchUsers, 
  createUser, 
  usernameExists,
  UserFilterParams,
  changeUserRole,
  setUserActiveStatus,
  CreateUserParams
} from './helpers';
import { ValidationError, ErrorCodes, ForbiddenError, NotFoundError } from '@/lib/errors/error-types';
import { z } from 'zod';

// Schema for creating a new user
const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-z0-9._-]+$/, { message: "Username can only contain lowercase letters, numbers, and ._-" }),
  role: z.enum(["admin", "employee"], { 
    errorMap: () => ({ message: "Role must be either 'admin' or 'employee'" })
  }),
  animationPrefs: z.object({
    reducedMotion: z.boolean().optional(),
    hapticFeedback: z.boolean().optional()
  }).optional()
});

// Schema for changing role
const changeRoleSchema = z.object({
  action: z.literal("changeRole"),
  uid: z.string().min(1, { message: "User ID is required" }),
  data: z.object({
    role: z.enum(["admin", "employee"], { 
      errorMap: () => ({ message: "Role must be either 'admin' or 'employee'" })
    })
  })
});

// Schema for setting active status
const setActiveStatusSchema = z.object({
  action: z.literal("setActiveStatus"),
  uid: z.string().min(1, { message: "User ID is required" }),
  data: z.object({
    isActive: z.boolean()
  })
});

// Combined update schema using discriminated union
const updateUserSchema = z.discriminatedUnion("action", [
  changeRoleSchema,
  setActiveStatusSchema
]);

/**
 * GET handler for retrieving users with filtering and pagination
 * 
 * @route GET /api/admin/users
 * @authentication Required with admin role
 */
export const GET = authenticateRequest(async (userId, request) => {
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    // 2. Process the request
    return await handleGetUsers(request);
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve users');
  }
});

/**
 * POST handler for creating a new user
 * 
 * @route POST /api/admin/users
 * @authentication Required with admin role
 */
export const POST = authenticateRequest(async (userId, request) => {
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    // 2. Process the request
    return await handleCreateUser(userId, request);
  } catch (error) {
    return handleApiError(error, 'Failed to create user');
  }
});

/**
 * PUT handler for updating a user
 * 
 * @route PUT /api/admin/users
 * @authentication Required with admin role
 */
export const PUT = authenticateRequest(async (userId, request) => {
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    // 2. Process the request
    return await handleUpdateUser(userId, request);
  } catch (error) {
    return handleApiError(error, 'Failed to update user');
  }
});

/**
 * DELETE handler for deactivating a user
 * 
 * @route DELETE /api/admin/users
 * @authentication Required with admin role
 */
export const DELETE = authenticateRequest(async (userId, request) => {
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    // 2. Process the request
    return await handleDeactivateUser(userId, request);
  } catch (error) {
    return handleApiError(error, 'Failed to deactivate user');
  }
});

/**
 * Verifies the user has admin role
 * @param userId User ID to verify
 * @throws ForbiddenError if user is not an admin
 */
async function verifyAdminRole(userId: string) {
  const auth = getAuthAdmin();
  const user = await auth.getUser(userId);
  
  const customClaims = user.customClaims || {};
  if (!customClaims.role || customClaims.role !== 'admin') {
    throw new ForbiddenError(
      'Admin access required',
      ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
      { 
        requiredRole: 'admin',
        userRole: customClaims.role || 'none'
      }
    );
  }
  
  return user;
}

/**
 * Handle GET request for retrieving users
 * @param request - The HTTP request
 * @returns Response with users data
 */
async function handleGetUsers(request: Request) {
  // Extract query parameters for filtering and pagination
  const url = new URL(request.url);
  
  // Build filter params from search parameters
  const filters: UserFilterParams = {
    role: url.searchParams.get('role') || undefined,
    search: url.searchParams.get('search') || undefined,
    isActive: url.searchParams.has('isActive') 
      ? url.searchParams.get('isActive') === 'true' 
      : undefined,
    page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page') || '1', 10) : undefined,
    pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') || '10', 10) : undefined
  };
  
  // Use helper function to fetch users with filtering
  const { users, pagination } = await fetchUsers(filters);
  
  return NextResponse.json({
    success: true,
    message: 'Users retrieved successfully',
    count: users.length,
    users,
    pagination
  });
}

/**
 * Handle POST request for creating a new user
 * @param adminUserId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with created user data
 */
async function handleCreateUser(adminUserId: string, request: Request) {
  // Parse request body
  const body = await request.json();
  
  try {
    // Validate user data with Zod
    const validatedData = createUserSchema.parse(body);
    
    // Check if username already exists
    if (await usernameExists(validatedData.username)) {
      throw new ValidationError(
        'Username already exists',
        ErrorCodes.VALIDATION_DUPLICATE_ENTRY,
        409,
        { field: 'username', value: validatedData.username }
      );
    }
    
    // Use helper to create new user with Firebase Admin SDK
    const userParams: CreateUserParams = {
      email: validatedData.email,
      password: validatedData.password,
      displayName: validatedData.displayName,
      username: validatedData.username,
      role: validatedData.role,
      animationPrefs: validatedData.animationPrefs
    };
    
    const newUser = await createUser(userParams, adminUserId);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid user data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: 'invalid_field'
        }))
      );
    }
    
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('email-already-exists')) {
        throw new ValidationError(
          'Email already exists',
          ErrorCodes.VALIDATION_DUPLICATE_ENTRY,
          409,
          { field: 'email' }
        );
      }
      
      if (error.message.includes('invalid-password')) {
        throw new ValidationError(
          'Invalid password - must be at least 6 characters',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          { field: 'password' }
        );
      }
    }
    
    throw error;
  }
}

/**
 * Handle PUT request for updating a user
 * @param adminUserId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with updated user data
 */
async function handleUpdateUser(adminUserId: string, request: Request) {
  // Parse request body
  const body = await request.json();
  
  try {
    // Validate with Zod schema
    const validatedData = updateUserSchema.parse(body);
    const { action, uid } = validatedData;
    
    // Handle different update actions
    switch (action) {
      case 'changeRole': {
        const { role } = validatedData.data;
        const updatedUser = await changeUserRole(uid, role, adminUserId);
        
        return NextResponse.json({
          success: true,
          message: `User role updated to ${role}`,
          user: updatedUser
        });
      }
      
      case 'setActiveStatus': {
        const { isActive } = validatedData.data;
        const statusUser = await setUserActiveStatus(uid, isActive, adminUserId);
        
        return NextResponse.json({
          success: true,
          message: isActive ? 'User activated' : 'User deactivated',
          user: statusUser
        });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid update data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: 'invalid_field'
        }))
      );
    }
    
    throw error;
  }
}

/**
 * Handle DELETE request for deactivating a user
 * @param adminUserId - The admin's user ID 
 * @param request - The HTTP request
 * @returns Response with deactivation confirmation
 */
async function handleDeactivateUser(adminUserId: string, request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid');
  
  if (!uid) {
    throw new ValidationError(
      'User ID is required',
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'uid' }
    );
  }
  
  try {
    // We don't actually delete users, we deactivate them
    const deactivatedUser = await setUserActiveStatus(uid, false, adminUserId);
    
    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      user: {
        uid,
        deactivatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('user-not-found')) {
      throw new NotFoundError(
        'User not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'user', id: uid }
      );
    }
    
    throw error;
  }
}
