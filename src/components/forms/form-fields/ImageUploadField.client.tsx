/**
 * Image Upload Field Component
 * 
 * A specialized field for uploading images with preview and validation.
 * 
 * @source directory-structure.md - "Form Components" section
 * @source Employee_Flows.md - "Image Upload Step" section
 */

'use client';

import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label.client';
import { Button } from '@/components/ui/button.client';
import { cn } from '@/lib/utils';
import { ImageIcon, X, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  validateImage, 
  MAX_IMAGE_SIZE, 
  ALLOWED_IMAGE_TYPES,
  formatFileSize
} from '@/lib/helpers/imageHelpers';

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
  
  // State for loading during upload
  const [isUploading, setIsUploading] = useState(false);
  
  // State for validation error
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    // Clear previous errors
    setValidationError(null);
    
    if (file) {
      // Validate the file
      const validation = validateImage(file);
      
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid file');
        return;
      }
      
      // Create preview URL
      if (preview) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      // Call onChange handler
      onChange(file);
      
      // Upload the file if onUpload is provided
      if (onUpload) {
        try {
          setIsUploading(true);
          await onUpload(file);
        } catch (err) {
          setValidationError('Failed to upload image');
          console.error('Upload error:', err);
        } finally {
          setIsUploading(false);
        }
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
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange(null);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            (error || validationError) ? "text-destructive" : "text-foreground"
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
          aria-invalid={!!(error || validationError)}
          aria-describedby={
            error || validationError ? errorId : hint ? hintId : undefined
          }
        />
        
        {/* Preview area */}
        {preview && (previewUrl || value) ? (
          <div className="relative w-full aspect-video mb-3 rounded-lg overflow-hidden border border-border">
            <img
              src={previewUrl || (value ? URL.createObjectURL(value) : '')}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={clearImage}
              disabled={disabled || isUploading}
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <motion.div
            className="w-full aspect-video mb-3 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={triggerFileInput}
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.01 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.99 }}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to select an image
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max size: {formatFileSize(maxSize)}
            </p>
          </motion.div>
        )}
        
        {/* Upload button */}
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          disabled={disabled || isUploading}
          className="w-full touch-target"
        >
          {isUploading ? (
            <span className="flex items-center">
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
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
              Uploading...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              {value || previewUrl ? 'Change Image' : 'Select Image'}
            </span>
          )}
        </Button>
      </div>
      
      <AnimatePresence>
        {(error || validationError) && (
          <motion.p 
            id={errorId}
            className="text-sm font-medium text-destructive flex items-start mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          >
            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{error || validationError}</span>
          </motion.p>
        )}
      </AnimatePresence>
      
      {hint && !error && !validationError && (
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
