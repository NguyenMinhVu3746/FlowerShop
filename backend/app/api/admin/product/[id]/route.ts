import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations/product';
import { generateUniqueSlug } from '@/lib/slug';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true,
        flowers: {
          include: {
            flower: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

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
    
    // For PATCH, all fields are optional
    const updateProductSchema = productSchema.partial();
    
    const validatedData = updateProductSchema.parse(body);
    
    // Check if at least one field is being updated
    if (Object.keys(validatedData).length === 0) {
      return errorResponse('Không có dữ liệu để cập nhật', 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Check if category exists (only if categoryId is being updated)
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return errorResponse('Danh mục không tồn tại', 404);
      }
    }

    // Generate new slug if title changed
    let slug = existingProduct.slug;
    if (validatedData.title && validatedData.title !== existingProduct.title) {
      slug = await generateUniqueSlug(
        validatedData.title,
        async (newSlug) => {
          const existing = await prisma.product.findFirst({
            where: {
              slug: newSlug,
              NOT: { id: params.id },
            },
          });
          return !!existing;
        }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...(validatedData.title && { slug }),
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return successResponse(product, 'Cập nhật sản phẩm thành công');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation error', 400);
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Check if product has orders
    const hasOrders = await prisma.orderItem.findFirst({
      where: {
        variant: {
          productId: params.id,
        },
      },
    });

    if (hasOrders) {
      return errorResponse(
        'Không thể xóa sản phẩm đã có đơn hàng. Bạn có thể ẩn sản phẩm thay vì xóa.',
        400
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Xóa sản phẩm thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
