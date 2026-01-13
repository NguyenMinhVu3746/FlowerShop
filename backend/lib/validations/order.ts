import { z } from 'zod';

// Order schemas
export const orderReceiverSchema = z.object({
  name: z.string().min(2, 'Tên người nhận phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  address: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
  deliveryDate: z.string().min(1, 'Ngày giao hàng không được để trống'),
  deliverySlot: z.string().min(1, 'Khung giờ giao hàng không được để trống'),
});

export const orderItemSchema = z.object({
  variantId: z.string().min(1, 'ID biến thể không được để trống'),
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
  addons: z.any().optional(),
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Giỏ hàng không được rỗng'),
  receiver: orderReceiverSchema,
  note: z.string().optional(),
  messageCard: z.string().optional(),
  senderType: z.enum(['NAMED', 'ANONYMOUS']).optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY']),
  voucherCode: z.string().optional(),
});

// Voucher schemas
export const voucherSchema = z.object({
  code: z.string().min(3, 'Mã voucher phải có ít nhất 3 ký tự'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive('Giá trị phải lớn hơn 0'),
  minOrder: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  endDate: z.string().min(1, 'Ngày kết thúc không được để trống'),
  quantity: z.number().int().min(0, 'Số lượng không được âm'),
  isActive: z.boolean().optional(),
});

// Banner schemas
export const bannerSchema = z.object({
  title: z.string().min(1, 'Tiêu đề banner không được để trống'),
  image: z.string().url('URL hình ảnh không hợp lệ'),
  link: z.string().min(1, 'Liên kết không được để trống').optional(),
  description: z.string().optional(),
  order: z.number().int().min(0, 'Thứ tự không được âm').optional(),
  isActive: z.boolean().optional(),
});

export type OrderReceiverInput = z.infer<typeof orderReceiverSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type VoucherInput = z.infer<typeof voucherSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
