# Refactoring Plan: Simple Tracker Authentication System (Revised)

**Note:** The authentication refactoring plan outlined in this document was **completed on 2025-04-06**. This document serves as a historical record of the planned steps. For a summary of the implemented changes, please refer to `CHANGELOG_AUTH_REFACTOR.md`. For details on the *current* authentication system, consult `API.md`, `ARCHITECTURE.md`, and `FIREBASE.md`.

**Goal:** Implement the secure authentication solution proposed in `simple-tracker/docs/Auth_System_Analysis.md` (Section 4, ID Token method with UID lookup), replacing the current insecure implementation by modifying existing files where applicable.

**Target Solution:** Username/Password login via custom API/token flow, server-side ID token verification (Admin SDK), RBAC via custom claims, consistent Bearer token transport, removal of `jwt-decode`.

---

### Step 1: Setup & Dependencies

**Objective:** Install necessary dependencies, remove insecure ones, configure environment variables, and ensure secure Firebase Admin SDK initialization.

**Files:**
*   `simple-tracker/package.json`
*   `simple-tracker/src/lib/firebase/admin.ts`
*   `.env.local` (or similar environment variable file - **Action:** Ensure variables are set, **No Code Change in Plan**)

**Instructions:**

1.  **Install Dependencies:**
    *   Run `npm install firebase-admin bcrypt` in the `simple-tracker` directory.
    *   Run `npm install --save-dev @types/bcrypt` in the `simple-tracker` directory.
2.  **Remove Dependency:**
    *   Run `npm uninstall jwt-decode` in the `simple-tracker` directory.
3.  **Configure Environment Variables:**
    *   Ensure the following environment variables are securely set for the server environment (e.g., in `.env.local`, Vercel environment variables):
        *   `FIREBASE_PROJECT_ID`
        *   `FIREBASE_CLIENT_EMAIL`
        *   `FIREBASE_PRIVATE_KEY` (Ensure newlines `\n` are correctly handled)
        *   `FIREBASE_STORAGE_BUCKET` (or `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`)
        *   `BCRYPT_SALT_ROUNDS` (Set to `10` or `12`)
4.  **Refine Admin SDK Initialization (`simple-tracker/src/lib/firebase/admin.ts`):**
    *   Modify `initializeFirebaseAdmin`: Remove fallback initialization (lines ~43-55), ensure required env vars are checked, remove `console.warn`.
    *   Modify `verifyIdToken` (lines ~122-134): Update call to `auth.verifyIdToken(token, true)` (check revocation), improve error handling/logging.
    *   Add `import bcrypt from 'bcrypt';` if bcrypt operations are added directly here (though likely better in specific user management functions).

---

### Step 2: Backend API - User Management Refactor

**Objective:** Modify the existing admin user management API (`/api/admin/users`) and its helpers to securely hash passwords using `bcrypt` during user creation and store them in Firestore alongside the username. Ensure custom claims are set correctly. Update authentication to use the new secure wrapper.

**Files:**
*   `simple-tracker/src/app/api/admin/users/route.ts`
*   `simple-tracker/src/app/api/admin/users/helpers.ts` (Assuming helpers like `createUser` exist here)
*   `simple-tracker/src/lib/firebase/admin.ts` (If `createUserWithRole` is used directly instead of a helper)
*   `simple-tracker/src/types/firebase.ts` (Potentially update `User` type)

**Instructions:**

1.  **Update User Type (`simple-tracker/src/types/firebase.ts`):**
    *   If a `User` type exists for Firestore `users`, add `username: string;` and `passwordHash: string;`. Remove plain `password` if present.
2.  **Modify User Creation Logic (Likely in `simple-tracker/src/app/api/admin/users/helpers.ts` -> `createUser` function, or `simple-tracker/src/lib/firebase/admin.ts` -> `createUserWithRole` if used directly):**
    *   Locate the function responsible for creating the Firebase Auth user and the Firestore user document (e.g., `createUser` or `createUserWithRole`).
    *   **Password Hashing:** Before creating the Firestore document, hash the provided `password` using `bcrypt`.
        *   Import `bcrypt`: `import bcrypt from 'bcrypt';`
        *   Get salt rounds: `const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');`
        *   Hash password: `const passwordHash = await bcrypt.hash(password, saltRounds);`
    *   **Firebase Auth User Creation:**
        *   Update `auth.createUser` call: Use a placeholder email if needed (e.g., `${username}@placeholder.app`). Remove plain `password` if possible.
    *   **Firestore Document:**
        *   Modify the `db.collection('users').doc(userRecord.uid).set({...})` call:
            *   Ensure `username` field is added/updated.
            *   Add the `passwordHash` field.
            *   Remove the plain `password` field if stored.
            *   Ensure `role` custom claim is set via `auth.setCustomUserClaims(uid, { role })` and the role is also stored in the Firestore doc.
