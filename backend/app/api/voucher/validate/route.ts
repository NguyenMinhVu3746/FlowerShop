import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const totalPriceParam = searchParams.get('totalPrice');

    if (!code) {
      return errorResponse('Mã voucher không được để trống', 400);
    }

    const totalPrice = totalPriceParam ? parseFloat(totalPriceParam) : 0;

    const voucher = await prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucher) {
      return errorResponse('Mã voucher không tồn tại', 404);
    }

    const now = new Date();

    if (!voucher.isActive) {
      return errorResponse('Mã voucher không hoạt động', 400);
    }

    if (now < voucher.startDate) {
      return errorResponse('Mã voucher chưa đến thời gian sử dụng', 400);
    }

    if (now > voucher.endDate) {
      return errorResponse('Mã voucher đã hết hạn', 400);
    }

    if (voucher.used >= voucher.quantity) {
      return errorResponse('Mã voucher đã hết lượt sử dụng', 400);
    }

    // Check minimum order value
    if (totalPrice > 0 && totalPrice < Number(voucher.minOrder)) {
      return errorResponse(
        `Đơn hàng tối thiểu ${Number(voucher.minOrder).toLocaleString('vi-VN')}đ`,
        400
      );
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === 'FIXED') {
      discount = Number(voucher.value);
    } else if (voucher.type === 'PERCENTAGE') {
      discount = (totalPrice * Number(voucher.value)) / 100;
      // Apply max discount if exists
      if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
        discount = Number(voucher.maxDiscount);
      }
    }

    return successResponse({
      voucher: {
        code: voucher.code,
        description: voucher.description,
        type: voucher.type,
        value: voucher.value,
        minOrder: voucher.minOrder,
        maxDiscount: voucher.maxDiscount,
      },
      discount,
      valid: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
