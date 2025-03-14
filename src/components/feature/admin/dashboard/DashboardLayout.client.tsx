/**
 * DashboardLayout.client.tsx
 * Bento grid layout with drag-and-drop functionality for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Button } from '@/components/ui/button';
import { ArrowsMaximize, ArrowsMinimize, GripVertical, Plus, X } from 'lucide-react';
import DashboardCard from './DashboardCard.client';
import ChartCard from './cards/ChartCard.client';
import MetricCard from './cards/MetricCard.client';
import TableCard from './cards/TableCard.client';
import StatusCard from './cards/StatusCard.client';4
import ActivityCard from './cards/ActivityCard.client';
import CardConfigPanel from './CardConfigPanel.client';

// Import types from dashboardStore
import type { 
  CardConfig, 
  CardPosition, 
  CardSize, 
  CardType,
  ChartCardConfig,
  MetricCardConfig,
  TableCardConfig,
  StatusCardConfig,
  ActivityCardConfig
} from '@/stores/dashboardStore';

interface DashboardLayoutProps {
  isEditing: boolean;
  onEditComplete: () => void;
}

// Grid configuration
const GRID_COLS = 12;
const GRID_ROW_HEIGHT = 100; // pixels
const GRID_GAP = 16; // pixels

/**
 * Bento grid layout for the admin dashboard with drag-and-drop functionality
 */
