/**
 * ImageUploadStep.client.tsx
 * Client component for the third step of the ticket submission wizard
 * Handles image upload (up to 10 images) with preview and deletion functionality
 */
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/button';
import { 
  ImageIcon, 
  X, 
  Upload, 
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  validateImage, 
  MAX_IMAGE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGES,
  formatFileSize
} from '@/lib/helpers/imageHelpers';
import { cn } from '@/lib/utils';
import { fadeVariants, slideUpVariants } from '@/lib/animations/variants';

const ImageUploadStep = () => {
  // Get reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Access wizard store
  const { 
    imageUpload, 
    addImage, 
    removeImage 
  } = useWizardStore();
  
  // Local state
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current images from store
  const images = imageUpload?.images || [];
  
  // Check if max images reached
  const isMaxImagesReached = images.length >= MAX_IMAGES;
  
  // Handle file selection
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Clear previous errors
    setError(null);
    
    // Check if adding more files would exceed the limit
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images. Please remove some images first.`);
      return;
    }
    
    // Process each file
    setIsUploading(true);
    
    try {
      // Convert FileList to array for easier processing
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        // Validate the file
        const validation = validateImage(file);
        
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          continue;
        }
        
        // Create object URL for preview
        const url = URL.createObjectURL(file);
        
        // Add image to store
        addImage({
          url,
          file,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setError('An error occurred while processing the files.');
    } finally {
      setIsUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFileSelect(e.dataTransfer.files);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (id: string) => {
    removeImage(id);
    setError(null);
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-2">Upload Images</h2>
      <p className="text-muted-foreground mb-6">
        Add up to {MAX_IMAGES} images to document your work
      </p>
      
      {/* Image upload area */}
      <div 
        className={cn(
          "w-full p-4 border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          isMaxImagesReached ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary"
        )}
        onClick={isMaxImagesReached ? undefined : triggerFileInput}
        onDragEnter={isMaxImagesReached ? undefined : handleDrag}
        onDragOver={isMaxImagesReached ? undefined : handleDrag}
        onDragLeave={isMaxImagesReached ? undefined : handleDrag}
        onDrop={isMaxImagesReached ? undefined : handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          
          {isMaxImagesReached ? (
            <p className="text-center text-muted-foreground">
              Maximum of {MAX_IMAGES} images reached. Remove some images to add more.
            </p>
          ) : (
            <>
              <p className="text-center font-medium">
                Drag and drop images here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Max {MAX_IMAGES} images, {formatFileSize(MAX_IMAGE_SIZE)} each
              </p>
            </>
          )}
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileInputChange}
            disabled={isMaxImagesReached || isUploading}
            className="hidden"
            multiple
          />
        </div>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="flex items-center mt-4 p-3 rounded-md bg-destructive/10 text-destructive"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image count indicator */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <h3 className="text-sm font-medium">
          Images ({images.length}/{MAX_IMAGES})
        </h3>
        
        {images.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerFileInput}
            disabled={isMaxImagesReached || isUploading}
          >
            <Upload className="h-4 w-4 mr-1" />
            Add More
          </Button>
        )}
      </div>
      
      {/* Image preview grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 pb-4 overflow-y-auto">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={slideUpVariants}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                layout
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full self-end"
                    onClick={() => handleRemoveImage(image.id)}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-white text-xs truncate bg-black/60 p-1 rounded">
                    {image.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <Info className="h-10 w-10 mb-2" />
          <p>No images uploaded yet</p>
          <p className="text-sm mt-1">Images will appear here after upload</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {isUploading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center p-6 rounded-lg bg-card shadow-lg">
            <svg 
              className="animate-spin h-10 w-10 text-primary mb-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="font-medium">Uploading images...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadStep;
