/**
 * preferencesStore.ts
 * Zustand store for managing user preferences
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserPreferences, saveUserPreferences } from '@/lib/api/userApi';

// User preferences interface
interface Preferences {
  // Theme preferences
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  
  // Display preferences
  defaultView: 'calendar' | 'tickets';
  
  // Notification preferences
  notificationsEnabled: boolean;
  
  // Recent selections for quick access
  recentTrucks: string[];
  recentJobsites: string[];
}

// Preferences state interface
interface PreferencesState {
  // State
  preferences: Preferences;
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setReducedMotion: (enabled: boolean) => void;
  setDefaultView: (view: 'calendar' | 'tickets') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  addRecentTruck: (truckId: string) => void;
  addRecentJobsite: (jobsiteId: string) => void;
  clearRecentSelections: () => void;
  
  // Sync methods
  syncPreferences: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
}

// Default preferences
const defaultPreferences: Preferences = {
  theme: 'system',
  reducedMotion: false,
  defaultView: 'tickets',
  notificationsEnabled: true,
  recentTrucks: [],
  recentJobsites: []
};

// Action creators
const addRecentTruckAction = (truckId: string) => (set: any, get: any) => {
  const { preferences } = get();
  
  // Filter out duplicates and add new truck to the beginning
  const updatedTrucks = [
    truckId,
    ...preferences.recentTrucks.filter(id => id !== truckId)
  ].slice(0, 5); // Keep only the 5 most recent
  
  set({
    preferences: { 
      ...preferences, 
      recentTrucks: updatedTrucks 
    },
    isSynced: false
  });
};

const addRecentJobsiteAction = (jobsiteId: string) => (set: any, get: any) => {
  const { preferences } = get();
  
  // Filter out duplicates and add new jobsite to the beginning
  const updatedJobsites = [
    jobsiteId,
    ...preferences.recentJobsites.filter(id => id !== jobsiteId)
  ].slice(0, 5); // Keep only the 5 most recent
  
  set({
    preferences: { 
      ...preferences, 
      recentJobsites: updatedJobsites 
    },
    isSynced: false
  });
};

// API action creators
const syncPreferencesAction = () => async (set: any, get: any) => {
  const { preferences, isSynced } = get();
  
  // Skip if preferences are already synced
  if (isSynced) return;
  
  set({ isLoading: true, error: null });
  
  try {
    // Save preferences to the API
    const response = await saveUserPreferences(preferences);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to save preferences');
    }
    
    // Set synced flag when successful
    set({ isLoading: false, isSynced: true });
  } catch (error) {
    console.error('Error syncing preferences:', error);
    
    set({
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to sync preferences'
    });
  }
};

const fetchPreferencesAction = () => async (set: any) => {
  set({ isLoading: true, error: null });
  
  try {
    // Fetch preferences from the API
    const response = await getUserPreferences();
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch preferences');
    }
    
    // Use preferences property (resource-specific) instead of generic data property
    const userPreferences = response.preferences;
    
    // Merge with defaults in case API response is missing some fields
    set({
      preferences: { ...defaultPreferences, ...userPreferences },
      isLoading: false,
      isSynced: true
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    
    set({
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch preferences'
    });
  }
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      isLoading: false,
      error: null,
      isSynced: true,
      
      // Actions
      setTheme: (theme) => set(state => ({
        preferences: { ...state.preferences, theme },
        isSynced: false
      })),
      
      setReducedMotion: (reducedMotion) => set(state => ({
        preferences: { ...state.preferences, reducedMotion },
        isSynced: false
      })),
      
      setDefaultView: (defaultView) => set(state => ({
        preferences: { ...state.preferences, defaultView },
        isSynced: false
      })),
      
      setNotificationsEnabled: (notificationsEnabled) => set(state => ({
        preferences: { ...state.preferences, notificationsEnabled },
        isSynced: false
      })),
      
      addRecentTruck: (truckId) => addRecentTruckAction(truckId)(set, get),
      
      addRecentJobsite: (jobsiteId) => addRecentJobsiteAction(jobsiteId)(set, get),
      
      clearRecentSelections: () => set(state => ({
        preferences: { 
          ...state.preferences, 
          recentTrucks: [], 
          recentJobsites: [] 
        },
        isSynced: false
      })),
      
      // Sync methods
      syncPreferences: () => syncPreferencesAction()(set, get),
      fetchPreferences: () => fetchPreferencesAction()(set)
    }),
    {
      name: 'user-preferences-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

// Selector hooks for optimized component rendering
export const useThemePreferences = () => ({
  theme: usePreferencesStore(state => state.preferences.theme),
  reducedMotion: usePreferencesStore(state => state.preferences.reducedMotion),
  setTheme: usePreferencesStore(state => state.setTheme),
  setReducedMotion: usePreferencesStore(state => state.setReducedMotion)
});

export const useViewPreferences = () => ({
  defaultView: usePreferencesStore(state => state.preferences.defaultView),
  setDefaultView: usePreferencesStore(state => state.setDefaultView)
});

export const useNotificationPreferences = () => ({
  notificationsEnabled: usePreferencesStore(state => state.preferences.notificationsEnabled),
  setNotificationsEnabled: usePreferencesStore(state => state.setNotificationsEnabled)
});

export const useRecentSelections = () => ({
  recentTrucks: usePreferencesStore(state => state.preferences.recentTrucks),
  recentJobsites: usePreferencesStore(state => state.preferences.recentJobsites),
  addRecentTruck: usePreferencesStore(state => state.addRecentTruck),
  addRecentJobsite: usePreferencesStore(state => state.addRecentJobsite),
  clearRecentSelections: usePreferencesStore(state => state.clearRecentSelections)
});

export const usePreferencesSync = () => ({
  syncPreferences: usePreferencesStore(state => state.syncPreferences),
  fetchPreferences: usePreferencesStore(state => state.fetchPreferences),
  isLoading: usePreferencesStore(state => state.isLoading),
  error: usePreferencesStore(state => state.error),
  isSynced: usePreferencesStore(state => state.isSynced)
});
