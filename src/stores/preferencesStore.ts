/**
 * preferencesStore.ts
 * Zustand store for managing user preferences
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setReducedMotion: (enabled: boolean) => void;
  setDefaultView: (view: 'calendar' | 'tickets') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  addRecentTruck: (truckId: string) => void;
  addRecentJobsite: (jobsiteId: string) => void;
  clearRecentSelections: () => void;
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
    }
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
    }
  });
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      
      // Actions
      setTheme: (theme) => set(state => ({
        preferences: { ...state.preferences, theme }
      })),
      
      setReducedMotion: (reducedMotion) => set(state => ({
        preferences: { ...state.preferences, reducedMotion }
      })),
      
      setDefaultView: (defaultView) => set(state => ({
        preferences: { ...state.preferences, defaultView }
      })),
      
      setNotificationsEnabled: (notificationsEnabled) => set(state => ({
        preferences: { ...state.preferences, notificationsEnabled }
      })),
      
      addRecentTruck: (truckId) => addRecentTruckAction(truckId)(set, get),
      
      addRecentJobsite: (jobsiteId) => addRecentJobsiteAction(jobsiteId)(set, get),
      
      clearRecentSelections: () => set(state => ({
        preferences: { 
          ...state.preferences, 
          recentTrucks: [], 
          recentJobsites: [] 
        }
      }))
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
