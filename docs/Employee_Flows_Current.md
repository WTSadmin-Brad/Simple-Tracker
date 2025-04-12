# Simple Tracker - Employee User Flows (Current Implementation)

[[_TOC_]]

## 1. Authentication

*   **Login Flow:**
    *   Employees authenticate using **username and password** provided by an administrator.
    *   Login occurs via a custom API endpoint: `/api/auth/login`.
    *   The server verifies credentials against Firestore (using bcrypt for password hashing) and, upon success, mints a **Firebase Custom Token** using the Firebase Admin SDK.
    *   The client-side application (`authStore`, `useAuth`) receives this custom token and uses the Firebase Client SDK's `signInWithCustomToken` method to establish the user's Firebase session.
*   **Session Management & API Authentication:**
    *   Once logged in, the Firebase Client SDK manages the user's session and automatically handles refreshing the **Firebase ID Token**.
    *   For all subsequent requests to protected API endpoints, the client sends the current **ID Token** as a **Bearer token** in the `Authorization` header.
    *   Server-side verification of the ID Token (using Firebase Admin SDK's `verifyIdToken`) is now **mandatory** in both the application middleware (`src/middleware.ts`) and within protected API routes (`src/lib/api/middleware.ts`). This ensures all requests are properly authenticated and authorized.
    *   Role-Based Access Control (RBAC) relies on **verified custom claims** (e.g., `role`) embedded within the ID token, checked server-side.
*   **Logout Flow:**
    *   User-initiated action clearing local state (`authStore`) and potentially server-side session information via an API call.

## 2. Workday Logging (Calendar)

*   **Access & View (`CalendarView`):**
    *   Employees access a calendar interface (likely `/employee/calendar` or similar) to view and log their workdays.
    *   `CalendarView` is the main component, possibly using sub-components like `CalendarContent` for the grid/display.
*   **State Management (`calendarStore`) & Data Fetching:**
    *   `calendarStore` (Zustand) manages calendar-related state (e.g., selected date, view mode - month/week).
    *   Workday data is fetched using TanStack Query, likely via hooks interacting with `/api/workdays` or similar endpoints.
*   **Navigation, Filtering & Search:**
    *   Users can navigate between months/weeks.
    *   Filtering or search capabilities might exist to find specific workdays or entries (details not specified in analysis).
*   **Logging/Editing Workdays (`DayDetailSheet`):**
    *   Clicking on a specific day likely opens a `DayDetailSheet` (or similar modal/panel).
    *   Within this sheet, employees can log details for that workday (e.g., hours worked, jobsite, notes).
    *   Existing entries can be edited through this interface.
*   **Ticket Summary Display:**
    *   The `DayDetailSheet` or the calendar day cell itself may display a summary of tickets associated with that specific workday.

## 3. Ticket Submission (Wizard)

*   **Access & Container (`WizardContainer`):**
    *   Employees initiate ticket submission, likely navigating to a dedicated page/section managed by `WizardContainer`.
*   **State Management (`wizardStore`) & API Interaction (`useWizardApi`):**
    *   `wizardStore` (Zustand) manages the state of the multi-step form across different steps (e.g., entered data, current step).
    *   `useWizardApi` is a custom hook likely handling the final submission logic, sending the compiled ticket data to the backend API (e.g., `/api/tickets`).
*   **Wizard Steps (Example):**
    *   The wizard guides the user through multiple steps, potentially including:
        1.  Basic Information (e.g., title, related jobsite/truck)
        2.  Category Selection
        3.  Description / Details
        4.  Image Upload (if applicable)
        5.  Review & Confirmation
*   **Submission Process & Outcome:**
    *   Upon confirmation, `useWizardApi` sends the data.
    *   The UI provides feedback on success or failure. `wizardStore` is likely reset.

## 4. Viewing Historical Data

*   **Workdays:** Employees can view past workdays primarily by navigating through the `CalendarView`.
*   **Tickets:** Historical tickets related to a specific day can be viewed via the summary in the `DayDetailSheet` when selecting that day on the calendar. *It's unclear from the analysis if a separate, dedicated "My Tickets" list view exists for employees.*

## 5. Authentication Implementation Notes & Issues

*   **Summary:** The authentication system has been refactored for enhanced security. It now relies exclusively on **Firebase ID Tokens** transported via the `Authorization: Bearer` header. Crucially, **server-side verification** of these tokens using the Firebase Admin SDK (`verifyIdToken`) is enforced in middleware and API routes. Authorization decisions are based on **verified custom claims** within the token.
*   **Security Posture:** This approach eliminates the previous security vulnerabilities associated with client-side token decoding (`jwt-decode`) and reliance on insecure cookies (`auth-token`) or headers (`x-user-role`) for access control. The system now adheres to recommended security practices for token-based authentication.

## 6. Future Enhancements & Ideas (Employee)

*   *Suggestion:* Offline support for workday logging and ticket draft creation.
*   *Suggestion:* Performance optimization for calendar view with large datasets.
*   *Suggestion:* Push notifications for workday reminders or ticket status updates.
*   *Suggestion:* Direct ticket viewing/editing capabilities from the calendar.
*   *Suggestion:* Streamlined UI for adding multiple ticket categories.