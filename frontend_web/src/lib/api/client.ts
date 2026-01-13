/**
 * Axios Instance with Auto Token Refresh
 * =======================================
 * Tự động thêm access token vào mọi request
 * Tự động refresh token khi hết hạn (401)
 */

import axios, { type AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Thêm access token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // No refresh token, logout
            handleLogout();
            return Promise.reject(error);
          }

          // TODO: Implement refresh token API
          // const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          //   refreshToken,
          // });
          
          // localStorage.setItem('accessToken', data.data.accessToken);
          // originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          
          // return apiClient(originalRequest);

          // Tạm thời logout nếu 401
          handleLogout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper: Logout
function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }
}

export default apiClient;
