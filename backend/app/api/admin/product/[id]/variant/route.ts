import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productVariantSchema } from '@/lib/validations/product';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = productVariantSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Check if variant with same size already exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: params.id,
        size: validatedData.size,
      },
    });

    if (existingVariant) {
      return errorResponse(`Biến thể size ${validatedData.size} đã tồn tại`, 400);
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: params.id,
        ...validatedData,
      },
    });

    return successResponse(variant, 'Tạo biến thể thành công', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
