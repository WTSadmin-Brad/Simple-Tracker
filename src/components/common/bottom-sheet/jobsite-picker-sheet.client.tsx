/**
 * JobsitePickerSheet.client.tsx
 * Jobsite selection component with search functionality in a bottom sheet
 * 
 * @source Employee_Flows.md - "Bottom sheets for selection interfaces" and "Basic Info Step"
 */

import { useState, useEffect } from 'react';
import BottomSheet from './BottomSheet.client';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

// Define the Jobsite type based on the application's data model
interface Jobsite {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isActive: boolean;
}

interface JobsitePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (jobsite: Jobsite) => void;
  selectedJobsite?: Jobsite | null;
  recentJobsites?: Jobsite[];
}

/**
 * Jobsite picker component in a bottom sheet with search functionality
 * 
 * TODO: Implement the following features:
 * - Search functionality with debounce
 * - Recent jobsites section
 * - Alphabetical sorting
 * - Active/inactive status indication
 * - Loading states for data fetching
 * - Error handling for failed requests
 * - Haptic feedback on selection
 */
const JobsitePickerSheet = ({
  isOpen,
  onClose,
  onSelect,
  selectedJobsite,
  recentJobsites = []
}: JobsitePickerSheetProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobsites, setJobsites] = useState<Jobsite[]>([]);
  const [filteredJobsites, setFilteredJobsites] = useState<Jobsite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated data fetching
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      setTimeout(() => {
        // Placeholder data
        setJobsites([
          // Jobsites would be fetched from an API
        ]);
        setIsLoading(false);
      }, 500);
    }
  }, [isOpen]);

  // Filter jobsites based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobsites(jobsites);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredJobsites(
        jobsites.filter(
          jobsite => 
            jobsite.name.toLowerCase().includes(query) ||
            jobsite.address.toLowerCase().includes(query) ||
            jobsite.city.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, jobsites]);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle jobsite selection
  const handleJobsiteSelect = (jobsite: Jobsite) => {
    onSelect(jobsite);
    onClose();
  };

  // Animation variants
  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : i * 0.05,
        duration: prefersReducedMotion ? 0.1 : 0.2
      }
    })
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Select Jobsite"
      height="large"
    >
      <div className="p-4">
        {/* Search input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobsites..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {/* Search icon would go here */}
              🔍
            </div>
          </div>
        </div>

        {/* Recent jobsites section */}
        {recentJobsites.length > 0 && searchQuery === '' && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent</h3>
            <div className="space-y-2">
              {recentJobsites.map((jobsite, index) => (
                <motion.div
                  key={jobsite.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleJobsiteSelect(jobsite)}
                >
                  <div className="font-medium">{jobsite.name}</div>
                  <div className="text-sm text-gray-500">{jobsite.address}, {jobsite.city}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <button 
              className="mt-2 text-primary-500 hover:underline"
              onClick={() => {
                // Retry logic would go here
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Jobsite list */}
        {!isLoading && !error && (
          <div className="space-y-2">
            {filteredJobsites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No jobsites found' : 'No jobsites available'}
              </div>
            ) : (
              filteredJobsites.map((jobsite, index) => (
                <motion.div
                  key={jobsite.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={listItemVariants}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedJobsite?.id === jobsite.id
                      ? 'bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-800'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${
                    !jobsite.isActive ? 'opacity-60' : ''
                  }`}
                  onClick={() => handleJobsiteSelect(jobsite)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{jobsite.name}</div>
                    {!jobsite.isActive && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{jobsite.address}, {jobsite.city}</div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default JobsitePickerSheet;
