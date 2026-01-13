import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      // Find category by slug
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price_asc':
        // Sort by minimum variant price
        orderBy = { variants: { _min: { price: 'asc' } } };
        break;
      case 'price_desc':
        // Sort by minimum variant price
        orderBy = { variants: { _min: { price: 'desc' } } };
        break;
      case 'best_selling':
        // Will need to add orderCount field later
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        // Will need to calculate this
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = await Promise.all(
      products.map(async (product: any) => {
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

        return {
          ...product,
          averageRating: Math.round(avgRating * 10) / 10,
        };
      })
    );

    return successResponse({
      products: productsWithRating,
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
