/**
 * Image Upload Step Validators
 * Validates image uploads (up to 10 images)
 */
import { z } from 'zod';

// Image reference schema
const imageRefSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  filename: z.string(),
  size: z.number().int().positive(),
});

// Image upload validation schema
export const imageUploadSchema = z.object({
  images: z.array(imageRefSchema).max(10, 'Maximum 10 images allowed'),
});

// Type for validated data
export type ImageUploadData = z.infer<typeof imageUploadSchema>;

// Validator function
export async function validateImageUpload(data: unknown): Promise<ImageUploadData> {
  return imageUploadSchema.parseAsync(data);
}

// Helper to check image file types
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  return validTypes.includes(mimeType);
}

// TODO: Implement image size validation (max 10MB per image)
// TODO: Implement integration with Firebase Storage
