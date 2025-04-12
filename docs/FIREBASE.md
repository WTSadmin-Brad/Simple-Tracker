---

## title: Simple Tracker Firebase Implementation

date: 2025-04-06
tags: [firebase, database, authentication, storage, security, data-model, firestore]
status: official
author: Development Team

# Simple Tracker Firebase Implementation

## Table of Contents

1.  [Overview](#overview)
2.  [Firebase Architecture](#firebase-architecture)
3.  [Firebase Client Implementation](#firebase-client-implementation)
4.  [Firebase Admin Implementation](#firebase-admin-implementation)
5.  [Data Model](#data-model)
6.  [Authentication Framework](#authentication-framework)
7.  [Security Rules](#security-rules)
8.  [Storage Implementation](#storage-implementation)
9.  [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)

## Overview

Simple Tracker uses Firebase as its primary backend platform, leveraging Firebase Authentication, Firestore, and Cloud Storage. This document describes the implementation architecture, patterns, and best practices used throughout the application, reflecting the current state based on `Data_Models_Schema.md`, `firestore.rules`, `firestore.indexes.json`, and `storage.rules`.

### Core Firebase Services

The application utilizes three primary Firebase services:

1.  **Firebase Authentication**: Manages user identity and access control.
2.  **Firestore**: NoSQL document database for storing application data.
3.  **Cloud Storage**: Object storage for user-uploaded images, exports, and archives.

### Implementation Philosophy

Simple Tracker's Firebase implementation follows these core principles:

1.  **Security**: Strict access controls at multiple levels (authentication, role-based permissions via custom claims, security rules).
2.  **Performance**: Optimized data structure, query patterns, and indexing for a responsive user experience.
3.  **Simplicity**: Clear patterns and predictable behavior for maintainability.
4.  **Scalability**: Design that accommodates future growth and feature expansion.

## Firebase Architecture

The Firebase implementation follows a layered architecture separating client-side and server-side operations for appropriate security boundaries and permission controls.

### Client vs. Admin Separation

The application maintains strict separation between client-side and server-side Firebase access:

1.  **Client SDK**: Used in browser context for direct user actions.
    *   Limited to user-specific operations.
    *   Subject to Firestore and Storage security rules.
    *   Access controlled by authentication state.
2.  **Admin SDK**: Used in server context (API routes, backend functions) for privileged operations, including custom token minting and ID token verification.
    *   Administrative operations (user management, data exports/archives).
    *   Cross-user data access.
    *   Security rule bypassing for trusted server environments.

### Directory Structure

```
/src
  /lib
    /firebase
      /client.ts       # Client-side Firebase initialization and accessors
      /admin.ts        # Server-side Firebase initialization and accessors
    /api
      /middleware.ts   # Authentication middleware for API routes using Admin SDK
```

### Service Access Pattern

Firebase services are accessed through centralized getter functions that ensure consistent initialization:

-   Client-side: `getFirestoreClient()`, `getStorageClient()`, `getAuthClient()`
-   Server-side: `getFirestoreAdmin()`, `getStorageAdmin()`, `getAuthAdmin()`

## Firebase Client Implementation

The client-side Firebase implementation provides browser-safe access to Firebase services for direct user interactions.

### Client Initialization

Firebase client SDK is initialized using environment variables (`NEXT_PUBLIC_FIREBASE_*`) with appropriate security considerations:

-   API keys and configuration stored securely.
-   Service initialization only when needed (lazy loading).
-   Singleton pattern for service instances.

### Client-Side Service Access

Client-side code accesses Firebase services through getter functions:

-   Authentication state tracking via `onAuthStateChanged`.
-   User profile management (limited updates allowed by rules).
-   Document access restricted by Firestore security rules.
-   File uploads governed by Storage security rules.

### Client Security Considerations

The client implementation includes specific security measures:

-   Token refresh management handled automatically by the SDK.
-   Secure handling of authentication state (e.g., using context providers).
-   Error handling for permission violations from Firestore/Storage rules.
-   No exposure of sensitive Admin SDK capabilities.

## Firebase Admin Implementation

The server-side Firebase implementation provides privileged access for administrative operations and cross-user functionality, typically within Next.js API routes or dedicated backend functions.

### Admin Initialization

The Admin SDK is initialized with service account credentials stored securely in server-side environment variables:

-   Server-side only initialization.
-   Secure credential management (e.g., Google Secret Manager or environment variables).
-   Provides full access to Firestore, Storage, and Auth APIs.

### API Route Integration

Admin SDK operations are integrated with API routes:

-   Authentication middleware **mandatorily verifies** user ID tokens using `authAdmin.verifyIdToken()`.
-   Role-based access control checks **verified custom claims** (e.g., `role`) extracted from the server-verified ID token.
-   Enables cross-user data operations (e.g., fetching all workdays for an admin).
-   Supports batch processing and transactions.

### Administrative Operations

The Admin SDK enables specialized administrative operations:

-   User management (creation with secure password hashing, updates, deletion).
-   Setting custom claims (e.g., `role`) for role-based access control.
-   Minting Firebase Custom Tokens for the username/password flow.
-   Verifying ID Tokens for secure API access.
-   **Note:** The Admin SDK is now a required dependency for core authentication and authorization logic.
-   Data migration, export generation, and archiving processes.
-   System-wide operations bypassing standard security rules.

## Data Model

Firestore data is organized into collections with standardized document schemas, as defined in `Data_Models_Schema.md`.

### Collection Structure

The database uses the following primary collections:

-   **`users`**: User profiles, roles, and preferences, linked to Firebase Auth UID.
-   **`jobsites`**: Information about work locations, managed by admins.
-   **`trucks`**: Equipment information, managed by admins.
-   **`workdays`**: Employee daily work records (hours, type, jobsite).
-   **`tickets`**: Ticket submissions from field workers, including categorized counts and image references.
-   **`wizardStates`**: Optional temporary storage for multi-step ticket wizard progress.
-   **`exports`**: Metadata and download links for generated data exports.
-   **`archives`**: Metadata for archived records (tickets, workdays).

*(Refer to `Data_Models_Schema.md` for detailed schemas and relationships.)*

### Document Schemas

Each collection follows a standardized document structure. Key fields are highlighted below; see `Data_Models_Schema.md` for the complete schemas.

#### Users Collection (`users`)

Stores employee and admin account information. Document ID typically matches Firebase Auth UID.

-   `email`: User's login email (string).
-   `displayName`: User's display name (string).
-   `role`: `'admin'` or `'employee'` (string).
-   `status`: `'active'`, `'inactive'`, or `'pending'` (string).
-   `isActive`: Derived or specific active flag (boolean).
-   `uid`: Firebase Auth UID (string).
-   `createdAt`, `updatedAt`: Timestamps.

#### Tickets Collection (`tickets`)

Stores ticket submissions with categorized counts and image references.

-   `date`: Date of ticket submission (Timestamp).
-   `truckNumber`: Identifier of the truck used (string).
-   `jobsite`: Reference to `jobsites.id` (string).
-   `categories`: Map of category IDs/names to counts (`{ [key: string]: number }`).
-   `imageUrls`: Array of Firebase Storage URLs for associated images (array of strings).
-   `userId`: Reference to `users.id` (string, optional).
-   `total`: Auto-calculated sum of category counts (number, optional).
-   `imageCount`: Auto-calculated count of images (number, optional).
-   `submissionDate`: Timestamp when ticket was submitted (Timestamp, optional).
-   `archiveStatus`: `'active'`, `'images_archived'`, or `'fully_archived'` (string, optional).
-   `createdAt`, `updatedAt`: Timestamps.

#### Workdays Collection (`workdays`)

Tracks employee daily work status and hours.

-   `userId`: Reference to `users.id` (string).
-   `date`: Date of workday (Timestamp).
-   `jobsite`: Reference to `jobsites.id` (string).
-   `workType`: `'regular'`, `'overtime'`, `'holiday'`, `'sick'`, `'vacation'` (string).
-   `hours`: Number of hours worked/recorded (number).
-   `status`: `'active'` or `'archived'` (string).
-   `isPrediction`: Flag for future projections vs actual entries (boolean, optional).
-   `createdAt`, `updatedAt`: Timestamps.

#### Exports Collection (`exports`)

Stores metadata for data exports generated by administrators.

-   `type`: `'tickets'` or `'workdays'` (string).
-   `format`: `'csv'`, `'excel'`, or `'json'` (string).
-   `url`: Download URL for the exported file (string).
-   `filename`: Name of the exported file (string).
-   `status`: `'completed'`, `'processing'`, or `'error'` (string).
-   `userId`: Admin user ID who initiated the export (string).
-   `createdAt`, `expiresAt`: Timestamps.

#### Archives Collection (`archives`)

Stores metadata for individual archived items (tickets, workdays).

-   `type`: `'ticket'` or `'workday'` (string).
-   `originalId`: Document ID of the item in its original collection (string).
-   `title`: Descriptive title for the archived item (string).
-   `date`: Relevant date of the original item (Timestamp).
-   `status`: `'archived'` or `'restored'` (string).
-   `archivedBy`: Admin user ID who archived the item (string).
-   `archivedAt`: Timestamp.

### Data Relationships

The data model uses document references (primarily document IDs) to establish relationships. Denormalization is used strategically for performance.

-   **References**:
    -   `workdays.userId` → `users.id`
    -   `workdays.jobsite` → `jobsites.id`
    -   `tickets.userId` → `users.id`
    -   `tickets.jobsite` → `jobsites.id`
    -   `exports.userId` → `users.id` (Admin)
    -   `archives.archivedBy` → `users.id` (Admin)
    -   `archives.originalId` + `type` → Original document
-   **Denormalization**:
    -   Names (`employeeName`, `jobsiteName`, `truckNickname`) may be stored in `workdays` and `tickets`.
    -   Calculated fields (`total`, `imageCount`) stored in `tickets`.
    -   Status fields (`status`, `archiveStatus`, `isActive`) used for efficient filtering.

*(Refer to `Data_Models_Schema.md` for a detailed relationship map.)*

## Authentication Framework

Simple Tracker uses a custom authentication flow built on top of Firebase Authentication, featuring username/password login and role-based access control (RBAC) via verified custom claims. The Firebase Admin SDK is essential for this process.

### Authentication Flow

1.  **Login Request**: User submits **username and password** to a custom API endpoint (`/api/auth/login`).
2.  **Server-Side Validation**: The API route verifies the username and password against securely hashed credentials stored in Firestore (using `bcrypt`).
3.  **Custom Token Minting**: Upon successful validation, the server uses the **Firebase Admin SDK** (`authAdmin.createCustomToken(uid, { role: userRole })`) to generate a **Firebase Custom Token** containing the user's UID and necessary custom claims (like `role`).
4.  **Client-Side Sign-In**: The custom token is returned to the client. The client uses the **Firebase Client SDK** (`signInWithCustomToken(customToken)`) to establish an authenticated Firebase session.
5.  **ID Token Generation**: The Firebase Client SDK automatically exchanges the custom token for a standard Firebase **ID Token** and Refresh Token.
6.  **API Authentication**: For subsequent requests to protected API routes, the client sends the **ID Token** in the `Authorization: Bearer <ID_token>` header.
7.  **Server-Side Verification**: API routes and middleware **mandatorily verify** the incoming ID Token using the **Firebase Admin SDK** (`authAdmin.verifyIdToken(idToken)`). This verification confirms the token's validity and securely extracts the user's `uid` and **verified custom claims**.
8.  **State Tracking**: Client-side uses `onAuthStateChanged` and `getIdTokenResult()` to manage user session state and access verified claims.

### Token Verification (Server-Side Focus)

**Server-side verification using the Admin SDK (`verifyIdToken`) is the standard and mandatory** way to authenticate API requests and access secure user information (UID, claims). This replaces previous insecure client-side decoding methods. The verified token payload is the source of truth for authorization decisions.

### Role-Based Access Control (RBAC)

1.  **Role Assignment**: Admins assign roles (`'admin'` or `'employee'`) by setting **custom claims** on user accounts via the **Firebase Admin SDK** (e.g., during user creation or update).
2.  **Role Verification (Server-Side)**: Server-side logic (API routes, middleware) checks the **verified custom claims** (e.g., `decodedToken.role`) extracted from the ID token after successful `verifyIdToken` validation.
3.  **Role Verification (Security Rules)**: Firestore and Storage security rules use `request.auth.token.role` (which reflects the verified claims) to enforce access control at the database/storage level.
4.  **UI Protection**: Client-side conditionally renders components based on the user's role, obtained securely from the ID token claims via `getIdTokenResult(true)`.
5.  **Permission Hierarchy**: Admins implicitly have all employee permissions.

## Security Rules

Firestore (`firestore.rules`) and Cloud Storage (`storage.rules`) security rules enforce data access control based on authentication state (`request.auth`), **verified roles from ID token custom claims (`request.auth.token.role`)**, document ownership (`request.auth.uid`), and data validation.

### Security Rule Structure (`firestore.rules`)

Rules utilize helper functions for clarity and reusability:

-   `isAuthenticated()`: Checks if `request.auth` is not null.
-   `hasRole(role)`: Checks the **verified** `request.auth.token.role` claim from the ID token.
-   `isAdmin()`: Checks if the **verified** role claim is 'admin'.
-   `isOwner(userId)`: Checks if `request.auth.uid` (from the verified token) matches the provided `userId`.
-   Data validation functions (e.g., `isValidTimestamp`, `isString`, `isValidUserRole`, `isValidTicketCategories`).

### Collection-Specific Rules (Firestore Summary)

-   **`users`**: Admins can create/delete. Admins or the owner can update specific fields (owners cannot change roles, email, etc.). Authenticated users can generally read profiles.
-   **`jobsites`, `trucks`**: Only admins can create, update, or delete. Authenticated users can read.
-   **`workdays`, `tickets`**: Authenticated users can create their own records. Admins or the owner can update (owners have restrictions, e.g., cannot change `userId` or `archiveStatus`). Admins can delete. Read access is generally open to authenticated users (client filters apply). Extensive validation on write operations (required fields, enums, calculations).
-   **`wizardStates`**: Only the owner (`userId` matching `request.auth.uid`) can read or write their own state document. Validation ensures expiry dates are reasonable.
-   **`exports`, `archives`**: Only admins can create, read, update, or delete these records. Validation ensures correct types, statuses, and creator IDs.

### Data Validation

Security rules perform server-side data validation on write operations:

-   Checking required fields (`hasRequiredFields`).
-   Validating field types (`isString`, `isNumber`, `isMap`, `isArray`, `isValidTimestamp`).
-   Enforcing enum values (e.g., `isValidUserRole`, `isValidWorkdayType`).
-   Validating data consistency (e.g., `isValidTicketTotal`, `isValidImageCount`).
-   Checking ownership and preventing unauthorized field changes (`isOwner`, `isNotChanging`).

### Storage Rules (`storage.rules`)

-   Default deny-all access.
-   **`users/{userId}/{allPaths=**}`**: Owner can write images (with size/type limits); Owner and Admins can read.
-   **`tickets/{ticketId}/images/{imageId}`**: Images can only be created (`allow create`) by the user specified in the image metadata (`request.resource.metadata.userId`). Reads allowed by owner or admin. Updates/deletes disallowed.
-   **`exports/{exportType}/{fileName}`**: Only admins can read/write.
-   **`archives/{archiveType}/{originalId}/{allPaths=**}`**: Only admins can read/write.

## Storage Implementation

Firebase Storage manages file storage for ticket images, data exports, and potentially archives.

### Storage Organization

Files are organized based on type and ownership, aligning with `storage.rules`:

```
# Ticket Images (Example based on rules/schema)
tickets/{ticketId}/images/{imageId}.jpg
# Note: Rules use metadata.userId for write auth. Schema suggests path includes userId.
# Actual implementation might use: tickets/{userId}/{ticketId}/images/{imageId}.jpg

# User-specific files (if any)
users/{userId}/profile.jpg

# Exports (Admin only access)
exports/{type}/{filename}.{ext}
# Example: exports/tickets/tickets-export-2025-04-06.xlsx

# Archives (Admin only access)
archives/{type}/{originalId}/data.json
archives/{type}/{originalId}/images/{imageId}.jpg
# Example: archives/ticket/tkt123/images/image1.jpg
```

*(Refer to `storage.rules` and `Data_Models_Schema.md` for definitive paths and access logic.)*

### Upload Process

File uploads typically involve:

1.  Client-side selection and validation (type, size).
2.  Upload directly to the final path using the Firebase Client SDK.
3.  Storage security rules enforce permissions based on user auth and metadata.
4.  For tickets, image URLs are stored in the corresponding Firestore `tickets` document.

### Image Processing

-   Client-side or server-side (Cloud Functions) processing can be used for:
    -   Compression/Resizing.
    -   Thumbnail generation (stored alongside original or in a `thumbnails/` subfolder).
-   Metadata (like `userId`) should be set during upload for rule enforcement.

## Performance Optimization

The Firebase implementation includes optimizations for performance.

### Query Optimization

Queries are optimized using:

1.  **Specific Indexes**: Defined in `firestore.indexes.json` to support common query patterns (filtering, sorting).
2.  **Query Limiting**: Client-side logic should limit the number of documents fetched (`limit()`).
3.  **Field Selection**: Use `select()` in Firestore queries when only specific fields are needed (less common with Firestore compared to SQL).
4.  **Denormalization**: Reduces the need for complex joins (see Data Model).

### Indexing Strategy

Firestore requires indexes for most compound queries (filtering/sorting on multiple fields).

-   **Index Definition**: Indexes are defined in `firestore.indexes.json` and deployed via the Firebase CLI.
-   **Source of Truth**: Refer to `firestore.indexes.json` for the complete list of active indexes. `Data_Models_Schema.md` provides examples based on common query patterns.
-   **Maintenance**: Indexes must be updated as query patterns evolve.

### Caching and Offline Support

-   **Firestore Persistence**: The client SDK provides offline data persistence out-of-the-box, caching recently accessed data.
-   **Client-Side Caching**: Libraries like TanStack Query manage client-side data caching, synchronization, and stale times, reducing redundant Firestore reads.

## Best Practices

Simple Tracker follows these Firebase best practices:

### Error Handling

-   Implement robust error handling on both client and server for Firebase operations.
-   Catch and handle specific Firebase error codes (e.g., `permission-denied`, `unavailable`).
-   Provide informative feedback to users.

### Batch Operations & Transactions

-   Use Firestore `writeBatch` for atomic writes to multiple documents.
-   Use Firestore `runTransaction` for read-modify-write operations requiring consistency.

### Testing Approach

-   Utilize the Firebase Local Emulator Suite for local development and testing of Auth, Firestore, and Storage rules/interactions.
-   Write unit/integration tests mocking Firebase SDK calls where appropriate.
-   Test security rules using the emulator's testing libraries.

### Data Lifecycle Management

-   **Active Data**: Resides in primary collections (`tickets`, `workdays`).
-   **Archiving**: Older/inactive data can be moved to the `archives` collection (metadata) and potentially cheaper Storage classes (requires admin-triggered process). `archiveStatus` field tracks state.
-   **Export**: Admins can generate data exports stored in the `exports` collection/Storage path.
-   **Cleanup**: Implement strategies (e.g., Cloud Functions, manual processes) to clean up expired `wizardStates`, expired `exports`, or temporary files.
