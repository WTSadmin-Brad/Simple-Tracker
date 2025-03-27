'use client';

/**
 * entity-detail-view.client.tsx
 * Generic detail view component for admin entities using the configuration system
 * 
 * This component displays detailed information about any entity type based on
 * the provided configuration. It supports tabs, custom field rendering,
 * and entity-specific actions.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fadeVariants } from '@/lib/animations/variants';
import { defaultSpring } from '@/lib/animations/springs';
import { EntityDetailViewProps } from './types';

/**
 * Generic EntityDetailView component
 * Displays detailed information about any entity type based on configuration
 */
export default function EntityDetailView<T extends Record<string, any>>({
  entityId,
  entityType,
  title,
  description,
  backLink,
  sections,
  fetchEntity,
  actions,
  className = ''
}: EntityDetailViewProps<T>) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [entity, setEntity] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(sections && sections.length > 0 ? sections[0].title : 'details');

  // Fetch entity data
  useEffect(() => {
    const loadEntity = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchEntity(entityId);
        if (data) {
          setEntity(data);
        } else {
          setError(`${entityType} not found`);
        }
      } catch (err) {
        setError(`Error loading ${entityType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEntity();
  }, [entityId, entityType, fetchEntity]);

  // Handle back navigation
  const handleBack = () => {
    router.push(backLink);
  };

  // Render a field value based on its key or format function
  const renderFieldValue = (field: { label: string; key: keyof T | ((item: T) => React.ReactNode); format?: (value: any) => React.ReactNode }, entity: T) => {
    // If key is a function, use it to render the value
    if (typeof field.key === 'function') {
      return field.key(entity);
    }
    
    // Otherwise, get the value from the entity
    const value = entity[field.key];
    
    // If format function is provided, use it
    if (field.format) {
      return field.format(value);
    }
    
    // Default rendering based on value type
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (Array.isArray(value)) {
        return (
          <ul className="list-disc pl-5 mt-2">
            {value.map((item, i) => (
              <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
            ))}
          </ul>
        );
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
        className={className}
      >
        <Card className="w-full">
          <CardHeader>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2 w-24"
              onClick={handleBack}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Error state
  if (error || !entity) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
        className={className}
      >
        <Card className="w-full">
          <CardHeader>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={handleBack}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </Button>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error || `${entityType} not found`}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Determine if we should use tabs
  const useTabs = sections && sections.length > 1;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
      transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
      className={className}
    >
      <Card className="w-full">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={handleBack}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        {useTabs ? (
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                {sections.map(section => (
                  <TabsTrigger key={section.title} value={section.title}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sections.map(section => (
                <TabsContent key={section.title} value={section.title} className="space-y-6">
                  {section.fields.map((field, index) => (
                    <div key={index} className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {field.label}
                      </h3>
                      <div className="text-base">
                        {renderFieldValue(field, entity)}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        ) : (
          <CardContent className="space-y-6">
            {sections && sections[0]?.fields.map((field, index) => (
              <div key={index} className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {field.label}
                </h3>
                <div className="text-base">
                  {renderFieldValue(field, entity)}
                </div>
              </div>
            ))}
          </CardContent>
        )}
        
        {actions && (
          <CardFooter className="flex justify-end space-x-2 border-t pt-6">
            {actions}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
