'use client';

/**
 * EntityDetailView.client.tsx
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
import { DetailField } from './DetailPanel.client';

interface EntityDetailViewProps<T = any> {
  entityId: string;
  entityType: string;
  title: string;
  description?: string;
  backLink: string;
  detailFields: DetailField[];
  tabs?: {
    id: string;
    label: string;
    fields: DetailField[];
  }[];
  fetchEntity: (id: string) => Promise<T | null>;
  actions?: React.ReactNode;
}

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
  detailFields,
  tabs,
  fetchEntity,
  actions
}: EntityDetailViewProps<T>) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [entity, setEntity] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0].id : 'details');

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

  // Render a field value based on its type
  const renderFieldValue = (field: DetailField, entity: T) => {
    const value = entity[field.key];
    
    if (field.renderValue) {
      return field.renderValue(value);
    }
    
    switch (field.type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : value;
      case 'image':
        return value ? (
          <div className="mt-2">
            <img 
              src={value} 
              alt={field.label} 
              className="max-w-full h-auto rounded-md" 
            />
          </div>
        ) : 'No image';
      case 'list':
        return Array.isArray(value) ? (
          <ul className="list-disc pl-5 mt-2">
            {value.map((item, i) => (
              <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
            ))}
          </ul>
        ) : value;
      case 'link':
        return value ? (
          <a 
            href={value} 
            className="text-primary hover:underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : 'No link';
      default:
        return typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeVariants}
      transition={shouldReduceMotion ? { duration: 0 } : defaultSpring}
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
        
        {tabs && tabs.length > 0 ? (
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {tabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  {tab.fields.map(field => (
                    <div key={field.key} className="space-y-1">
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
            {detailFields.map(field => (
              <div key={field.key} className="space-y-1">
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
