import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Find product by slug to get ID
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId: product.id,
          isHidden: false,
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              avatar: true,
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
      prisma.review.count({
        where: {
          productId: product.id,
          isHidden: false,
        },
      }),
    ]);

    // Calculate rating distribution
    const allReviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        isHidden: false,
      },
      select: {
        rating: true,
      },
    });

    const ratingDistribution = {
      5: allReviews.filter((r: any) => r.rating === 5).length,
      4: allReviews.filter((r: any) => r.rating === 4).length,
      3: allReviews.filter((r: any) => r.rating === 3).length,
      2: allReviews.filter((r: any) => r.rating === 2).length,
      1: allReviews.filter((r: any) => r.rating === 1).length,
    };

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
        : 0;

    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
        ratingDistribution,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
