import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const payload = updateUserSchema.parse(body);

    // Prevent admin from demoting/deleting themselves here if needed
    // We'll allow role changes but prevent demoting self for safety
    if (payload.role && authResult.user?.userId === params.id) {
      return errorResponse('Không thể thay đổi vai trò cho chính bạn', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return errorResponse('Người dùng không tồn tại', 404);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(payload.role ? { role: payload.role } : {}),
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updated, 'Cập nhật người dùng thành công');
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return errorResponse(error.errors?.[0]?.message || 'Dữ liệu không hợp lệ', 400);
    }
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    // Prevent admin from deleting themselves
    if (authResult.user?.userId === params.id) {
      return errorResponse('Không thể xóa chính bạn', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return errorResponse('Người dùng không tồn tại', 404);

    await prisma.user.delete({ where: { id: params.id } });

    return successResponse(null, 'Xóa người dùng thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
