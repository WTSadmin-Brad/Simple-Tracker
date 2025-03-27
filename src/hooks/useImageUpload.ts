/**
 * useImageUpload Hook
 * 
 * Provides a React hook interface for using the imageService
 * Makes it easy to manage image uploads with React state
 * with proper error handling, progress tracking, and validation.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Ticket_Submission.md - "Image Upload Flow" section
 */

import { useState, useEffect, useCallback } from 'react';
import imageService, { ImageData, ValidationResult } from '@/lib/services/image-service';

/**
 * Options for configuring the useImageUpload hook
 */
interface UseImageUploadOptions {
  /** Called when an upload starts */
  onUploadStart?: (file: File) => void;
  /** Called when upload progress updates */
  onUploadProgress?: (id: string, progress: number) => void;
  /** Called when an upload completes successfully */
  onUploadComplete?: (imageData: ImageData) => void;
  /** Called when an upload encounters an error */
  onUploadError?: (error: Error, file: File) => void;
  /** Whether to validate images immediately when selected */
  validateOnSelect?: boolean;
}

/**
 * Return type for useImageUpload hook
 */
interface UseImageUploadReturn {
  /** Upload a single image file */
  uploadImage: (file: File) => Promise<ImageData>;
  /** Upload multiple image files sequentially */
  uploadMultipleImages: (files: File[]) => Promise<ImageData[]>;
  /** Cancel an in-progress upload */
  cancelUpload: (id: string) => void;
  /** Retry a failed upload */
  retryUpload: (id: string, file: File) => Promise<ImageData>;
  
  /** Validate an image file */
  validateImage: (file: File) => ValidationResult;
  /** Generate a preview URL for an image file */
  generatePreview: (file: File) => Promise<string>;
  /** Revoke a previously generated image URL to prevent memory leaks */
  revokeImageUrl: (url: string) => void;
  
  /** Whether any uploads are currently in progress */
  isUploading: boolean;
  /** Progress percentage (0-100) for each upload by ID */
  uploadProgress: Record<string, number>;
  /** Error messages for failed uploads by ID */
  uploadErrors: Record<string, string>;
  
  /** Reset all state (progress, errors, etc.) */
  resetState: () => void;
}

/**
 * Hook for managing image uploads
 * Provides methods and state for image upload operations
 * 
 * @param options Configuration options for the hook
 * @returns Object containing upload methods and state
 */
export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  // Destructure options with defaults
  const {
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    validateOnSelect = true,
  } = options;

  // Track uploads in progress
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  /**
   * Reset all state to initial values
   */
  const resetState = useCallback(() => {
    setIsUploading(false);
    setActiveUploads(new Set());
    setUploadProgress({});
    setUploadErrors({});
  }, []);

  /**
   * Upload a single image file
   * 
   * @param file The image file to upload
   * @returns Promise resolving to the uploaded image data
   * @throws Error if validation or upload fails
   */
  const uploadImage = useCallback(async (file: File): Promise<ImageData> => {
    // Validate first if requested
    if (validateOnSelect) {
      const validation = imageService.validateImage(file);
      if (!validation.valid) {
        const error = new Error(validation.error || 'Invalid image');
        if (onUploadError) {
          onUploadError(error, file);
        }
        throw error;
      }
    }

    try {
      // Notify start
      if (onUploadStart) {
        onUploadStart(file);
      }

      setIsUploading(true);
      const imageData = await imageService.uploadImage(file);
      
      // Track progress with interval
      const id = imageData.id;
      const uploadTracker = setInterval(() => {
        const progress = imageService.getUploadProgress(id);
        if (progress) {
          // Update progress state
          setUploadProgress(prev => ({
            ...prev,
            [id]: progress.progress
          }));

          // Call progress callback
          if (onUploadProgress) {
            onUploadProgress(id, progress.progress);
          }

          // Handle completion
          if (progress.status === 'complete') {
            clearInterval(uploadTracker);
            setActiveUploads(prev => {
              const updated = new Set(prev);
              updated.delete(id);
              if (updated.size === 0) {
                setIsUploading(false);
              }
              return updated;
            });

            // Call complete callback
            if (onUploadComplete) {
              onUploadComplete(imageData);
            }
          }

          // Handle error
          if (progress.status === 'error') {
            clearInterval(uploadTracker);
            setUploadErrors(prev => ({
              ...prev,
              [id]: progress.error || 'Unknown error'
            }));
            setActiveUploads(prev => {
              const updated = new Set(prev);
              updated.delete(id);
              if (updated.size === 0) {
                setIsUploading(false);
              }
              return updated;
            });
          }
        }
      }, 200);

      // Track this upload
      setActiveUploads(prev => {
        const updated = new Set(prev);
        updated.add(id);
        return updated;
      });

      return imageData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload image');
      
      // Call error callback
      if (onUploadError) {
        onUploadError(error, file);
      }
      
      // Set error state
      setUploadErrors(prev => ({
        ...prev,
        [file.name]: error.message
      }));
      
      throw error;
    }
  }, [validateOnSelect, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]);

  /**
   * Upload multiple image files sequentially
   * 
   * @param files Array of image files to upload
   * @returns Promise resolving to array of uploaded image data
   */
  const uploadMultipleImages = useCallback(async (files: File[]): Promise<ImageData[]> => {
    const results: ImageData[] = [];
    
    // Process files sequentially to avoid overloading
    for (const file of files) {
      try {
        const result = await uploadImage(file);
        results.push(result);
      } catch (error) {
        // Continue with other files even if one fails
        console.error('Error uploading file:', file.name, error);
      }
    }
    
    return results;
  }, [uploadImage]);

  /**
   * Cancel an in-progress upload
   * 
   * @param id ID of the upload to cancel
   */
  const cancelUpload = useCallback((id: string): void => {
    imageService.cancelUpload(id);
    
    setActiveUploads(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      if (updated.size === 0) {
        setIsUploading(false);
      }
      return updated;
    });
  }, []);

  /**
   * Retry a failed upload
   * 
   * @param id ID of the failed upload
   * @param file The image file to retry
   * @returns Promise resolving to the uploaded image data
   * @throws Error if retry fails
   */
  const retryUpload = useCallback(async (id: string, file: File): Promise<ImageData> => {
    // Clear previous error
    setUploadErrors(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    
    try {
      return await imageService.retryUpload(id, file);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to retry upload');
      
      // Set error state
      setUploadErrors(prev => ({
        ...prev,
        [id]: error.message
      }));
      
      throw error;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No need to call cleanup here since objectURLs should be managed
      // at the component level with revokeImageUrl
    };
  }, []);

  return {
    // Upload methods
    uploadImage,
    uploadMultipleImages,
    cancelUpload,
    retryUpload,
    
    // Validation and utility methods
    validateImage: imageService.validateImage.bind(imageService),
    generatePreview: imageService.generatePreview.bind(imageService),
    revokeImageUrl: imageService.revokeImageUrl.bind(imageService),
    
    // State
    isUploading,
    uploadProgress,
    uploadErrors,
    
    // Reset state
    resetState,
  };
};

export default useImageUpload;
