/**
 * User Preferences Helpers
 * Bridge from the References API to shared Firebase utilities
 */

import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { NotFoundError, ValidationError, ErrorCodes } from '@/lib/errors/error-types';

// Firestore collection name
const USER_PREFERENCES_COLLECTION = 'userPreferences';

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  defaultJobsite?: string;
  defaultTruck?: string;
  lastActive: string;
}

/**
 * Fetch user preferences from Firestore
 * @param userId User ID to fetch preferences for
 * @returns User preferences object
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  if (!userId) {
    throw new ValidationError(
      'User ID is required', 
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'userId' }
    );
  }

  try {
    // Set up Firestore reference
    const firestore = getFirestoreAdmin();
    const preferencesRef = firestore.collection(USER_PREFERENCES_COLLECTION).doc(userId);
    
    // Fetch the document
    const doc = await preferencesRef.get();
    
    if (!doc.exists) {
      // If no preferences exist, return defaults
      return {
        userId,
        theme: 'system',
        notifications: true,
        lastActive: new Date().toISOString(),
      };
    }
    
    const data = doc.data() as Omit<UserPreferences, 'userId'>;
    
    // Return preferences with userId added
    return {
      userId,
      ...data,
    };
  } catch (error) {
    console.error(`Error fetching user preferences for user ${userId}:`, error);
    // Return defaults on error to avoid breaking the UI
    return {
      userId,
      theme: 'system',
      notifications: true,
      lastActive: new Date().toISOString(),
    };
  }
}

/**
 * Alternative name for getUserPreferences to maintain backward compatibility
 * @deprecated Use getUserPreferences instead
 */
export const fetchUserPreferences = getUserPreferences;

/**
 * Update user preferences in Firestore
 * @param userId User ID to update preferences for
 * @param preferences Partial preferences to update
 * @returns Updated user preferences object
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Omit<UserPreferences, 'userId' | 'lastActive'>>
): Promise<UserPreferences> {
  if (!userId) {
    throw new ValidationError(
      'User ID is required', 
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'userId' }
    );
  }
  
  try {
    // Set up Firestore reference
    const firestore = getFirestoreAdmin();
    const preferencesRef = firestore.collection(USER_PREFERENCES_COLLECTION).doc(userId);
    
    // Fetch current preferences to merge with updates
    const currentPreferences = await getUserPreferences(userId);
    
    // Create updated preferences object
    const updatedPreferences: Partial<UserPreferences> = {
      ...preferences,
      lastActive: new Date().toISOString(),
    };
    
    // Update the document (Firestore will merge with existing data)
    await preferencesRef.set(updatedPreferences, { merge: true });
    
    // Return the complete updated preferences
    return {
      ...currentPreferences,
      ...updatedPreferences,
    };
  } catch (error) {
    console.error(`Error updating user preferences for user ${userId}:`, error);
    throw error; // Let the API route handler catch and format this
  }
}

/**
 * Check if a user has preferences stored
 * @param userId User ID to check
 * @returns Boolean indicating whether user preferences exist
 */
export async function userPreferencesExist(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }
  
  try {
    const firestore = getFirestoreAdmin();
    const preferencesRef = firestore.collection(USER_PREFERENCES_COLLECTION).doc(userId);
    const doc = await preferencesRef.get();
    
    return doc.exists;
  } catch (error) {
    console.error(`Error checking if user preferences exist for user ${userId}:`, error);
    return false;
  }
}
