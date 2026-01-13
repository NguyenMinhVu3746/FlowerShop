import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'COMPLETED', 'CANCELLED']),
});

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
    const { status } = updateStatusSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return errorResponse('Đơn hàng không tồn tại', 404);
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            phone: true,
          },
        },
        receiver: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    // If order is completed, update payment status
    if (status === 'COMPLETED' && order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: 'PAID' },
      });
    }

    return successResponse(updatedOrder, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
