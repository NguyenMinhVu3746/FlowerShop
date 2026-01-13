// Admin Types & Interfaces

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  images: string[];
  categoryId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  variants?: ProductVariant[];
  _count?: {
    variants: number;
    reviews: number;
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: 'S' | 'M' | 'L';
  price: number;
  description: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Form Input Types
export interface ProductInput {
  title: string;
  description?: string;
  images: string[];
  categoryId: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive: boolean;
}

export interface VariantInput {
  size: 'S' | 'M' | 'L';
  price: number;
  description?: string;
  stock: number;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
