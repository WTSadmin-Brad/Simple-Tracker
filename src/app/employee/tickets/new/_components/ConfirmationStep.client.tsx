'use client';

/**
 * Confirmation Step Component (Client Component)
 * Final step of the wizard for reviewing and submitting the ticket
 */

import Image from 'next/image';
import { useWizardStore } from '@/stores/wizardStore';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ConfirmationStepProps = {
  onSubmit: () => Promise<void>;
};

// Get color based on count value
const getCounterColor = (count: number) => {
  if (count === 0) return 'var(--counter-red)';
  if (count >= 1 && count <= 84) return 'var(--counter-yellow)';
  if (count >= 85 && count <= 124) return 'var(--counter-green)';
  return 'var(--counter-gold)';
};

// Category definitions
const CATEGORIES = [
  { id: 'category1', name: 'Concrete' },
  { id: 'category2', name: 'Steel' },
  { id: 'category3', name: 'Wood' },
  { id: 'category4', name: 'Plastic' },
  { id: 'category5', name: 'Glass' },
  { id: 'category6', name: 'Other' },
];

export function ConfirmationStep({ onSubmit }: ConfirmationStepProps) {
  const { basicInfo, categories, imageUpload, isSubmitting } = useWizardStore();
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Helper function to get truck and jobsite names (would be replaced with actual lookups)
  const getTruckName = (truckId: string) => {
    // This would normally fetch from a reference data store
    return `Truck ${truckId}`;
  };
  
  const getJobsiteName = (jobsiteId: string) => {
    // This would normally fetch from a reference data store
    return `Jobsite ${jobsiteId}`;
  };
  
  if (!basicInfo || !categories || !imageUpload) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Missing required information. Please complete all previous steps.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Review Your Ticket</h3>
        <p className="text-sm text-muted-foreground">
          Please review the information below before submitting your ticket.
        </p>
      </div>
      
      {/* Basic info section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Basic Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="text-sm font-medium">{formatDate(basicInfo.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Jobsite:</span>
            <span className="text-sm font-medium">{getJobsiteName(basicInfo.jobsiteId)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Truck:</span>
            <span className="text-sm font-medium">{getTruckName(basicInfo.truckId)}</span>
          </div>
        </div>
      </div>
      
      {/* Categories section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium mb-3">Categories</h4>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => {
            const count = categories[category.id as keyof typeof categories];
            return (
              <div key={category.id} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{category.name}:</span>
                <span 
                  className="text-sm font-medium" 
                  style={{ color: getCounterColor(count) }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Images section */}
      {imageUpload.images && imageUpload.images.length > 0 ? (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Images ({imageUpload.images.length})</h4>
          <div className="grid grid-cols-3 gap-2">
            {imageUpload.images.map((image, index) => (
              <div 
                key={image.id} 
                className="relative aspect-square rounded-md overflow-hidden border border-border"
              >
                <Image
                  src={image.url}
                  alt={`${image.name || `Uploaded image ${index + 1}`}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Images</h4>
          <p className="text-sm text-muted-foreground">No images uploaded.</p>
        </div>
      )}
      
      {/* Submit button */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full max-w-xs py-6 text-lg touch-target"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </span>
          ) : (
            <span>Submit Ticket</span>
          )}
        </Button>
      </div>
    </div>
  );
}
