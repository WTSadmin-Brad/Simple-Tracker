/**
 * Image processing helpers
 * 
 * @source directory-structure.md - "Shared Utilities" section
 * @source Employee_Flows.md - "Image Upload Step" section
 */

/**
 * Maximum image size in bytes (10MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum number of images per ticket
 */
export const MAX_IMAGES = 10;

/**
 * Allowed image types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
];

/**
 * Validate image file
 * 
 * @param file - File to validate
 * @returns Validation result with success flag and error message if applicable
 */
export function validateImage(file: File): { 
  valid: boolean; 
  error?: string;
} {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.'
    };
  }
  
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Image size exceeds the maximum allowed size (10MB).'
    };
  }
  
  return { valid: true };
}

/**
 * Generate a thumbnail from an image file
 * 
 * @param file - Image file
 * @param maxWidth - Maximum thumbnail width (default: 200)
 * @param maxHeight - Maximum thumbnail height (default: 200)
 * @returns Promise with thumbnail data URL
 */
export async function generateThumbnail(
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate thumbnail dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        // Create canvas and draw thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get thumbnail data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnailDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Extract filename from a URL or path
 * 
 * @param url - URL or path
 * @returns Filename
 */
export function getFilenameFromUrl(url: string): string {
  return url.split('/').pop() || url;
}

/**
 * Convert a base64 string to a File object
 * 
 * @param base64 - Base64 string
 * @param filename - Filename
 * @param mimeType - MIME type (default: 'image/jpeg')
 * @returns File object
 */
export function base64ToFile(
  base64: string,
  filename: string,
  mimeType = 'image/jpeg'
): File {
  // Remove data URL prefix if present
  const base64Data = base64.includes('base64,')
    ? base64.split('base64,')[1]
    : base64;
  
  // Convert base64 to binary
  const byteString = atob(base64Data);
  
  // Create array buffer
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  // Create Blob and File
  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}
