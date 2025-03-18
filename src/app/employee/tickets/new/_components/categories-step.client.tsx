'use client';

/**
 * Categories Step Component (Client Component)
 * Second step of the wizard for collecting category counts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { useWizardStore, COUNTER_CATEGORIES } from '@/stores/wizardStore';

// Category definitions with their ranges
const CATEGORIES = [
  { id: 'category1', name: 'Concrete', min: 0, max: 150 },
  { id: 'category2', name: 'Steel', min: 0, max: 150 },
  { id: 'category3', name: 'Wood', min: 0, max: 150 },
  { id: 'category4', name: 'Plastic', min: 0, max: 150 },
  { id: 'category5', name: 'Glass', min: 0, max: 150 },
  { id: 'category6', name: 'Other', min: 0, max: 150 },
];

// Get gradient color based on count value
const getCounterGradient = (count: number) => {
  if (count === 0) {
    // Red gradient for 0
    return 'linear-gradient(135deg, hsl(0, 84%, 55%), hsl(0, 84%, 65%))';
  } else if (count >= 1 && count <= 84) {
    // Calculate a gradient that shifts from red to yellow based on position in range
    const percentage = (count - 1) / 83;
    return `linear-gradient(135deg, 
      hsl(${Math.round(percentage * 45)}, 90%, 55%), 
      hsl(${Math.round(percentage * 45 + 5)}, 90%, 65%))`;
  } else if (count >= 85 && count <= 124) {
    // Calculate a gradient that shifts from yellow to green based on position in range
    const percentage = (count - 85) / 39;
    return `linear-gradient(135deg, 
      hsl(${Math.round(45 + percentage * 97)}, 80%, 45%), 
      hsl(${Math.round(45 + percentage * 97 + 5)}, 80%, 55%))`;
  } else {
    // Gold gradient for 125-150
    return 'linear-gradient(135deg, hsl(43, 96%, 50%), hsl(43, 96%, 60%))';
  }
};

// Get solid color for fallback and compatibility
const getCounterColor = (count: number) => {
  if (count === 0) return 'var(--counter-red)';
  if (count >= 1 && count <= 84) return 'var(--counter-yellow)';
  if (count >= 85 && count <= 124) return 'var(--counter-green)';
  return 'var(--counter-gold)';
};

export function CategoriesStep() {
  const { categories, updateCategory, setCategories } = useWizardStore();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  
  // Initialize categories if they don't exist
  if (!categories) {
    const initialCategories = COUNTER_CATEGORIES.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    setCategories(initialCategories);
  }
  
  // Get the current category
  const currentCategory = CATEGORIES[currentCategoryIndex];
  
  // Navigate to previous category
  const goToPrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };
  
  // Navigate to next category
  const goToNext = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };
  
  // Increment counter value
  const incrementCounter = (categoryId: string) => {
    if (!categories) return;
    
    const currentValue = categories[categoryId] || 0;
    const category = CATEGORIES.find(c => c.id === categoryId);
    
    if (category && currentValue < category.max) {
      updateCategory(categoryId, currentValue + 1);
    }
  };
  
  // Decrement counter value
  const decrementCounter = (categoryId: string) => {
    if (!categories) return;
    
    const currentValue = categories[categoryId] || 0;
    const category = CATEGORIES.find(c => c.id === categoryId);
    
    if (category && currentValue > category.min) {
      updateCategory(categoryId, currentValue - 1);
    }
  };
  
  // Get the current value of a category
  const getCategoryValue = (categoryId: string) => {
    if (!categories) return 0;
    return categories[categoryId] || 0;
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentCategoryIndex + 1) / CATEGORIES.length) * 100;
  
  // Handle swipe gestures
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const swipe = info.offset.x;
    
    if (swipe < -50 && info.velocity.x < -0.3) {
      goToNext();
    } else if (swipe > 50 && info.velocity.x > 0.3) {
      goToPrevious();
    }
  };
  
  if (!categories) {
    return <div className="flex justify-center items-center h-64">Loading categories...</div>;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Categories</h3>
        <p className="text-sm text-muted-foreground">
          Enter the count for each category. Swipe left or right to navigate between categories.
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {currentCategoryIndex + 1} of {CATEGORIES.length}
        </div>
      </div>
      
      {/* Category counter */}
      <motion.div
        key={currentCategory.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="mb-8 touch-target"
      >
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 className="text-center text-lg font-medium mb-6">{currentCategory.name}</h4>
          
          <div className="flex flex-col items-center">
            <div 
              className="text-7xl font-bold mb-6 transition-all duration-300"
              style={{ 
                background: getCounterGradient(getCategoryValue(currentCategory.id)),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: getCounterColor(getCategoryValue(currentCategory.id)) // Fallback for browsers that don't support background-clip
              }}
            >
              {getCategoryValue(currentCategory.id)}
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full touch-target"
                onClick={() => decrementCounter(currentCategory.id)}
                disabled={getCategoryValue(currentCategory.id) <= currentCategory.min}
              >
                <Minus className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full touch-target"
                onClick={() => incrementCounter(currentCategory.id)}
                disabled={getCategoryValue(currentCategory.id) >= currentCategory.max}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={goToPrevious}
          disabled={currentCategoryIndex === 0}
          className="touch-target"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="ghost"
          onClick={goToNext}
          disabled={currentCategoryIndex === CATEGORIES.length - 1}
          className="touch-target"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
