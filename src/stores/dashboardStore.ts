/**
 * dashboardStore.ts
 * Zustand store for managing admin dashboard state with persistence
 * Handles dashboard layout, card configurations, and user preferences
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Type definitions for dashboard state
export type CardType = 'chart' | 'metric' | 'table' | 'status' | 'activity';
export type CardSize = 'small' | 'medium' | 'large';
export type ChartType = 'line' | 'bar' | 'pie';
export type MetricType = 'count' | 'sum' | 'average';

export interface CardPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CardBase {
  id: string;
  type: CardType;
  title: string;
  size: CardSize;
  position: CardPosition;
  refreshInterval?: number; // in seconds, 0 means no auto-refresh
}

export interface ChartCardConfig extends CardBase {
  type: 'chart';
  chartType: ChartType;
  dataSource: string;
  filters?: Record<string, any>;
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

export interface MetricCardConfig extends CardBase {
  type: 'metric';
  metricType: MetricType;
  dataSource: string;
  filters?: Record<string, any>;
  showTrend?: boolean;
  trendPeriod?: 'day' | 'week' | 'month';
  format?: string;
}

export interface TableCardConfig extends CardBase {
  type: 'table';
  dataSource: string;
  columns: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status';
  }>;
  filters?: Record<string, any>;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
}

export interface StatusCardConfig extends CardBase {
  type: 'status';
  systems: Array<{
    name: string;
    endpoint?: string;
  }>;
  showHistory?: boolean;
}

export interface ActivityCardConfig extends CardBase {
  type: 'activity';
  activityTypes: string[];
  maxItems: number;
  showUser?: boolean;
}

export type CardConfig = 
  | ChartCardConfig 
  | MetricCardConfig 
  | TableCardConfig 
  | StatusCardConfig 
  | ActivityCardConfig;

export interface DashboardLayout {
  id: string;
  name: string;
  isDefault: boolean;
  cards: CardConfig[];
  lastModified: string;
}

export interface DashboardState {
  // Layouts
  layouts: DashboardLayout[];
  activeLayoutId: string | null;
  
  // Edit mode
  isEditMode: boolean;
  
  // Methods
  setLayouts: (layouts: DashboardLayout[]) => void;
  addLayout: (layout: DashboardLayout) => void;
  updateLayout: (layoutId: string, updates: Partial<DashboardLayout>) => void;
  deleteLayout: (layoutId: string) => void;
  setActiveLayout: (layoutId: string) => void;
  
  // Card methods
  addCard: (layoutId: string, card: CardConfig) => void;
  updateCard: (layoutId: string, cardId: string, updates: Partial<CardConfig>) => void;
  deleteCard: (layoutId: string, cardId: string) => void;
  updateCardPosition: (layoutId: string, cardId: string, position: CardPosition) => void;
  updateCardSize: (layoutId: string, cardId: string, size: CardSize) => void;
  
  // Edit mode methods
  setEditMode: (isEditMode: boolean) => void;
  
  // Helper methods
  getActiveLayout: () => DashboardLayout | null;
  getDefaultLayout: () => DashboardLayout;
  createDefaultLayout: () => DashboardLayout;
}

// Default layout with sample cards
const createDefaultLayout = (): DashboardLayout => ({
  id: 'default-layout',
  name: 'Default Layout',
  isDefault: true,
  cards: [
    {
      id: 'chart-1',
      type: 'chart',
      title: 'Tickets by Category',
      size: 'medium',
      position: { x: 0, y: 0, width: 6, height: 2 },
      chartType: 'bar',
      dataSource: 'tickets',
      refreshInterval: 300, // 5 minutes
    },
    {
      id: 'metric-1',
      type: 'metric',
      title: 'Total Tickets Today',
      size: 'small',
      position: { x: 6, y: 0, width: 3, height: 1 },
      metricType: 'count',
      dataSource: 'tickets',
      showTrend: true,
      trendPeriod: 'day',
    },
    {
      id: 'metric-2',
      type: 'metric',
      title: 'Active Employees',
      size: 'small',
      position: { x: 9, y: 0, width: 3, height: 1 },
      metricType: 'count',
      dataSource: 'users',
      filters: { status: 'active' },
    },
    {
      id: 'status-1',
      type: 'status',
      title: 'System Status',
      size: 'small',
      position: { x: 6, y: 1, width: 6, height: 1 },
      systems: [
        { name: 'API', endpoint: '/api/health' },
        { name: 'Database', endpoint: '/api/health/db' },
        { name: 'Storage', endpoint: '/api/health/storage' },
      ],
    },
    {
      id: 'table-1',
      type: 'table',
      title: 'Recent Tickets',
      size: 'large',
      position: { x: 0, y: 2, width: 12, height: 2 },
      dataSource: 'tickets',
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'truck', label: 'Truck' },
        { key: 'jobsite', label: 'Jobsite' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      sortBy: 'date',
      sortDirection: 'desc',
      pageSize: 5,
    },
    {
      id: 'activity-1',
      type: 'activity',
      title: 'Recent Activity',
      size: 'medium',
      position: { x: 0, y: 4, width: 6, height: 2 },
      activityTypes: ['login', 'ticket', 'workday'],
      maxItems: 10,
      showUser: true,
    },
  ],
  lastModified: new Date().toISOString(),
});

// Action creators
const updateLayoutAction = (layoutId: string, updates: Partial<DashboardLayout>) => 
  (set: any, get: any) => {
    const { layouts } = get();
    
    set({
      layouts: layouts.map(layout => 
        layout.id === layoutId
          ? { 
              ...layout, 
              ...updates, 
              lastModified: new Date().toISOString() 
            }
          : layout
      )
    });
  };

const deleteLayoutAction = (layoutId: string) => 
  (set: any, get: any) => {
    const { layouts, activeLayoutId } = get();
    
    // Prevent deleting the last layout
    if (layouts.length <= 1) {
      console.warn('Cannot delete the last layout');
      return;
    }
    
    // Filter out the layout to delete
    const updatedLayouts = layouts.filter(layout => layout.id !== layoutId);
    
    // If the active layout is being deleted, set a new active layout
    let newActiveLayoutId = activeLayoutId;
    if (activeLayoutId === layoutId) {
      // Try to find a default layout, or use the first available
      const defaultLayout = updatedLayouts.find(layout => layout.isDefault);
      newActiveLayoutId = defaultLayout ? defaultLayout.id : updatedLayouts[0].id;
    }
    
    set({
      layouts: updatedLayouts,
      activeLayoutId: newActiveLayoutId
    });
  };

const addCardAction = (layoutId: string, card: CardConfig) => 
  (set: any, get: any) => {
    const { layouts } = get();
    
    set({
      layouts: layouts.map(layout => 
        layout.id === layoutId
          ? { 
              ...layout, 
              cards: [...layout.cards, card],
              lastModified: new Date().toISOString() 
            }
          : layout
      )
    });
  };

const updateCardAction = (layoutId: string, cardId: string, updates: Partial<CardConfig>) => 
  (set: any, get: any) => {
    const { layouts } = get();
    
    set({
      layouts: layouts.map(layout => 
        layout.id === layoutId
          ? { 
              ...layout, 
              cards: layout.cards.map(card => 
                card.id === cardId
                  ? { ...card, ...updates }
                  : card
              ),
              lastModified: new Date().toISOString() 
            }
          : layout
      )
    });
  };

const deleteCardAction = (layoutId: string, cardId: string) => 
  (set: any, get: any) => {
    const { layouts } = get();
    
    set({
      layouts: layouts.map(layout => 
        layout.id === layoutId
          ? { 
              ...layout, 
              cards: layout.cards.filter(card => card.id !== cardId),
              lastModified: new Date().toISOString() 
            }
          : layout
      )
    });
  };

// Create the dashboard store with persistence
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      layouts: [createDefaultLayout()],
      activeLayoutId: 'default-layout',
      isEditMode: false,
      
      // Layout methods
      setLayouts: (layouts) => set({ layouts }),
      
      addLayout: (layout) => set(state => ({
        layouts: [...state.layouts, layout]
      })),
      
      updateLayout: (layoutId, updates) => updateLayoutAction(layoutId, updates)(set, get),
      
      deleteLayout: (layoutId) => deleteLayoutAction(layoutId)(set, get),
      
      setActiveLayout: (layoutId) => set({ activeLayoutId: layoutId }),
      
      // Card methods
      addCard: (layoutId, card) => addCardAction(layoutId, card)(set, get),
      
      updateCard: (layoutId, cardId, updates) => updateCardAction(layoutId, cardId, updates)(set, get),
      
      deleteCard: (layoutId, cardId) => deleteCardAction(layoutId, cardId)(set, get),
      
      updateCardPosition: (layoutId, cardId, position) => 
        updateCardAction(layoutId, cardId, { position })(set, get),
      
      updateCardSize: (layoutId, cardId, size) => 
        updateCardAction(layoutId, cardId, { size })(set, get),
      
      // Edit mode methods
      setEditMode: (isEditMode) => set({ isEditMode }),
      
      // Helper methods
      getActiveLayout: () => {
        const { layouts, activeLayoutId } = get();
        return layouts.find(layout => layout.id === activeLayoutId) || null;
      },
      
      getDefaultLayout: () => {
        const { layouts } = get();
        return layouts.find(layout => layout.isDefault) || layouts[0];
      },
      
      createDefaultLayout,
    }),
    {
      name: 'simple-tracker-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        layouts: state.layouts,
        activeLayoutId: state.activeLayoutId
      })
    }
  )
);

// Selector hooks for optimized component rendering
export const useLayouts = () => ({
  layouts: useDashboardStore(state => state.layouts),
  setLayouts: useDashboardStore(state => state.setLayouts),
  addLayout: useDashboardStore(state => state.addLayout),
  updateLayout: useDashboardStore(state => state.updateLayout),
  deleteLayout: useDashboardStore(state => state.deleteLayout)
});

export const useActiveLayout = () => ({
  activeLayoutId: useDashboardStore(state => state.activeLayoutId),
  activeLayout: useDashboardStore(state => state.getActiveLayout()),
  setActiveLayout: useDashboardStore(state => state.setActiveLayout)
});

export const useCards = () => ({
  addCard: useDashboardStore(state => state.addCard),
  updateCard: useDashboardStore(state => state.updateCard),
  deleteCard: useDashboardStore(state => state.deleteCard),
  updateCardPosition: useDashboardStore(state => state.updateCardPosition),
  updateCardSize: useDashboardStore(state => state.updateCardSize)
});

export const useEditMode = () => ({
  isEditMode: useDashboardStore(state => state.isEditMode),
  setEditMode: useDashboardStore(state => state.setEditMode)
});
