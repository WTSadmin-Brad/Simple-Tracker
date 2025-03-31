/**
 * Firebase Implementation
 *
 * Comprehensive documentation of Firebase implementation in Simple Tracker
 * Last updated: March 24, 2025
 */

# Firebase Implementation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Firebase Client Implementation](#firebase-client-implementation)
4. [Firebase Admin Implementation](#firebase-admin-implementation)
5. [Data Model](#data-model)
6. [Authentication Flow](#authentication-flow)
7. [API Route Patterns](#api-route-patterns)
8. [Security Rules](#security-rules)
9. [Performance Considerations](#performance-considerations)
10. [Future Improvements](#future-improvements)

## Overview

Simple Tracker uses Firebase as its primary backend, specifically leveraging Firebase Authentication, Firestore, and Cloud Storage. The implementation follows a dual-client approach with separate client-side and admin-side integrations to provide appropriate security boundaries and permission controls.

### Key Components

- **Firebase Authentication**: Manages user identity and access
- **Firestore**: NoSQL database for storing application data
- **Cloud Storage**: Storage for user-uploaded images
- **Firebase Admin SDK**: Server-side implementation for administrative operations

### Philosophy

Our Firebase implementation prioritizes:

1. **Security**: Strict access controls and data validation
2. **Performance**: Optimized queries and data structure
3. **Simplicity**: Clear patterns and predictable behavior
4. **Scalability**: Design that accommodates growth

## Architecture

The Firebase implementation follows a layered architecture that separates client-side and server-side operations:

```markdown
┌─────────────────────────────────────────────────────────────┐
│                      Client Components                       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer (lib/services)             │
└───────────┬─────────────────────────────────┬───────────────┘
            │                                 │
            ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│     Firebase Client      │      │       API Routes         │
│   (lib/firebase/client)  │      │    (app/api/*/route.ts)  │
└──────────────────────────┘      └──────┬───────────────────┘
                                                │
                                                ▼
                                  ┌──────────────────────────┐
                                  │     Firebase Admin       │
                                  │   (lib/firebase/admin)   │
                                  └──────────────────────────┘
```

### Data Flow

1. **Client-side operations**: Components → Services → Firebase Client SDK
2. **Admin operations**: Components → Services → API Routes → Firebase Admin SDK
3. **Authentication**: Auth state managed through Firebase auth provider

## Firebase Client Implementation

The client-side Firebase implementation is located in `src/lib/firebase/client.ts` and provides browser-safe access to Firebase services.

### Key Features

- Secure initialization using environment variables
- Service singletons for Firestore, Storage, and Auth
- Helper functions for common Firestore operations
- Analytics integration (browser-only)

### Initialization

```typescript
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
```

### Service Access

Client-side code accesses Firebase services through getter functions:

- `getFirestoreClient()`
- `getStorageClient()`
- `getAuthClient()`

### Usage Pattern

Services should not directly call Firebase client functions. Instead, use the service layer:

```typescript
// DON'T: Direct Firebase usage in components
const doc = await getDoc(doc(db, 'users', id));

// DO: Use service layer
const user = await userService.getUserById(id);
```

## Firebase Admin Implementation

The Firebase Admin SDK implementation is located in `src/lib/firebase/admin.ts` and provides server-side access to Firebase services with elevated privileges.

### Admin Key Features

- Server-side only initialization with service account
- Authorization verification functions
- User management operations (creation, role updates, activation/deactivation)
- Secure document access

### Admin Initialization

The Admin SDK is initialized with service account credentials stored as environment variables:

```typescript
initializeApp({
  credential: cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  storageBucket: FIREBASE_STORAGE_BUCKET
});
```

### Admin Service Access

Server-side code accesses Firebase Admin services through getter functions:

- `getFirestoreAdmin()`
- `getStorageAdmin()`
- `getAuthAdmin()`

### Admin Usage Pattern

Admin SDK operations should be performed only in API routes and server components.

## Data Model

Firestore data is organized into collections with specific purposes:

### Collections

- **users**: User profiles and preferences
- **tickets**: Field worker ticket submissions
- **workdays**: Daily work logs
- **jobsites**: Work locations
- **trucks**: Vehicle inventory
- **settings**: Application configuration
- **audit**: Audit trail for significant actions

### Schema Examples

#### User Document

```typescript
interface User {
  uid: string;              // Firebase Auth UID
  email: string;            // User email
  displayName: string;      // Full name
  username: string;         // Unique username
  role: 'admin' | 'employee'; // User role
  isActive: boolean;        // Account status
  createdAt: string;        // ISO date string
  createdBy: string;        // Admin UID who created this user
  updatedAt: string | null; // ISO date string
  updatedBy: string | null; // Admin UID who last updated this user
  lastLoggedIn: string | null; // ISO date string
  animationPrefs: {         // Animation preferences
    reducedMotion: boolean;
    hapticFeedback: boolean;
  };
}
```

#### Ticket Document

```typescript
interface Ticket {
  id: string;               // Ticket ID
  userId: string;           // Creator UID
  date: string;             // ISO date string
  jobsite: string;          // Job location
  truckId: string;          // Truck identifier
  categories: {             // Category counters
    [key: string]: number;
  };
  imageUrls: string[];      // Storage URLs to images
  status: 'submitted' | 'processing' | 'completed';
  createdAt: string;        // ISO date string
  updatedAt: string | null; // ISO date string
  updatedBy: string | null; // Admin UID who last updated this ticket
}
```

## Authentication Flow

Simple Tracker uses Firebase Authentication for identity management with a custom authentication flow.

### Client-Side Authentication

1. **Login Form**: User submits credentials (email/password)
2. **Firebase Auth**: Credentials validated by Firebase Authentication  
3. **Token Management**: Authentication tokens stored in secure cookies
4. **State Management**: Auth state tracked in Zustand store
5. **Protected Routes**: Client-side route protection based on auth state

```typescript
// Client-side authentication using Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase/client";

const auth = getAuthClient();
const { user, token } = await signInWithEmailAndPassword(auth, email, password);
```

### Server-Side Authentication

Server-side authentication is handled through:

1. **API Route Middleware**: Centralized authentication middleware for API routes
2. **Token Verification**: Firebase Admin SDK to verify authentication tokens
3. **User ID Extraction**: Secure extraction of user ID from verified tokens

#### Centralized Authentication Middleware

The application uses a centralized `authenticateRequest` middleware to handle authentication consistently across all API routes:

```typescript
// Authentication middleware in src/lib/api/middleware.ts
export const authenticateRequest = <Params extends object = {}>(
  handler: (userId: string, req: Request, params: Params) => Promise<Response>
) => {
  return async (request: Request, params: Params): Promise<Response> => {
    try {
      // Extract token from header
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ValidationError(
          'Authentication required',
          ErrorCodes.AUTH_REQUIRED,
          401
        );
      }
      
      const token = authHeader.split('Bearer ')[1];
      
      // Verify token and extract user ID
      const auth = getAuthAdmin();
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;
      
      // Call the actual route handler with user ID
      return handler(userId, request, params);
    } catch (error) {
      return handleApiError(error, 'Authentication failed');
    }
  };
};
```

## API Route Patterns

The Simple Tracker API follows standardized patterns for consistency, maintainability, and security.

### Core API Route Principles

1. **Consistent Authentication**: All routes use the `authenticateRequest` middleware
2. **Standardized Error Handling**: Centralized error handling with detailed context
3. **Validation with Zod**: All input data validated using Zod schemas
4. **Structured Response Format**: Consistent response structure
5. **Separation of Concerns**: Route handlers separated from business logic

### Standard Route Structure

```typescript
// Standard API route pattern
export const METHOD = authenticateRequest(async (userId, request) => {
  try {
    // 1. Verify permissions if needed (e.g., admin role)
    await verifyAdminRole(userId);
    
    // 2. Process the request with a handler function
    return await handleOperation(userId, request);
  } catch (error) {
    return handleApiError(error, 'Operation failed');
  }
});

// Handler function pattern
async function handleOperation(userId: string, request: Request) {
  // 1. Parse and validate request data
  const body = await request.json();
  const validatedData = schemaName.parse(body);
  
  // 2. Perform business logic
  const result = await performOperation(validatedData);
  
  // 3. Return standardized response
  return NextResponse.json({
    success: true,
    message: 'Operation completed successfully',
    data: result
  });
}
```

### Permission Verification

Admin routes include standardized admin role verification:

```typescript
// Standard admin role verification
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
```

### Batch Operations

Batch operations follow a consistent pattern with tracking for successes and failures:

```typescript
// Batch update pattern
async function handleBatchUpdate(userId: string, data) {
  const { itemIds, updates } = data;
  const db = getFirestoreAdmin();
  const batch = db.batch();
  
  // Track results
  const results = {
    successful: [] as string[],
    failed: [] as {id: string, reason: string}[]
  };
  
  // Process each item
  for (const itemId of itemIds) {
    const itemRef = db.collection(COLLECTION_NAME).doc(itemId);
    const itemSnapshot = await itemRef.get();
    
    if (!itemSnapshot.exists) {
      results.failed.push({
        id: itemId,
        reason: 'Item not found'
      });
      continue;
    }
    
    // Add to batch with audit fields
    batch.update(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    });
    
    results.successful.push(itemId);
  }
  
  // Execute batch
  await batch.commit();
  
  return results;
}
```

### Error Types and Codes

The application uses consistent error types and codes:

```typescript
// Error types with context
export class ValidationError extends BaseError {
  constructor(
    message: string, 
    code: string, 
    statusCode = 400,
    context?: Record<string, any>
  ) {
    super(message, code, statusCode, context);
  }
}

export class ForbiddenError extends BaseError {
  constructor(
    message: string, 
    code: string, 
    context?: Record<string, any>
  ) {
    super(message, code, 403, context);
  }
}

export class NotFoundError extends BaseError {
  constructor(
    message: string, 
    code: string, 
    context?: Record<string, any>
  ) {
    super(message, code, 404, context);
  }
}
```

## Security Rules

Firestore security rules enforce access control based on user authentication, roles, and document ownership.

### Core Security Principles

1. **Least Privilege**: Users can only access data they need
2. **Data Validation**: Enforced at the database level
3. **Role Enforcement**: Different access for admins vs employees
4. **User Isolation**: Users can only see their own data

### Example Security Rules

```typescript
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User collection rules
    match /users/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));
      allow write: if isAdmin();
    }
    
    // Ticket collection rules
    match /tickets/{ticketId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(resource.data.userId));
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

## Performance Considerations

Our Firebase implementation includes optimizations for performance:

### Query Optimization

- **Indexes**: Custom indexes for frequently queried combinations
- **Query Limits**: All queries include limits to prevent excessive reads
- **Compound Queries**: Designed to leverage Firestore's querying strengths

### Data Structure Optimization

- **Denormalization**: Strategic duplication to minimize joins
- **Subcollections**: Used for one-to-many relationships
- **Document Size**: Keeping documents under 1MB

### Caching Strategy

- **Local Persistence**: Enabled for offline support
- **React Query**: Used for server state caching
- **API Route Caching**: Implemented where appropriate

## Future Improvements

The Firebase implementation has several areas for future enhancement:

### Short-Term Improvements

1. **Centralized Schema Validation**: Move to a unified schema definition approach with Zod in `/src/lib/schemas/`
2. **Enhanced Offline Support**: Improve synchronization for field workers in areas with poor connectivity
3. **API Route Testing**: Add comprehensive testing for API routes
4. **Error Recovery Mechanisms**: Add retry logic for failed operations

### Medium-Term Improvements

1. **Custom Claims Expansion**: Extend custom claims to include more user attributes
2. **Firestore Data Migration System**: Create a system for managing schema changes
3. **Analytics Integration**: Deeper integration with Firebase Analytics
4. **Enhanced Audit Trail**: More comprehensive activity logging

### Long-Term Considerations

1. **Multi-Region Configuration**: Expand to multiple Firebase regions for lower latency
2. **Function Integration**: Add Cloud Functions for backend processing
3. **Edge Functions**: Explore Firebase/Firestore with Edge computing for even faster responses
