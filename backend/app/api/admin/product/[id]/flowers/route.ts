import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productFlowerMapSchema } from '@/lib/validations/product';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { z } from 'zod';

const flowersArraySchema = z.object({
  flowers: z.array(productFlowerMapSchema),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const flowers = await prisma.productFlowerMap.findMany({
      where: { productId: params.id },
      include: {
        flower: true,
      },
    });

    return successResponse(flowers);
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const { flowers } = flowersArraySchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Validate all flowers exist
    for (const flower of flowers) {
      const flowerExists = await prisma.flowerLibrary.findUnique({
        where: { id: flower.flowerId },
      });

      if (!flowerExists) {
        return errorResponse(`Nguyên liệu ID ${flower.flowerId} không tồn tại`, 404);
      }
    }

    // Delete existing mappings
    await prisma.productFlowerMap.deleteMany({
      where: { productId: params.id },
    });

    // Create new mappings
    const createdMappings = await Promise.all(
      flowers.map((flower) =>
        prisma.productFlowerMap.create({
          data: {
            productId: params.id,
            flowerId: flower.flowerId,
            quantity: flower.quantity,
          },
          include: {
            flower: true,
          },
        })
      )
    );

    return successResponse(
      createdMappings,
      'Cập nhật nguyên liệu cho sản phẩm thành công'
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || 'Validation error', 400);
    }
    return handleApiError(error);
  }
}
