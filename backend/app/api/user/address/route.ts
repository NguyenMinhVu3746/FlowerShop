import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addressSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const addresses = await prisma.address.findMany({
      where: { userId: authResult.user!.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return successResponse({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // If this is set as default, unset all other default addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: authResult.user!.userId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: authResult.user!.userId,
        ...validatedData,
      },
    });

    return successResponse({ address }, 'Thêm địa chỉ thành công', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
