import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bannerSchema } from '@/lib/validations/order';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const updateBannerSchema = bannerSchema.partial();
    const validatedData = updateBannerSchema.parse(body);
    
    if (Object.keys(validatedData).length === 0) {
      return errorResponse('Không có dữ liệu để cập nhật', 400);
    }

    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    if (!existingBanner) {
      return errorResponse('Banner không tồn tại', 404);
    }

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: validatedData,
    });

    return successResponse(banner, 'Cập nhật banner thành công');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation error', 400);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    if (!banner) {
      return errorResponse('Banner không tồn tại', 404);
    }

    await prisma.banner.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Xóa banner thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
