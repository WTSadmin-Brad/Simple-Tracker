/**
 * Temporary Image Helpers
 * Utilities for managing temporary image uploads
 */

// Interface for temporary image metadata
export interface TempImageMetadata {
  id: string;
  userId: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  createdAt: string;
  expiresAt: string; // 24 hours from creation
}

// Generate a unique ID for a temporary image
export function generateTempImageId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Calculate expiration time (24 hours from now)
export function calculateExpirationTime(): string {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  return expirationDate.toISOString();
}

// Create metadata for a temporary image
export function createTempImageMetadata(
  userId: string,
  filename: string,
  size: number,
  url: string,
  thumbnailUrl?: string
): TempImageMetadata {
  return {
    id: generateTempImageId(),
    userId,
    url,
    thumbnailUrl,
    filename,
    size,
    createdAt: new Date().toISOString(),
    expiresAt: calculateExpirationTime(),
  };
}

// TODO: Implement cleanup for expired temporary images
// TODO: Add integration with Firebase Storage
// TODO: Implement thumbnail generation for previews (maintain original image quality for OCR processing)
