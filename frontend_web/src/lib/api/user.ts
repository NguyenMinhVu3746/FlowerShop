/**
 * USER API SERVICES
 * =================
 * Handles: Profile, Address, Orders, Wishlist
 */

import apiClient from './client';
import type { ApiResponse, User, Address, Order, Product } from '@/types';

export interface UpdateProfileData {
  fullname?: string;
  phone?: string;
  birthday?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatar?: string;
}

export interface AddressData {
  title: string;
  fullAddress: string;
  ward: string;
  district: string;
  province: string;
  phoneReceiver: string;
  nameReceiver: string;
  isDefault?: boolean;
}

export const userApi = {
  // GET /api/user/profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // PATCH /api/user/profile
  updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch('/user/profile', data);
    return response.data;
  },

  // GET /api/user/address
  getAddresses: async (): Promise<ApiResponse<{ addresses: Address[] }>> => {
    const response = await apiClient.get('/user/address');
    return response.data;
  },

  // POST /api/user/address
  addAddress: async (data: AddressData): Promise<ApiResponse<{ address: Address }>> => {
    const response = await apiClient.post('/user/address', data);
    return response.data;
  },

  // PATCH /api/user/address/[id]
  updateAddress: async (id: string, data: AddressData): Promise<ApiResponse<{ address: Address }>> => {
    const response = await apiClient.patch(`/user/address/${id}`, data);
    return response.data;
  },

  // DELETE /api/user/address/[id]
  deleteAddress: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/user/address/${id}`);
    return response.data;
  },

  // GET /api/user/orders
  getOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ orders: Order[]; total: number }>> => {
    const response = await apiClient.get('/user/orders', { params });
    return response.data;
  },

  // GET /api/user/wishlist
  getWishlist: async (): Promise<ApiResponse<{ products: Product[] }>> => {
    const response = await apiClient.get('/user/wishlist');
    return response.data;
  },

  // POST /api/user/wishlist/toggle
  toggleWishlist: async (productId: string): Promise<ApiResponse<{ isWishlisted: boolean }>> => {
    const response = await apiClient.post('/user/wishlist/toggle', { productId });
    return response.data;
  },
};
