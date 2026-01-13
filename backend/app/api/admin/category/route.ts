import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations/product';
import { generateUniqueSlug } from '@/lib/slug';
import { saveImageLocally } from '@/lib/upload';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse({ categories });
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
    const validatedData = categorySchema.parse(body);

    // Handle image upload if it's base64
    let imageUrl = validatedData.image;
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      const result = await saveImageLocally(imageUrl, 'hoashop/categories');
      imageUrl = result.url;
    }

    // Convert empty parentId to null
    const parentId = validatedData.parentId && validatedData.parentId.trim() !== '' 
      ? validatedData.parentId 
      : null;

    // Generate unique slug
    const slug = await generateUniqueSlug(
      validatedData.name,
      async (slug) => {
        const existing = await prisma.category.findUnique({
          where: { slug },
        });
        return !!existing;
      }
    );

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        image: imageUrl,
        parentId,
        slug,
      },
    });

    return successResponse(category, 'Tạo danh mục thành công', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
