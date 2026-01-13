import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        receiver: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return errorResponse('Đơn hàng không tồn tại', 404);
    }

    // Format data for printing
    const printData = {
      orderInfo: {
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        total: order.total,
        note: order.note,
        messageCard: order.messageCard,
        senderType: order.senderType,
      },
      customer: {
        fullname: order.user.fullname,
        email: order.user.email,
        phone: order.user.phone,
      },
      receiver: order.receiver
        ? {
            name: order.receiver.name,
            phone: order.receiver.phone,
            address: order.receiver.address,
            deliveryDate: order.receiver.deliveryDate,
            deliverySlot: order.receiver.deliverySlot,
          }
        : null,
      items: order.items.map((item: any) => ({
        productTitle: item.variant.product.title,
        size: item.variant.size,
        quantity: item.quantity,
        price: item.price,
        subtotal: Number(item.price) * item.quantity,
        addons: item.addons,
      })),
      payment: order.payment
        ? {
            method: order.payment.method,
            status: order.payment.status,
            amount: order.payment.amount,
          }
        : null,
    };

    return successResponse(printData);
  } catch (error) {
    return handleApiError(error);
  }
}
