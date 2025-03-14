/**
 * wizardStore.ts
 * Zustand store for managing wizard state with persistence
 * Handles session management, auto-save, and connection status
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

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
    id: string;
    url: string;
    caption: string;
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
  
  // Methods
  setStep: (step: WizardStep) => void;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  setCategories: (categories: Partial<Categories>) => void;
  setImageUpload: (imageUpload: Partial<ImageUpload>) => void;
  
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
      
      // Navigation methods
      setStep: (step) => set({ 
        currentStep: step,
        lastUpdated: new Date().toISOString()
      }),
      
      // Data update methods
      setBasicInfo: (info) => set((state) => ({ 
        basicInfo: { ...state.basicInfo, ...info } as BasicInfo,
        lastUpdated: new Date().toISOString()
      })),
      
      setCategories: (categories) => set((state) => ({ 
        categories: { ...state.categories, ...categories } as Categories,
        lastUpdated: new Date().toISOString()
      })),
      
      setImageUpload: (imageUpload) => set((state) => ({ 
        imageUpload: { ...state.imageUpload, ...imageUpload } as ImageUpload,
        lastUpdated: new Date().toISOString()
      })),
      
      // Session management methods
      initSession: () => {
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
      },
      
      clearWizard: () => set({
        currentStep: 'basic-info',
        basicInfo: null,
        categories: null,
        imageUpload: null,
        sessionId: null,
        sessionMetadata: null,
        lastUpdated: null
      }),
      
      hasActiveSession: () => {
        const state = get();
        
        // Check if there's any data in the wizard
        const hasData = 
          (state.basicInfo && (
            state.basicInfo.date || 
            state.basicInfo.truckId || 
            state.basicInfo.jobsiteId || 
            state.basicInfo.notes
          )) || 
          (state.categories && Object.values(state.categories).some(v => v > 0)) || 
          (state.imageUpload && state.imageUpload.images.length > 0);
        
        // Check if session is valid
        return Boolean(hasData && state.sessionId !== null && !get().isSessionExpired());
      },
      
      isSessionExpired: () => {
        const { sessionMetadata } = get();
        
        if (!sessionMetadata || !sessionMetadata.expiresAt) return true;
        
        return new Date(sessionMetadata.expiresAt) < new Date();
      },
      
      saveWizardState: () => {
        const state = get();
        
        // Only save if online and there's a session
        if (state.isOnline && state.sessionId) {
          const now = new Date();
          
          // Update session metadata
          set({
            lastUpdated: now.toISOString(),
            sessionMetadata: {
              ...state.sessionMetadata!,
              autoSaved: true
            }
          });
        }
      },
      
      // Auto-save methods
      enableAutoSave: () => set({ isAutoSaving: true }),
      disableAutoSave: () => set({ isAutoSaving: false }),
      
      // Connection status
      setOnlineStatus: (status) => set({ isOnline: status })
    }),
    {
      name: 'simple-tracker-wizard',
      storage: createJSONStorage(() => createCustomStorage())
    }
  )
);
