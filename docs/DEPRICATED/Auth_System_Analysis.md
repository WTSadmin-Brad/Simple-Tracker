## Simple Tracker Authentication System Analysis & Proposed Solution

**Date:** 2025-04-06

**1. Analysis of Current Implementation**

Based on the provided documentation (`CODEBASE_REVIEW_SUMMARY.md`, `ARCHITECTURE.md`, `FIREBASE.md`, `API.md`, `PRD.md`, `Data_Models_Schema.md`, `firestore.rules`), the current authentication system in Simple Tracker exhibits significant deviations from its intended secure design:

*   **Authentication Flow:** Users log in via username/password (as per PRD, though implementation details are unclear without code access). Tokens (intended to be Firebase ID Tokens) are generated.
*   **Token Verification (Middleware):** The main Next.js middleware (`src/middleware.ts`) attempts to protect page routes. However, it uses the insecure client-side `jwt-decode` library instead of server-side verification via the Firebase Admin SDK. It decodes the token (expected in an `auth-token` cookie) but doesn't verify its signature or expiry.
*   **Token Verification (API):** API routes are protected by a helper (`src/lib/api/middleware.ts#authenticateRequest`). This helper *does* correctly use the Firebase Admin SDK's `verifyIdToken` function (assuming the SDK *was* present or intended) to verify the token (expected in the `Authorization: Bearer` header).
*   **Role-Based Access Control (RBAC):**
    *   **Intended (Claims):** Documentation (`FIREBASE.md`, `firestore.rules`) clearly indicates the *intention* to use Firebase Custom Claims (`request.auth.token.role`) set via the Admin SDK for RBAC in both API routes and Firestore rules.
    *   **Actual (Middleware):** The main middleware performs role checks based on the *unverified* token data decoded by `jwt-decode`. These checks are inherently insecure and likely non-functional as claims are probably not set.
    *   **Actual (API):** The API authentication helper, despite verifying the token, *ignores* any claims within it. Instead, it relies on an easily manipulated `x-user-role` header or fetches the user's role from their Firestore `users` document *after* authentication.
    *   **Actual (Firestore Rules):** The `firestore.rules` are correctly written to check `request.auth.token.role`. However, since claims are likely not being set due to the missing Admin SDK and flawed server logic, these rules are non-functional for granting admin privileges.
*   **Session Management:** Tokens are expected to be stored client-side (potentially IndexedDB via Firebase SDK, plus the inconsistent cookie/header usage). Token refresh is likely handled by the Firebase Client SDK. The mention of "Session cookies" in `ARCHITECTURE.md` seems aspirational or incorrect given the evidence of ID token usage.
*   **User Creation:** The PRD assumes admins manually create users, implying no client-side sign-up exists, which aligns with security best practices for this type of application. However, the mechanism for admin creation is broken without the Admin SDK.
*   **Login Method:** PRD requires username/password login, not email. The `users` schema has both `email` and `username` fields. The exact implementation mechanism is unclear but deviates from standard Firebase email/password.

**2. Identified Flaws and Security Vulnerabilities**

The current implementation suffers from critical flaws:

1.  **Insecure Middleware Token Handling:** Using `jwt-decode` in `src/middleware.ts` without server-side verification allows attackers to easily forge ID tokens (including roles and user IDs) by simply decoding a valid one, modifying the payload, and re-encoding it (no signature check). **Risk:** Complete bypass of authentication and authorization for page routes, allowing unauthorized access and privilege escalation (e.g., an employee accessing admin pages).
2.  **Insecure API Role Verification:** Relying on the `x-user-role` header or fetching roles from Firestore *after* verifying the token in `src/lib/api/middleware.ts` is insecure. Headers are easily manipulated, and fetching roles post-auth creates race conditions and inconsistencies. **Risk:** Unauthorized users (e.g., employees) could potentially manipulate the header or exploit timing issues to gain admin privileges for API actions.
3.  **Non-Functional Firestore RBAC:** Security rules relying on `request.auth.token.role` (via `isAdmin()`/`hasRole()`) are ineffective because custom claims are not being set or verified correctly. **Risk:** Admins are likely blocked from performing essential administrative tasks defined in the rules; the intended database-level security is broken.
4.  **Missing Firebase Admin SDK Dependency:** This is a root cause. It prevents secure server-side token verification, custom claim management, and programmatic user creation, forcing the insecure workarounds observed.
5.  **Inconsistent Token Transport:** Expecting the token in a cookie (`auth-token`) for middleware and a Bearer header (`Authorization`) for API calls leads to confusion, potential bugs, and inconsistent security postures. **Risk:** Authentication failures depending on request type, difficult debugging.
6.  **Broad Firestore Read Access:** Allowing any authenticated user to read collections like `jobsites` and `trucks` relies heavily on client-side filtering, which is not a robust security measure. **Risk:** Potential for authenticated users to access data they shouldn't see if client-side logic fails or is bypassed.
7.  **Potential Admin SDK Initialization Fallback:** The fallback mechanism in `src/lib/firebase/admin.ts` could lead to unexpected behavior or security risks if default credentials are used unintentionally in production.

