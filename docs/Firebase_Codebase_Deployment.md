---
title: Firebase Setup and Deployment Guide (from Codebase)
date: 2025-04-06
tags: [firebase, firestore, storage, deployment, cli, rules, indexes, setup]
status: official
author: Development Team
---

# Firebase Setup and Deployment Guide (from Codebase)

## Table of Contents

1.  [Introduction](#introduction)
2.  [Prerequisites](#prerequisites)
3.  [Codebase Configuration Files](#codebase-configuration-files)
4.  [Deployment Process using Firebase CLI](#deployment-process-using-firebase-cli)
5.  [Firestore Setup Details](#firestore-setup-details)
6.  [Cloud Storage Setup Details](#cloud-storage-setup-details)
7.  [Authentication Setup Details](#authentication-setup-details)
8.  [Verification and Testing](#verification-and-testing)
9.  [Summary & Best Practices](#summary--best-practices)

## 1. Introduction

### Purpose

This guide explains how to set up and deploy your Firebase project's core backend configuration (Firestore Security Rules, Firestore Indexes, Cloud Storage Rules) directly from the files stored within the `simple-tracker` codebase. This approach is preferred for consistency, version control, and automated deployments.

This guide assumes:
*   You have a Firebase project already created.
*   The configuration files in your codebase (`simple-tracker/firestore.rules`, `simple-tracker/firestore.indexes.json`, `simple-tracker/storage.rules`) accurately reflect the desired structure and security needs, ideally matching the `simple-tracker/docs/Data_Models_Schema.md`.

### Why Deploy from Codebase?

*   **Version Control:** Your rules and indexes are tracked in Git alongside your application code.
*   **Consistency:** Ensures all environments (dev, staging, prod) use the same configuration.
*   **Automation:** Enables CI/CD pipelines to deploy configuration changes automatically.
*   **Collaboration:** Makes it easier for team members to review and manage configuration.

## 2. Prerequisites

Before deploying, ensure you have the following set up:

1.  **Node.js and npm:** Installed on your machine. ([Download Node.js](https://nodejs.org/))
2.  **Firebase CLI:** Installed globally. If not, run:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Firebase Login:** Logged into the Firebase CLI using the Google account associated with your Firebase project:
    ```bash
    firebase login
    ```
4.  **Firebase Project:** A Firebase project created in the [Firebase Console](https://console.firebase.google.com/). Note your **Project ID**.
5.  **Firebase Services Enabled:** In your Firebase project console, ensure the following services are enabled (you usually do this once when setting up the project):
    *   **Firestore Database:** (Build > Firestore Database > Create database - choose **Production mode** initially). Note the **Location** you choose.
    *   **Storage:** (Build > Storage > Get started).
    *   **Authentication:** (Build > Authentication > Get started). Enable the specific Sign-in methods you need (e.g., Email/Password).
6.  **Environment File (`.env.local`):** Create a `.env.local` file in the `simple-tracker` root directory (copy from `.env.example` if it exists) and fill in your Firebase project's **Client SDK configuration keys**. These are found in the Firebase Console (Project Settings > General > Your apps > Web app > SDK setup and configuration > Config).
    ```dotenv
    # Example .env.local content
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-... # Optional

    # Admin SDK credentials might also be here for server-side functions,
    # but are often handled differently (e.g., environment variables in hosting)
    # FIREBASE_PROJECT_ID=...
    # FIREBASE_CLIENT_EMAIL=...
    # FIREBASE_PRIVATE_KEY=...
    ```
7.  **Admin SDK Setup (for Custom Claims):** Ensure you have a secure backend mechanism (like Cloud Functions deployed separately) set up to assign custom claims (e.g., `role: 'admin'`) using the Firebase Admin SDK. This is crucial for role-based security rules. See the [Authentication Setup Details](#7-authentication-setup-details) section.

## 3. Codebase Configuration Files

The Firebase CLI uses configuration files within your project directory to know what to deploy.

*   **`firebase.json`**: This is the main configuration file for the Firebase CLI. It tells the CLI about your project structure and, importantly, *which files* contain your rules and indexes.
    *   The `"firestore"` section points to your `firestore.rules` and `firestore.indexes.json` files.
    *   The `"storage"` section points to your `storage.rules` file.
    *   The `"hosting"` section defines deployment settings for Firebase Hosting (if used).

*   **`firestore.rules`**: This file contains the security rules that define who can read, write, and validate data in your Firestore database. Deploying this file overwrites the rules currently active in your Firebase project.

*   **`firestore.indexes.json`**: This file defines the *composite indexes* needed for complex Firestore queries (e.g., filtering on one field while ordering by another). Deploying this file tells Firebase to create or update these indexes. Index creation can take some time.

*   **`storage.rules`**: This file contains the security rules that define who can upload, download, or delete files in your Cloud Storage bucket and under which paths. Deploying this file overwrites the active storage rules.

## 4. Deployment Process using Firebase CLI

Follow these steps in your terminal, ensuring you are in the `simple-tracker` root directory (the one containing `firebase.json`).

1.  **Select Firebase Project:**
    Make sure the CLI is targeting the correct Firebase project. You can list projects and select one:
    ```bash
    firebase projects:list
    firebase use <your-project-id>
    ```
    Replace `<your-project-id>` with the actual ID of your Firebase project (you can find this in your Firebase project settings or `.env.local`).

2.  **Deploy Firestore Rules:**
    This command uploads the contents of your local `firestore.rules` file to your Firebase project, replacing the existing rules.
    ```bash
    firebase deploy --only firestore:rules
    ```
    *   **What it does:** Enforces the data access and validation logic defined in your local file.

3.  **Deploy Firestore Indexes:**
    This command uploads the index definitions from your local `firestore.indexes.json` file. Firebase will then start creating or updating the necessary composite indexes in the background.
    ```bash
    firebase deploy --only firestore:indexes
    ```
    *   **What it does:** Ensures your database can efficiently perform the complex queries required by your application.
    *   **Note:** Index building can take several minutes or longer, depending on the amount of data. You can monitor the status in the Firebase Console (Firestore Database > Indexes tab). Queries requiring a newly defined index might fail until the index is fully built.

4.  **Deploy Storage Rules:**
    This command uploads the contents of your local `storage.rules` file to your Firebase project, replacing the existing rules for Cloud Storage.
    ```bash
    firebase deploy --only storage:rules
    # Note: Sometimes written as --only storage
    ```
    *   **What it does:** Enforces who can access files and under which conditions (paths, file types, sizes).

5.  **Deploy All (Alternative):**
    You can deploy Firestore (rules and indexes) and Storage rules together:
    ```bash
    firebase deploy --only firestore,storage
    ```

Choose the specific commands based on what you've changed. If you only updated rules, just deploy rules.

## 5. Firestore Setup Details

Deploying the configuration files handles most of the Firestore setup.

*   **Collections:** Firestore collections (`users`, `tickets`, `workdays`, etc.) are schema-less and are typically **created automatically** the first time your application writes a document to that collection path. You usually don't need to create them manually in the console when deploying configuration from code.
*   **Security Rules:** The rules defined in your deployed `firestore.rules` file are now active. They control read/write access and perform basic data validation based on user authentication (UID) and potentially custom claims (like `role`). Ensure these rules accurately reflect the access patterns needed by your application as documented in `Data_Models_Schema.md`.
*   **Indexes:** The composite indexes defined in your deployed `firestore.indexes.json` are being built or are ready. These are essential for queries involving multiple fields (filtering + sorting, multiple filters). Without the correct indexes defined and deployed, these queries would fail.

## 6. Cloud Storage Setup Details

*   **Rules:** The rules defined in your deployed `storage.rules` file are now active. They control who can upload, download, and delete files based on the path (e.g., `/tickets/...`, `/exports/...`, `/archives/...`), file metadata (like `userId`), content type, and size.
*   **Folder Structure:** Similar to Firestore collections, folders in Cloud Storage are created automatically when your application uploads a file to a specific path (e.g., `tickets/<userId>/<ticketId>/image.jpg`). You don't need to pre-create folders in the console.

## 7. Authentication Setup Details

While rules and indexes are deployed via the CLI, Authentication setup requires some console interaction and, critically, separate backend logic for Role-Based Access Control (RBAC).

*   **Sign-in Methods:** Ensure you have enabled the necessary sign-in methods (e.g., Email/Password) in the Firebase Console (Authentication > Sign-in method tab). This allows users to actually authenticate.

*   **Custom Claims (Essential for RBAC):**
    *   **Critical Requirement:** Deploying security rules (`firestore.rules`, `storage.rules`) is **NOT** sufficient on its own for the application's RBAC system to function. These rules rely heavily on checks like `request.auth.token.role == 'admin'` or similar.
    *   **The Missing Piece:** The `role` (or other RBAC attributes) used in the rules is a **Firebase Custom Claim**. These claims are metadata attached directly to a user's authentication token.
    *   **Mandatory Backend Process:** Custom claims **CANNOT** be deployed via Firebase CLI configuration files (`firebase.json`, etc.) or set directly from the client-side application due to security constraints. They **MUST** be set using the **Firebase Admin SDK** running within a trusted, secure backend environment (e.g., a Cloud Function, a dedicated admin API endpoint).
    *   **Implementation:** This typically involves:
        1.  Setting up the Firebase Admin SDK (using service account credentials) in your secure backend.
        2.  Creating a secure mechanism (e.g., an HTTP-triggered Cloud Function callable only by authenticated administrators) that accepts a user's UID and the desired claims (like `{ role: 'admin' }` or `{ role: 'employee' }`).
        3.  Using the Admin SDK function `admin.auth().setCustomUserClaims(uid, { role: 'newRole', ...otherClaims })` within that secure backend logic to assign the claims to the specified user.
    *   **Consequence of Omission:** If custom claims are not set correctly via the Admin SDK, all rule checks based on `request.auth.token.role` (or similar claims) will fail. Users will not receive their intended permissions (e.g., an admin user will be treated as a standard user by the security rules).
    *   **Further Reading:** For detailed implementation guidance, refer to the official documentation: [Firebase Docs: Control Access with Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
## 8. Verification and Testing

After deploying your configuration:

1.  **Check Console:** Go to the Firebase Console:
    *   Verify the deployed rules match your local files in the "Rules" tabs for Firestore and Storage.
    *   Check the "Indexes" tab in Firestore to confirm your composite indexes are listed and their status is "Enabled".
2.  **Test Application Functionality:** Thoroughly test all parts of your application that interact with Firestore or Storage:
    *   Log in as an 'employee' and verify they can perform allowed actions (e.g., create/view their tickets) but not restricted actions (e.g., view other users' tickets, access admin areas).
    *   Log in as an 'admin' (ensure their custom claim is set!) and verify they have the broader access defined in the rules.
    *   Test all queries that rely on the composite indexes you deployed.
    *   Test file uploads and downloads to ensure storage rules are working correctly.
    *   Test edge cases and try to perform actions that *should* be denied by the rules.

## 9. Summary & Best Practices

*   Deploying Firebase rules and indexes from your codebase using the Firebase CLI is the recommended approach for consistency and version control.
*   Ensure your `firebase.json` correctly points to your `firestore.rules`, `firestore.indexes.json`, and `storage.rules` files.
*   Keep these configuration files synchronized with your application's data access patterns and your schema documentation (`Data_Models_Schema.md`).
*   **Crucially, remember that setting custom claims for role-based access requires a separate, secure backend process using the Firebase Admin SDK.**
*   Always test thoroughly after deploying configuration changes.