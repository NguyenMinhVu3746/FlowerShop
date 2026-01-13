/**
 * ADMIN API SERVICE
 * =================
 * All admin-only endpoints (34 APIs total)
 */

import client from './client';
import type {
  Category,
  Product,
  Order,
  Review,
  Voucher,
  Banner,
  ProductFormData,
  VoucherFormData,
  BannerFormData,
} from '@/types';

// ========================================
// DASHBOARD (3 APIs)
// ========================================

/**
 * GET /api/admin/dashboard/overview
 * Get dashboard overview stats
 */
export const getOverview = () =>
  client.get('/api/admin/dashboard/overview');

/**
 * GET /api/admin/dashboard/revenue-chart
 * Get revenue chart data (7 days)
 */
export const getRevenueChart = () =>
  client.get('/api/admin/dashboard/revenue-chart');

/**
 * GET /api/admin/dashboard/top-products
 * Get top 10 best-selling products
 */
export const getTopProducts = () =>
  client.get('/api/admin/dashboard/top-products');

// ========================================
// PRODUCTS (5 APIs)
// ========================================

/**
 * GET /api/admin/product
 * Get all products with pagination
 */
export const getProducts = (params?: {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
}) => client.get('/api/admin/product', { params });

/**
 * POST /api/admin/product
 * Create new product
 */
export const createProduct = (data: ProductFormData) =>
  client.post('/api/admin/product', data);

/**
 * PATCH /api/admin/product/[id]
 * Update product
 */
export const updateProduct = (id: number, data: Partial<ProductFormData>) =>
  client.patch(`/api/admin/product/${id}`, data);

/**
 * DELETE /api/admin/product/[id]
 * Delete product
 */
export const deleteProduct = (id: number) =>
  client.delete(`/api/admin/product/${id}`);

/**
 * PATCH /api/admin/product/[id]/variant
 * Update product variant (stock, price)
 */
export const updateProductVariant = (
  id: number,
  variantId: number,
  data: { stock?: number; price?: number }
) =>
  client.patch(`/api/admin/product/${id}/variant`, {
    variantId,
    ...data,
  });

// ========================================
// CATEGORIES (4 APIs)
// ========================================

/**
 * GET /api/admin/category
 * Get all categories
 */
export const getCategories = () =>
  client.get('/api/admin/category');

/**
 * POST /api/admin/category
 * Create new category
 */
export const createCategory = (data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
}) =>
  client.post('/api/admin/category', data);

/**
 * PATCH /api/admin/category/[id]
 * Update category
 */
export const updateCategory = (
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: number;
  }>
) =>
  client.patch(`/api/admin/category/${id}`, data);

/**
 * DELETE /api/admin/category/[id]
 * Delete category
 */
export const deleteCategory = (id: number) =>
  client.delete(`/api/admin/category/${id}`);

// ========================================
// ORDERS (3 APIs)
// ========================================

/**
 * GET /api/admin/orders
 * Get all orders with filters
 */
export const getOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => client.get('/api/admin/orders', { params });

/**
 * PATCH /api/admin/order/[id]/status
 * Update order status
 */
export const updateOrderStatus = (
  id: number,
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
) =>
  client.patch(`/api/admin/order/${id}/status`, { status });

/**
 * GET /api/admin/order/[id]/print
 * Get order print data (invoice/shipping label)
 */
export const getOrderPrint = (id: number) =>
  client.get(`/api/admin/order/${id}/print`);

// ========================================
// REVIEWS (3 APIs)
// ========================================

/**
 * GET /api/admin/reviews
 * Get all reviews with filters
 */
export const getReviews = (params?: {
  page?: number;
  limit?: number;
  productId?: number;
  rating?: number;
}) => client.get('/api/admin/reviews', { params });

/**
 * PATCH /api/admin/review/[id]/reply
 * Reply to review
 */
export const replyToReview = (id: number, reply: string) =>
  client.patch(`/api/admin/review/${id}/reply`, { reply });

/**
 * PATCH /api/admin/review/[id]/hide
 * Hide/unhide review
 */
export const toggleHideReview = (id: number, hidden: boolean) =>
  client.patch(`/api/admin/review/${id}/hide`, { hidden });

// ========================================
// VOUCHERS (4 APIs)
// ========================================

/**
 * GET /api/admin/voucher
 * Get all vouchers
 */
export const getVouchers = (params?: {
  page?: number;
  limit?: number;
}) => client.get('/api/admin/voucher', { params });

/**
 * POST /api/admin/voucher
 * Create new voucher
 */
export const createVoucher = (data: VoucherFormData) =>
  client.post('/api/admin/voucher', data);

/**
 * PATCH /api/admin/voucher/[id]
 * Update voucher
 */
export const updateVoucher = (id: number, data: Partial<VoucherFormData>) =>
  client.patch(`/api/admin/voucher/${id}`, data);

/**
 * DELETE /api/admin/voucher/[id]
 * Delete voucher
 */
export const deleteVoucher = (id: number) =>
  client.delete(`/api/admin/voucher/${id}`);

// ========================================
// BANNERS (4 APIs)
// ========================================

/**
 * GET /api/admin/banner
 * Get all banners
 */
export const getBanners = () =>
  client.get('/api/admin/banner');

/**
 * POST /api/admin/banner
 * Create new banner
 */
export const createBanner = (data: BannerFormData) =>
  client.post('/api/admin/banner', data);

/**
 * PATCH /api/admin/banner/[id]
 * Update banner
 */
export const updateBanner = (id: number, data: Partial<BannerFormData>) =>
  client.patch(`/api/admin/banner/${id}`, data);

/**
 * DELETE /api/admin/banner/[id]
 * Delete banner
 */
export const deleteBanner = (id: number) =>
  client.delete(`/api/admin/banner/${id}`);

// ========================================
// INVENTORY (2 APIs)
// ========================================

/**
 * GET /api/admin/inventory/stock
 * Get stock levels for all products
 */
export const getStock = () =>
  client.get('/api/admin/inventory/stock');

/**
 * GET /api/admin/inventory/logs
 * Get inventory change logs
 */
export const getInventoryLogs = (params?: {
  page?: number;
  limit?: number;
  productId?: number;
}) => client.get('/api/admin/inventory/logs', { params });
