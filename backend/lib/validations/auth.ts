import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullname: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const updateProfileSchema = z.object({
  fullname: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  avatar: z.string().optional().nullable(),
});

// Address schemas
export const addressSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  fullAddress: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  ward: z.string().min(1, 'Phường/Xã không được để trống'),
  district: z.string().min(1, 'Quận/Huyện không được để trống'),
  province: z.string().min(1, 'Tỉnh/Thành phố không được để trống'),
  phoneReceiver: z.string().min(10, 'Số điện thoại không hợp lệ'),
  nameReceiver: z.string().min(2, 'Tên người nhận phải có ít nhất 2 ký tự'),
  isDefault: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