const DashboardLayout = ({
  isEditing,
  onEditComplete
}: DashboardLayoutProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { 
    getActiveLayout, 
    addCard, 
    updateCard, 
    deleteCard, 
    updateCardPosition,
    updateCardSize,
    setEditMode
  } = useDashboardStore();
  
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardConfig | null>(null);
  const [showCardTypeSelector, setShowCardTypeSelector] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState<CardPosition | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Get active layout
  const activeLayout = getActiveLayout();
  const cards = activeLayout?.cards || [];
  
  // Update edit mode in store when isEditing changes
  useEffect(() => {
    setEditMode(isEditing);
  }, [isEditing, setEditMode]);
  
  // Calculate grid cell dimensions
  const calculateGridCellDimensions = useCallback(() => {
    if (!gridRef.current) return { cellWidth: 0, cellHeight: 0 };
    
    const gridWidth = gridRef.current.clientWidth;
    const cellWidth = (gridWidth - (GRID_GAP * (GRID_COLS - 1))) / GRID_COLS;
    const cellHeight = GRID_ROW_HEIGHT;
    
    return { cellWidth, cellHeight };
  }, []);
  
  // Calculate position from pixel coordinates
  const calculateGridPosition = useCallback((x: number, y: number, cardSize: CardSize): CardPosition => {
    if (!gridRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const { cellWidth, cellHeight } = calculateGridCellDimensions();
    const gridRect = gridRef.current.getBoundingClientRect();
    
    // Calculate grid coordinates
    const gridX = x - gridRect.left;
    const gridY = y - gridRect.top;
    
    // Calculate column and row
    const col = Math.round(gridX / (cellWidth + GRID_GAP));
    const row = Math.round(gridY / (cellHeight + GRID_GAP));
    
    // Determine width and height based on card size
    let width, height;
    switch (cardSize) {
      case 'small':
        width = 3;
        height = 1;
        break;
      case 'medium':
        width = 6;
        height = 2;
        break;
      case 'large':
        width = 12;
        height = 3;
        break;
      default:
        width = 6;
        height = 2;
    }
    
    // Ensure the card stays within grid boundaries
    const boundedCol = Math.max(0, Math.min(col, GRID_COLS - width));
    const boundedRow = Math.max(0, row);
    
    return {
      x: boundedCol,
      y: boundedRow,
      width,
      height
    };
  }, []);
  
  // Handle card edit
  const handleEditCard = (card: CardConfig) => {
    setSelectedCard(card);
    setConfigPanelOpen(true);
  };
  
  // Handle card removal
  const handleRemoveCard = (cardId: string) => {
    if (!activeLayout) return;
    deleteCard(activeLayout.id, cardId);
  };
  
  // Handle card resize
  const handleResizeCard = (cardId: string, size: CardSize) => {
    if (!activeLayout) return;
    updateCardSize(activeLayout.id, cardId, size);
  };
  
  // Handle config panel save
  const handleConfigSave = (updatedConfig: CardConfig) => {
    if (!activeLayout || !selectedCard) return;
    updateCard(activeLayout.id, selectedCard.id, updatedConfig);
    setConfigPanelOpen(false);
    setSelectedCard(null);
  };
  
  // Handle config panel close
  const handleConfigClose = () => {
    setConfigPanelOpen(false);
    setSelectedCard(null);
  };
  
  // Handle card type selection
  const handleCardTypeSelect = (type: CardType) => {
    if (!activeLayout) return;
    
    // Create a new card based on type
    const newCardBase = {
      id: `card-${Date.now()}`,
      title: `New ${type} card`,
      size: 'medium' as CardSize,
      position: {
        x: 0,
        y: cards.length > 0 ? Math.max(...cards.map(c => c.position.y)) + 3 : 0,
        width: 6,
        height: 2
      },
    };
    
    let newCard: CardConfig;
    
    switch (type) {
      case 'chart':
        newCard = {
          ...newCardBase,
          type: 'chart',
          chartType: 'bar',
          dataSource: 'tickets',
          refreshInterval: 300,
        } as ChartCardConfig;
        break;
        
      case 'metric':
        newCard = {
          ...newCardBase,
          type: 'metric',
          metricType: 'count',
          dataSource: 'tickets',
          showTrend: true,
          trendPeriod: 'day',
        } as MetricCardConfig;
        break;
        
      case 'table':
        newCard = {
          ...newCardBase,
          type: 'table',
          dataSource: 'tickets',
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'status' },
          ],
          sortBy: 'date',
          sortDirection: 'desc',
          pageSize: 5,
        } as TableCardConfig;
        break;
        
      case 'status':
        newCard = {
          ...newCardBase,
          type: 'status',
          systems: [
            { name: 'API', endpoint: '/api/health' },
            { name: 'Database', endpoint: '/api/health/db' },
          ],
        } as StatusCardConfig;
        break;
        
      case 'activity':
        newCard = {
          ...newCardBase,
          type: 'activity',
          activityTypes: ['ticket-created', 'user'],
          maxItems: 5,
          showUser: true,
        } as ActivityCardConfig;
        break;
        
      default:
        return;
    }
    
    addCard(activeLayout.id, newCard);
    setShowCardTypeSelector(false);
    
    // Open config panel for the new card
    setSelectedCard(newCard);
    setConfigPanelOpen(true);
  };
  
  // Handle drag start
  const handleDragStart = (cardId: string) => {
    if (!isEditing) return;
    setDraggingCardId(cardId);
    
    // Find the card's current position
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setDragPreviewPosition(card.position);
    }
  };
  
  // Handle drag
  const handleDrag = (cardId: string, event: MouseEvent | TouchEvent | PointerEvent) => {
    if (!isEditing || !gridRef.current) return;
    
    // Find the card
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // Get pointer position
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }
    
    // Calculate new position
    const newPosition = calculateGridPosition(clientX, clientY, card.size);
    setDragPreviewPosition(newPosition);
  };
  
  // Handle drag end
  const handleDragEnd = (cardId: string) => {
    if (!isEditing || !activeLayout || !dragPreviewPosition) return;
    
    updateCardPosition(activeLayout.id, cardId, dragPreviewPosition);
    setDraggingCardId(null);
    setDragPreviewPosition(null);
  };
  
  // Handle edit complete
  const handleEditComplete = () => {
    setConfigPanelOpen(false);
    setSelectedCard(null);
    setShowCardTypeSelector(false);
    onEditComplete();
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3
      }
    }
  };
  
  // Get column span class based on card size
  const getColSpanClass = (size: CardSize): string => {
    switch (size) {
      case 'small':
        return 'col-span-12 sm:col-span-6 md:col-span-3';
      case 'medium':
        return 'col-span-12 md:col-span-6';
      case 'large':
        return 'col-span-12';
      default:
        return 'col-span-12 md:col-span-6';
    }
  };
  
  // Render card based on type
  const renderCard = (card: CardConfig) => {
    switch (card.type) {
      case 'chart':
        return (
          <ChartCard
            key={card.id}
            id={card.id}
            title={card.title}
            chartType={(card as ChartCardConfig).chartType}
            dataSource={(card as ChartCardConfig).dataSource}
            filters={(card as ChartCardConfig).filters}
            refreshInterval={(card as ChartCardConfig).refreshInterval}
            size={card.size}
            isEditing={isEditing}
            onEdit={() => handleEditCard(card)}
            onRemove={() => handleRemoveCard(card.id)}
            onResize={(newSize) => handleResizeCard(card.id, newSize)}
          />
        );
        
      case 'metric':
        return (
          <MetricCard
            key={card.id}
            id={card.id}
            title={card.title}
            metricType={(card as MetricCardConfig).metricType}
            dataSource={(card as MetricCardConfig).dataSource}
            filters={(card as MetricCardConfig).filters}
            showTrend={(card as MetricCardConfig).showTrend}
            trendPeriod={(card as MetricCardConfig).trendPeriod}
            size={card.size}
            isEditing={isEditing}
            onEdit={() => handleEditCard(card)}
            onRemove={() => handleRemoveCard(card.id)}
            onResize={(newSize) => handleResizeCard(card.id, newSize)}
          />
        );
        
      case 'table':
        return (
          <TableCard
            key={card.id}
            id={card.id}
            title={card.title}
            dataSource={(card as TableCardConfig).dataSource}
            columns={(card as TableCardConfig).columns}
            filters={(card as TableCardConfig).filters}
            sortBy={(card as TableCardConfig).sortBy}
            sortDirection={(card as TableCardConfig).sortDirection}
            pageSize={(card as TableCardConfig).pageSize}
            size={card.size}
            isEditing={isEditing}
            onEdit={() => handleEditCard(card)}
            onRemove={() => handleRemoveCard(card.id)}
            onResize={(newSize) => handleResizeCard(card.id, newSize)}
          />
        );
        
      case 'status':
        return (
          <StatusCard
            key={card.id}
            id={card.id}
            title={card.title}
            systems={(card as StatusCardConfig).systems}
            showHistory={(card as StatusCardConfig).showHistory}
            size={card.size}
            isEditing={isEditing}
            onEdit={() => handleEditCard(card)}
            onRemove={() => handleRemoveCard(card.id)}
            onResize={(newSize) => handleResizeCard(card.id, newSize)}
          />
        );
        
      case 'activity':
        return (
          <ActivityCard
            key={card.id}
            id={card.id}
            title={card.title}
            activityTypes={(card as ActivityCardConfig).activityTypes}
            maxItems={(card as ActivityCardConfig).maxItems}
            showUser={(card as ActivityCardConfig).showUser}
            size={card.size}
            isEditing={isEditing}
            onEdit={() => handleEditCard(card)}
            onRemove={() => handleRemoveCard(card.id)}
            onResize={(newSize) => handleResizeCard(card.id, newSize)}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Render resize handle
  const ResizeHandle = ({ cardId, size }: { cardId: string, size: CardSize }) => {
    const nextSize = (): CardSize => {
      switch (size) {
        case 'small': return 'medium';
        case 'medium': return 'large';
        case 'large': return 'small';
        default: return 'medium';
      }
    };
    
    return (
      <div className="absolute bottom-2 right-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => handleResizeCard(cardId, nextSize())}
        >
          {size === 'large' ? (
            <ArrowsMinimize className="h-4 w-4" />
          ) : (
            <ArrowsMaximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };
  
  // Render drag handle
  const DragHandle = ({ cardId }: { cardId: string }) => {
    const controls = useDragControls();
    
    return (
      <div 
        className="absolute top-2 left-2 z-10 cursor-move touch-target"
        onPointerDown={(e) => {
          controls.start(e);
          handleDragStart(cardId);
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Card type selector
  const CardTypeSelector = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCardTypeSelector(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Select Card Type</h3>
          <Button variant="ghost" size="icon" onClick={() => setShowCardTypeSelector(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
            onClick={() => handleCardTypeSelect('chart')}
          >
            <span className="text-2xl mb-2">📊</span>
            <span>Chart</span>
          </button>
          <button
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
            onClick={() => handleCardTypeSelect('metric')}
          >
            <span className="text-2xl mb-2">📈</span>
            <span>Metric</span>
          </button>
          <button
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
            onClick={() => handleCardTypeSelect('table')}
          >
            <span className="text-2xl mb-2">📋</span>
            <span>Table</span>
          </button>
          <button
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center"
            onClick={() => handleCardTypeSelect('status')}
          >
            <span className="text-2xl mb-2">🔔</span>
            <span>Status</span>
          </button>
          <button
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center col-span-2"
            onClick={() => handleCardTypeSelect('activity')}
          >
            <span className="text-2xl mb-2">📝</span>
            <span>Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  // Grid overlay for drag preview
  const GridOverlay = () => {
    if (!isEditing || !draggingCardId || !dragPreviewPosition) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none z-20">
        <div 
          className="absolute bg-primary-500 bg-opacity-20 border-2 border-primary-500 rounded-lg"
          style={{
            left: `${(dragPreviewPosition.x * (100 / GRID_COLS))}%`,
            top: `${dragPreviewPosition.y * (GRID_ROW_HEIGHT + GRID_GAP)}px`,
            width: `${(dragPreviewPosition.width * (100 / GRID_COLS))}%`,
            height: `${dragPreviewPosition.height * (GRID_ROW_HEIGHT + GRID_GAP) - GRID_GAP}px`,
            transition: prefersReducedMotion ? 'none' : 'all 0.1s ease'
          }}
        />
      </div>
    );
  };
  
  return (
    <div className="relative">
      {/* Edit mode indicator */}
      {isEditing && (
        <div className="sticky top-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-2 px-4 text-center z-10">
          <p>Edit Mode: Drag cards to rearrange your dashboard</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Button 
              onClick={() => setShowCardTypeSelector(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
            <Button 
              onClick={handleEditComplete}
              className="bg-primary-500 hover:bg-primary-600 text-white"
              size="sm"
            >
              Save Layout
            </Button>
          </div>
        </div>
      )}
      
      {/* Grid container */}
      <div className="relative">
        <motion.div
          ref={gridRef}
          className="grid grid-cols-12 gap-4 p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {cards.map(card => (
              <motion.div
                key={card.id}
                className={`relative ${getColSpanClass(card.size)}`}
                style={{
                  gridRow: `span ${card.position.height}`,
                  order: card.position.y * GRID_COLS + card.position.x
                }}
                ref={el => cardRefs.current[card.id] = el}
                variants={itemVariants}
                layout
                drag={isEditing}
                dragControls={useDragControls()}
                dragListener={false}
                dragConstraints={gridRef}
                dragElastic={0.1}
                dragMomentum={false}
                onDrag={(_, info) => handleDrag(card.id, info.point.x ? info : info.lastEvent)}
                onDragEnd={() => handleDragEnd(card.id)}
                whileDrag={{ zIndex: 50, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                data-card-id={card.id}
              >
                {isEditing && <DragHandle cardId={card.id} />}
                {isEditing && <ResizeHandle cardId={card.id} size={card.size} />}
                {renderCard(card)}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add card button - only visible in edit mode when no card type selector is shown */}
          {isEditing && cards.length === 0 && !showCardTypeSelector && (
            <motion.div
              className="col-span-12 md:col-span-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => setShowCardTypeSelector(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-4xl text-gray-400 mb-2">+</div>
              <div className="text-gray-500">Add your first card</div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Grid overlay for drag preview */}
        <GridOverlay />
      </div>
      
      {/* Card type selector modal */}
      {showCardTypeSelector && <CardTypeSelector />}
      
      {/* Card configuration panel */}
      {configPanelOpen && selectedCard && (
        <CardConfigPanel
          isOpen={configPanelOpen}
          onClose={handleConfigClose}
          config={selectedCard}
          onSave={handleConfigSave}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