**3. Research Findings**

*   **Firebase Auth + Next.js (App Router) Best Practices:**
    *   **Server-Side Verification is Crucial:** Never trust client-side decoding (`jwt-decode`). Always verify ID tokens on the server using the Firebase Admin SDK (`admin.auth().verifyIdToken(token)`).
    *   **Session Management:**
        *   **ID Tokens:** Suitable for many cases. Verify the ID token (from `Authorization: Bearer` header or secure, HttpOnly cookie) in middleware or API routes/Server Components. Manage refresh on the client. Can lead to brief "flash" of unauthenticated content if not handled carefully on initial load.
        *   **Firebase Session Cookies:** Recommended for traditional web applications or when needing longer, server-managed sessions. The server creates a session cookie using the Admin SDK after verifying an ID token. Middleware then verifies the *session cookie* (not the ID token) on subsequent requests. Provides CSRF protection benefits. Requires more server-side setup but can offer a smoother UX.
    *   **Auth State Management:** Use React Context or state management libraries (like Zustand, as used here) to provide auth state (user object, loading status) to components. Fetch initial state server-side (in Layout or page) by verifying the token/session cookie and pass it down to client components.
    *   **Middleware:** Next.js middleware is ideal for protecting routes. It should verify the ID token or session cookie using the Admin SDK. Avoid heavy logic; redirect or rewrite as needed. Pass verified user info via request headers if necessary for API routes (though direct verification in API routes is often cleaner).
*   **User Requirements Implementation:**
    *   **Admin-Created Users:** Use the Firebase Admin SDK's `admin.auth().createUser({...})` method on the server (e.g., in a dedicated admin API endpoint). Client-side sign-up methods (`createUserWithEmailAndPassword`, etc.) should *not* be used.
    *   **Username Login:** Firebase Auth doesn't directly support username/password login. Common strategies:
        1.  **Internal Email Mapping:** Store a unique, generated email (e.g., `username@internal.domain`) in Firebase Auth. Store the actual username in Firestore (`users` collection). On login, use an API route: client sends username/password -> server looks up the user document by username -> gets the internal email -> uses Admin SDK `signInWithEmailAndPassword` (or custom token flow) -> returns ID token to client. *This requires storing passwords securely or using custom auth.* A simpler Admin SDK approach might involve verifying the password hash stored in Firestore and then minting a custom token (`createCustomToken`) for the corresponding UID.
        2.  **UID Lookup:** Client sends username/password -> server looks up user by username in Firestore -> verifies password hash stored in Firestore -> if valid, gets the Firebase `uid` from the user document -> uses Admin SDK `createCustomToken(uid)` -> returns custom token to client -> client uses `signInWithCustomToken(customToken)` to get an ID token. **This is generally preferred as it avoids storing/managing internal emails and integrates better with standard Firebase Auth.** Requires secure password hashing (e.g., bcrypt) on the server during user creation/password set.
    *   **Custom Claims for RBAC:** Use the Firebase Admin SDK's `admin.auth().setCustomUserClaims(uid, { role: 'admin' | 'employee', ...otherClaims })` method on the server (e.g., when an admin creates or modifies a user). These claims are embedded in the ID token upon refresh and can be securely read server-side (`decodedToken.role`) and in security rules (`request.auth.token.role`). This is the standard and most secure way to handle roles. **Admin SDK is mandatory.**
*   **Next.js Security Vulnerabilities:** No major, widespread vulnerabilities specific to Next.js 13/14 authentication/middleware that directly apply *if standard best practices are followed* were found in recent searches. Standard web vulnerabilities (CSRF, XSS, improper session handling) apply, reinforcing the need for secure practices like HttpOnly cookies (if using session cookies), proper input validation, and avoiding trust in client-side data. The flaws identified in this project are implementation errors, not inherent Next.js vulnerabilities.

**4. Proposed Optimized Solution**

This solution aims to fix the identified flaws, implement user requirements securely, and align with best practices for Firebase and Next.js.

**A. Core Dependencies:**

1.  **Add Firebase Admin SDK:** Install `firebase-admin` as a project dependency.
2.  **Remove `jwt-decode`:** Uninstall this library as it should not be used for verification.

**B. Initialization & Configuration:**

