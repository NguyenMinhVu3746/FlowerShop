import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isHidden = searchParams.get('isHidden');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isHidden !== null && isHidden !== undefined) {
      where.isHidden = isHidden === 'true';
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
          adminReply: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
