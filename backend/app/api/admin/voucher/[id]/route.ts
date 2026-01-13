import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { voucherSchema } from '@/lib/validations/order';
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
    console.log('Update voucher body:', body);
    const validatedData = voucherSchema.parse(body);
    console.log('Validated data:', validatedData);

    const existingVoucher = await prisma.voucher.findUnique({
      where: { id: params.id },
    });

    if (!existingVoucher) {
      return errorResponse('Voucher không tồn tại', 404);
    }

    // Check if code is being changed and already exists
    if (validatedData.code !== existingVoucher.code) {
      const codeExists = await prisma.voucher.findFirst({
        where: {
          code: validatedData.code,
          NOT: { id: params.id },
        },
      });

      if (codeExists) {
        return errorResponse('Mã voucher đã tồn tại', 400);
      }
    }

    const voucher = await prisma.voucher.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    });

    return successResponse(voucher, 'Cập nhật voucher thành công');
  } catch (error: any) {
    console.error('Voucher update error:', error);
    if (error.name === 'ZodError') {
      console.error('Zod validation error:', error.issues);
      return errorResponse(error.issues?.[0]?.message || 'Dữ liệu không hợp lệ', 400);
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

    const voucher = await prisma.voucher.findUnique({
      where: { id: params.id },
    });

    if (!voucher) {
      return errorResponse('Voucher không tồn tại', 404);
    }

    if (voucher.used > 0) {
      return errorResponse(
        'Không thể xóa voucher đã được sử dụng. Bạn có thể vô hiệu hóa voucher.',
        400
      );
    }

    await prisma.voucher.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Xóa voucher thành công');
  } catch (error) {
    return handleApiError(error);
  }
}
