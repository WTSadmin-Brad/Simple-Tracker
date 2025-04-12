# Simple Tracker - Admin User Flows (Current Implementation)

[[_TOC_]]

## 1. Authentication

*   **Login Flow:**
    *   Users authenticate using **username and password**.
    *   The client sends credentials to a custom API endpoint: `/api/auth/login`.
    *   The backend verifies credentials against user records stored in Firestore (passwords are hashed using `bcrypt`).
    *   Upon successful verification, the backend uses the Firebase Admin SDK to mint a **Firebase Custom Token**.
    *   The client receives the Custom Token and uses the Firebase Client SDK's `signInWithCustomToken` method.
    *   This establishes the Firebase authentication session on the client and retrieves a **Firebase ID Token**.
    *   The client-side `authStore` (Zustand) manages the user's authentication state, primarily using the ID Token and its claims.
*   **Session Management & API Protection:**
    *   **Unified Token Strategy:** The system relies solely on the **Firebase ID Token** for securing both page access and API calls.
    *   **Token Transport:** The ID Token is sent from the client to the server as a **Bearer token** in the `Authorization` header for all protected requests.
    *   **Server-Side Verification:** Mandatory server-side verification of the ID Token using the Firebase Admin SDK (`verifyIdToken`) is enforced in:
        *   Next.js middleware (`src/middleware.ts`) for protecting page routes.
        *   Backend API route handlers (`/api/*`) via helper functions (`src/lib/api/middleware.ts`) to protect API access.
    *   **Role-Based Access Control (RBAC):** Authorization decisions (e.g., granting access to admin-specific routes or actions) are based on **verified custom claims** (like `role`) embedded within the ID Token. These claims are set securely via the Admin SDK during user creation or update.
*   **Logout Flow:**
    *   Initiated by the user on the client-side.
    *   Triggers the Firebase Client SDK's sign-out mechanism, clearing the local authentication state and invalidating the current ID Token.
    *   (Note: Previous dedicated server-side logout endpoints have been removed as the primary session state is managed by Firebase client SDK and token expiration.)

## 2. Dashboard

*   **Access & Layout:**
    *   Accessible at `/admin/dashboard` (or similar root admin path).
    *   Features a customizable "Bento grid" layout managed by the `DashboardLayout` component.
*   **State Management & Persistence:**
    *   The `dashboardStore` (Zustand) manages the state of the dashboard, including the layout and visibility of cards.
    *   User customizations (card arrangement, visibility) are likely persisted (e.g., in Firebase Firestore or local storage) to maintain the layout across sessions.
*   **Available Card Types:**
    *   The specific cards available are not detailed in the analysis but likely include summaries or quick actions related to Users, Jobsites, Trucks, Tickets, etc.
*   **Customization (Edit Mode):**
    *   An "Edit Mode" allows admins to rearrange, add, or remove cards from their dashboard view.

## 3. Data Management (General Pattern)

*   **Core Components:**
    *   A reusable pattern is employed across various data management sections (Users, Jobsites, etc.).
    *   `useAdminDataGrid`: A custom hook likely encapsulating data fetching (using TanStack Query), filtering, sorting, pagination logic.
    *   `DataGrid`: A component (likely wrapping a library like Tanstack Table or similar) responsible for displaying data in a tabular format.
    *   `FilterBar`: Component providing UI elements for filtering the data shown in the grid.
    *   `ActionBar`: Component containing buttons for actions like "Add New", potentially "Export", etc.
*   **Viewing & Filtering Data:**
    *   Admins can view lists of records.
    *   Filtering options allow narrowing down the data based on specific criteria.
*   **Adding New Records:**
    *   Typically involves opening a modal or navigating to a form page to input details for a new record.
*   **Editing Records:**
    *   Selecting a record allows modification, usually via a modal or dedicated edit form.
*   **Viewing Record Details:**
    *   Often involves clicking on a record row to see more comprehensive information, potentially in a side sheet or separate page.
*   **Deleting/Status Changes:**
    *   Actions available per record, such as deletion or changing status (e.g., activating/deactivating a user).

## 4. Specific Data Management Flows

*   **Users (`/admin/users`):** Manages application users (employees, potentially other admins). Follows the general data management pattern.
*   **Jobsites (`/admin/jobsites`):** Manages job site locations. Follows the general data management pattern.
*   **Trucks (`/admin/trucks`):** Manages company trucks/vehicles. Follows the general data management pattern.
*   **Tickets (`/admin/tickets`):** Manages support tickets or work-related tickets submitted by employees. Follows the general data management pattern.
*   **Workdays (`/admin/workdays` - *If present*):** *Analysis did not explicitly confirm an admin-specific view for individual workdays, but if present at this path, it would likely follow the general data management pattern for viewing/managing employee logged workdays.*

## 5. Archive & Export

*   **Archive (`/admin/archive`) Flow:**
    *   Provides functionality to view and potentially manage archived records (e.g., old tickets, inactive users). The exact mechanism (soft delete vs. moving to separate collection) is not specified.
*   **Export (`/admin/export`) Flow:**
    *   Allows admins to export data (e.g., user lists, ticket reports) likely in formats like CSV or JSON.

## 6. Authentication Implementation Notes

*   **Refactored System Overview:** The authentication system has been completely refactored to use a unified and secure approach based on Firebase ID Tokens and server-side verification.
*   **Key Changes & Security Measures:**
    *   **Username/Password & Custom Tokens:** Login uses username/password, verified server-side against Firestore (`bcrypt` hashes). Successful login results in a Firebase Custom Token being minted (Admin SDK) and exchanged client-side (`signInWithCustomToken`) for a standard Firebase ID Token.
    *   **Mandatory Server-Side Verification:** The core security improvement is the consistent use of the Firebase Admin SDK's `verifyIdToken` on the backend for *all* protected resources. This occurs in both the Next.js middleware (`src/middleware.ts`) for page access and within API route handlers. This eliminates previous vulnerabilities associated with client-side decoding.
    *   **Unified Token Strategy (Bearer):** The Firebase ID Token, sent as an `Authorization: Bearer <token>` header, is the single source of truth for authentication and authorization. Reliance on insecure cookies (`auth-token`) or headers (`x-user-role`) has been removed.
    *   **Secure RBAC:** Role-based access control relies entirely on verified custom claims (e.g., `role`) extracted from the ID token *after* server-side verification.
    *   **Secure Password Handling:** Passwords are securely hashed using `bcrypt` on the server.
    *   **Dependency Cleanup:** The insecure `jwt-decode` library has been removed.
*   **Previous Issues Addressed:**
    *   The discrepancy between page protection (previously insecure `jwt-decode` on cookies) and API protection (secure `verifyIdToken` on Bearer tokens) has been resolved. Both now use the secure server-side verification method.
    *   The security vulnerability associated with using `jwt-decode` without signature verification in the middleware has been eliminated.
*   **Areas to Note:**
    *   The `/api/admin/export` routes were noted as potentially using a different auth mechanism and were outside the scope of this refactor. They may require separate review.
    *   Focus remains on client-side sign-out; dedicated server-side session invalidation endpoints were removed in favor of standard Firebase token lifecycle management.

## 7. Future Enhancements & Ideas (Admin)

*   *Suggestion:* Role-based dashboard layouts.
*   *Suggestion:* Enhanced bulk actions in data grids (e.g., bulk role assignment).
*   *Suggestion:* Real-time updates/notifications for key events (new tickets, user registrations).
*   *Suggestion:* More advanced reporting/analytics dashboard cards.
*   *Suggestion:* Audit logs for admin actions.