1.  **Secure Admin SDK Initialization:** Ensure `src/lib/firebase/admin.ts` *only* initializes using explicit service account credentials (loaded securely from environment variables, e.g., `GOOGLE_APPLICATION_CREDENTIALS` or individual `FIREBASE_ADMIN_*` vars) in production/staging. Remove or guard the fallback initialization path.
2.  **Firebase Client SDK:** Keep as is (`src/lib/firebase/client.ts`) for client-side interactions.

**C. Authentication Flow (Username Login - UID Lookup Method Recommended):**

1.  **User Creation (Admin API Endpoint):**
    *   Create a secure API endpoint (e.g., `/api/admin/users`) accessible only to admins (verified via custom claims).
    *   This endpoint uses `admin.auth().createUser({...})` to create the Firebase Auth user (potentially with a placeholder email like `username@placeholder.app` or no email if using UID only). **Crucially, hash the provided password securely (e.g., using bcrypt) before storing it in the corresponding Firestore `users` document.** Store the username here too.
    *   Immediately after creation, use `admin.auth().setCustomUserClaims(uid, { role: 'employee' })` (or 'admin') to set the role claim.
2.  **Login (API Endpoint - e.g., `/api/auth/login`):**
    *   Client POSTs `{ username, password }` to the endpoint.
    *   Server finds the user document in Firestore based on the `username`.
    *   If found, retrieve the stored password hash and the Firebase `uid`.
    *   Verify the provided password against the stored hash using bcrypt.
    *   If password matches:
        *   Use `admin.auth().createCustomToken(uid)` to generate a custom token.
        *   Return the custom token to the client.
    *   If not found or password mismatch, return an authentication error.
3.  **Client-Side Sign-In:**
    *   Client receives the custom token.
    *   Client calls `signInWithCustomToken(authClient, customToken)` using the Firebase Client SDK.
    *   Firebase handles the exchange, returning an ID token (containing the UID and custom claims) and managing the user session (including refresh).
4.  **Logout:**
    *   Client calls `signOut(authClient)`.
    *   Server-side action might be needed if using session cookies (see below), but likely not required for ID token approach.

**D. Token Verification & RBAC:**

1.  **Choose Token Strategy:**
    *   **Option 1 (ID Token - Simpler):**
        *   Client stores the ID token securely (Firebase SDK handles this in IndexedDB).
        *   Client sends the ID token in the `Authorization: Bearer <token>` header for all API requests and potentially Server Component fetches.
        *   **Remove the `auth-token` cookie logic.**
    *   **Option 2 (Session Cookies - More Robust Session):**
        *   After `signInWithCustomToken`, client sends the resulting ID token to a server endpoint (e.g., `/api/auth/sessionLogin`).
        *   Server verifies the ID token using `admin.auth().verifyIdToken()`.
        *   Server creates a session cookie using `admin.auth().createSessionCookie()` with an appropriate expiry.
        *   Server sets a secure, HttpOnly cookie in the response.
        *   Client relies on the browser sending the cookie automatically.
        *   **Remove `Authorization: Bearer` logic for subsequent requests.**
2.  **Next.js Middleware (`src/middleware.ts`):**
    *   **If using ID Tokens:** Read the token from the `Authorization` header. Verify it using `admin.auth().verifyIdToken(token, true)` (check for revocation). Handle errors (invalid token, expired). If valid, allow request or rewrite/redirect. Can optionally pass verified `uid` and `role` via request headers (e.g., `x-user-id`, `x-user-role`) for downstream use *if needed*, but direct verification in API routes is often better.
    *   **If using Session Cookies:** Read the session cookie. Verify it using `admin.auth().verifySessionCookie(cookie, true)`. Handle errors. If valid, allow request. Pass verified `uid` and `role` via headers if needed.
    *   **Role Checks:** Perform role checks *using the verified claims* (`decodedToken.role`) for protecting page routes (e.g., redirect non-admins from `/admin/*`).
3.  **API Route Authentication (`src/lib/api/middleware.ts` or directly in routes):**
    *   Remove the current `authenticateRequest` wrapper or modify it significantly.
    *   **If using ID Tokens:** Directly verify the `Authorization: Bearer` token in each API route (or a cleaner wrapper) using `admin.auth().verifyIdToken()`. Extract `uid` and `role` from the verified `decodedToken`. **Do not trust headers like `x-user-role`.**
    *   **If using Session Cookies:** Directly verify the session cookie in each API route (or wrapper) using `admin.auth().verifySessionCookie()`. Extract `uid` and `role`.
    *   **Role Checks:** Perform necessary role checks within the API route logic based on the *verified* `decodedToken.role`.
