import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/response';
import { hashPassword } from '@/lib/password';

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

/**
 * POST /api/auth/reset-password
 * Reset password với token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Tìm user với reset token hợp lệ (chưa hết hạn)
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // Token chưa hết hạn
        },
      },
    });

    if (!user) {
      return errorResponse('Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Hash password mới
    const hashedPassword = await hashPassword(password);

    // Cập nhật password và xóa reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return successResponse({
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    console.error('Reset password error:', error);
    return errorResponse('Đã có lỗi xảy ra', 500);
  }
}
