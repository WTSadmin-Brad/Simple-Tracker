/**
 * Image Upload Field Component
 * 
 * A specialized field for uploading images with preview and validation.
 * Enhanced with centralized image service for better reliability.
 * 
 * @source directory-structure.md - "Form Components" section
 * @source Employee_Flows.md - "Image Upload Step" section
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label.client';
import { Button } from '@/components/ui/button.client';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ImageIcon, X, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  MAX_IMAGE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  formatFileSize
} from '@/lib/helpers/imageHelpers';
import useImageUpload from '@/hooks/useImageUpload';

// Animation constants
const ANIMATION_CONFIG = {
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  },
  duration: 0.3
};

interface ImageUploadFieldProps {
  label: string;
  onChange: (file: File | null) => void;
  onUpload?: (file: File) => Promise<void>;
  value?: File | null;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  preview?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}

export function ImageUploadField({
  label,
  onChange,
  onUpload,
  value,
  error,
  hint,
  disabled = false,
  className,
  id,
  preview = true,
  maxSize = MAX_IMAGE_SIZE,
  allowedTypes = ALLOWED_IMAGE_TYPES,
}: ImageUploadFieldProps) {
  // Generate a unique ID if none is provided
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  
  // Ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Use our image upload hook
  const {
    uploadImage,
    isUploading,
    uploadProgress,
    uploadErrors,
    validateImage,
    generatePreview,
    revokeImageUrl
  } = useImageUpload({
    onUploadComplete: (imageData) => {
      setPreviewUrl(imageData.url);
      setUploadedFile(imageData.file);
      
      // Call the parent component's onChange handler
      onChange(imageData.file);
      
      // Call onUpload if provided (for backward compatibility)
      if (onUpload) {
        onUpload(imageData.file).catch(error => {
          console.error('Error in onUpload handler:', error);
        });
      }
    }
  });
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // Initialize from value prop if provided
  useEffect(() => {
    const initializeFromValue = async () => {
      if (value && !previewUrl) {
        try {
          const preview = await generatePreview(value);
          setPreviewUrl(preview);
          setUploadedFile(value);
        } catch (err) {
          console.error('Error generating preview:', err);
        }
      }
    };
    
    initializeFromValue();
  }, [value, previewUrl, generatePreview]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any object URLs to prevent memory leaks
      if (previewUrl) {
        revokeImageUrl(previewUrl);
      }
    };
  }, [previewUrl, revokeImageUrl]);
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      try {
        // Validate the file
        const validation = validateImage(file);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid file');
        }
        
        // Clean up previous preview if it exists
        if (previewUrl) {
          revokeImageUrl(previewUrl);
        }
        
        // Upload using our service
        await uploadImage(file);
      } catch (err) {
        console.error('Upload error:', err);
      }
    } else {
      // Clear preview and value if no file is selected
      clearImage();
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Clear the selected image
  const clearImage = () => {
    if (previewUrl) {
      revokeImageUrl(previewUrl);
      setPreviewUrl(null);
    }
    setUploadedFile(null);
    onChange(null);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Get the most relevant error message
  const errorMessage = error || Object.values(uploadErrors)[0] || null;
  
  // Get progress percentage for the current upload
  const progressValue = Object.values(uploadProgress)[0] || 0;
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Field label */}
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            errorMessage ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </Label>
      </div>
      
      <div className="flex flex-col items-center">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id={fieldId}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
          aria-invalid={!!errorMessage}
          aria-describedby={
            errorMessage ? errorId : hint ? hintId : undefined
          }
        />
        
        {/* Upload area */}
        <AnimatePresence mode="wait">
          {!previewUrl ? (
            /* Upload button when no image is selected */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : ANIMATION_CONFIG.spring}
              className="w-full"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={triggerFileInput}
                disabled={disabled || isUploading}
                className={cn(
                  "w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed",
                  errorMessage ? "border-destructive" : "border-muted-foreground/25",
                  "hover:border-muted-foreground/50 transition-colors"
                )}
              >
                {isUploading ? (
                  /* Show progress during upload */
                  <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    <Upload className="h-6 w-6 text-muted-foreground animate-pulse" />
                    <Progress value={progressValue} className="w-full h-2" />
                    <span className="text-xs text-muted-foreground">
                      Uploading... {progressValue.toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  /* Default upload state */
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium">Click to upload</span>
                      <span className="text-xs text-muted-foreground">
                        {allowedTypes.map(type => type.replace('image/', '.')).join(', ')} up to {formatFileSize(maxSize)}
                      </span>
                    </div>
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            /* Preview when image is selected */
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={prefersReducedMotion ? { duration: 0.1 } : ANIMATION_CONFIG.spring}
              className="relative w-full"
            >
              {preview && (
                <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-md border border-border">
                  {/* Image preview */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  
                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearImage}
                    disabled={disabled}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* File info */}
              <div className="mt-2 text-center">
                <p className="text-sm font-medium truncate">
                  {uploadedFile?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFile && formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <p id={errorId}>{errorMessage}</p>
        </div>
      )}
      
      {/* Hint text */}
      {hint && !errorMessage && (
        <p 
          id={hintId}
          className="text-sm text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
