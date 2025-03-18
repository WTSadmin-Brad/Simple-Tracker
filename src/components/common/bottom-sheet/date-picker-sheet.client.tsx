/**
 * DatePickerSheet.client.tsx
 * Calendar date picker in bottom sheet for selecting dates
 * 
 * @source Employee_Flows.md - "Bottom sheets for selection interfaces" and "Basic Info Step"
 */

import { useState } from 'react';
import BottomSheet from './BottomSheet.client';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DatePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

/**
 * Date picker component in a bottom sheet
 * 
 * TODO: Implement the following features:
 * - Month navigation with animations
 * - Day selection with color coding
 * - Disabled dates support
 * - Min/max date range support
 * - Today button for quick navigation
 * - Haptic feedback on selection
 * - Support for reduced motion preferences
 */
const DatePickerSheet = ({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate = new Date(),
  minDate,
  maxDate,
  disabledDates = []
}: DatePickerSheetProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  
  // Function to check if a date is selectable
  const isDateSelectable = (date: Date) => {
    // Check if date is within min/max range
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    
    // Check if date is in disabled dates
    return !disabledDates.some(disabledDate => 
      disabledDate.toDateString() === date.toDateString()
    );
  };
  
  // Function to handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      onDateSelect(date);
      onClose();
    }
  };
  
  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Function to generate calendar days
  const generateCalendarDays = () => {
    // Placeholder for calendar generation logic
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Calendar days would be generated here */}
        <div className="h-10 w-10 flex items-center justify-center">
          {/* Example day cell */}
          <button 
            className="h-8 w-8 rounded-full flex items-center justify-center"
            onClick={() => handleDateSelect(new Date())}
          >
            {new Date().getDate()}
          </button>
        </div>
      </div>
    );
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose}
      title="Select Date"
      height="large"
    >
      <div className="p-4">
        {/* Month navigation */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            &lt; {/* Left arrow */}
          </button>
          
          <h3 className="text-lg font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            &gt; {/* Right arrow */}
          </button>
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        {generateCalendarDays()}
        
        {/* Today button */}
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => handleDateSelect(new Date())}
            className="px-4 py-2 bg-primary-500 text-white rounded-md"
          >
            Today
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default DatePickerSheet;
