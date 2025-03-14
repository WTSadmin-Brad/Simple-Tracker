/**
 * uiStore.ts
 * Zustand store for managing UI state
 */

import { create } from 'zustand';

// UI state interface
interface UIState {
  // Bottom sheet state
  activeBottomSheet: string | null;
  
  // Modal state
  activeModal: string | null;
  
  // Toast notifications
  toasts: {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }[];
  
  // Navigation state
  isSidebarOpen: boolean;
  
  // Actions
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
}

// Placeholder for the actual store implementation
export const useUIStore = create<UIState>()((set, get) => ({
  // Initial state
  activeBottomSheet: null,
  activeModal: null,
  toasts: [],
  isSidebarOpen: false,
  
  // Actions - placeholders to be implemented
  openBottomSheet: (id) => set({ activeBottomSheet: id }),
  closeBottomSheet: () => set({ activeBottomSheet: null }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  addToast: (message, type) => set(state => ({
    toasts: [...state.toasts, { id: Date.now().toString(), message, type }]
  })),
  removeToast: (id) => set(state => ({
    toasts: state.toasts.filter(toast => toast.id !== id)
  })),
  toggleSidebar: () => set(state => ({
    isSidebarOpen: !state.isSidebarOpen
  }))
}));
