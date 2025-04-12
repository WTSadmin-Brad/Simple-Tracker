# Changelog: Authentication System Refactor (2025-04-06)

This document summarizes the major changes implemented during the authentication system refactor, aimed at enhancing security, consistency, and alignment with best practices.

## Security Enhancements

*   **Server-Side Token Verification:** Implemented mandatory server-side verification of Firebase ID tokens using the Firebase Admin SDK (`verifyIdToken`) in both Next.js middleware (`src/middleware.ts`) and all protected API routes. This replaces the previous insecure client-side decoding (`jwt-decode`).
*   **Secure Role-Based Access Control (RBAC):** Authorization checks in middleware and API routes now consistently rely on *verified* custom claims (e.g., `role`) extracted from the server-verified ID token. Removed reliance on insecure headers (`x-user-role`) or unverified token payloads.
*   **Secure Password Handling:** Implemented secure password hashing using `bcrypt` for the new username/password login flow. Passwords are hashed server-side during user creation/update and verified server-side during login. Hashes are stored in the Firestore `users` collection.
*   **Removed Insecure Dependencies:** Uninstalled the `jwt-decode` library to prevent its misuse.
*   **Consistent Token Transport:** Standardized on using the `Authorization: Bearer <ID_token>` header for sending authentication tokens from the client to the server for all protected resources. Removed inconsistent and potentially insecure cookie-based token transport (`auth-token`, `__session`, `session`).
*   **Secure Admin SDK Initialization:** Ensured Firebase Admin SDK initialization (`src/lib/firebase/admin.ts`) uses secure credential loading mechanisms suitable for server environments.
*   **Firestore Rules Hardening:** Reviewed and tightened Firestore rules for key collections (`workdays`, `tickets`) to enforce permissions based on verified token claims (`request.auth.token.role`, `request.auth.uid`) rather than potentially unreliable client-side filtering or insecure server logic.

## Feature Changes

*   **Username/Password Login:** Replaced the previous email-based login with a username/password system, fulfilling the original requirement. This involves:
    *   A new custom API endpoint (`/api/auth/login`) for handling username/password verification against Firestore.
    *   Using Firebase Admin SDK's `createCustomToken` on the server after successful credential validation.
    *   Using Firebase Client SDK's `signInWithCustomToken` on the client to establish the Firebase session.
*   **Admin User Creation:** The admin endpoint for user creation (`/api/admin/users`) now correctly handles hashing the user's password with `bcrypt` before storing user details (including the hash and username) in Firestore, and sets the appropriate role via Firebase Custom Claims using the Admin SDK.

## Refactoring & Cleanup

*   **Middleware (`src/middleware.ts`):** Rewritten to use Admin SDK verification and check verified claims for route protection. Removed `jwt-decode` logic and insecure header forwarding.
*   **API Authentication:** Refactored API authentication helpers (`src/lib/api/middleware.ts` - e.g., `withAuthentication`, `withAdminRole`) to consistently use Admin SDK `verifyIdToken` and rely solely on verified claims. Integrated these helpers across all protected API routes.
*   **Client-Side Auth (`useAuth.ts`, `authStore.ts`):** Updated to interact with the new `/api/auth/login` endpoint, handle the `signInWithCustomToken` flow, and derive user state (including role) directly from verified ID token claims obtained via the Firebase Client SDK (`getIdTokenResult`).
*   **UI Components (`LoginForm`, `AuthGuard`):** Updated `LoginForm` to accept username instead of email. Ensured `AuthGuard` correctly uses the refactored `authStore` state for route protection.
*   **Removed Obsolete Code:** Deleted unused API routes related to the previous session/refresh logic (`/api/auth/session`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/sessionLogin`). The `/api/auth/me` route was left for potential future use but should be reviewed. Removed the `auth-token` constant and other redundant helpers.

## Dependencies

*   **Added:** `firebase-admin`, `bcrypt`, `@types/bcrypt` (dev).
*   **Removed:** `jwt-decode`.
*   **Scope Note:** The `/api/admin/export` routes were identified as using a potentially separate authentication mechanism (`@/lib/auth/auth`) and were intentionally **excluded** from this refactoring scope to avoid unintended side effects. A separate review and potential refactoring task should be considered for these routes if alignment with the new system is desired.

## Potential Follow-up / Areas to Monitor

*   **Thorough Testing:** Extensive testing across all user roles (employee, admin) and application features is crucial to confirm the refactor's correctness and identify any regressions. Pay special attention to edge cases in authentication and authorization flows.
*   **Environment Variables:** Ensure `bcrypt` salt rounds and Firebase Admin SDK credentials are configured securely and appropriately for different environments (development, staging, production).
*   **Password Management:** Implement secure flows for password resets or changes if required, ensuring interaction with the hashed passwords in Firestore via secure admin endpoints.
*   **Error Handling:** Review and enhance user-facing error messages related to authentication failures (e.g., invalid username/password, insufficient permissions).
*   **Session Cookie Alternative:** While the ID Token (Bearer) approach was implemented, the alternative using Firebase Session Cookies remains an option if longer, server-controlled session lifetimes become a requirement in the future.