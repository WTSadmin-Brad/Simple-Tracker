/**
 * ConfirmationStep.client.tsx
 * Client component for the fourth step of the ticket submission wizard
 * Handles final confirmation and submission
 */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import { useWizardStore, COUNTER_CATEGORIES, getCounterColor } from '@/stores/wizardStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Calendar,
  Truck,
  MapPin,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { fadeVariants } from '@/lib/animations/variants';
import { MAX_IMAGES } from '@/lib/helpers/imageHelpers';

const ConfirmationStep = () => {
  // Get reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Access wizard store
  const { 
    basicInfo, 
    categories, 
    imageUpload, 
    isSubmitting,
    submitTicket
  } = useWizardStore();
  
  // Local state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Format date for display
  const formattedDate = basicInfo?.date 
    ? format(new Date(basicInfo.date), 'MMMM d, yyyy')
    : 'Not selected';
  
  // Get images
  const images = imageUpload?.images || [];
  
  // Handle submission
  const handleSubmit = async () => {
    setSubmissionError(null);
    
    try {
      await submitTicket();
      // Note: The wizard store will handle redirection after successful submission
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionError('An error occurred during submission. Please try again.');
      setShowConfirmDialog(false);
    }
  };
  
  // Get category color class
  const getCategoryColorClass = (value: number) => {
    const color = getCounterColor(value);
    
    switch (color) {
      case 'red':
        return 'bg-[hsl(var(--counter-red))] text-white';
      case 'yellow':
        return 'bg-[hsl(var(--counter-yellow))] text-white';
      case 'green':
        return 'bg-[hsl(var(--counter-green))] text-white';
      case 'gold':
        return 'bg-[hsl(var(--counter-gold))] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-2">Review Your Ticket</h2>
      <p className="text-muted-foreground mb-6">
        Please review your ticket information before submitting
      </p>
      
      {/* Error message */}
      <AnimatePresence>
        {submissionError && (
          <motion.div 
            className="flex items-center mb-4 p-3 rounded-md bg-destructive/10 text-destructive"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{submissionError}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Basic Info Summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Date:</span>
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Truck:</span>
            <span className="text-sm">{basicInfo?.truckId || 'Not selected'}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Jobsite:</span>
            <span className="text-sm">{basicInfo?.jobsiteId || 'Not selected'}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Categories Summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COUNTER_CATEGORIES.map((category) => {
              const value = categories?.[category] || 0;
              
              return (
                <div 
                  key={category}
                  className="flex flex-col items-center p-2 rounded-md border"
                >
                  <span className="text-sm font-medium mb-1">{category}</span>
                  <Badge className={cn("text-lg font-bold", getCategoryColorClass(value))}>
                    {value}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Images Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Images</CardTitle>
          <CardDescription>
            {images.length} of {MAX_IMAGES} images uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((image) => (
                <div 
                  key={image.id}
                  className="relative aspect-square rounded-md overflow-hidden border"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
              <ImageIcon className="h-5 w-5 mr-2" />
              <span>No images uploaded</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Submit Button */}
      <div className="mt-auto">
        <Button 
          className="w-full touch-target"
          size="lg"
          onClick={() => setShowConfirmDialog(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Ticket'
          )}
        </Button>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center mb-4">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            
            <div className="flex items-center mb-4">
              <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{basicInfo?.truckId || 'Not selected'}</span>
              
              <span className="mx-2">•</span>
              
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{basicInfo?.jobsiteId || 'Not selected'}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{images.length} images</span>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm & Submit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfirmationStep;
