/**
 * AUTH API SERVICES
 * =================
 * Handles: Register, Login, Forgot/Reset Password
 */

import apiClient from './client';
import type { ApiResponse, LoginResponse, User } from '@/types';

export interface RegisterData {
  email: string;
  password: string;
  fullname: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  // POST /api/auth/register
  register: async (data: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // POST /api/auth/login
  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // POST /api/auth/reset-password
  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
};
