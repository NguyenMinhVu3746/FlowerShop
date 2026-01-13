import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/response';
import { searchFlowersByImage } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

// Validation schema
const imageSearchSchema = z.object({
  image: z.string().min(1, 'Vui lòng cung cấp ảnh'),
});

/**
 * POST /api/ai/image-search
 * Tìm kiếm sản phẩm bằng ảnh (Gemini Vision)
 * Body: { image: "data:image/jpeg;base64,..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = imageSearchSchema.parse(body);

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      return errorResponse('Định dạng ảnh không hợp lệ', 400);
    }

    // Analyze image with Gemini Vision
    const analysis = await searchFlowersByImage(image);

    // Search products based on keywords
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: analysis.keywords.map((keyword) => ({
          title: { contains: keyword, mode: 'insensitive' as const },
        })),
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        variants: {
          where: { isActive: true },
          select: { size: true, price: true, stock: true },
          orderBy: { price: 'asc' },
        },
        reviews: {
          select: { rating: true },
        },
      },
      take: 12,
    });

    // Calculate average rating and format data
    const formattedProducts = products.map((product: any) => {
      const ratings = product.reviews.map((r: any) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
        : 0;

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        images: product.images,
        category: product.category,
        variants: product.variants,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: product.reviews.length,
      };
    });

    return successResponse({
      message: 'Tìm kiếm bằng hình ảnh thành công',
      data: {
        analysis: {
          description: analysis.description,
          keywords: analysis.keywords,
          suggestions: analysis.suggestions,
        },
        products: formattedProducts,
        total: formattedProducts.length,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    console.error('Image search error:', error);
    return errorResponse('Tìm kiếm thất bại. Vui lòng thử lại', 500);
  }
}
