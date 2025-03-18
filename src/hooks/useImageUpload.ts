/**
 * useImageUpload Hook
 * 
 * Provides a React hook interface for using the imageService
 * Makes it easy to manage image uploads with React state
 */

import { useState, useEffect, useCallback } from 'react';
import imageService, { ImageData, ValidationResult } from '@/lib/services/image-service';

interface UseImageUploadOptions {
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (id: string, progress: number) => void;
  onUploadComplete?: (imageData: ImageData) => void;
  onUploadError?: (error: Error, file: File) => void;
  validateOnSelect?: boolean;
}

interface UseImageUploadReturn {
  // Upload methods
  uploadImage: (file: File) => Promise<ImageData>;
  uploadMultipleImages: (files: File[]) => Promise<ImageData[]>;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string, file: File) => Promise<ImageData>;
  
  // Validation and utility methods
  validateImage: (file: File) => ValidationResult;
  generatePreview: (file: File) => Promise<string>;
  revokeImageUrl: (url: string) => void;
  
  // State
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  uploadErrors: Record<string, string>;
  
  // Reset state
  resetState: () => void;
}

/**
 * Hook for managing image uploads
 * Provides methods and state for image upload operations
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

  // Reset all state
  const resetState = useCallback(() => {
    setIsUploading(false);
    setActiveUploads(new Set());
    setUploadProgress({});
    setUploadErrors({});
  }, []);

  // Upload a single image
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

  // Upload multiple images
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

  // Cancel an upload
  const cancelUpload = useCallback((id: string) => {
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

  // Retry a failed upload
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
