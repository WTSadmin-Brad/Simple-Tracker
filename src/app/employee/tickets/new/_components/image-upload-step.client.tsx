'use client';

/**
 * Image Upload Step Component (Client Component)
 * Third step of the wizard for uploading images
 * 
 * Enhanced with the centralized image service for better
 * reliability and simpler state management
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Image from 'next/image';
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Camera, ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import useImageUpload from '@/hooks/useImageUpload';
import imageService from '@/lib/services/image-service';

export function ImageUploadStep() {
  const { imageUpload, setImageUpload } = useWizardStore();
  const [dragActive, setDragActive] = useState(false);
  const [images, setImages] = useState<Array<{
    id: string;
    url: string;
    previewUrl: string;
    name: string;
    uploadedAt: string;
  }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Use our new image upload hook
  const {
    uploadImage,
    uploadMultipleImages,
    uploadProgress,
    uploadErrors,
    isUploading,
    resetState
  } = useImageUpload({
    onUploadComplete: (imageData) => {
      setImages(prev => [...prev, {
        id: imageData.id,
        url: imageData.url,
        previewUrl: imageData.previewUrl,
        name: imageData.file.name,
        uploadedAt: imageData.uploadedAt,
      }]);
    }
  });
  
  // Maximum number of images allowed
  const MAX_IMAGES = 10;
  
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
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  // Handle file processing with our new service
  const handleFiles = async (files: File[]) => {
    // Filter for image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Check if adding these images would exceed the limit
    if (images.length + imageFiles.length > MAX_IMAGES) {
      alert(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    
    try {
      // Use our service to upload multiple images
      await uploadMultipleImages(imageFiles);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (id: string) => {
    // Find the image to remove
    const imageToRemove = images.find(img => img.id === id);
    
    // Revoke object URL to prevent memory leaks
    if (imageToRemove) {
      imageService.revokeImageUrl(imageToRemove.url);
      if (imageToRemove.previewUrl !== imageToRemove.url) {
        imageService.revokeImageUrl(imageToRemove.previewUrl);
      }
    }
    
    // Remove from state
    setImages(prev => prev.filter(img => img.id !== id));
  };
  
  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Check if we can add more images
  const canAddMoreImages = images.length < MAX_IMAGES;
  
  // Get any error message to display
  const errorMessages = Object.values(uploadErrors);
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Image Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload up to {MAX_IMAGES} images related to your ticket. Drag and drop files or click to select.
        </p>
      </div>
      
      {/* Error display */}
      {errorMessages.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {errorMessages[0]}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Drag and drop area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 mb-6 text-center
          transition-colors duration-200 ease-in-out
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${canAddMoreImages ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onClick={canAddMoreImages && !isUploading ? openFileDialog : undefined}
        onDragEnter={canAddMoreImages && !isUploading ? handleDrag : undefined}
        onDragLeave={canAddMoreImages && !isUploading ? handleDrag : undefined}
        onDragOver={canAddMoreImages && !isUploading ? handleDrag : undefined}
        onDrop={canAddMoreImages && !isUploading ? handleDrop : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={!canAddMoreImages || isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            {isUploading ? (
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div>
            {isUploading ? (
              <p className="font-medium">Uploading images...</p>
            ) : (
              <p className="font-medium">
                {dragActive ? 'Drop images here' : 'Drag images here or click to upload'}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {images.length} of {MAX_IMAGES} images uploaded
            </p>
          </div>
          
          {/* Upload progress */}
          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="w-full max-w-xs">
              <Progress value={Object.values(uploadProgress)[0] || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round(Object.values(uploadProgress)[0] || 0)}%
              </p>
            </div>
          )}
          
          {canAddMoreImages && !isUploading && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
              className="mt-2 touch-target"
            >
              <Camera className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          )}
        </div>
      </div>
      
      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                className="relative aspect-square rounded-md overflow-hidden border border-border group"
              >
                <Image
                  src={image.url}
                  alt={image.name || 'Image preview'}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                    className="h-10 w-10 rounded-full touch-target"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Empty state */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-8 border rounded-lg bg-muted">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-background rounded-full">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h4 className="text-sm font-medium mb-1">No images uploaded yet</h4>
          <p className="text-sm text-muted-foreground">
            Images are optional but help provide visual context.
          </p>
        </div>
      )}
    </div>
  );
}
