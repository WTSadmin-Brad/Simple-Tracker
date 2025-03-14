/**
 * preferencesStore.ts
 * Zustand store for managing user preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Placeholder for the actual store implementation
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      
      // Actions - placeholders to be implemented
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
      addRecentTruck: (truckId) => set(state => {
        // Placeholder implementation - will handle duplicates and limit array size
        return { preferences: { ...state.preferences, recentTrucks: [truckId, ...state.preferences.recentTrucks].slice(0, 5) } };
      }),
      addRecentJobsite: (jobsiteId) => set(state => {
        // Placeholder implementation - will handle duplicates and limit array size
        return { preferences: { ...state.preferences, recentJobsites: [jobsiteId, ...state.preferences.recentJobsites].slice(0, 5) } };
      }),
      clearRecentSelections: () => set(state => ({
        preferences: { ...state.preferences, recentTrucks: [], recentJobsites: [] }
      }))
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);
