/**
 * AI API SERVICES
 * ===============
 * Handles: AI Chat (Multi-modal), Image Search
 */

import apiClient from './client';
import type {
  ApiResponse,
  AIChatMessage,
  AIChatResponse,
  AIImageSearchResponse,
} from '@/types';

export const aiApi = {
  // POST /api/ai/chat - Multi-modal (Text + Image)
  chat: async (params: {
    message?: string;
    image?: string; // base64
    conversationHistory?: AIChatMessage[];
  }): Promise<ApiResponse<AIChatResponse>> => {
    const response = await apiClient.post('/ai/chat', params);
    return response.data;
  },

  // POST /api/ai/image-search - DEPRECATED (Use chat instead)
  imageSearch: async (image: string): Promise<ApiResponse<AIImageSearchResponse>> => {
    const response = await apiClient.post('/ai/image-search', { image });
    return response.data;
  },

  // POST /predict - YOLO Flower Detection (Direct to AI Server)
  scanFlower: async (imageFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    // Call YOLO AI Server directly (adjust URL based on environment)
    const AI_SERVER_URL = process.env.NEXT_PUBLIC_AI_SERVER_URL || 'http://localhost:8000';
    const response = await fetch(`${AI_SERVER_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AI Server error: ${response.status}`);
    }

    return response.json();
  },
};
