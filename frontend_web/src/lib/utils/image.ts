/**
 * IMAGE UTILITIES
 * ===============
 * Helper functions for handling image URLs
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Convert image path to full URL
 * Supports:
 * - Local paths: /uploads/... -> http://localhost:3000/uploads/...
 * - External URLs: http://..., https://... -> unchanged
 * - Base64: data:image/... -> unchanged
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/placeholder.jpg'; // fallback image
  
  // Already a full URL (external or base64)
  if (imagePath.startsWith('http://') || 
      imagePath.startsWith('https://') || 
      imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // Fix paths without leading slash (from old seed data)
  let normalizedPath = imagePath;
  if (imagePath.startsWith('uploads/')) {
    normalizedPath = '/' + imagePath;
  }
  
  // Local path - prepend API URL
  if (normalizedPath.startsWith('/')) {
    return `${API_URL}${normalizedPath}`;
  }
  
  // Relative path without leading slash
  return `${API_URL}/${normalizedPath}`;
}

/**
 * Convert array of image paths to URLs
 */
export function getImageUrls(imagePaths: (string | null | undefined)[]): string[] {
  return imagePaths
    .filter((path): path is string => !!path)
    .map(getImageUrl);
}