3.  **Update API Route (`simple-tracker/src/app/api/admin/users/route.ts`):**
    *   **Authentication:**
        *   Replace the *old* `authenticateRequest` wrapper import and usage with the *new* `withAdminRole` wrapper (to be created in Step 4). Apply it to `GET`, `POST`, `PUT`, `DELETE` exports.
        *   Remove the local `verifyAdminRole` function (lines ~148-165) as the new wrapper handles this. Update handler signatures to accept the `user: AuthenticatedUser` object.
    *   **POST Handler (`handleCreateUser`):**
        *   Update the Zod schema (`createUserSchema`, line ~28) to accept `username` as a string (remove email validation if `username` is the primary login identifier). Keep password validation.
        *   Ensure the call to the `createUser` helper (or `createUserWithRole`) passes the correct parameters (including `username`).
    *   **PUT/DELETE Handlers:** Ensure they correctly use the `user.uid` from the new authentication context for identifying the admin performing the action, if needed for logging/auditing.

---

### Step 3: Backend API - Login Flow Implementation

**Objective:** Rewrite the existing `/api/auth/login` endpoint to implement the custom username/password authentication using Firestore lookup, bcrypt verification, and custom token minting, returning the custom token.

**Files:**
*   `simple-tracker/src/app/api/auth/login/route.ts`
*   `simple-tracker/src/lib/firebase/admin.ts`

**Instructions:**

1.  **Rewrite Login API Endpoint (`simple-tracker/src/app/api/auth/login/route.ts`):**
    *   **Imports:**
        *   Remove imports for `signInWithEmailAndPassword`, `getAuthClient`, `cookies`.
        *   Keep imports for `NextResponse`, `z`, `getAuthAdmin`, `getFirestoreAdmin`, `handleApiError`, `validateRequest`, `createSuccessResponse`, `createErrorResponse`, `ErrorCodes`.
        *   Add import for `bcrypt`: `import bcrypt from 'bcrypt';`
    *   **Schema:** Update `loginSchema` (line ~21):
        *   Change `username` validation from `z.string().email(...)` to `z.string().min(3, 'Username required')` (or adjust length constraints as needed).
        *   Remove `rememberMe` field.
    *   **Rewrite `loginHandler` function (lines ~41-136):** Replace the entire body with the following logic:
        1.  Get `username` and `password` from the validated `data`.
        2.  Get Firestore admin instance: `const db = getFirestoreAdmin();`
        3.  Query the `users` collection: `const userQuery = await db.collection('users').where('username', '==', username).limit(1).get();`
        4.  **If `userQuery.empty`:** Return 401 (`createErrorResponse('Invalid username or password', ErrorCodes.AUTH_INVALID_CREDENTIALS, 401)`).
        5.  **If user found:**
            *   Get user data: `const userData = userQuery.docs[0].data();`
            *   Get UID: `const uid = userQuery.docs[0].id;`
            *   Check if active: `if (!userData.isActive) { return createErrorResponse('Account deactivated', ErrorCodes.AUTH_ACCOUNT_DISABLED, 403); }`
            *   Get stored hash: `const storedHash = userData.passwordHash;`
            *   **If `storedHash` is missing:** Log an error and return 500 (indicates an issue during user creation).
            *   Compare passwords: `const passwordMatch = await bcrypt.compare(password, storedHash);`
            *   **If `passwordMatch` is true:**
                *   Get Auth admin instance: `const authAdmin = getAuthAdmin();`
                *   Create custom token: `const customToken = await authAdmin.createCustomToken(uid);`
                *   Return 200 OK with token: `return NextResponse.json({ customToken });` (Use `createSuccessResponse` if preferred: `createSuccessResponse('Login successful', { customToken }, 'auth')`)
            *   **If `passwordMatch` is false:** Return 401 (`createErrorResponse('Invalid username or password', ErrorCodes.AUTH_INVALID_CREDENTIALS, 401)`).
    *   **Remove Session Logic:** Delete `SESSION_EXPIRES_IN` const, `AUTH_COOKIE` const, `updateLastLogin` function, and any calls related to `createSessionCookie` or `cookies().set()`.
    *   **Cleanup:** Remove unused imports and variables.

