/**
 * wizardStore.ts
 * Zustand store for managing wizard state with persistence
 * Handles session management, auto-save, and connection status
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { TICKET_CATEGORIES } from '@/lib/constants/ticketCategories';

// Type definitions for wizard state
export type WizardStep = 'basic-info' | 'categories' | 'image-upload' | 'confirmation';

export interface BasicInfo {
  date: string | null;
  truckId: string | null;
  jobsiteId: string | null;
  notes: string;
}

export interface Categories {
  category1: number;
  category2: number;
  category3: number;
  category4: number;
  category5: number;
  category6: number;
}

export interface ImageUpload {
  images: Array<{
    tempId: string;
    url: string;
    expiresAt?: string;
  }>;
}

export interface SessionMetadata {
  createdAt: string;
  expiresAt: string;
  autoSaved: boolean;
  deviceId: string;
  userId: string | null;
}

export interface WizardState {
  // Wizard navigation
  currentStep: WizardStep;
  
  // Step data
  basicInfo: BasicInfo | null;
  categories: Categories | null;
  imageUpload: ImageUpload | null;
  
  // Session management
  sessionId: string | null;
  sessionMetadata: SessionMetadata | null;
  lastUpdated: string | null;
  isAutoSaving: boolean;
  isOnline: boolean;
  isSubmitting: boolean;
  
  // Methods
  setCurrentStep: (step: WizardStep) => void;
  updateBasicInfo: (key: keyof BasicInfo, value: string | null) => void;
  updateCategory: (categoryId: string, value: number) => void;
  setBasicInfo: (info: BasicInfo | null) => void;
  setCategories: (categories: Record<string, number> | null) => void;
  setImageUpload: (imageUpload: ImageUpload | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  
  // Validation methods
  isStepValid: (step: WizardStep) => boolean;
  canProceedToNextStep: () => boolean;
  
  // Session management methods
  initSession: () => void;
  clearWizard: () => void;
  hasActiveSession: () => boolean;
  isSessionExpired: () => boolean;
  saveWizardState: () => void;
  
  // Auto-save methods
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  
  // Connection status
  setOnlineStatus: (status: boolean) => void;
}

// Category keys for wizard step 2
export const COUNTER_CATEGORIES = [
  'category1',
  'category2',
  'category3',
  'category4',
  'category5',
  'category6',
];

// Generate a unique session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Generate a unique device ID if not already stored
const getDeviceId = () => {
  const storageKey = 'simple-tracker-device-id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = 'device_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
};

// Create a custom storage object that handles session expiration
const createCustomStorage = (): StateStorage => {
  return {
    getItem: (name: string): string | null => {
      const storedValue = localStorage.getItem(name);
      
      if (!storedValue) return null;
      
      try {
        const parsedValue = JSON.parse(storedValue);
        
        // Check if the session has expired
        if (parsedValue.state && parsedValue.state.sessionMetadata) {
          const { expiresAt } = parsedValue.state.sessionMetadata;
          
          if (expiresAt && new Date(expiresAt) < new Date()) {
            // Session expired, remove it
            localStorage.removeItem(name);
            return null;
          }
        }
        
        return storedValue;
      } catch (error) {
        console.error('Error parsing stored value:', error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
      localStorage.removeItem(name);
    }
  };
};

// Action creators
const initSessionAction = () => (set: any, get: any) => {
  const state = get();
  
  // If no session exists, create one
  if (!state.sessionId) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(now.getHours() + 24); // 24-hour expiration
    
    set({
      sessionId: generateSessionId(),
      sessionMetadata: {
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        autoSaved: false,
        deviceId: getDeviceId(),
        userId: null // Will be set when user is authenticated
      },
      lastUpdated: now.toISOString()
    });
  }
};

const clearWizardAction = () => (set: any) => {
  set({
    currentStep: 'basic-info',
    basicInfo: null,
    categories: null,
    imageUpload: null,
    sessionId: null,
    sessionMetadata: null,
    lastUpdated: null,
    isAutoSaving: false,
    isSubmitting: false
  });
};

const hasActiveSessionAction = () => (get: any) => {
  const { sessionId, sessionMetadata } = get();
  
  if (!sessionId || !sessionMetadata) return false;
  
  const { expiresAt } = sessionMetadata;
  if (!expiresAt) return false;
  
  // Check if session is expired
  const now = new Date();
  const expiration = new Date(expiresAt);
  
  return now < expiration;
};

const isSessionExpiredAction = () => (get: any) => {
  const { sessionMetadata } = get();
  if (!sessionMetadata || !sessionMetadata.expiresAt) return true;
  
  return new Date() > new Date(sessionMetadata.expiresAt);
};

const saveWizardStateAction = () => (get: any) => {
  // This would typically sync with a server
  // For now, we're just updating the lastUpdated timestamp
  const state = get();
  
  if (state.sessionId && state.isOnline) {
    // In a real implementation, this would call an API
    console.log('Saving wizard state to server...', {
      sessionId: state.sessionId,
      currentStep: state.currentStep,
      basicInfo: state.basicInfo,
      categories: state.categories,
      imageUpload: state.imageUpload
    });
  }
};

// Create the wizard store with persistence
export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'basic-info',
      basicInfo: null,
      categories: null,
      imageUpload: null,
      sessionId: null,
      sessionMetadata: null,
      lastUpdated: null,
      isAutoSaving: false,
      isOnline: true,
      isSubmitting: false,
      
      // Navigation methods
      setCurrentStep: (step) => set({ 
        currentStep: step,
        lastUpdated: new Date().toISOString()
      }),
      
      // Data update methods
      updateBasicInfo: (key, value) => set((state) => ({
        basicInfo: {
          ...state.basicInfo || { date: null, truckId: null, jobsiteId: null, notes: '' },
          [key]: value
        },
        lastUpdated: new Date().toISOString()
      })),
      
      updateCategory: (categoryId, value) => set((state) => ({
        categories: {
          ...state.categories || {},
          [categoryId]: value
        },
        lastUpdated: new Date().toISOString()
      })),
      
      setBasicInfo: (info) => set({ 
        basicInfo: info,
        lastUpdated: new Date().toISOString()
      }),
      
      setCategories: (categories) => set({ 
        categories: categories as Categories | null,
        lastUpdated: new Date().toISOString()
      }),
      
      setImageUpload: (imageUpload) => set({ 
        imageUpload,
        lastUpdated: new Date().toISOString()
      }),
      
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      
      // Validation methods
      isStepValid: (step) => {
        const state = get();
        
        switch (step) {
          case 'basic-info':
            return !!(
              state.basicInfo && 
              state.basicInfo.date && 
              state.basicInfo.truckId && 
              state.basicInfo.jobsiteId
            );
          case 'categories':
            return !!(
              state.categories && 
              Object.values(state.categories).some(value => value > 0)
            );
          case 'image-upload':
            // Image upload is optional
            return true;
          case 'confirmation':
            return state.isStepValid('basic-info') && state.isStepValid('categories');
          default:
            return false;
        }
      },
      
      canProceedToNextStep: () => {
        const { currentStep, isStepValid } = get();
        return isStepValid(currentStep);
      },
      
      // Session management methods
      initSession: () => initSessionAction()(set, get),
      clearWizard: () => clearWizardAction()(set),
      hasActiveSession: () => hasActiveSessionAction()(get),
      isSessionExpired: () => isSessionExpiredAction()(get),
      saveWizardState: () => saveWizardStateAction()(get),
      
      // Auto-save methods
      enableAutoSave: () => set({ isAutoSaving: true }),
      disableAutoSave: () => set({ isAutoSaving: false }),
      
      // Connection status
      setOnlineStatus: (status) => set({ isOnline: status })
    }),
    {
      name: 'simple-tracker-wizard',
      storage: createJSONStorage(() => createCustomStorage()),
      partialize: (state) => ({
        // Only persist necessary data
        currentStep: state.currentStep,
        basicInfo: state.basicInfo,
        categories: state.categories,
        imageUpload: state.imageUpload,
        sessionId: state.sessionId,
        sessionMetadata: state.sessionMetadata,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

// Selector hooks for optimized component rendering
export const useWizardStep = () => ({
  currentStep: useWizardStore(state => state.currentStep),
  setCurrentStep: useWizardStore(state => state.setCurrentStep)
});

export const useBasicInfo = () => ({
  basicInfo: useWizardStore(state => state.basicInfo),
  setBasicInfo: useWizardStore(state => state.setBasicInfo),
  updateBasicInfo: useWizardStore(state => state.updateBasicInfo)
});

export const useCategories = () => ({
  categories: useWizardStore(state => state.categories),
  setCategories: useWizardStore(state => state.setCategories),
  updateCategory: useWizardStore(state => state.updateCategory)
});

export const useImageUpload = () => ({
  imageUpload: useWizardStore(state => state.imageUpload),
  setImageUpload: useWizardStore(state => state.setImageUpload)
});

export const useWizardSession = () => ({
  sessionId: useWizardStore(state => state.sessionId),
  sessionMetadata: useWizardStore(state => state.sessionMetadata),
  lastUpdated: useWizardStore(state => state.lastUpdated),
  hasActiveSession: useWizardStore(state => state.hasActiveSession),
  isSessionExpired: useWizardStore(state => state.isSessionExpired),
  initSession: useWizardStore(state => state.initSession),
  clearWizard: useWizardStore(state => state.clearWizard),
  saveWizardState: useWizardStore(state => state.saveWizardState)
});

export const useWizardAutoSave = () => ({
  isAutoSaving: useWizardStore(state => state.isAutoSaving),
  enableAutoSave: useWizardStore(state => state.enableAutoSave),
  disableAutoSave: useWizardStore(state => state.disableAutoSave)
});

export const useWizardOnlineStatus = () => ({
  isOnline: useWizardStore(state => state.isOnline),
  setOnlineStatus: useWizardStore(state => state.setOnlineStatus)
});

export const useWizardSubmission = () => ({
  isSubmitting: useWizardStore(state => state.isSubmitting),
  setIsSubmitting: useWizardStore(state => state.setIsSubmitting)
});
