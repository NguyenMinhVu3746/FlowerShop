import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { voucherSchema } from '@/lib/validations/order';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const vouchers = await prisma.voucher.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse({ vouchers });
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
    const validatedData = voucherSchema.parse(body);

    // Check if code already exists
    const existingVoucher = await prisma.voucher.findUnique({
      where: { code: validatedData.code },
    });

    if (existingVoucher) {
      return errorResponse('Mã voucher đã tồn tại', 400);
    }

    const voucher = await prisma.voucher.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
    });

    return successResponse(voucher, 'Tạo voucher thành công', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
