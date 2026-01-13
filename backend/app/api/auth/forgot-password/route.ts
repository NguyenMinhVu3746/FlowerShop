import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/response';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

/**
 * POST /api/auth/forgot-password
 * Gửi email reset password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullname: true },
    });

    // Không báo lỗi nếu email không tồn tại (security best practice)
    // Luôn trả về success để tránh enumeration attack
    if (!user) {
      return successResponse({
        message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu',
      });
    }

    // Tạo reset token (random 32 bytes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Lưu token vào database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Gửi email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      return errorResponse('Không thể gửi email. Vui lòng thử lại sau', 500);
    }

    return successResponse({
      message: 'Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    console.error('Forgot password error:', error);
    return errorResponse('Đã có lỗi xảy ra', 500);
  }
}
