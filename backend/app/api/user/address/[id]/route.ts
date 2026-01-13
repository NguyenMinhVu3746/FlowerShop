import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addressSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: authResult.user!.userId,
      },
    });

    if (!existingAddress) {
      return errorResponse('Địa chỉ không tồn tại', 404);
    }

    // If this is set as default, unset all other default addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: authResult.user!.userId,
          isDefault: true,
          NOT: { id: params.id },
        },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: validatedData,
    });

    return successResponse({ address: updatedAddress }, 'Cập nhật địa chỉ thành công');
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
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: authResult.user!.userId,
      },
    });

    if (!existingAddress) {
      return errorResponse('Địa chỉ không tồn tại', 404);
    }

    await prisma.address.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Xóa địa chỉ thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
