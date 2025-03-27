/**
 * uiStore.ts
 * Zustand store for managing UI state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// Action creators
const createToastAction = (message: string, type: 'info' | 'success' | 'warning' | 'error') => 
  (set: any) => set((state: UIState) => ({
    toasts: [...state.toasts, { id: Date.now().toString(), message, type }]
  }));

const removeToastAction = (id: string) => 
  (set: any) => set((state: UIState) => ({
    toasts: state.toasts.filter(toast => toast.id !== id)
  }));

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      activeBottomSheet: null,
      activeModal: null,
      toasts: [],
      isSidebarOpen: false,
      
      // Actions
      openBottomSheet: (id) => set({ activeBottomSheet: id }),
      closeBottomSheet: () => set({ activeBottomSheet: null }),
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
      addToast: (message, type) => createToastAction(message, type)(set),
      removeToast: (id) => removeToastAction(id)(set),
      toggleSidebar: () => set((state) => ({
        isSidebarOpen: !state.isSidebarOpen
      }))
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist UI preferences that should be remembered
        isSidebarOpen: state.isSidebarOpen
      })
    }
  )
);

// Selector hooks for optimized component rendering
export const useBottomSheet = () => ({
  activeBottomSheet: useUIStore(state => state.activeBottomSheet),
  openBottomSheet: useUIStore(state => state.openBottomSheet),
  closeBottomSheet: useUIStore(state => state.closeBottomSheet)
});

export const useModal = () => ({
  activeModal: useUIStore(state => state.activeModal),
  openModal: useUIStore(state => state.openModal),
  closeModal: useUIStore(state => state.closeModal)
});

export const useToasts = () => ({
  toasts: useUIStore(state => state.toasts),
  addToast: useUIStore(state => state.addToast),
  removeToast: useUIStore(state => state.removeToast)
});

export const useSidebar = () => ({
  isSidebarOpen: useUIStore(state => state.isSidebarOpen),
  toggleSidebar: useUIStore(state => state.toggleSidebar)
});