---

### Step 4: Backend API - Auth Helpers Refactor

**Objective:** Refactor or create secure API authentication helpers/wrappers using Admin SDK `verifyIdToken` (with revocation check) and extracting verified claims (UID, role).

**Files:**
*   `simple-tracker/src/lib/api/middleware.ts`
*   `simple-tracker/src/lib/firebase/admin.ts` (Ensure `verifyIdToken` is updated per Step 1)
*   `simple-tracker/src/types/api.ts` (Potentially add type for authenticated request context)

**Instructions:**

1.  **Define Authenticated Context Type (`simple-tracker/src/types/api.ts`):**
    *   Create/ensure interface:
      ```typescript
      export interface AuthenticatedUser {
        uid: string;
        role: 'admin' | 'employee'; // Or string
      }
      ```
2.  **Refactor/Create `authenticateRequest` Wrapper (`simple-tracker/src/lib/api/middleware.ts`):**
    *   Modify existing `authenticateRequest` (lines ~140-178) or create `withAuthentication`.
    *   **Signature:** Wrapped handler receives `(request: Request, user: AuthenticatedUser)`.
    *   **Logic:**
        1.  Extract `Authorization: Bearer <token>`. Return 401 if missing/malformed.
        2.  Call updated `verifyIdToken(token)` (from `admin.ts`).
        3.  **On failure:** Catch error, log, return 401 (`createErrorResponse`).
        4.  **On success:**
            *   Extract `uid` and `role` from `decodedToken` (check `decodedToken.role` or `decodedToken.claims.role`). Handle missing role (default or error).
            *   Construct `AuthenticatedUser` object.
            *   Call original `handler(request, user)`.
        5.  Wrap in try/catch, use `handleApiError`.
3.  **Add Role-Specific Wrapper (`simple-tracker/src/lib/api/middleware.ts`):**
    *   Create `withAdminRole` that uses `withAuthentication` and adds a check: `if (user.role !== 'admin') { return createErrorResponse('Forbidden...', 403); }`.

---

### Step 5: Middleware Refactor

**Objective:** Update `src/middleware.ts` to use Admin SDK verification on Bearer tokens and check verified claims for route protection. Remove cookie logic and insecure header forwarding.

**Files:**
*   `src/middleware.ts`
*   `src/lib/firebase/admin.ts`

**Instructions:**

1.  **Modify `middleware` function (`src/middleware.ts`):**
    *   Imports: Add necessary `firebase-admin` imports (`initializeApp`, `getAuth`, `cert`). Import `verifyIdToken` from `admin.ts`. Remove `jwt-decode`.
    *   **Initialization:** Attempt conditional Admin SDK initialization within middleware (be mindful of Edge runtime limitations - may need fallback to API call).
    *   **Token Extraction:** Remove cookie logic (line ~57). Read `Authorization: Bearer <token>` header. Return/redirect if missing/malformed.
    *   **Token Verification:** Remove `jwtDecode` block (lines ~66-97). Call `verifyIdToken(token)` in try/catch. On error, log and redirect to login.
    *   **Role Check:** Use verified `decodedToken.role` for admin path checks (lines ~76-81).
    *   **Remove Header Forwarding:** Delete lines setting `x-user-id`, `x-user-role` (lines ~84-92). Call `NextResponse.next()` without modified headers.

---

### Step 6: API Route Integration

**Objective:** Update *all* protected API routes to use the new secure authentication helper/wrapper from Step 4, relying on verified claims instead of insecure headers or local role checks.

**Files:**
*   All files under `simple-tracker/src/app/api/` requiring auth (e.g., `/tickets`, `/workdays`, `/admin/*`).
*   `simple-tracker/src/lib/api/middleware.ts` (Importing wrappers)

**Instructions:**

1.  **Identify Protected Routes.**
2.  **Apply Authentication Wrapper:**
    *   For each protected route handler:
        *   Import `withAuthentication` or `withAdminRole`.
        *   Wrap the exported handler function (e.g., `export const POST = withAuthentication(handler);`).
        *   Modify the handler signature to accept `user: AuthenticatedUser`.
        *   Remove internal header reads (`x-user-id`, `x-user-role`). Use `user.uid`, `user.role`.
        *   Remove any redundant internal auth/role checks (like the `verifyAdminRole` function in `admin/users/route.ts`).
