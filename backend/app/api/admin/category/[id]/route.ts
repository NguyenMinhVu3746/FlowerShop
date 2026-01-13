import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validations/product';
import { generateUniqueSlug } from '@/lib/slug';
import { saveImageLocally } from '@/lib/upload';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return errorResponse('Danh mục không tồn tại', 404);
    }

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

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (validatedData.name !== existingCategory.name) {
      slug = await generateUniqueSlug(
        validatedData.name,
        async (newSlug) => {
          const existing = await prisma.category.findFirst({
            where: {
              slug: newSlug,
              NOT: { id: params.id },
            },
          });
          return !!existing;
        }
      );
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        image: imageUrl,
        parentId,
        slug,
      },
    });

    return successResponse(category, 'Cập nhật danh mục thành công');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return errorResponse('Danh mục không tồn tại', 404);
    }

    if (category._count.products > 0) {
      return errorResponse(
        'Không thể xóa danh mục đang có sản phẩm',
        400
      );
    }

    if (category._count.children > 0) {
      return errorResponse(
        'Không thể xóa danh mục đang có danh mục con',
        400
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Xóa danh mục thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
