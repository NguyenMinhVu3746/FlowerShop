import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations/product';
import { generateUniqueSlug } from '@/lib/slug';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: true,
          _count: {
            select: {
              reviews: true,
              wishlists: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    return successResponse({
      products,
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

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return errorResponse('Danh mục không tồn tại', 404);
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(
      validatedData.title,
      async (slug) => {
        const existing = await prisma.product.findUnique({
          where: { slug },
        });
        return !!existing;
      }
    );

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug,
      },
      include: {
        category: true,
      },
    });

    return successResponse(product, 'Tạo sản phẩm thành công', 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const message = error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return errorResponse(message, 400);
    }
    return handleApiError(error);
  }
}
