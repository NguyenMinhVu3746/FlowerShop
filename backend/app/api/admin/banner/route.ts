import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bannerSchema } from '@/lib/validations/order';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const banners = await prisma.banner.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return successResponse(banners);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = bannerSchema.parse(body);

    const banner = await prisma.banner.create({
      data: validatedData,
    });

    return successResponse(banner, 'Tạo banner thành công', 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation error', 400);
    }
    return handleApiError(error);
  }
}
