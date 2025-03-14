/**
 * Firebase data types
 * 
 * @source directory-structure.md - "Firebase Cloud Functions" section
 * @source directory-structure.md - "Firebase Configuration" section
 */

/**
 * Firestore timestamp type
 */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

/**
 * Base document type with Firestore metadata
 */
export interface FirestoreDocument {
  id: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

/**
 * Firestore workday document
 */
export interface FirestoreWorkday extends FirestoreDocument {
  date: FirestoreTimestamp;
  jobsite: string;
  workType: 'full' | 'half' | 'off';
  editableUntil: FirestoreTimestamp;
  userId: string;
}

/**
 * Firestore ticket document
 */
export interface FirestoreTicket extends FirestoreDocument {
  date: FirestoreTimestamp;
  jobsite: string;
  truck: string;
  categories: {
    id: string;
    name: string;
    count: number;
  }[];
  imageRefs: string[];
  userId: string;
}

/**
 * Firestore user document
 */
export interface FirestoreUser extends FirestoreDocument {
  username: string;
  displayName: string;
  role: 'employee' | 'admin';
  lastLogin: FirestoreTimestamp;
  isActive: boolean;
}

/**
 * Firestore jobsite document
 */
export interface FirestoreJobsite extends FirestoreDocument {
  siteId: string;
  name: string;
  isActive: boolean;
}

/**
 * Firestore truck document
 */
export interface FirestoreTruck extends FirestoreDocument {
  truckId: string;
  name: string;
  isActive: boolean;
}

/**
 * Firestore wizard state document
 */
export interface FirestoreWizardState extends FirestoreDocument {
  userId: string;
  data: any;
  currentStep: number;
  expiresAt: FirestoreTimestamp;
}
