/**
 * BasicInfoStep.client.tsx
 * Client component for the first step of the ticket submission wizard
 * Handles basic information input (date, truck, jobsite)
 */
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button.client';
import { Sheet } from '@/components/ui/sheet.client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.client';
import { useWizardStore } from '@/stores/wizardStore';
import { basicInfoSchema } from '@/lib/schemas/wizardSchema';
import { useQuery } from '@tanstack/react-query';
import { fetchTrucks, fetchJobsites } from '@/lib/api/references';

type BasicInfoFormValues = {
  date: Date;
  truckId: string;
  jobsiteId: string;
};

const BasicInfoStep = () => {
  const shouldReduceMotion = useReducedMotion();
  const { basicInfo, setBasicInfo } = useWizardStore();
  
  // Sheet states for bottom sheets
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTruckSelectorOpen, setIsTruckSelectorOpen] = useState(false);
  const [isJobsiteSelectorOpen, setIsJobsiteSelectorOpen] = useState(false);
  
  // Fetch reference data
  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks'],
    queryFn: fetchTrucks
  });
  
  const { data: jobsites = [] } = useQuery({
    queryKey: ['jobsites'],
    queryFn: fetchJobsites
  });
  
  // Form setup with React Hook Form + Zod
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      date: basicInfo?.date || new Date(),
      truckId: basicInfo?.truckId || '',
      jobsiteId: basicInfo?.jobsiteId || ''
    }
  });
  
  // Get selected items
  const selectedTruck = trucks.find(truck => truck.id === form.watch('truckId'));
  const selectedJobsite = jobsites.find(jobsite => jobsite.id === form.watch('jobsiteId'));
  
  // Update wizard store when form values change
  const onSubmit = (values: BasicInfoFormValues) => {
    setBasicInfo(values);
  };
  
  // Update form when store values change
  useEffect(() => {
    if (basicInfo) {
      form.reset({
        date: basicInfo.date,
        truckId: basicInfo.truckId,
        jobsiteId: basicInfo.jobsiteId
      });
    }
  }, [basicInfo, form]);
  
  // Save form values to store when they change
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.date && values.truckId && values.jobsiteId) {
        setBasicInfo(values as BasicInfoFormValues);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, setBasicInfo]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: shouldReduceMotion ? 300 : 200,
        damping: 25
      }
    }
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-6">Basic Info Step</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Date Field */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Date</FormLabel>
                    <FormControl>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal touch-target"
                        onClick={() => setIsCalendarOpen(true)}
                        type="button"
                      >
                        {field.value ? format(field.value, 'PPP') : 'Select date'}
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Calendar Bottom Sheet */}
              <Sheet
                open={isCalendarOpen}
                onOpenChange={setIsCalendarOpen}
              >
                <Calendar
                  mode="single"
                  selected={form.watch('date')}
                  onSelect={(date) => {
                    if (date) {
                      form.setValue('date', date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date > new Date() || date < new Date('2023-01-01')}
                  className="p-4"
                />
              </Sheet>
            </motion.div>
            
            {/* Truck Selector */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="truckId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Truck</FormLabel>
                    <FormControl>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal touch-target"
                        onClick={() => setIsTruckSelectorOpen(true)}
                        type="button"
                      >
                        {selectedTruck ? selectedTruck.name : 'Select truck'}
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Truck Selector Bottom Sheet */}
              <Sheet
                open={isTruckSelectorOpen}
                onOpenChange={setIsTruckSelectorOpen}
              >
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-medium">Select Truck</h3>
                  <div className="grid gap-2">
                    {trucks.map(truck => (
                      <Button
                        key={truck.id}
                        variant={truck.id === form.watch('truckId') ? 'default' : 'outline'}
                        className="w-full justify-start text-left touch-target"
                        onClick={() => {
                          form.setValue('truckId', truck.id);
                          setIsTruckSelectorOpen(false);
                        }}
                      >
                        {truck.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </Sheet>
            </motion.div>
            
            {/* Jobsite Selector */}
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="jobsiteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jobsite</FormLabel>
                    <FormControl>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal touch-target"
                        onClick={() => setIsJobsiteSelectorOpen(true)}
                        type="button"
                      >
                        {selectedJobsite ? selectedJobsite.name : 'Select jobsite'}
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Jobsite Selector Bottom Sheet */}
              <Sheet
                open={isJobsiteSelectorOpen}
                onOpenChange={setIsJobsiteSelectorOpen}
              >
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-medium">Select Jobsite</h3>
                  <div className="grid gap-2">
                    {jobsites.map(jobsite => (
                      <Button
                        key={jobsite.id}
                        variant={jobsite.id === form.watch('jobsiteId') ? 'default' : 'outline'}
                        className="w-full justify-start text-left touch-target"
                        onClick={() => {
                          form.setValue('jobsiteId', jobsite.id);
                          setIsJobsiteSelectorOpen(false);
                        }}
                      >
                        {jobsite.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </Sheet>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
};

export default BasicInfoStep;
