/**
 * Image Upload Step Validators
 * Validates image uploads (up to 10 images)
 */
import { z } from 'zod';
import { imageUploadSchema, ImageUploadData, ImageData } from '@/lib/validation/wizardSchemas';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, MAX_IMAGES } from '@/lib/helpers/imageHelpers';

// Validator function
export async function validateImageUpload(data: unknown): Promise<ImageUploadData> {
  const validatedData = await imageUploadSchema.parseAsync(data);
  
  // Validate maximum number of images
  if (validatedData.images.length > MAX_IMAGES) {
    throw new Error(`Too many images. Maximum allowed is ${MAX_IMAGES}.`);
  }
  
  return validatedData;
}

// Helper to check image file types
export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType);
}

// Helper to check if image size is within limits
export function isValidImageSize(size: number): boolean {
  return size <= MAX_IMAGE_SIZE;
}

// Helper to validate a single image
export function validateSingleImage(image: File): { valid: boolean; error?: string } {
  // Check file type
  if (!isValidImageType(image.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }
  
  // Check file size
  if (!isValidImageSize(image.size)) {
    return {
      valid: false,
      error: `Image size exceeds the maximum allowed size (${MAX_IMAGE_SIZE / (1024 * 1024)}MB).`
    };
  }
  
  return { valid: true };
}
