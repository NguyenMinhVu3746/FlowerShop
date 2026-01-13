/**
 * PRODUCT API SERVICES
 * =====================
 * Handles: Products, Categories, Search, Reviews
 */

import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  Category,
  Review,
  ReviewStats,
  Banner,
  Voucher,
} from '@/types';

export const productApi = {
  // GET /api/home/banner
  getBanners: async (): Promise<ApiResponse<{ banners: Banner[] }>> => {
    const response = await apiClient.get('/home/banner');
    return response.data;
  },

  // GET /api/home/categories
  getCategories: async (): Promise<ApiResponse<{ categories: Category[] }>> => {
    const response = await apiClient.get('/home/categories');
    return response.data;
  },

  // GET /api/home/products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating';
    minPrice?: number;
    maxPrice?: number;
  }): Promise<
    ApiResponse<{
      products: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  > => {
    const response = await apiClient.get('/home/products', { params });
    return response.data;
  },

  // GET /api/search
  searchProducts: async (query: string): Promise<
    ApiResponse<{ products: Product[]; total: number }>
  > => {
    const response = await apiClient.get('/search', {
      params: { q: query },
    });
    return response.data;
  },

  // GET /api/product/[slug]
  getProductBySlug: async (slug: string): Promise<
    ApiResponse<{
      product: Product;
      relatedProducts: Product[];
    }>
  > => {
    const response = await apiClient.get(`/product/${slug}`);
    return response.data;
  },

  // GET /api/product/[id]/reviews
  getProductReviews: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ): Promise<
    ApiResponse<{
      reviews: Review[];
      stats: ReviewStats;
      total: number;
      page: number;
      limit: number;
    }>
  > => {
    const response = await apiClient.get(`/product/${productId}/reviews`, {
      params,
    });
    return response.data;
  },

  // POST /api/product/[id]/review
  createReview: async (
    productId: string,
    data: {
      rating: number;
      comment: string;
      images?: string[];
    }
  ): Promise<ApiResponse<{ review: Review }>> => {
    const response = await apiClient.post(`/product/${productId}/review`, data);
    return response.data;
  },

  // GET /api/voucher/validate
  validateVoucher: async (
    code: string,
    totalPrice: number
  ): Promise<
    ApiResponse<{
      voucher: Voucher;
      discount: number;
      valid: boolean;
    }>
  > => {
    const response = await apiClient.get('/voucher/validate', {
      params: { code, totalPrice },
    });
    return response.data;
  },
};
