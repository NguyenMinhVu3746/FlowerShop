import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return successResponse(banners);
  } catch (error) {
    return handleApiError(error);
  }
}
