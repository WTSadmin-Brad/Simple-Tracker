/**
 * DashboardCard.client.tsx
 * Base card component for the admin dashboard
 * 
 * @source Admin_Flows.md - "Dashboard" section - "Bento-style dashboard with customizable cards"
 */

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type CardSize = 'small' | 'medium' | 'large';

interface DashboardCardProps {
  id: string;
  title: string;
  children: ReactNode;
  size?: CardSize;
  isEditing?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (newSize: CardSize) => void;
  className?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  description?: string;
  isCollapsible?: boolean;
}

/**
 * Base dashboard card component used by all card types
 * Provides common functionality like headers, actions, and resizing
 */
const DashboardCard = ({
  id,
  title,
  children,
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onResize,
  className = '',
  headerActions,
  footer,
  description,
  isCollapsible = false
}: DashboardCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: { 
        duration: prefersReducedMotion ? 0.1 : 0.2,
        ease: "easeIn"
      }
    }
  };
  
  // Content animation variants
  const contentVariants = {
    collapsed: { 
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: prefersReducedMotion ? 0.1 : 0.3 },
        opacity: { duration: prefersReducedMotion ? 0.1 : 0.2 }
      }
    },
    expanded: { 
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: prefersReducedMotion ? 0.1 : 0.3 },
        opacity: { duration: prefersReducedMotion ? 0.1 : 0.2, delay: prefersReducedMotion ? 0 : 0.1 }
      }
    }
  };
  
  // Handle resize
  const handleResize = () => {
    if (onResize) {
      // Cycle through sizes: small -> medium -> large -> small
      const nextSize: CardSize = 
        size === 'small' ? 'medium' : 
        size === 'medium' ? 'large' : 'small';
      
      onResize(nextSize);
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-1';
      case 'large':
        return 'col-span-2 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };
  
  // Toggle collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <motion.div
      className={cn(
        'w-full h-full',
        getSizeClasses(),
        isEditing && 'outline-dashed outline-2 outline-gray-300 dark:outline-gray-700',
        className
      )}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout={!prefersReducedMotion}
      data-card-id={id}
    >
      <Card className="h-full flex flex-col shadow-md border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Card Header */}
        <CardHeader className="px-4 py-3 flex flex-row items-center space-y-0 gap-2 border-b border-gray-100 dark:border-gray-800">
          {isEditing && (
            <div className="cursor-move touch-target" data-drag-handle>
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
          )}
          
          <CardTitle className="text-base font-medium truncate flex-grow">
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            {headerActions}
            
            {isCollapsible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {isEditing ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={handleResize}
                      >
                        {size === 'large' ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Resize to {size === 'small' ? 'medium' : size === 'medium' ? 'large' : 'small'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={onEdit}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit card</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={onRemove}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove card</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>
                  {onResize && (
                    <DropdownMenuItem onClick={handleResize}>
                      {size === 'large' ? (
                        <Minimize2 className="h-4 w-4 mr-2" />
                      ) : (
                        <Maximize2 className="h-4 w-4 mr-2" />
                      )}
                      Resize
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        {/* Description (if provided) */}
        {description && (
          <div className="px-4 py-1 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
            {description}
          </div>
        )}
        
        {/* Card Content */}
        <AnimatePresence initial={false}>
          <motion.div 
            className="flex-grow overflow-hidden"
            variants={contentVariants}
            initial={false}
            animate={isCollapsed ? "collapsed" : "expanded"}
          >
            <CardContent className="h-full p-0 overflow-auto">
              {children}
            </CardContent>
          </motion.div>
        </AnimatePresence>
        
        {/* Card Footer */}
        {footer && (
          <CardFooter className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default DashboardCard;
