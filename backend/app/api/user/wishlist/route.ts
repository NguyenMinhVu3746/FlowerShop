import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: authResult.user!.userId },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            variants: {
              select: {
                id: true,
                size: true,
                price: true,
                stock: true,
              },
              orderBy: {
                price: 'asc',
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate avgRating and totalReviews for each product
    const productsWithRating = wishlists.map((wishlist) => {
      const product = wishlist.product;
      const reviews = product.reviews || [];
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      // Parse images from JSON
      let images: string[] = [];
      if (product.images) {
        try {
          images = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : Array.isArray(product.images) 
              ? product.images 
              : [];
        } catch {
          images = [];
        }
      }

      return {
        id: wishlist.id,
        productId: product.id,
        userId: wishlist.userId,
        createdAt: wishlist.createdAt,
        product: {
          ...product,
          images,
          avgRating,
          totalReviews,
          reviews: undefined, // Remove reviews array from response
        },
      };
    });

    return successResponse(productsWithRating);
  } catch (error) {
    return handleApiError(error);
  }
}
