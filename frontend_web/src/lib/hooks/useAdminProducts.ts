import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';
import type {
  Product,
  ProductInput,
  VariantInput,
  ProductVariant,
  Category,
  ApiResponse,
  PaginatedResponse,
} from '@/types/admin';

// ========== PRODUCTS ==========

export function useProducts(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin-products', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ products: Product[]; pagination: any }>>(
        'admin/product',
        { params: { page, limit } }
      );
      return response.data.data || { products: [], pagination: null };
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Product>>(`admin/product/${id}`);
      return response.data.data || null;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductInput) => {
      const response = await apiClient.post<ApiResponse<Product>>('admin/product', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Tạo sản phẩm thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo sản phẩm thất bại');
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProductInput>) => {
      const response = await apiClient.patch<ApiResponse<Product>>(`admin/product/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      toast.success('Cập nhật sản phẩm thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật sản phẩm thất bại');
    },
  });
}

// NEW: Unified upsert function
export function useUpsertProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<Product>>('admin/product/upsert', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['admin-product', variables.id] });
      }
      // Toast được handle từ endpoint
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Lưu sản phẩm thất bại');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`admin/product/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Xóa sản phẩm thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa sản phẩm thất bại');
    },
  });
}

// ========== VARIANTS ==========

export function useAddVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VariantInput) => {
      const response = await apiClient.post<ApiResponse<ProductVariant>>(
        `admin/product/${productId}/variant`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      toast.success('Thêm biến thể thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Thêm biến thể thất bại');
    },
  });
}

// ========== CATEGORIES ==========

export function useCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ categories: Category[] }>>(
        'admin/category'
      );
      return response.data.data?.categories || [];
    },
  });
}

// ========== UPLOAD ==========

export async function uploadImage(base64Image: string, folder: string = 'hoashop/products') {
  try {
    const response = await apiClient.post<ApiResponse<{ url: string }>>('upload', {
      image: base64Image,
      folder,
    });
    return response.data.data.url;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Upload ảnh thất bại');
    throw error;
  }
}

export async function uploadMultipleImages(
  base64Images: string[],
  folder: string = 'hoashop/products'
) {
  try {
    const uploadPromises = base64Images.map((image) => uploadImage(image, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw error;
  }
}
