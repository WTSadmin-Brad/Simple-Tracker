/**
 * Image Upload Step Component (Client Component)
 * Third step of the wizard for uploading images
 * 
 * Uses the shared ImageUploadGrid component for better
 * consistency and reduced code duplication
 */
'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';
import ImageUploadGrid from '@/components/feature/tickets/image-upload-grid.client';
import imageService from '@/lib/services/image-service';
import { TempImageUploadResponse } from '@/types/tickets';

export function ImageUploadStep() {
  const { imageUpload, setImageUpload } = useWizardStore();
  const [images, setImages] = useState<TempImageUploadResponse[]>([]);
  
  // Initialize image upload state if necessary
  useEffect(() => {
    if (!imageUpload) {
      setImageUpload({ images: [] });
    } else if (imageUpload.images.length > 0 && images.length === 0) {
      // Initialize images from store if available
      setImages(imageUpload.images);
    }
  }, [imageUpload, setImageUpload, images.length]);
  
  // Update store when images change
  useEffect(() => {
    if (images.length > 0 || imageUpload?.images.length) {
      setImageUpload({ images });
    }
  }, [images, setImageUpload, imageUpload?.images.length]);
  
  // Cleanup images on unmount
  useEffect(() => {
    return () => {
      // Clean up any object URLs to prevent memory leaks
      imageService.cleanup();
    };
  }, []);
  
  // Handle image changes from the ImageUploadGrid component
  const handleImagesChange = (newImages: TempImageUploadResponse[]) => {
    setImages(newImages);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Image Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload up to 10 images related to your ticket. Drag and drop files or click to select.
        </p>
      </div>
      
      {/* Use the feature component for image uploads */}
      <ImageUploadGrid 
        images={images}
        onImagesChange={handleImagesChange}
        maxImages={10}
      />
      
      {/* Informational alert */}
      <Alert variant="default" className="mt-6 bg-muted">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          Images are optional but help provide visual context for your ticket.
        </AlertDescription>
      </Alert>
    </div>
  );
}
