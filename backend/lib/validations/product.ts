import { z } from 'zod';

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  description: z.string().optional(),
  image: z.string().min(1, 'Hình ảnh không được để trống').optional(),
  parentId: z.string().optional(),
});

// Flower Library schemas
export const flowerSchema = z.object({
  name: z.string().min(1, 'Tên hoa không được để trống'),
  description: z.string().optional(),
  image: z.string().min(1, 'Hình ảnh không được để trống').optional(),
  price: z.number().positive('Giá phải lớn hơn 0'),
  unit: z.string().min(1, 'Đơn vị không được để trống'),
});

// Product schemas
export const productSchema = z.object({
  title: z.string().min(1, 'Tiêu đề sản phẩm không được để trống'),
  description: z.string().optional(),
  images: z.array(z.string().min(1, 'URL hình ảnh không được để trống')),
  categoryId: z.string().min(1, 'Danh mục không được để trống'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Product Variant schemas
export const productVariantSchema = z.object({
  size: z.enum(['S', 'M', 'L']),
  price: z.number().positive('Giá phải lớn hơn 0'),
  description: z.string().optional(),
  stock: z.number().int().min(0, 'Tồn kho không được âm').optional(),
  isActive: z.boolean().optional(),
});

// Product Flower Map schemas
export const productFlowerMapSchema = z.object({
  flowerId: z.string().min(1, 'ID hoa không được để trống'),
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
});

// Review schemas
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Đánh giá tối thiểu là 1').max(5, 'Đánh giá tối đa là 5'),
  comment: z.string().min(10, 'Bình luận phải có ít nhất 10 ký tự'),
  images: z.array(z.string().min(1, 'Hình ảnh không được để trống')).optional(),
});

export const adminReplySchema = z.object({
  content: z.string().min(1, 'Nội dung phản hồi không được để trống'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type FlowerInput = z.infer<typeof flowerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductFlowerMapInput = z.infer<typeof productFlowerMapSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AdminReplyInput = z.infer<typeof adminReplySchema>;
