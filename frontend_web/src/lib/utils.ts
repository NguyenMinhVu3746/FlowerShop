import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image utilities
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Convert image path to full URL
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/placeholder.jpg';
  
  if (imagePath.startsWith('http://') || 
      imagePath.startsWith('https://') || 
      imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return `${API_URL}${imagePath}`;
  }
  
  return `${API_URL}/${imagePath}`;
}

/**
 * Format price with thousand separator (dots)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}