3.  **Ensure Admin Routes use `withAdminRole`.**

---

### Step 7: Client-Side - Auth Logic Refactor

**Objective:** Refactor client-side authentication state management (`useAuth.ts`, `authStore.ts`) to use the new API login flow, `signInWithCustomToken`, and derive user state from verified ID token claims.

**Files:**
*   `simple-tracker/src/hooks/useAuth.ts`
*   `simple-tracker/src/stores/authStore.ts`
*   `simple-tracker/src/lib/firebase/client.ts`
*   `simple-tracker/src/lib/api/authApi.ts` (If exists)

**Instructions:**

1.  **Refactor Login Logic (`useAuth.ts`):**
    *   Modify `login` function: Accepts `username`, `password`.
    *   Remove old login logic.
    *   `POST` to `/api/auth/login` with `{ username, password }`.
    *   On success (receiving `customToken`):
        *   Import `signInWithCustomToken`, `auth` instance.
        *   Call `await signInWithCustomToken(auth, customToken);`.
        *   Handle errors. `onAuthStateChanged` will update state.
    *   Modify `logout`: Ensure `signOut(auth)` is called. Remove old cookie clearing.
2.  **Refactor Auth State Management (`authStore.ts`):**
    *   In `onAuthStateChanged` listener:
        *   On `user` login: Call `await user.getIdTokenResult(true);`. Extract `role` from `idTokenResult.claims.role`. Update store state with `uid`, verified `role`, `displayName`. **Do not fetch role from Firestore client-side.**
        *   On `user` logout: Clear store state.
    *   Ensure store exposes `user`, `role`, `isLoading`, `error`.
3.  **Update/Remove `authApi.ts`:** Remove/update functions related to old endpoints.
4.  **Token Transmission:** Ensure client API calls get current ID token (`auth.currentUser?.getIdToken()`) and send in `Authorization: Bearer <token>` header.

---

### Step 8: Client-Side - UI Updates

**Objective:** Update UI components (login form, guards) to use the new username/password flow and rely on the updated auth store state (with verified role).

**Files:**
*   `simple-tracker/src/components/forms/LoginForm.tsx`
*   `simple-tracker/src/components/auth/AuthGuard.tsx`
*   Components conditionally rendering based on role.

**Instructions:**

1.  **Update Login Form:** Use `username` and `password` fields. Call refactored `login(username, password)`. Handle loading/errors.
2.  **Update Auth Guard:** Subscribe to `authStore` (`user`, `isLoading`, `role`). Use verified `role` for client-side admin checks.
3.  **Update Role-Based UI:** Ensure components use the verified `role` from `authStore`.

---

### Step 9: Cleanup

**Objective:** Remove unused files, functions, code related to the old auth flow (jwt-decode, cookies, old API routes, insecure headers).

**Files:**
*   `src/middleware.ts`
*   `src/lib/api/middleware.ts`
*   Old API routes under `src/app/api/auth/` (e.g., `/session`, `/refresh`, `/logout` if replaced)
*   Files using `jwt-decode`.
*   Code setting/reading `auth-token` cookie.

**Instructions:**

1.  Remove `jwt-decode` imports/usage.
2.  Remove `auth-token` cookie logic.
3.  Delete unused API routes (e.g., `/api/auth/session`, `/api/auth/refresh`, potentially `/api/auth/logout` if client just uses `signOut`).
4.  Remove usage of `x-user-id`, `x-user-role` headers.
5.  Review `admin.ts` and `api/middleware.ts` for unused functions.

---

### Step 10: Firestore Rules Review

**Objective:** Review and tighten Firestore security rules, especially read access, relying on verified custom claims.

**Files:**
*   `simple-tracker/firestore.rules`

**Instructions:**

1.  **Verify Claim Usage:** Confirm rules use `request.auth.token.role` (via helpers like `isAdmin()`).
2.  **Tighten Read Access:** Replace broad `allow read: if request.auth != null;` where possible. Use role/ownership checks (`isAdmin()`, `request.auth.uid == resource.data.userId`). Prioritize server-side filtering.
3.  **Write Access:** Ensure write rules also use claims/ownership correctly.

---

This completes the revised implementation plan.