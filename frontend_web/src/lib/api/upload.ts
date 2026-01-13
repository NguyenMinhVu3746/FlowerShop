/**
 * UPLOAD API SERVICES
 * ===================
 * Handles: Image Upload to Cloudinary
 */

import apiClient from './client';
import type { ApiResponse } from '@/types';

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export const uploadApi = {
  // POST /api/upload - Single or Multiple
  upload: async (files: File[]): Promise<ApiResponse<{ images: UploadResponse[] }>> => {
    // Convert files to base64
    const convertToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    const base64Images = await Promise.all(files.map(convertToBase64));

    const response = await apiClient.post('/upload', {
      images: base64Images,
      folder: 'hoashop/users',
    });
    return response.data;
  },

  // DELETE /api/upload
  delete: async (publicId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete('/upload', {
      params: { publicId },
    });
    return response.data;
  },
};