4.  **Firestore Rules (`firestore.rules`):**
    *   **No changes needed** to the `isAdmin()` / `hasRole()` functions, as they correctly use `request.auth.token.role`. They will start working correctly once claims are properly set and tokens verified.
    *   **Review Broad Read Access:** Re-evaluate rules for `jobsites`, `trucks`, `workdays`, `tickets`. Tighten read access where possible (e.g., `allow read: if isAdmin() || isOwner(resource.data.userId);`) instead of relying solely on client-side filtering. Only allow broad `isAuthenticated()` reads if absolutely necessary for the application's function.

**E. State Management (`src/stores/authStore.ts`):**

1.  Store user state (UID, role, display name, loading status, error) obtained after successful client-side sign-in (`onAuthStateChanged`).
2.  Make the role available via the store/context for conditional UI rendering based on the *verified* role from the token claims (accessible via `authClient.currentUser.getIdTokenResult()`). Avoid relying on the potentially stale Firestore `users` document role for UI checks.

**F. Diagram of Proposed Flow (ID Token Method):**

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant NextServer as Next.js Server (Middleware/API)
    participant FirebaseAuth as Firebase Auth Service
    participant Firestore
    participant AdminSDK as Firebase Admin SDK (on NextServer)

    %% Login %%
    Client->>NextServer: POST /api/auth/login (username, password)
    NextServer->>Firestore: Find user document by username
    Firestore-->>NextServer: User doc (uid, pwdHash) or Not Found
    alt User Found
        NextServer->>NextServer: Verify password against hash (bcrypt)
        alt Password OK
            NextServer->>AdminSDK: createCustomToken(uid)
            AdminSDK-->>NextServer: customToken
            NextServer-->>Client: { customToken }
        else Password Bad
            NextServer-->>Client: Auth Error Response
        end
    else User Not Found
        NextServer-->>Client: Auth Error Response
    end

    Client->>FirebaseAuth: signInWithCustomToken(customToken)
    FirebaseAuth-->>Client: ID Token (contains uid, role claim)
    Client->>Client: Store ID Token (SDK handles storage/refresh)
    Client->>Client: Update Auth Store (user, role)

    %% Authenticated Page Request %%
    Client->>NextServer: GET /admin/dashboard (sends ID Token via Auth Header)
    NextServer->>AdminSDK: verifyIdToken(idToken)
    AdminSDK-->>NextServer: decodedToken (uid, role='admin')
    alt Token Valid & Role OK
        NextServer-->>Client: Serve Admin Page
    else Token Invalid or Role Denied
        NextServer-->>Client: Redirect to Login or 403 Page
    end

    %% Authenticated API Request %%
    Client->>NextServer: POST /api/tickets (sends ID Token via Auth Header)
    NextServer->>AdminSDK: verifyIdToken(idToken)
    AdminSDK-->>NextServer: decodedToken (uid, role='employee')
    alt Token Valid
        NextServer->>Firestore: Create ticket (rules check request.auth.token)
        Firestore-->>NextServer: Success/Failure
        NextServer-->>Client: API Response
    else Token Invalid
        NextServer-->>Client: Auth Error Response
    end
\`\`\`

*(Note: The Mermaid diagram might need slight adjustments for perfect rendering depending on the Markdown processor)*

**5. Why This Solution is Better**

*   **Security:** Eliminates critical vulnerabilities by implementing proper server-side token verification and using secure custom claims for RBAC, preventing token forgery and unauthorized access.
*   **Correctness:** Aligns with Firebase and web security best practices. Ensures Firestore rules function as intended.
*   **Consistency:** Establishes a single, consistent method for token transport (Bearer header or session cookie) and verification across middleware and API routes.
*   **Maintainability:** Centralizes authentication logic and uses standard Firebase mechanisms, making the system easier to understand, debug, and maintain.
*   **User Requirements:** Securely implements admin-only user creation, username login, and role-based access using standard Firebase patterns.

**6. Next Steps (for Implementation)**

1.  Install `firebase-admin` dependency.
2.  Implement secure Admin SDK initialization.
3.  Implement the chosen username login flow (API endpoint, password hashing, custom token generation).
4.  Implement admin user creation endpoint with claim setting.
5.  Refactor `src/middleware.ts` to use Admin SDK for verification and check verified claims.
6.  Refactor API routes to use Admin SDK for verification and check verified claims, removing reliance on headers or Firestore reads for roles.
7.  Ensure client-side sends tokens consistently (Bearer header or relies on session cookie).
8.  Update client-side auth state management to use claims from `getIdTokenResult()`.
9.  Review and tighten Firestore rules, especially read access.
10. Remove `jwt-decode`.

**7. Implementation Status**

The optimized solution proposed in Section 4 of this document has been implemented as of 2025-04-06.

For detailed information on the specific changes made during the implementation, please refer to the `CHANGELOG_AUTH_REFACTOR.md` document.