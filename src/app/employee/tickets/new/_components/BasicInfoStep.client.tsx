'use client';

/**
 * Basic Info Step Component (Client Component)
 * First step of the wizard for collecting basic ticket information
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { CalendarIcon, ChevronRight, Truck, Building } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';

// Mock data for jobsites and trucks
// In a real implementation, these would be fetched from the API
const JOBSITES = [
  { id: 'job1', name: 'Downtown Project' },
  { id: 'job2', name: 'Highway Extension' },
  { id: 'job3', name: 'City Center' },
  { id: 'job4', name: 'Riverside Development' },
];

const TRUCKS = [
  { id: 'truck1', name: 'Truck 101' },
  { id: 'truck2', name: 'Truck 102' },
  { id: 'truck3', name: 'Truck 103' },
  { id: 'truck4', name: 'Truck 104' },
];

export function BasicInfoStep() {
  const { basicInfo, updateBasicInfo } = useWizardStore();
  const [isJobsiteSheetOpen, setIsJobsiteSheetOpen] = useState(false);
  const [isTruckSheetOpen, setIsTruckSheetOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Initialize local state if store is empty
  const localBasicInfo = basicInfo || {
    date: format(new Date(), 'yyyy-MM-dd'),
    jobsiteId: '',
    truckId: ''
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, MMMM d, yyyy');
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      updateBasicInfo('date', format(date, 'yyyy-MM-dd'));
    }
  };
  
  // Handle jobsite selection
  const handleJobsiteSelect = (jobsiteId: string) => {
    updateBasicInfo('jobsiteId', jobsiteId);
    setIsJobsiteSheetOpen(false);
  };
  
  // Handle truck selection
  const handleTruckSelect = (truckId: string) => {
    updateBasicInfo('truckId', truckId);
    setIsTruckSheetOpen(false);
  };
  
  // Get jobsite name by ID
  const getJobsiteName = (jobsiteId: string) => {
    const jobsite = JOBSITES.find(j => j.id === jobsiteId);
    return jobsite ? jobsite.name : 'Select Jobsite';
  };
  
  // Get truck name by ID
  const getTruckName = (truckId: string) => {
    const truck = TRUCKS.find(t => t.id === truckId);
    return truck ? truck.name : 'Select Truck';
  };
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Please provide the basic details for your ticket.
        </p>
      </div>
      
      {/* Date Picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Date
        </label>
        <div className="relative">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between h-14 text-left font-normal touch-target"
              >
                <span>{formatDate(localBasicInfo.date)}</span>
                <CalendarIcon className="h-5 w-5 opacity-50" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-96">
              <SheetHeader>
                <SheetTitle>Select Date</SheetTitle>
              </SheetHeader>
              <div className="py-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={new Date(localBasicInfo.date)}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Jobsite Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Jobsite
        </label>
        <Sheet open={isJobsiteSheetOpen} onOpenChange={setIsJobsiteSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className={`
                w-full justify-between h-14 text-left font-normal touch-target
                ${!localBasicInfo.jobsiteId ? 'text-muted-foreground' : ''}
              `}
            >
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 opacity-70" />
                <span>{getJobsiteName(localBasicInfo.jobsiteId)}</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-50" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-96">
            <SheetHeader>
              <SheetTitle>Select Jobsite</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="space-y-2">
                {JOBSITES.map((jobsite) => (
                  <motion.button
                    key={jobsite.id}
                    onClick={() => handleJobsiteSelect(jobsite.id)}
                    className={`
                      w-full p-4 text-left rounded-md border touch-target
                      ${jobsite.id === localBasicInfo.jobsiteId 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-card border-border hover:bg-accent'}
                    `}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-2 opacity-70" />
                      <span>{jobsite.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Truck Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Truck
        </label>
        <Sheet open={isTruckSheetOpen} onOpenChange={setIsTruckSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className={`
                w-full justify-between h-14 text-left font-normal touch-target
                ${!localBasicInfo.truckId ? 'text-muted-foreground' : ''}
              `}
            >
              <div className="flex items-center">
                <Truck className="h-5 w-5 mr-2 opacity-70" />
                <span>{getTruckName(localBasicInfo.truckId)}</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-50" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-96">
            <SheetHeader>
              <SheetTitle>Select Truck</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="space-y-2">
                {TRUCKS.map((truck) => (
                  <motion.button
                    key={truck.id}
                    onClick={() => handleTruckSelect(truck.id)}
                    className={`
                      w-full p-4 text-left rounded-md border touch-target
                      ${truck.id === localBasicInfo.truckId 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-card border-border hover:bg-accent'}
                    `}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 mr-2 opacity-70" />
                      <span>{truck.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
