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
      activityTypes: ['ticket', 'user', 'system'],
      maxItems: 10,
      showUser: true,
    },
  ],
  lastModified: new Date().toISOString(),
});

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
      
      addLayout: (layout) => set((state) => ({
        layouts: [...state.layouts, { ...layout, lastModified: new Date().toISOString() }],
      })),
      
      updateLayout: (layoutId, updates) => set((state) => ({
        layouts: state.layouts.map(layout => 
          layout.id === layoutId 
            ? { ...layout, ...updates, lastModified: new Date().toISOString() } 
            : layout
        ),
      })),
      
      deleteLayout: (layoutId) => set((state) => {
        // Don't delete if it's the only layout or if it's the active layout
        if (state.layouts.length <= 1 || state.activeLayoutId === layoutId) {
          return state;
        }
        
        // Set active layout to default if deleting the active layout
        const newState: Partial<DashboardState> = {
          layouts: state.layouts.filter(layout => layout.id !== layoutId),
        };
        
        if (state.activeLayoutId === layoutId) {
          const defaultLayout = state.layouts.find(layout => layout.isDefault) || state.layouts[0];
          newState.activeLayoutId = defaultLayout.id;
        }
        
        return newState as DashboardState;
      }),
      
      setActiveLayout: (layoutId) => set((state) => {
        const layoutExists = state.layouts.some(layout => layout.id === layoutId);
        return layoutExists ? { activeLayoutId: layoutId } : state;
      }),
      
      // Card methods
      addCard: (layoutId, card) => set((state) => ({
        layouts: state.layouts.map(layout => 
          layout.id === layoutId 
            ? { 
                ...layout, 
                cards: [...layout.cards, card],
                lastModified: new Date().toISOString() 
              } 
            : layout
        ),
      })),
      
      updateCard: (layoutId, cardId, updates) => set((state) => ({
        layouts: state.layouts.map(layout => 
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
        ),
      })),
      
      deleteCard: (layoutId, cardId) => set((state) => ({
        layouts: state.layouts.map(layout => 
          layout.id === layoutId 
            ? { 
                ...layout, 
                cards: layout.cards.filter(card => card.id !== cardId),
                lastModified: new Date().toISOString() 
              } 
            : layout
        ),
      })),
      
      updateCardPosition: (layoutId, cardId, position) => set((state) => ({
        layouts: state.layouts.map(layout => 
          layout.id === layoutId 
            ? { 
                ...layout, 
                cards: layout.cards.map(card => 
                  card.id === cardId 
                    ? { ...card, position } 
                    : card
                ),
                lastModified: new Date().toISOString() 
              } 
            : layout
        ),
      })),
      
      updateCardSize: (layoutId, cardId, size) => set((state) => ({
        layouts: state.layouts.map(layout => 
          layout.id === layoutId 
            ? { 
                ...layout, 
                cards: layout.cards.map(card => 
                  card.id === cardId 
                    ? { ...card, size } 
                    : card
                ),
                lastModified: new Date().toISOString() 
              } 
            : layout
        ),
      })),
      
      // Edit mode methods
      setEditMode: (isEditMode) => set({ isEditMode }),
      
      // Helper methods
      getActiveLayout: () => {
        const state = get();
        return state.layouts.find(layout => layout.id === state.activeLayoutId) || null;
      },
      
      getDefaultLayout: () => {
        const state = get();
        return state.layouts.find(layout => layout.isDefault) || state.layouts[0] || createDefaultLayout();
      },
      
      createDefaultLayout,
    }),
    {
      name: 'simple-tracker-dashboard',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
