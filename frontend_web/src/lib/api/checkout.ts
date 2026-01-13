/**
 * CHECKOUT API SERVICES
 * ======================
 * Handles: Checkout, Payment, AI Message Suggestion
 */

import apiClient from './client';
import type { ApiResponse, Order, CheckoutData } from '@/types';

export const checkoutApi = {
  // POST /api/checkout
  checkout: async (data: CheckoutData): Promise<ApiResponse<{ order: Order }>> => {
    const response = await apiClient.post('/checkout', data);
    return response.data;
  },

  // POST /api/checkout/ai-suggest-message
  aiSuggestMessage: async (params: {
    occasion: string;
    recipient: string;
    relationship: string;
    tone?: 'formal' | 'casual' | 'romantic';
  }): Promise<ApiResponse<{ messages: string[] }>> => {
    const response = await apiClient.post('/checkout/ai-suggest-message', params);
    return response.data;
  },
};
