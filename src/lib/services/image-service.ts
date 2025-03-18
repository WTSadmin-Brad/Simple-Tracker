/**
 * Image Service
 * 
 * Centralized service for handling image uploads and management
 * Provides consistent interface for working with images across the application
 * Focuses on reliability and high-quality image handling for OCR processing
 */

import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, validateImage } from '../helpers/imageHelpers';

// Types
export interface ImageUploadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export interface ImageData {
  id: string;
  file: File;
  url: string;
  previewUrl: string;
  uploadedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// In-memory storage for tracking upload progress
const uploadProgress = new Map<string, ImageUploadProgress>();

// In-memory storage for object URLs that need cleanup
const objectUrls = new Set<string>();

/**
 * Image Service Class
 * Handles image uploads, preview generation, and state management
 */
class ImageService {
  /**
   * Validate an image file against size and type constraints
   * 
   * @param file - The file to validate
   * @returns Validation result with success flag and error message if applicable
   */
  validateImage(file: File): ValidationResult {
    return validateImage(file);
  }

  /**
   * Generate a preview URL for an image file
   * 
   * @param file - The image file
   * @returns Promise with the preview URL
   */
  async generatePreview(file: File): Promise<string> {
    // Create an object URL for the file
    const previewUrl = URL.createObjectURL(file);
    
    // Track the URL for later cleanup
    objectUrls.add(previewUrl);
    
    return previewUrl;
  }

  /**
   * Upload an image to the server
   * 
   * @param file - The image file to upload
   * @returns Promise with upload result
   */
  async uploadImage(file: File): Promise<ImageData> {
    // First validate the image
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file');
    }

    // Generate a unique ID for this upload
    const id = uuidv4();
    
    // Create a preview URL
    const previewUrl = await this.generatePreview(file);
    
    // Initialize progress tracking
    uploadProgress.set(id, {
      id,
      progress: 0,
      status: 'pending'
    });

    try {
      // Update progress to uploading
      uploadProgress.set(id, {
        id,
        progress: 10,
        status: 'uploading'
      });

      // Simulate upload process for now
      // In a real implementation, this would be an API call to upload the file
      // This would be replaced with actual upload logic
      await new Promise<void>((resolve) => {
        let progress = 10;
        const interval = setInterval(() => {
          progress += 10;
          
          // Update progress
          uploadProgress.set(id, {
            id,
            progress,
            status: 'uploading'
          });
          
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });

      // Create a permanent object URL for the uploaded file
      // In a real implementation, this would be the URL returned from the server
      const url = URL.createObjectURL(file);
      objectUrls.add(url);
      
      // Mark as complete
      uploadProgress.set(id, {
        id,
        progress: 100,
        status: 'complete'
      });

      // Return the image data
      const imageData: ImageData = {
        id,
        file,
        url,
        previewUrl,
        uploadedAt: new Date().toISOString()
      };

      return imageData;
    } catch (error) {
      // Handle errors
      uploadProgress.set(id, {
        id,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error during upload'
      });
      
      // Clean up the preview URL
      this.revokeImageUrl(previewUrl);
      
      throw error;
    }
  }

  /**
   * Get the current progress of an image upload
   * 
   * @param id - The upload ID
   * @returns The current upload progress
   */
  getUploadProgress(id: string): ImageUploadProgress | undefined {
    return uploadProgress.get(id);
  }

  /**
   * Cancel an ongoing upload
   * 
   * @param id - The upload ID
   */
  cancelUpload(id: string): void {
    const progress = uploadProgress.get(id);
    if (progress && (progress.status === 'pending' || progress.status === 'uploading')) {
      // In a real implementation, this would cancel the actual upload request
      
      // Update status
      uploadProgress.set(id, {
        ...progress,
        status: 'error',
        error: 'Upload cancelled'
      });
    }
  }

  /**
   * Retry a failed upload
   * 
   * @param id - The upload ID
   * @param file - The file to upload
   * @returns Promise with upload result
   */
  async retryUpload(id: string, file: File): Promise<ImageData> {
    const progress = uploadProgress.get(id);
    if (!progress || progress.status !== 'error') {
      throw new Error('Cannot retry: Upload not in error state');
    }

    // Reset progress
    uploadProgress.set(id, {
      id,
      progress: 0,
      status: 'pending'
    });

    // Re-attempt the upload
    return this.uploadImage(file);
  }

  /**
   * Revoke a single object URL to free up memory
   * 
   * @param url - The URL to revoke
   */
  revokeImageUrl(url: string): void {
    if (objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      objectUrls.delete(url);
    }
  }

  /**
   * Revoke multiple object URLs to free up memory
   * 
   * @param urls - The URLs to revoke
   */
  revokeImageUrls(urls: string[]): void {
    urls.forEach(url => this.revokeImageUrl(url));
  }

  /**
   * Clean up all tracked object URLs
   * Call this when components unmount to prevent memory leaks
   */
  cleanup(): void {
    objectUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    objectUrls.clear();
  }
}

// Create and export a singleton instance
export const imageService = new ImageService();

export default imageService;
