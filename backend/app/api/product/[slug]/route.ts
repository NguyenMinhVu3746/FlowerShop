import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: {
            price: 'asc',
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product || !product.isActive) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Get average rating
    const ratings = await prisma.review.findMany({
      where: {
        productId: product.id,
        isHidden: false,
      },
      select: {
        rating: true,
      },
    });

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        NOT: {
          id: product.id,
        },
      },
      include: {
        variants: {
          select: {
            id: true,
            size: true,
            price: true,
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse({
      product: {
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: ratings.length,
      },
      relatedProducts: relatedProducts.map(p => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
