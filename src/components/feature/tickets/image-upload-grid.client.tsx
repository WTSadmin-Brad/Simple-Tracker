/**
 * ImageUploadGrid.client.tsx
 * Client Component for handling image uploads in a grid layout
 */
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getAccessibleVariants } from '@/lib/animations/accessibility';
import { stiffSpring } from '@/lib/animations/springs';
import { TempImageUploadResponse } from '@/types/tickets';
import { ImageUploadProps } from './ticket-types';
import { cn } from '@/lib/utils';

const ImageUploadGrid = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  className
}: ImageUploadProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  
  const {
    uploadImage,
    uploadProgress,
    uploadErrors,
    isUploading,
    generatePreview,
    revokeImageUrl,
    validateImage
  } = useImageUpload({
    onUploadComplete: (imageData) => {
      const newImage: TempImageUploadResponse = {
        tempId: imageData.id,
        url: imageData.url,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      onImagesChange([...images, newImage]);
      setError(null);
    },
    onUploadError: (error) => {
      setError(error.message);
    }
  });

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    // Check if adding more images would exceed the limit
    if (images.length + event.target.files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }
    
    setError(null);
    
    // Process each file
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      
      // Validate image
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file');
        continue;
      }
      
      // Upload image
      try {
        await uploadImage(file);
      } catch (err) {
        // Error handling is done in onUploadError callback
      }
    }
    
    // Reset the input
    event.target.value = '';
  }, [images, maxImages, uploadImage, validateImage]);

  const handleRemoveImage = useCallback((index: number) => {
    const newImages = [...images];
    
    // If the image has a URL, revoke it to prevent memory leaks
    if (newImages[index]?.url) {
      revokeImageUrl(newImages[index].url);
    }
    
    newImages.splice(index, 1);
    onImagesChange(newImages);
  }, [images, onImagesChange, revokeImageUrl]);

  // Animation variants for grid items
  const gridItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };
  
  // Get accessible variants based on reduced motion preference
  const accessibleVariants = getAccessibleVariants(gridItemVariants, prefersReducedMotion);

  return (
    <div className={cn("w-full", className)}>
      {/* Upload button and status */}
      <div className="mb-4">
        <Button
          as="label"
          htmlFor="image-upload"
          variant="outline"
          className="w-full touch-target h-12"
          disabled={isUploading || images.length >= maxImages}
        >
          {isUploading ? 'Uploading...' : `Add Images (${images.length}/${maxImages})`}
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileSelect}
            disabled={isUploading || images.length >= maxImages}
          />
        </Button>
        
        {isUploading && (
          <Progress 
            value={Object.values(uploadProgress)[0] || 0} 
            className="mt-2" 
          />
        )}
        
        {error && (
          <p className="text-red-500 text-sm mt-2" role="alert">{error}</p>
        )}
      </div>
      
      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.tempId}
            className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
            variants={accessibleVariants}
            initial="hidden"
            animate="visible"
            transition={stiffSpring}
          >
            <img 
              src={image.url} 
              alt={`Uploaded image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 w-8 h-8 rounded-full opacity-80 hover:opacity-100"
              onClick={() => handleRemoveImage(index)}
              aria-label={`Remove image ${index + 1}`}
            >
              <span aria-hidden="true">×</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadGrid;
