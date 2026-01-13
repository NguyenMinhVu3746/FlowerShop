import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: authResult.user!.userId },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        avatar: true,
        birthday: true,
        gender: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse('Người dùng không tồn tại', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const body = await request.json();
    console.log('Update profile body:', body);
    
    const validatedData = updateProfileSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Check if phone is being updated and already exists
    if (validatedData.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone,
          NOT: { id: authResult.user!.userId },
        },
      });

      if (existingUser) {
        return errorResponse('Số điện thoại đã được sử dụng', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: authResult.user!.userId },
      data: {
        ...(validatedData.fullname && { fullname: validatedData.fullname }),
        ...(validatedData.phone && { phone: validatedData.phone }),
        ...(validatedData.birthday && { birthday: new Date(validatedData.birthday) }),
        ...(validatedData.gender && { gender: validatedData.gender }),
        ...(validatedData.avatar && { avatar: validatedData.avatar }),
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        avatar: true,
        birthday: true,
        gender: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser, 'Cập nhật thông tin thành công');
  } catch (error: any) {
    if (error.name === 'ZodError' && error.errors?.length > 0) {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
