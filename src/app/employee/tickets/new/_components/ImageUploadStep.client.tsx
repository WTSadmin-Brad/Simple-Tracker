'use client';

/**
 * Image Upload Step Component (Client Component)
 * Third step of the wizard for uploading images
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/button';
import { ImageData } from '@/lib/validation/wizardSchemas';
import { Upload, X, Camera, ImageIcon } from 'lucide-react';

export function ImageUploadStep() {
  const { imageUpload, addImage, removeImage, setImageUpload } = useWizardStore();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Maximum number of images allowed
  const MAX_IMAGES = 10;
  
  // Initialize image upload state if necessary
  if (!imageUpload) {
    setImageUpload({ images: [] });
  }
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  // Handle file processing
  const handleFiles = (files: File[]) => {
    // Filter for image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Check if adding these images would exceed the limit
    if (imageUpload && imageUpload.images.length + imageFiles.length > MAX_IMAGES) {
      alert(`You can only upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    
    // Process each image file
    imageFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          // Create a new image object
          const newImage: Omit<ImageData, 'id' | 'uploadedAt'> = {
            url: e.target.result.toString(),
            name: file.name,
            size: file.size,
            type: file.type,
          };
          
          // Add to store
          addImage(newImage);
        }
      };
      
      reader.readAsDataURL(file);
    });
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    removeImage(id);
  };
  
  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Check if we can add more images
  const canAddMoreImages = !imageUpload || imageUpload.images.length < MAX_IMAGES;
  
  if (!imageUpload) {
    return <div className="flex justify-center items-center h-64">Loading image uploader...</div>;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Image Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload up to {MAX_IMAGES} images related to your ticket. Drag and drop files or click to select.
        </p>
      </div>
      
      {/* Drag and drop area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 mb-6 text-center
          transition-colors duration-200 ease-in-out
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${canAddMoreImages ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
        `}
        onClick={canAddMoreImages ? openFileDialog : undefined}
        onDragEnter={canAddMoreImages ? handleDrag : undefined}
        onDragLeave={canAddMoreImages ? handleDrag : undefined}
        onDragOver={canAddMoreImages ? handleDrag : undefined}
        onDrop={canAddMoreImages ? handleDrop : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={!canAddMoreImages}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {dragActive ? 'Drop images here' : 'Drag images here or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {imageUpload.images.length} of {MAX_IMAGES} images uploaded
            </p>
          </div>
          
          {canAddMoreImages && (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          )}
        </div>
      </div>
      
      {/* Image preview grid */}
      {imageUpload.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <AnimatePresence>
            {imageUpload.images.map((image) => (
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
                  alt={image.name}
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
                    className="h-9 w-9 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Empty state */}
      {imageUpload.images.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
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
